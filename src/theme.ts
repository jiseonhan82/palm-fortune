// 디자인 토큰 — 신비로운 밤하늘 + 골드 테마 (공유·바이럴에 유리한 프리미엄 룩)
export const theme = {
  color: {
    bg: '#0e0b1a',
    bgDeep: '#080611',
    panel: '#191333',
    panelSoft: '#211a42',
    line: 'rgba(255,255,255,0.08)',
    gold: '#f5c451',
    goldSoft: '#f8d98a',
    violet: '#8b6bff',
    violetSoft: '#b9a4ff',
    text: '#f4f1ff',
    textSoft: '#b8afd6',
    textDim: '#8478a6',
    danger: '#ff6b8b',
    success: '#5ad1a5',
  },
  radius: {
    sm: '10px',
    md: '16px',
    lg: '22px',
    pill: '999px',
  },
  shadow: {
    glow: '0 0 40px rgba(139,107,255,0.35)',
    goldGlow: '0 0 28px rgba(245,196,81,0.4)',
    card: '0 10px 30px rgba(0,0,0,0.45)',
  },
  space: (n: number) => `${n * 4}px`,
  maxWidth: '480px',
  font: {
    family:
      "'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Malgun Gothic', system-ui, sans-serif",
  },
} as const;

export type Theme = typeof theme;
