// 앱인토스 SDK 브릿지 어댑터.
// - 토스 앱 안(WebView): @apps-in-toss/web-framework 의 실제 네이티브 브릿지 사용
// - 개발/브라우저: 폴백(파일선택·모의결제)으로 동일 인터페이스 제공
//
// 앱 코드는 항상 이 어댑터만 호출하므로, 화면 로직은 실행 환경을 신경 쓸 필요가 없습니다.

import type { CaptureResult } from '../../types';

// @apps-in-toss/web-framework는 실제 dependency로 설치돼 있음(package.json 참고).
// - 로컬 개발: @apps-in-toss/devtools의 vite 플러그인이 이 모듈을 mock으로 자동 치환(패널로 조작 가능)
// - 프로덕션(GitHub Pages 등, 토스 앱 밖): devtools가 비활성화되지만 실제 SDK 호출은
//   네이티브 브릿지가 없어 대부분 실패 → 아래 각 함수의 폴백 경로로 넘어감
// - 실제 토스 앱 WebView 안: 네이티브 브릿지가 정상 응답
let sdkCache: any | undefined; // undefined=미시도, null=로드 실패(네이티브 브릿지 없음)
async function loadSdk(): Promise<any | null> {
  if (sdkCache !== undefined) return sdkCache;
  try {
    sdkCache = await import('@apps-in-toss/web-framework');
  } catch {
    sdkCache = null;
  }
  return sdkCache;
}

/** 토스 앱 WebView 안에서 실행 중인지 (UA 힌트) */
export function isInToss(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /toss/i.test(navigator.userAgent);
}

// ── 카메라 ─────────────────────────────────────────────
export async function openCamera(): Promise<CaptureResult | null> {
  const sdk = await loadSdk();
  if (sdk?.Device?.openCamera) {
    try {
      const image = await sdk.Device.openCamera({ base64: true, maxWidth: 1024 });
      return { id: image.id, dataUri: 'data:image/jpeg;base64,' + image.dataUri };
    } catch (e) {
      if (sdk.OpenCameraPermissionError && e instanceof sdk.OpenCameraPermissionError) {
        throw new BridgeError('CAMERA_PERMISSION', '카메라 권한이 필요해요.');
      }
      throw e;
    }
  }
  // 브라우저 폴백: 파일 선택(모바일에선 카메라 실행)
  return pickImageFromFile();
}

function pickImageFromFile(): Promise<CaptureResult | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.setAttribute('capture', 'environment');
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return resolve(null);
      const reader = new FileReader();
      reader.onload = () =>
        resolve({ id: `${file.name}:${file.size}:${file.lastModified}`, dataUri: String(reader.result) });
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    };
    // 취소 감지가 브라우저마다 달라, onchange가 안 오면 null로 남습니다(사용자가 다시 시도).
    input.click();
  });
}

// ── 인앱결제(IAP) ───────────────────────────────────────
export interface PurchaseSuccess {
  ok: true;
  orderId: string;
}
export interface PurchaseCancelled {
  ok: false;
  reason: 'cancelled' | 'error';
  message?: string;
}
export type PurchaseResult = PurchaseSuccess | PurchaseCancelled;

/**
 * 소모성 상품 결제.
 * @param sku 콘솔에 등록된 상품 ID
 * @param onGrant 결제 성공 직후 지급 처리 콜백 (여기서 로컬 해제/서버검증 등)
 */
export async function purchase(
  sku: string,
  onGrant: (orderId: string) => Promise<boolean> | boolean,
): Promise<PurchaseResult> {
  const sdk = await loadSdk();
  if (sdk?.IAP?.createOneTimePurchaseOrder) {
    return new Promise<PurchaseResult>((resolve) => {
      try {
        sdk.IAP.createOneTimePurchaseOrder({
          options: {
            sku,
            processProductGrant: async ({ orderId }: { orderId: string }) => onGrant(orderId),
          },
          onEvent: (event: any) => {
            if (event?.type === 'success') resolve({ ok: true, orderId: event.data.orderId });
          },
          onError: (error: any) =>
            resolve({ ok: false, reason: 'error', message: String(error?.message ?? error) }),
        });
      } catch (error: any) {
        resolve({ ok: false, reason: 'error', message: String(error?.message ?? error) });
      }
    });
  }
  // 브라우저 폴백: 모의 결제 (개발용). 실제 과금 없음.
  const confirmed =
    typeof window !== 'undefined' &&
    window.confirm(`[개발용 모의 결제]\n상품: ${sku}\n결제를 진행할까요? (실제 과금 없음)`);
  if (!confirmed) return { ok: false, reason: 'cancelled' };
  const orderId = `mock_${Date.now()}`;
  await onGrant(orderId);
  return { ok: true, orderId };
}

// ── 공유 ────────────────────────────────────────────────
export async function shareText(payload: { title?: string; text?: string; url?: string }): Promise<void> {
  const sdk = await loadSdk();
  // 앱인토스 v3 SDK는 Share.sendMessage({ message }) 하나만 제공함 (텍스트만, 파일 공유 불가).
  if (sdk?.Share?.sendMessage) {
    const message = [payload.title, payload.text, payload.url].filter(Boolean).join('\n');
    try {
      await sdk.Share.sendMessage({ message });
      return;
    } catch {
      /* 폴백으로 진행 */
    }
  }
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share(payload);
      return;
    } catch {
      /* 사용자 취소 등 */
    }
  }
}

// ── 이미지 저장 ─────────────────────────────────────────
// 우선순위: ①앱인토스 네이티브 저장 → ②Web Share(파일) — 모바일에서 가장 안정적,
// iOS Safari 등 WebKit 계열은 <a download>가 안 먹히는 경우가 많아 공유 시트의
// "이미지 저장"을 대신 씀 → ③<a download> — 데스크톱 브라우저 → ④새 탭으로 열기(최후 폴백,
// 사용자가 길게 눌러 직접 저장)
export type SaveImageResult = 'native' | 'share' | 'download' | 'opened' | 'cancelled' | 'failed';

export async function saveImage(blob: Blob, fileName: string): Promise<SaveImageResult> {
  // ① 앱인토스 네이티브 파일 저장
  const sdk = await loadSdk();
  if (sdk?.File?.saveBase64) {
    const supported = sdk.File.saveBase64.isSupported?.() ?? true;
    if (supported) {
      try {
        const data = await blobToBase64(blob);
        await sdk.File.saveBase64({ data, fileName, mimeType: blob.type || 'image/png' });
        return 'native';
      } catch {
        /* 폴백으로 진행 */
      }
    }
  }

  // ② Web Share(파일) — 모바일 브라우저(특히 iOS)에서 가장 확실하게 "저장"까지 이어짐
  if (typeof navigator !== 'undefined' && 'canShare' in navigator) {
    try {
      const file = new File([blob], fileName, { type: blob.type || 'image/png' });
      const anyNav = navigator as any;
      if (anyNav.canShare?.({ files: [file] })) {
        await anyNav.share({ files: [file] });
        return 'share';
      }
    } catch (e: any) {
      // 사용자가 공유 시트에서 직접 취소한 경우엔 다음 방법으로 폴백하지 않음
      if (e?.name === 'AbortError') return 'cancelled';
      /* 그 외(미지원 등)엔 다음 방법으로 폴백 */
    }
  }

  // ③ <a download> — 데스크톱 브라우저에서 잘 동작
  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    return 'download';
  } catch {
    /* 폴백으로 진행 */
  }

  // ④ 새 탭에서 열기 — 사용자가 직접 길게 눌러 저장
  try {
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    return 'opened';
  } catch {
    return 'failed';
  }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result);
      const comma = result.indexOf(',');
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export class BridgeError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = 'BridgeError';
  }
}
