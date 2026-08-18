// 커플 궁합 $0 생성 엔진.
// 두 사람 각자의 손금 시드(Reading.id)를 합쳐 새 시드를 만들고, 그걸로 궁합 콘텐츠를 조립합니다.
// 순서(누가 초대했는지)와 무관하게 항상 같은 결과가 나오도록 시드를 정렬 후 결합합니다.
// 사진 원본은 전혀 쓰지 않음 — 이미 각자 기기에서 계산된 시드 문자열만 입력으로 받습니다.

import type { CoupleCategory, CoupleReading } from '../../types';
import { CHEMISTRY, COMMUNICATION, CONFLICT, COUPLE_ADVICE, COUPLE_OVERALL, FUTURE } from './coupleContent';
import { fnv1a, makeRng, pick, rangeInt } from './seed';

function category(rng: ReturnType<typeof makeRng>, key: CoupleCategory['key'], pool: { title: string; emoji: string; bodies: readonly string[] }): CoupleCategory {
  return {
    key,
    title: pool.title,
    emoji: pool.emoji,
    score: rangeInt(rng, 62, 98),
    body: pick(rng, pool.bodies),
  };
}

export function generateCoupleReading(inviteId: string, seedA: string, seedB: string): CoupleReading {
  // 정렬 후 결합 → 누가 먼저 초대했는지와 무관하게 항상 동일한 결과
  const combined = [seedA, seedB].sort().join('::');
  const seed = fnv1a(combined);
  const rng = makeRng(seed);

  const categories: CoupleCategory[] = [
    category(rng, 'chemistry', CHEMISTRY),
    category(rng, 'communication', COMMUNICATION),
    category(rng, 'conflict', CONFLICT),
    category(rng, 'future', FUTURE),
  ];

  const overallScore = Math.round(categories.reduce((sum, c) => sum + c.score, 0) / categories.length);
  const tier = COUPLE_OVERALL.find((t) => overallScore >= t.min) ?? COUPLE_OVERALL[COUPLE_OVERALL.length - 1];

  return {
    id: inviteId,
    createdAt: Date.now(),
    overallScore,
    overallTag: tier.tag,
    headline: tier.headline,
    categories,
    advice: pick(rng, COUPLE_ADVICE),
  };
}
