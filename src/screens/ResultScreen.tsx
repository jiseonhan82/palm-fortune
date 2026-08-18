/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { isCoupleFeatureAvailable } from '../lib/supabase';
import { theme } from '../theme';
import type { Reading } from '../types';
import { Badge, Button, Card, LockedContent, Screen, SectionTitle } from '../ui/primitives';
import { PremiumReport } from './PremiumReport';

export function ResultScreen({
  reading,
  unlocked,
  onOpenPaywall,
  onOpenCouple,
  onShare,
  onRestart,
}: {
  reading: Reading;
  unlocked: boolean;
  onOpenPaywall: () => void;
  onOpenCouple: () => void;
  onShare: () => void;
  onRestart: () => void;
}) {
  return (
    <Screen>
      {/* 헤더 */}
      <div css={css`text-align: center; margin-bottom: 18px;`}>
        <Badge tone="violet">{reading.overallTag}</Badge>
        <h1 css={css`margin: 12px 0 0; font-size: 22px; font-weight: 800;`}>당신의 손금 리딩 결과</h1>
      </div>

      {/* ⭐ 희귀 손금 진단 — 메인 후킹 (최상단 강조) */}
      <SectionTitle>⭐ 희귀 손금 진단</SectionTitle>
      <Card glow>
        <div css={css`display: flex; align-items: flex-start; gap: 14px;`}>
          <div css={css`font-size: 44px; line-height: 1;`}>{reading.rare.emoji}</div>
          <div css={css`flex: 1;`}>
            <div css={css`display: flex; align-items: center; gap: 8px; flex-wrap: wrap;`}>
              <h3 css={css`margin: 0; font-size: 19px; font-weight: 800; color: ${theme.color.goldSoft};`}>
                {reading.rare.name}
              </h3>
              <Badge tone="gold">{reading.rare.tag}</Badge>
            </div>
            <p
              css={css`
                margin: 8px 0 0;
                font-size: 13px;
                font-weight: 700;
                color: ${theme.color.gold};
              `}
            >
              🔥 {reading.rare.rarityLabel}만 가진 문양
            </p>
            <p css={css`margin: 10px 0 0; font-size: 14px; line-height: 1.65; color: ${theme.color.text};`}>
              {reading.rare.meaning}
            </p>
          </div>
        </div>
      </Card>

      {/* 기본 손금 (생명선·두뇌선) */}
      <div css={css`margin-top: 22px;`}>
        <SectionTitle>기본 손금 해석</SectionTitle>
        <div css={css`display: flex; flex-direction: column; gap: 12px;`}>
          {reading.lines.map((line) => (
            <Card key={line.key}>
              <div css={css`display: flex; align-items: center; gap: 8px;`}>
                <span css={css`font-size: 20px;`}>{line.emoji}</span>
                <h3 css={css`margin: 0; font-size: 16px; font-weight: 800;`}>{line.title}</h3>
                <span css={css`margin-left: auto; font-size: 12px; color: ${theme.color.textDim};`}>
                  {line.headline}
                </span>
              </div>
              <p css={css`margin: 10px 0 0; font-size: 14px; line-height: 1.65; color: ${theme.color.textSoft};`}>
                {line.body}
              </p>
            </Card>
          ))}
        </div>
      </div>

      {/* 프리미엄 영역: 잠금 or 해제 */}
      <div css={css`margin-top: 26px;`}>
        {unlocked ? (
          <>
            <SectionTitle>🔓 상세 리포트</SectionTitle>
            <PremiumReport reading={reading} />
          </>
        ) : (
          <PremiumTeaser reading={reading} onOpenPaywall={onOpenPaywall} />
        )}
      </div>

      {/* 커플 궁합 진입점 */}
      {isCoupleFeatureAvailable() && (
        <div css={css`margin-top: 22px;`}>
          <Card>
            <div css={css`display: flex; align-items: center; gap: 12px;`}>
              <span css={css`font-size: 28px;`}>💞</span>
              <div css={css`flex: 1;`}>
                <div css={css`font-size: 15px; font-weight: 800;`}>우리 둘의 궁합은?</div>
                <div css={css`font-size: 12px; color: ${theme.color.textDim}; margin-top: 2px;`}>
                  상대방을 초대해서 궁합 리포트 받기
                </div>
              </div>
            </div>
            <div css={css`margin-top: 14px;`}>
              <Button variant="ghost" onClick={onOpenCouple}>
                💌 커플 궁합 보기
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* 하단 액션 */}
      <div css={css`margin-top: 26px; display: flex; flex-direction: column; gap: 10px;`}>
        <Button variant="gold" onClick={onShare}>
          📸 결과 이미지로 공유하기
        </Button>
        <Button variant="ghost" onClick={onRestart}>
          다시 촬영하기
        </Button>
        <p css={css`margin: 6px 0 0; font-size: 11px; color: ${theme.color.textDim}; text-align: center;`}>
          ※ 다시 촬영하면 각도·조명 차이로 풀이가 달라질 수 있어요
          <br />
          본 콘텐츠는 오락 목적이며, 의학·재정적 조언이 아니에요.
        </p>
      </div>
    </Screen>
  );
}

function PremiumTeaser({ reading, onOpenPaywall }: { reading: Reading; onOpenPaywall: () => void }) {
  return (
    <Card>
      <div css={css`text-align: center; margin-bottom: 4px;`}>
        <Badge tone="gold">🔒 프리미엄</Badge>
        <h3 css={css`margin: 12px 0 4px; font-size: 18px; font-weight: 800;`}>
          {reading.rare.name}이 당신의 운명과
          <br />
          어떻게 연결되는지 확인해보세요
        </h3>
        <p css={css`margin: 0; font-size: 13px; color: ${theme.color.textSoft};`}>
          재물·애정·건강·운명선 + 인생 전환점 나이
        </p>
      </div>

      <div css={css`display: flex; flex-direction: column; gap: 10px; margin: 16px 0;`}>
        {reading.premium.map((s) => (
          <div
            key={s.key}
            css={css`
              display: flex;
              align-items: center;
              gap: 12px;
              padding: 12px 14px;
              border-radius: ${theme.radius.md};
              background: rgba(255, 255, 255, 0.04);
              border: 1px solid ${theme.color.line};
            `}
          >
            <span css={css`font-size: 20px;`}>{s.emoji}</span>
            <div css={css`flex: 1; min-width: 0;`}>
              <div css={css`font-size: 14px; font-weight: 700;`}>{s.title}</div>
              <div css={css`font-size: 12px; color: ${theme.color.textDim}; margin-top: 2px;`}>{s.teaser}</div>
            </div>
            <LockedContentMini />
          </div>
        ))}
      </div>

      <Button variant="gold" onClick={onOpenPaywall}>
        🔓 상세 리포트 잠금 해제
      </Button>
    </Card>
  );
}

function LockedContentMini() {
  return (
    <LockedContent>
      <span css={css`font-size: 12px; color: ${theme.color.textDim};`}>••••••</span>
    </LockedContent>
  );
}
