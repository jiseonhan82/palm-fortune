// 손금 미니앱 도메인 타입.
// 실제 손금 판독이 아니라 "재미/콘텐츠" 목적의 생성 결과물 구조입니다.

export type LineKey = 'life' | 'head';
export type PremiumKey = 'wealth' | 'love' | 'health' | 'destiny' | 'turningPoint';

/** 희귀 손금(특이 문양) 진단 — 메인 후킹 요소 */
export interface RarePattern {
  id: string;
  name: string; // "신비의 십자가"
  emoji: string; // "✝️"
  /** 화면 노출용 희소성 문구. 예: "1000명 중 3명" */
  rarityLabel: string;
  /** 희소성 퍼센트 (설계된 가중치 기반, 오락용) */
  rarityPercent: number;
  /** 2~3줄 해석 */
  meaning: string;
  /** 짧은 배지 태그. 예: "재물 대박" */
  tag: string;
}

/** 생명선/두뇌선 등 정석 손금 기본 해석 (보조·신뢰감용) */
export interface LineReading {
  key: LineKey;
  title: string; // "생명선"
  emoji: string;
  headline: string; // 한 줄 요약
  body: string; // 2~3줄
}

/** 프리미엄(유료) 섹션 */
export interface PremiumSection {
  key: PremiumKey;
  title: string; // "재물운"
  emoji: string;
  /** 락 화면 티저(제목은 공개, 내용은 블러). 예: "재물선에 이런 특이점이 있어요" */
  teaser: string;
  /** 결제 후 공개되는 본문 (문단 배열) */
  body: string[];
  /** 강조 하이라이트. 예: 전환점 나이 "27세 · 34세" */
  highlight?: string;
}

export interface Reading {
  /** 이미지 시드 해시 — 같은 손바닥이면 항상 동일한 결과 (공유·재현성) */
  id: string;
  createdAt: number;
  /** 손금 종합 유형 태그. 예: "대기만성형 손금" */
  overallTag: string;
  rare: RarePattern;
  lines: LineReading[]; // 생명선, 두뇌선
  premium: PremiumSection[]; // 재물/애정/건강/운명선/전환점
}

/** 촬영 결과 (브릿지 공통 반환형) */
export interface CaptureResult {
  id: string;
  dataUri: string; // 항상 화면에 바로 넣을 수 있는 data: URI 형태로 정규화
}

// ─────────────────────────────────────────────────────────────
// 커플 궁합 리포트
// ─────────────────────────────────────────────────────────────

export type CoupleCategoryKey = 'chemistry' | 'communication' | 'conflict' | 'future';

/** 궁합 세부 카테고리 (케미/대화/갈등 대처/미래 전망) */
export interface CoupleCategory {
  key: CoupleCategoryKey;
  title: string;
  emoji: string;
  score: number; // 0~100, 화면 표시용
  body: string;
}

export interface CoupleReading {
  /** 초대(invite) id와 동일 — Supabase couple_invites.id */
  id: string;
  createdAt: number;
  overallScore: number; // 0~100
  overallTag: string; // "천생연분형 궁합"
  headline: string; // 한 줄 요약
  categories: CoupleCategory[];
  advice: string; // 마무리 조언 한 문단
}

/** 궁합 초대 상태 (Supabase couple_invites row와 대응) */
export interface CoupleInvite {
  id: string;
  inviterSeed: string;
  inviterRareName: string | null;
  inviterRareEmoji: string | null;
  partnerSeed: string | null;
  partnerRareName: string | null;
  partnerRareEmoji: string | null;
  status: 'pending' | 'completed';
  createdAt: string;
  completedAt: string | null;
}
