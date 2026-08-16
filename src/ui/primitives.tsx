/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import type { ReactNode } from 'react';
import { theme } from '../theme';

// 앱인토스 최종 심사 시에는 이 프리미티브들을 TDS(@toss/tds-mobile) 컴포넌트로
// 교체하는 것이 승인 기준에 유리합니다. 화면 로직은 그대로 두고 여기만 교체하세요.

// ── 화면 컨테이너 ───────────────────────────────────────
export function Screen({ children, center }: { children: ReactNode; center?: boolean }) {
  return (
    <div
      css={css`
        position: relative;
        width: 100%;
        max-width: ${theme.maxWidth};
        min-height: 100dvh;
        display: flex;
        flex-direction: column;
        ${center ? 'justify-content: center;' : ''}
        padding: max(env(safe-area-inset-top), 20px) 20px max(env(safe-area-inset-bottom), 20px);
        background: radial-gradient(120% 80% at 50% -10%, ${theme.color.panel} 0%, ${theme.color.bg} 45%, ${theme.color.bgDeep} 100%);
        overflow: hidden;
      `}
    >
      <StarField />
      <div css={css`position: relative; z-index: 1; display: flex; flex-direction: column; flex: 1;`}>
        {children}
      </div>
    </div>
  );
}

// ── 배경 별 ─────────────────────────────────────────────
function StarField() {
  const stars = Array.from({ length: 26 }, (_, i) => i);
  return (
    <div css={css`position: absolute; inset: 0; z-index: 0; pointer-events: none;`}>
      {stars.map((i) => {
        const top = (i * 37) % 100;
        const left = (i * 53) % 100;
        const size = (i % 3) + 1;
        const delay = (i % 7) * 0.4;
        return (
          <span
            key={i}
            css={css`
              position: absolute;
              top: ${top}%;
              left: ${left}%;
              width: ${size}px;
              height: ${size}px;
              border-radius: 50%;
              background: ${i % 4 === 0 ? theme.color.gold : '#fff'};
              opacity: 0.3;
              animation: twinkle ${2 + (i % 4)}s ease-in-out ${delay}s infinite;
            `}
          />
        );
      })}
    </div>
  );
}

// ── 버튼 ────────────────────────────────────────────────
export function Button({
  children,
  onClick,
  variant = 'primary',
  disabled,
  full = true,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'ghost' | 'gold';
  disabled?: boolean;
  full?: boolean;
}) {
  const base = css`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: ${full ? '100%' : 'auto'};
    padding: 16px 22px;
    border-radius: ${theme.radius.pill};
    font-size: 16px;
    font-weight: 700;
    letter-spacing: -0.2px;
    transition: transform 0.08s ease, opacity 0.15s ease;
    opacity: ${disabled ? 0.45 : 1};
    &:active {
      transform: ${disabled ? 'none' : 'scale(0.97)'};
    }
  `;
  const variants = {
    primary: css`
      color: #14102a;
      background: linear-gradient(135deg, ${theme.color.violetSoft}, ${theme.color.violet});
      box-shadow: ${theme.shadow.glow};
    `,
    gold: css`
      color: #2a1c00;
      background: linear-gradient(135deg, ${theme.color.goldSoft}, ${theme.color.gold});
      box-shadow: ${theme.shadow.goldGlow};
    `,
    ghost: css`
      color: ${theme.color.textSoft};
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid ${theme.color.line};
    `,
  };
  return (
    <button css={[base, variants[variant]]} onClick={disabled ? undefined : onClick} disabled={disabled}>
      {children}
    </button>
  );
}

// ── 카드 ────────────────────────────────────────────────
export function Card({
  children,
  glow,
  style,
}: {
  children: ReactNode;
  glow?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={style}
      css={css`
        position: relative;
        background: linear-gradient(180deg, ${theme.color.panelSoft}, ${theme.color.panel});
        border: 1px solid ${theme.color.line};
        border-radius: ${theme.radius.lg};
        padding: 20px;
        box-shadow: ${theme.shadow.card};
        ${glow ? `outline: 1px solid rgba(245,196,81,0.35); box-shadow: ${theme.shadow.goldGlow};` : ''}
        animation: fadeUp 0.5s ease both;
      `}
    >
      {children}
    </div>
  );
}

// ── 배지 ────────────────────────────────────────────────
export function Badge({ children, tone = 'violet' }: { children: ReactNode; tone?: 'violet' | 'gold' }) {
  const c = tone === 'gold' ? theme.color.gold : theme.color.violetSoft;
  return (
    <span
      css={css`
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 5px 11px;
        border-radius: ${theme.radius.pill};
        font-size: 12px;
        font-weight: 700;
        color: ${c};
        background: ${tone === 'gold' ? 'rgba(245,196,81,0.12)' : 'rgba(139,107,255,0.15)'};
        border: 1px solid ${tone === 'gold' ? 'rgba(245,196,81,0.3)' : 'rgba(139,107,255,0.3)'};
      `}
    >
      {children}
    </span>
  );
}

// ── 블러 잠금 오버레이 ───────────────────────────────────
export function LockedContent({ children }: { children: ReactNode }) {
  return (
    <div css={css`position: relative;`}>
      <div
        css={css`
          filter: blur(7px);
          user-select: none;
          pointer-events: none;
          opacity: 0.75;
        `}
        aria-hidden
      >
        {children}
      </div>
      <div
        css={css`
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
        `}
      >
        🔒
      </div>
    </div>
  );
}

// ── 섹션 제목 ───────────────────────────────────────────
export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2
      css={css`
        margin: 0 0 12px;
        font-size: 15px;
        font-weight: 700;
        color: ${theme.color.textSoft};
        letter-spacing: 0.3px;
      `}
    >
      {children}
    </h2>
  );
}
