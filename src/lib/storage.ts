// 결제/해제 상태 + 마지막 결과 저장 (로컬).
// 소모성 아이템이지만, "이 손금 결과에 대해 상세 리포트를 이미 열었다"는 상태를
// 기기에 남겨 새로고침해도 유지되게 합니다.
// ⚠️ 실제 지급/검증은 향후 서버 영수증 검증으로 보강해야 합니다(보안).

import type { Reading } from '../types';

const KEY = 'palm.entitlements.v1';

type EntitlementMap = Record<string, string[]>; // readingId -> [sku, ...]

function read(): EntitlementMap {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}');
  } catch {
    return {};
  }
}

function write(map: EntitlementMap): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(map));
  } catch {
    /* 저장 실패는 조용히 무시 (프라이빗 모드 등) */
  }
}

export function hasEntitlement(readingId: string, sku: string): boolean {
  return (read()[readingId] ?? []).includes(sku);
}

export function grantEntitlement(readingId: string, sku: string): void {
  const map = read();
  const list = map[readingId] ?? [];
  if (!list.includes(sku)) list.push(sku);
  map[readingId] = list;
  write(map);
}

// ── 마지막 결과 복원 ────────────────────────────────────
// 앱을 나갔다 들어와도(재촬영 없이) 방금 본 결과로 자동 복귀시키기 위함.
// "다시 촬영하기"를 누르면 clearLastReading()으로 지워짐 — 그 전까지는 계속 복원됨.
// 사진 원본은 저장하지 않음 — 이미 계산된 결과(Reading)만 저장.

const LAST_READING_KEY = 'palm.lastReading.v1';

export function saveLastReading(reading: Reading): void {
  try {
    localStorage.setItem(LAST_READING_KEY, JSON.stringify(reading));
  } catch {
    /* 저장 실패는 조용히 무시 */
  }
}

export function getLastReading(): Reading | null {
  try {
    const raw = localStorage.getItem(LAST_READING_KEY);
    return raw ? (JSON.parse(raw) as Reading) : null;
  } catch {
    return null;
  }
}

export function clearLastReading(): void {
  try {
    localStorage.removeItem(LAST_READING_KEY);
  } catch {
    /* 무시 */
  }
}
