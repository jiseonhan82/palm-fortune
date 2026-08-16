// $0 손금 생성 엔진.
// 이미지 dataUri → 시드 → 결정론적으로 Reading 조립.
// 서버·API·과금 없이 브라우저에서 즉시 동작하며, 같은 손금은 항상 같은 결과.

import type { PremiumSection, Reading } from '../../types';
import {
  DESTINY,
  DESTINY_TURNING,
  HEALTH,
  HEAD_LINES,
  LIFE_LINES,
  LOVE,
  OVERALL_TAGS,
  RARE_PATTERNS,
  TURNING_AGES,
  WEALTH,
} from './content';
import { fnv1a, makeRng, pick, pickMany, pickWeighted, rangeInt, shortId } from './seed';

function rarityLabel(percent: number): string {
  // 퍼센트 → "N명 중 M명" 자연스러운 표현
  if (percent <= 0.5) return `1000명 중 ${Math.max(1, Math.round(percent * 10))}명`;
  if (percent < 5) return `100명 중 ${Math.max(1, Math.round(percent))}명`;
  return `상위 ${Math.round(percent)}%`;
}

export function generateReading(dataUri: string): Reading {
  const seedStr = dataUri.length > 4096 ? dataUri.slice(0, 2048) + dataUri.slice(-2048) : dataUri;
  const seed = fnv1a(seedStr);
  const rng = makeRng(seed);
  const id = shortId(seedStr);

  const rareBase = pickWeighted(rng, RARE_PATTERNS);
  const rare = {
    id: rareBase.id,
    name: rareBase.name,
    emoji: rareBase.emoji,
    rarityPercent: rareBase.rarityPercent,
    rarityLabel: rarityLabel(rareBase.rarityPercent),
    meaning: rareBase.meaning,
    tag: rareBase.tag,
  };

  const life = pick(rng, LIFE_LINES);
  const head = pick(rng, HEAD_LINES);

  const [ageA, ageB] = pickMany(rng, TURNING_AGES, 2).sort((a, b) => a - b);

  const premium: PremiumSection[] = [
    {
      key: 'wealth',
      title: '재물운',
      emoji: '💰',
      teaser: pick(rng, WEALTH.teasers),
      body: pickMany(rng, WEALTH.bodies, 2),
    },
    {
      key: 'love',
      title: '애정운',
      emoji: '💕',
      teaser: pick(rng, LOVE.teasers),
      body: pickMany(rng, LOVE.bodies, 2),
    },
    {
      key: 'health',
      title: '건강운',
      emoji: '🌿',
      teaser: pick(rng, HEALTH.teasers),
      body: pickMany(rng, HEALTH.bodies, 1),
    },
    {
      key: 'destiny',
      title: '운명선',
      emoji: '🧭',
      teaser: pick(rng, DESTINY.teasers),
      body: pickMany(rng, DESTINY.bodies, 1),
    },
    {
      key: 'turningPoint',
      title: '인생 전환점 나이',
      emoji: '⏳',
      teaser: pick(rng, DESTINY_TURNING.teasers),
      highlight: `${ageA}세 · ${ageB}세`,
      body: [DESTINY_TURNING.bodyTemplate(ageA, ageB)],
    },
  ];

  return {
    id,
    createdAt: Date.now(),
    overallTag: OVERALL_TAGS[rangeInt(rng, 0, OVERALL_TAGS.length - 1)],
    rare,
    lines: [
      { key: 'life', title: '생명선', emoji: '🌱', headline: life.headline, body: life.body },
      { key: 'head', title: '두뇌선', emoji: '🧠', headline: head.headline, body: head.body },
    ],
    premium,
  };
}
