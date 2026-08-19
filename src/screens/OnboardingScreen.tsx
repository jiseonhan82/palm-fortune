/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { theme } from '../theme';
import { Button, Screen } from '../ui/primitives';

export function OnboardingScreen({ onStart }: { onStart: () => void }) {
  return (
    <Screen center>
      <div css={css`text-align: center; display: flex; flex-direction: column; align-items: center; gap: 8px;`}>
        <div
          css={css`
            font-size: 96px;
            line-height: 1;
            animation: float 3.5s ease-in-out infinite;
            filter: drop-shadow(0 8px 30px rgba(139, 107, 255, 0.5));
          `}
        >
          🖐️
        </div>

        <div css={css`margin-top: 20px;`}>
          <p css={css`margin: 0; font-size: 14px; font-weight: 700; color: ${theme.color.gold}; letter-spacing: 2px;`}>
            AI 손금 리딩
          </p>
          <h1
            css={css`
              margin: 10px 0 0;
              font-size: 30px;
              font-weight: 800;
              line-height: 1.35;
              letter-spacing: -0.5px;
            `}
          >
            당신의 손금엔
            <br />
            어떤 운명이 담겨 있을까요?
          </h1>
        </div>

        <p css={css`margin: 16px 0 0; font-size: 15px; color: ${theme.color.textSoft}; line-height: 1.6;`}>
          손바닥 사진 한 장이면 충분해요.
          <br />
          희귀 손금부터 오늘의 운세까지, 지금 확인해보세요.
        </p>
        <p css={css`margin: 8px 0 0; font-size: 12px; color: ${theme.color.textDim};`}>
          🖐️ 왼손 · 오른손 아무 손이나 상관없어요
        </p>

        <ul
          css={css`
            list-style: none;
            padding: 0;
            margin: 26px 0 0;
            display: flex;
            flex-direction: column;
            gap: 10px;
            width: 100%;
            max-width: 320px;
          `}
        >
          {[
            ['⭐', '희귀 손금 진단 — 몇 명 중 한 명일까?'],
            ['🌱', '생명선 · 두뇌선 기본 해석'],
            ['🔮', '재물 · 애정 · 운명선 상세 리포트'],
          ].map(([emoji, text]) => (
            <li
              key={text}
              css={css`
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 16px;
                border-radius: ${theme.radius.md};
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid ${theme.color.line};
                font-size: 14px;
                text-align: left;
              `}
            >
              <span css={css`font-size: 20px;`}>{emoji}</span>
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </div>

      <div css={css`margin-top: 32px;`}>
        <Button variant="gold" onClick={onStart}>
          손바닥 촬영하고 시작하기
        </Button>
        <p css={css`margin: 14px 0 0; font-size: 11px; color: ${theme.color.textDim}; text-align: center;`}>
          본 콘텐츠는 오락 목적이며, 의학·재정적 조언이 아니에요.
        </p>
      </div>
    </Screen>
  );
}
