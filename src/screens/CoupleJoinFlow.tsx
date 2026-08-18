/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useEffect, useState } from 'react';
import { openCamera } from '../lib/bridge';
import { generateReading } from '../lib/reading/engine';
import { generateCoupleReading } from '../lib/reading/coupleEngine';
import { fetchCoupleInvite, joinCoupleInvite } from '../lib/supabase';
import { theme } from '../theme';
import type { CoupleInvite, CoupleReading } from '../types';
import { Button, Screen } from '../ui/primitives';
import { LoadingScreen } from './LoadingScreen';
import { CoupleResultScreen } from './CoupleResultScreen';

type Phase = 'checking' | 'notfound' | 'landing' | 'loading' | 'result' | 'error';

/**
 * 초대 링크(?invite=xxx)로 들어온 파트너 전용 진입 플로우.
 * 사진 촬영 → 로컬에서 개인 시드 계산 → Supabase에 시드만 전송(사진 원본은 안 보냄) → 궁합 결과.
 * 이미 완료된 초대 링크를 다시 열면 곧바로 결과를 재계산해서 보여줍니다.
 */
export function CoupleJoinFlow({ inviteId, onExit }: { inviteId: string; onExit: () => void }) {
  const [phase, setPhase] = useState<Phase>('checking');
  const [invite, setInvite] = useState<CoupleInvite | null>(null);
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [coupleReading, setCoupleReading] = useState<CoupleReading | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const found = await fetchCoupleInvite(inviteId);
      if (!found) {
        setPhase('notfound');
        return;
      }
      setInvite(found);
      if (found.status === 'completed' && found.partnerSeed) {
        setCoupleReading(generateCoupleReading(found.id, found.inviterSeed, found.partnerSeed));
        setPhase('result');
      } else {
        setPhase('landing');
      }
    })();
  }, [inviteId]);

  async function handleCapture() {
    setBusy(true);
    setError(null);
    try {
      const captured = await openCamera();
      if (!captured) {
        setBusy(false);
        return;
      }
      setCapturedUri(captured.dataUri);
      setPhase('loading');
    } catch (e: any) {
      setError(e?.message ?? '촬영 중 문제가 생겼어요. 다시 시도해주세요.');
    } finally {
      setBusy(false);
    }
  }

  async function handleLoadingDone() {
    if (!capturedUri || !invite) return;
    const myReading = generateReading(capturedUri);
    const joined = await joinCoupleInvite(invite.id, {
      partnerSeed: myReading.id,
      partnerRareName: myReading.rare.name,
      partnerRareEmoji: myReading.rare.emoji,
    });
    if (!joined || !joined.partnerSeed) {
      setError('궁합 결과를 만드는 데 문제가 생겼어요. 링크를 다시 열어봐 주세요.');
      setPhase('error');
      return;
    }
    setInvite(joined);
    setCoupleReading(generateCoupleReading(joined.id, joined.inviterSeed, joined.partnerSeed));
    setPhase('result');
  }

  if (phase === 'checking') {
    return (
      <Screen center>
        <p css={css`text-align: center; color: ${theme.color.textDim}; font-size: 14px;`}>초대 확인하는 중…</p>
      </Screen>
    );
  }

  if (phase === 'notfound' || phase === 'error') {
    return (
      <Screen center>
        <div css={css`display: flex; flex-direction: column; align-items: center; gap: 16px; text-align: center;`}>
          <div css={css`font-size: 48px;`}>💔</div>
          <h1 css={css`margin: 0; font-size: 18px; font-weight: 800;`}>
            {error ?? '초대를 찾을 수 없어요'}
          </h1>
          <p css={css`margin: 0; font-size: 13px; color: ${theme.color.textDim};`}>
            링크가 잘못됐거나 만료됐을 수 있어요.
          </p>
          <Button variant="ghost" onClick={onExit}>
            내 손금 보러 가기
          </Button>
        </div>
      </Screen>
    );
  }

  if (phase === 'loading' && capturedUri) {
    return <LoadingScreen imageUri={capturedUri} onDone={handleLoadingDone} />;
  }

  if (phase === 'result' && coupleReading && invite) {
    return <CoupleResultScreen coupleReading={coupleReading} invite={invite} onRestart={onExit} />;
  }

  // landing
  return (
    <Screen>
      <div css={css`flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 24px;`}>
        <div css={css`text-align: center;`}>
          <div css={css`font-size: 48px; margin-bottom: 8px;`}>💌</div>
          <h1 css={css`margin: 0; font-size: 22px; font-weight: 800; line-height: 1.4;`}>
            {invite?.inviterRareEmoji} <b css={css`color: ${theme.color.goldSoft};`}>{invite?.inviterRareName}</b>을
            가진
            <br />
            상대방이 궁합을 물어봤어요
          </h1>
          <p css={css`margin: 12px 0 0; font-size: 14px; color: ${theme.color.textSoft}; line-height: 1.6;`}>
            내 손바닥을 촬영하면 바로 궁합 결과가 나와요.
            <br />
            결제는 필요 없어요 — 이미 상대방이 결제했어요.
          </p>
        </div>

        <div
          css={css`
            position: relative;
            width: 220px;
            height: 270px;
            border-radius: 120px 120px 40px 40px;
            border: 2px dashed rgba(245, 196, 81, 0.55);
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(245, 196, 81, 0.04);
          `}
        >
          <span css={css`font-size: 100px; opacity: 0.5;`}>✋</span>
        </div>

        {error && <p css={css`color: ${theme.color.danger}; font-size: 13px; margin: 0;`}>{error}</p>}
      </div>

      <Button variant="gold" onClick={handleCapture} disabled={busy}>
        {busy ? '카메라 여는 중…' : '📸 내 손바닥 촬영하기'}
      </Button>
    </Screen>
  );
}
