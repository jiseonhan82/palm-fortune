/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useEffect, useState } from 'react';
import { theme } from '../theme';
import { Screen } from '../ui/primitives';

// 로딩은 실제 연산이 아니라 "기대감 연출 장치" (기획서 명시). 5~8초 목표.
const STEPS = [
  '생명선을 읽는 중…',
  '두뇌선을 분석하는 중…',
  '감정선의 결을 살피는 중…',
  '희귀 문양을 찾는 중…',
  '운명의 흐름을 해석하는 중…',
];
const STEP_MS = 1300;

export function LoadingScreen({ imageUri, onDone }: { imageUri: string; onDone: () => void }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers: number[] = [];
    STEPS.forEach((_, i) => {
      timers.push(window.setTimeout(() => setStep(i), i * STEP_MS));
    });
    timers.push(window.setTimeout(onDone, STEPS.length * STEP_MS + 500));
    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  const progress = Math.min(100, ((step + 1) / STEPS.length) * 100);

  return (
    <Screen center>
      <div css={css`display: flex; flex-direction: column; align-items: center; gap: 28px; text-align: center;`}>
        <div css={css`position: relative; width: 200px; height: 200px;`}>
          {/* 촬영 이미지 (은은하게) */}
          <img
            src={imageUri}
            alt="손바닥"
            css={css`
              width: 100%;
              height: 100%;
              object-fit: cover;
              border-radius: 50%;
              opacity: 0.35;
              filter: saturate(0.8);
            `}
          />
          {/* 스캔 링 */}
          <div
            css={css`
              position: absolute;
              inset: -6px;
              border-radius: 50%;
              border: 3px solid transparent;
              border-top-color: ${theme.color.gold};
              border-right-color: ${theme.color.violet};
              animation: spin 1.1s linear infinite;
              @keyframes spin {
                to {
                  transform: rotate(360deg);
                }
              }
            `}
          />
          <div
            css={css`
              position: absolute;
              inset: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 56px;
              animation: twinkle 1.6s ease-in-out infinite;
            `}
          >
            🔮
          </div>
        </div>

        <div>
          <h1 css={css`margin: 0; font-size: 20px; font-weight: 800;`} key={step}>
            <span css={css`animation: fadeUp 0.4s ease both;`}>{STEPS[step]}</span>
          </h1>
          <p css={css`margin: 10px 0 0; font-size: 13px; color: ${theme.color.textDim};`}>
            잠시만요, 당신의 손금을 꼼꼼히 보고 있어요
          </p>
        </div>

        {/* 진행 바 */}
        <div
          css={css`
            width: 220px;
            height: 6px;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.08);
            overflow: hidden;
          `}
        >
          <div
            css={css`
              height: 100%;
              width: ${progress}%;
              border-radius: 999px;
              background: linear-gradient(90deg, ${theme.color.violet}, ${theme.color.gold});
              transition: width ${STEP_MS}ms ease;
            `}
          />
        </div>
      </div>
    </Screen>
  );
}
