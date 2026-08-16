// 결제/해제 상태 저장 (로컬).
// 소모성 아이템이지만, "이 손금 결과에 대해 상세 리포트를 이미 열었다"는 상태를
// 기기에 남겨 새로고침해도 유지되게 합니다.
// ⚠️ 실제 지급/검증은 향후 서버 영수증 검증으로 보강해야 합니다(보안).

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
