// $0 손금 엔진 스모크 테스트: `npx vite-node scripts/smoke.ts`
import { generateReading } from '../src/lib/reading/engine';
import { generateCoupleReading } from '../src/lib/reading/coupleEngine';

function fakeImage(tag: string) {
  return 'data:image/jpeg;base64,' + Buffer.from(tag.repeat(200)).toString('base64');
}

const a1 = generateReading(fakeImage('handA'));
const a2 = generateReading(fakeImage('handA')); // 동일 이미지
const b1 = generateReading(fakeImage('handB'));

let failures = 0;
function check(name: string, cond: boolean) {
  console.log(`${cond ? '✅' : '❌'} ${name}`);
  if (!cond) failures++;
}

// 1) 결정론성: 같은 이미지 → 같은 결과
check('determinism (same image → same id)', a1.id === a2.id);
check('determinism (same rare pattern)', a1.rare.id === a2.rare.id);

// 2) 다양성: 다른 이미지 → 대체로 다른 결과 (id는 반드시 달라야 함)
check('variety (different image → different id)', a1.id !== b1.id);

// 3) 구조 완결성
check('has rare pattern', !!a1.rare.name && !!a1.rare.rarityLabel && a1.rare.rarityPercent > 0);
check('has 2 basic lines (life, head)', a1.lines.length === 2);
check('has 5 premium sections', a1.premium.length === 5);
check('turningPoint has highlight', a1.premium.some((s) => s.key === 'turningPoint' && !!s.highlight));
check('every premium section has body', a1.premium.every((s) => s.body.length >= 1));

// 4) 분포 확인 (100개 시드로 희귀문양 분포)
const dist: Record<string, number> = {};
for (let i = 0; i < 100; i++) {
  const r = generateReading(fakeImage('seed' + i));
  dist[r.rare.name] = (dist[r.rare.name] ?? 0) + 1;
}
console.log('\n📊 희귀문양 분포 (100 시드):');
Object.entries(dist)
  .sort((a, b) => b[1] - a[1])
  .forEach(([k, v]) => console.log(`   ${k}: ${v}`));

console.log('\n🔮 샘플 결과 A:');
console.log('   종합:', a1.overallTag);
console.log(`   희귀: ${a1.rare.emoji} ${a1.rare.name} (${a1.rare.rarityLabel})`);
console.log('   생명선:', a1.lines[0].headline);
console.log('   전환점:', a1.premium.find((s) => s.key === 'turningPoint')?.highlight);

// 5) 커플 궁합 엔진
const inviteId = 'invite-test-1';
const c1 = generateCoupleReading(inviteId, a1.id, b1.id);
const c2 = generateCoupleReading(inviteId, b1.id, a1.id); // 순서 반대
const c3 = generateCoupleReading(inviteId, a1.id, a1.id); // 같은 사람(엣지 케이스)

check('couple: 순서 무관하게 같은 결과', c1.overallScore === c2.overallScore && c1.overallTag === c2.overallTag);
check('couple: 4개 카테고리 모두 존재', c1.categories.length === 4);
check(
  'couple: 카테고리별 점수가 0~100 범위',
  c1.categories.every((cat) => cat.score >= 0 && cat.score <= 100),
);
check('couple: 종합 점수가 0~100 범위', c1.overallScore >= 0 && c1.overallScore <= 100);
check('couple: 같은 사람끼리도 에러 없이 생성됨', !!c3.overallTag);

console.log('\n💞 샘플 궁합 결과:');
console.log(`   ${c1.overallTag} (${c1.overallScore}점) — ${c1.headline}`);
c1.categories.forEach((cat) => console.log(`   ${cat.emoji} ${cat.title}: ${cat.score}점`));

console.log(`\n${failures === 0 ? '🎉 ALL PASS' : `💥 ${failures} FAIL`}`);
process.exit(failures === 0 ? 0 : 1);
