/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useState } from 'react';
import { openCamera } from '../lib/bridge';
import type { CaptureResult } from '../types';
import { theme } from '../theme';
import { Button, Screen } from '../ui/primitives';

export function CaptureScreen({
  onCaptured,
  onBack,
}: {
  onCaptured: (result: CaptureResult) => void;
  onBack: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCapture() {
    setBusy(true);
    setError(null);
    try {
      const result = await openCamera();
      if (result) onCaptured(result);
    } catch (e: any) {
      setError(e?.message ?? '촬영 중 문제가 생겼어요. 다시 시도해주세요.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <button
        onClick={onBack}
        css={css`color: ${theme.color.textSoft}; font-size: 15px; align-self: flex-start; padding: 4px 0;`}
      >
        ← 뒤로
      </button>

      <div css={css`flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 24px;`}>
        <div css={css`text-align: center;`}>
          <h1 css={css`margin: 0; font-size: 24px; font-weight: 800;`}>손바닥을 촬영해주세요</h1>
          <p css={css`margin: 10px 0 0; font-size: 14px; color: ${theme.color.textSoft}; line-height: 1.6;`}>
            손금 라인이 잘 보이도록 밝은 곳에서
            <br />
            손바닥을 가이드 안에 맞춰주세요.
          </p>
        </div>

        {/* 손바닥 가이드 오버레이 */}
        <div
          css={css`
            position: relative;
            width: 240px;
            height: 300px;
            border-radius: 130px 130px 40px 40px;
            border: 2px dashed rgba(245, 196, 81, 0.55);
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(245, 196, 81, 0.04);
          `}
        >
          <span css={css`font-size: 120px; opacity: 0.5; animation: float 3.5s ease-in-out infinite;`}>✋</span>
          <span
            css={css`
              position: absolute;
              bottom: -12px;
              left: 50%;
              transform: translateX(-50%);
              font-size: 12px;
              font-weight: 700;
              color: ${theme.color.gold};
              background: ${theme.color.bg};
              padding: 2px 10px;
              border-radius: 999px;
            `}
          >
            손바닥 가이드
          </span>
        </div>

        <ul
          css={css`
            list-style: none;
            margin: 0;
            padding: 0;
            display: flex;
            gap: 8px;
            font-size: 12px;
            color: ${theme.color.textDim};
          `}
        >
          <li>💡 밝은 조명</li>
          <li>·</li>
          <li>🖐️ 손가락 살짝 펴기</li>
          <li>·</li>
          <li>📵 흔들림 주의</li>
        </ul>

        {error && <p css={css`color: ${theme.color.danger}; font-size: 13px; margin: 0;`}>{error}</p>}
      </div>

      <Button variant="gold" onClick={handleCapture} disabled={busy}>
        {busy ? '카메라 여는 중…' : '📸 손바닥 촬영하기'}
      </Button>
    </Screen>
  );
}
