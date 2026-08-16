/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useEffect, useState } from 'react';
import { shareText } from '../lib/bridge';
import { renderShareImage } from '../lib/shareImage';
import { theme } from '../theme';
import type { Reading } from '../types';
import { Button } from '../ui/primitives';

export function ShareSheet({ reading, onClose }: { reading: Reading; onClose: () => void }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);

  useEffect(() => {
    let url: string | null = null;
    renderShareImage(reading).then((b) => {
      if (!b) return;
      setBlob(b);
      url = URL.createObjectURL(b);
      setPreviewUrl(url);
    });
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [reading]);

  async function handleShare() {
    // 1) 파일 공유 시도 (navigator.share level 2)
    if (blob && typeof navigator !== 'undefined' && 'canShare' in navigator) {
      const file = new File([blob], 'palm-reading.png', { type: 'image/png' });
      const anyNav = navigator as any;
      if (anyNav.canShare?.({ files: [file] })) {
        try {
          await anyNav.share({ files: [file], title: 'AI 손금 리딩', text: `내 손금: ${reading.rare.name}` });
          return;
        } catch {
          /* 취소/미지원 → 폴백 */
        }
      }
    }
    // 2) 앱인토스/웹 텍스트 공유
    await shareText({
      title: 'AI 손금 리딩',
      text: `내 손금은 ${reading.rare.rarityLabel}만 가진 「${reading.rare.name}」! 너도 확인해봐 🖐️`,
    });
  }

  function handleSave() {
    if (!previewUrl) return;
    const a = document.createElement('a');
    a.href = previewUrl;
    a.download = `palm-reading-${reading.id}.png`;
    a.click();
  }

  return (
    <div
      onClick={onClose}
      css={css`
        position: fixed;
        inset: 0;
        z-index: 50;
        background: rgba(4, 3, 10, 0.8);
        backdrop-filter: blur(6px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
      `}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        css={css`
          width: 100%;
          max-width: 360px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          animation: fadeUp 0.3s ease both;
        `}
      >
        <div
          css={css`
            border-radius: ${theme.radius.lg};
            overflow: hidden;
            box-shadow: ${theme.shadow.card};
            aspect-ratio: 1080 / 1350;
            background: ${theme.color.panel};
            display: flex;
            align-items: center;
            justify-content: center;
          `}
        >
          {previewUrl ? (
            <img src={previewUrl} alt="공유 카드" css={css`width: 100%; height: 100%; object-fit: cover;`} />
          ) : (
            <span css={css`color: ${theme.color.textDim}; font-size: 14px;`}>카드 만드는 중…</span>
          )}
        </div>

        <Button variant="gold" onClick={handleShare} disabled={!blob}>
          공유하기
        </Button>
        <Button variant="ghost" onClick={handleSave} disabled={!previewUrl}>
          이미지 저장
        </Button>
        <button onClick={onClose} css={css`color: ${theme.color.textDim}; font-size: 14px; padding: 6px;`}>
          닫기
        </button>
      </div>
    </div>
  );
}
