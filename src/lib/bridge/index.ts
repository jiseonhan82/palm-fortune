// 앱인토스 SDK 브릿지 어댑터.
// - 토스 앱 안(WebView): @apps-in-toss/web-framework 의 실제 네이티브 브릿지 사용
// - 개발/브라우저: 폴백(파일선택·모의결제)으로 동일 인터페이스 제공
//
// 앱 코드는 항상 이 어댑터만 호출하므로, 화면 로직은 실행 환경을 신경 쓸 필요가 없습니다.

import type { CaptureResult } from '../../types';

// 패키지명을 변수로 둬서 Vite 정적 분석이 미설치 패키지를 해석하려다 실패하지 않게 함.
const SDK_MODULE = '@apps-in-toss/web-framework';

let sdkCache: any | undefined; // undefined=미시도, null=없음(브라우저)
async function loadSdk(): Promise<any | null> {
  if (sdkCache !== undefined) return sdkCache;
  try {
    sdkCache = await import(/* @vite-ignore */ SDK_MODULE);
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
  if (sdk?.Share?.share) {
    try {
      await sdk.Share.share(payload);
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

export class BridgeError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = 'BridgeError';
  }
}
