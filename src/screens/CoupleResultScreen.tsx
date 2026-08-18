/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useState } from 'react';
import { shareText } from '../lib/bridge';
import { theme } from '../theme';
import type { CoupleInvite, CoupleReading } from '../types';
import { Badge, Button, Card, Screen, SectionTitle } from '../ui/primitives';

export function CoupleResultScreen({
  coupleReading,
  invite,
  onRestart,
}: {
  coupleReading: CoupleReading;
  invite: CoupleInvite;
  onRestart: () => void;
}) {
  const [shareMsg, setShareMsg] = useState<string | null>(null);

  async function handleShare() {
    const result = await shareText({
      title: '커플 궁합 리포트',
      text: `우리 궁합 결과: ${coupleReading.overallTag} (${coupleReading.overallScore}점) 🖐️💕`,
    });
    setShareMsg(result === 'copied' ? '결과가 클립보드에 복사됐어요 📋' : null);
  }

  return (
    <Screen>
      <div css={css`text-align: center; margin-bottom: 18px;`}>
        <Badge tone="violet">{coupleReading.overallTag}</Badge>
        <h1 css={css`margin: 12px 0 0; font-size: 22px; font-weight: 800;`}>우리 둘의 궁합 결과</h1>
      </div>

      <Card glow>
        <div css={css`text-align: center;`}>
          {(invite.inviterRareEmoji || invite.partnerRareEmoji) && (
            <div css={css`font-size: 15px; color: ${theme.color.textSoft}; margin-bottom: 8px;`}>
              {invite.inviterRareEmoji} {invite.inviterRareName} × {invite.partnerRareEmoji} {invite.partnerRareName}
            </div>
          )}
          <div css={css`font-size: 44px; font-weight: 800; color: ${theme.color.goldSoft};`}>
            {coupleReading.overallScore}
            <span css={css`font-size: 20px; color: ${theme.color.textDim};`}>점</span>
          </div>
          <p css={css`margin: 10px 0 0; font-size: 14px; line-height: 1.65; color: ${theme.color.text};`}>
            {coupleReading.headline}
          </p>
        </div>
      </Card>

      <div css={css`margin-top: 22px;`}>
        <SectionTitle>세부 궁합</SectionTitle>
        <div css={css`display: flex; flex-direction: column; gap: 12px;`}>
          {coupleReading.categories.map((c) => (
            <Card key={c.key}>
              <div css={css`display: flex; align-items: center; gap: 8px;`}>
                <span css={css`font-size: 20px;`}>{c.emoji}</span>
                <h3 css={css`margin: 0; font-size: 16px; font-weight: 800;`}>{c.title}</h3>
                <span css={css`margin-left: auto; font-size: 13px; font-weight: 700; color: ${theme.color.gold};`}>
                  {c.score}점
                </span>
              </div>
              <p css={css`margin: 10px 0 0; font-size: 14px; line-height: 1.65; color: ${theme.color.textSoft};`}>
                {c.body}
              </p>
            </Card>
          ))}
        </div>
      </div>

      <Card style={{ marginTop: 22 }}>
        <p css={css`margin: 0; font-size: 13px; line-height: 1.65; color: ${theme.color.textSoft}; text-align: center;`}>
          💡 {coupleReading.advice}
        </p>
      </Card>

      <div css={css`margin-top: 26px; display: flex; flex-direction: column; gap: 10px;`}>
        <Button variant="gold" onClick={handleShare}>
          📸 궁합 결과 공유하기
        </Button>
        {shareMsg && (
          <p css={css`margin: -4px 0 0; font-size: 12px; color: ${theme.color.gold}; text-align: center;`}>
            {shareMsg}
          </p>
        )}
        <Button variant="ghost" onClick={onRestart}>
          처음으로
        </Button>
        <p css={css`margin: 6px 0 0; font-size: 11px; color: ${theme.color.textDim}; text-align: center;`}>
          본 콘텐츠는 오락 목적이며, 의학·재정적 조언이 아니에요.
        </p>
      </div>
    </Screen>
  );
}
