// 결정론적 시드 유틸.
// 손바닥 이미지 바이트를 해시해 시드로 쓰면, 같은 손금은 항상 같은 결과가 나옵니다.
// → 공유했을 때 친구가 봐도 동일 → 신뢰감·바이럴. 서버/API 없이 $0.

/** FNV-1a 32bit 해시 */
export function fnv1a(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** 문자열을 사람이 읽기 쉬운 짧은 id로 (시드 해시 → base36) */
export function shortId(input: string): string {
  const a = fnv1a(input);
  const b = fnv1a(input + '::salt');
  return (a.toString(36) + b.toString(36)).slice(0, 10);
}

/** mulberry32 — 시드 기반 결정론적 난수 생성기 */
export function makeRng(seed: number) {
  let s = seed >>> 0;
  return function next(): number {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Rng = ReturnType<typeof makeRng>;

/** 배열에서 하나 균등 선택 */
export function pick<T>(rng: Rng, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

/** 정수 범위 [min, max] */
export function rangeInt(rng: Rng, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

/** 가중치 기반 선택 — weight가 작을수록 희귀 */
export function pickWeighted<T extends { weight: number }>(rng: Rng, arr: readonly T[]): T {
  const total = arr.reduce((s, x) => s + x.weight, 0);
  let r = rng() * total;
  for (const item of arr) {
    r -= item.weight;
    if (r <= 0) return item;
  }
  return arr[arr.length - 1];
}

/** 중복 없이 n개 선택 (Fisher–Yates 부분 셔플) */
export function pickMany<T>(rng: Rng, arr: readonly T[], n: number): T[] {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(n, copy.length));
}
