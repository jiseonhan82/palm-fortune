/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useEffect, useRef, useState } from 'react';
import { createInviteLink, purchase, shareText } from '../lib/bridge';
import { PRODUCTS } from '../lib/products';
import { createCoupleInvite, fetchCoupleInvite } from '../lib/supabase';
import { theme } from '../theme';
import type { CoupleInvite, CoupleReading, Reading } from '../types';
import { generateCoupleReading } from '../lib/reading/coupleEngine';
import { Badge, Button, Card, Screen } from '../ui/primitives';

const POLL_MS = 3000;

/**
 * 궁합 시작 화면. 결제 전(가격 안내) → 결제 후(초대 링크 공유 + 대기)까지 한 화면에서 처리합니다.
 * 상대방이 참여를 마치면 자동으로 폴링에서 감지해 onReady로 결과를 넘깁니다.
 */
export function CoupleInviteScreen({
  reading,
  onReady,
  onClose,
}: {
  reading: Reading;
  onReady: (coupleReading: CoupleReading, invite: CoupleInvite) => void;
  onClose: () => void;
}) {
  const product = PRODUCTS.coupleReport;
  const [phase, setPhase] = useState<'pay' | 'waiting'>('pay');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invite, setInvite] = useState<CoupleInvite | null>(null);
  const [shareUrl, setShareUrl] = useState('');
  const [shareMsg, setShareMsg] = useState<string | null>(null);
  const pollRef = useRef<number | null>(null);

  useEffect(() => {
    if (!invite) return;
    createInviteLink(`invite=${invite.id}`).then(setShareUrl);
  }, [invite]);

  useEffect(() => {
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
  }, []);

  async function handleBuy() {
    setBusy(true);
    setError(null);
    const result = await purchase(product.sku, () => true);
    if (!result.ok) {
      setBusy(false);
      if (result.reason === 'error') setError(result.message ?? '결제 중 문제가 생겼어요. 다시 시도해주세요.');
      return;
    }

    const created = await createCoupleInvite({
      inviterSeed: reading.id,
      inviterRareName: reading.rare.name,
      inviterRareEmoji: reading.rare.emoji,
    });
    setBusy(false);

    if (!created) {
      setError('초대 링크를 만드는 데 문제가 생겼어요. 잠시 후 다시 시도해주세요.');
      return;
    }

    setInvite(created);
    setPhase('waiting');
    pollRef.current = window.setInterval(() => checkInvite(created.id), POLL_MS);
  }

  async function checkInvite(id: string) {
    const latest = await fetchCoupleInvite(id);
    if (!latest) return;
    setInvite(latest);
    if (latest.status === 'completed' && latest.partnerSeed) {
      if (pollRef.current) window.clearInterval(pollRef.current);
      const coupleReading = generateCoupleReading(latest.id, latest.inviterSeed, latest.partnerSeed);
      onReady(coupleReading, latest);
    }
  }

  async function handleShare() {
    const result = await shareText({
      title: '커플 궁합 리포트',
      text: `내 손금 「${reading.rare.name}」과 네 손금, 궁합이 어떨지 확인해봐! 🖐️💕`,
      url: shareUrl,
    });
    setShareMsg(result === 'copied' ? '링크가 복사됐어요! 카톡·문자에 붙여넣기 해주세요 📋' : null);
  }

  if (phase === 'waiting') {
    return (
      <Screen center>
        <div css={css`display: flex; flex-direction: column; align-items: center; gap: 20px; text-align: center;`}>
          <div css={css`font-size: 56px; animation: float 3.5s ease-in-out infinite;`}>💌</div>
          <div>
            <h1 css={css`margin: 0; font-size: 20px; font-weight: 800;`}>상대방을 기다리는 중이에요</h1>
            <p css={css`margin: 10px 0 0; font-size: 13px; color: ${theme.color.textDim}; line-height: 1.6;`}>
              아래 링크를 상대방에게 보내주세요.
              <br />
              상대방이 손바닥을 찍으면 자동으로 궁합 결과가 나와요.
            </p>
          </div>

          <Card>
            <p
              css={css`
                margin: 0;
                font-size: 12px;
                color: ${theme.color.textSoft};
                word-break: break-all;
                text-align: left;
              `}
            >
              {shareUrl || '링크 만드는 중…'}
            </p>
          </Card>
          <p css={css`margin: -8px 0 0; font-size: 11px; color: ${theme.color.textDim};`}>
            ※ 상대방 기기에 토스 앱이 설치돼 있어야 링크가 열려요
          </p>

          <div css={css`width: 100%; display: flex; flex-direction: column; gap: 10px;`}>
            <Button variant="gold" onClick={handleShare} disabled={!shareUrl}>
              💌 초대 링크 보내기
            </Button>
            {shareMsg && (
              <p css={css`margin: 0; font-size: 12px; color: ${theme.color.gold}; text-align: center;`}>
                {shareMsg}
              </p>
            )}
            <Button variant="ghost" onClick={onClose}>
              나중에 결과 보기
            </Button>
          </div>

          <div
            css={css`
              width: 20px;
              height: 20px;
              border-radius: 50%;
              border: 2px solid transparent;
              border-top-color: ${theme.color.gold};
              animation: spin 1s linear infinite;
              @keyframes spin {
                to {
                  transform: rotate(360deg);
                }
              }
            `}
          />
        </div>
      </Screen>
    );
  }

  return (
    <Screen>
      <button
        onClick={onClose}
        css={css`color: ${theme.color.textSoft}; font-size: 15px; align-self: flex-start; padding: 4px 0;`}
      >
        ← 무료 결과로
      </button>

      <div css={css`text-align: center; margin: 8px 0 20px;`}>
        <div css={css`font-size: 48px;`}>💞</div>
        <h1 css={css`margin: 10px 0 0; font-size: 24px; font-weight: 800; line-height: 1.35;`}>
          우리 둘의 궁합이
          <br />
          궁금하지 않아요?
        </h1>
        <p css={css`margin: 12px 0 0; font-size: 14px; color: ${theme.color.textSoft}; line-height: 1.6;`}>
          내 손금 <b css={css`color: ${theme.color.goldSoft};`}>{reading.rare.name}</b>과 상대방 손금을 비교해서
          <br />
          케미·대화·갈등 대처·미래 전망까지 풀어드려요.
        </p>
      </div>

      <Card>
        <div css={css`display: flex; flex-direction: column; gap: 10px;`}>
          {[
            ['💥', '케미'],
            ['💬', '대화'],
            ['🌊', '갈등 대처'],
            ['🌱', '미래 전망'],
          ].map(([emoji, title]) => (
            <div key={title} css={css`display: flex; align-items: center; gap: 10px;`}>
              <span css={css`font-size: 18px;`}>{emoji}</span>
              <span css={css`font-size: 14px; font-weight: 600;`}>{title}</span>
            </div>
          ))}
        </div>
      </Card>

      <div css={css`flex: 1;`} />

      <div css={css`text-align: center; margin: 20px 0 12px;`}>
        <Badge tone="gold">💌 나만 결제하면 돼요</Badge>
        <div css={css`margin-top: 10px;`}>
          <span css={css`font-size: 32px; font-weight: 800; color: ${theme.color.goldSoft};`}>
            {product.priceLabel}
          </span>
        </div>
        <p css={css`margin: 6px 0 0; font-size: 12px; color: ${theme.color.textDim};`}>
          상대방은 결제 없이 링크만 열면 돼요
        </p>
      </div>

      {error && (
        <p css={css`color: ${theme.color.danger}; font-size: 13px; text-align: center; margin: 0 0 10px;`}>{error}</p>
      )}

      <Button variant="gold" onClick={handleBuy} disabled={busy}>
        {busy ? '결제 진행 중…' : `${product.priceLabel} · 궁합 시작하기`}
      </Button>
      <p css={css`margin: 12px 0 0; font-size: 11px; color: ${theme.color.textDim}; text-align: center; line-height: 1.5;`}>
        결제는 토스 인앱결제로 안전하게 진행돼요.
        <br />
        본 콘텐츠는 오락 목적이며, 의학·재정적 조언이 아니에요.
      </p>
    </Screen>
  );
}
