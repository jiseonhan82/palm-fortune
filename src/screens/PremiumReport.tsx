/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { theme } from '../theme';
import type { Reading } from '../types';
import { Card } from '../ui/primitives';

/** 결제 후 공개되는 상세 리포트 본문 */
export function PremiumReport({ reading }: { reading: Reading }) {
  return (
    <div css={css`display: flex; flex-direction: column; gap: 12px;`}>
      {reading.premium.map((s) => (
        <Card key={s.key}>
          <div css={css`display: flex; align-items: center; gap: 8px;`}>
            <span css={css`font-size: 20px;`}>{s.emoji}</span>
            <h3 css={css`margin: 0; font-size: 16px; font-weight: 800;`}>{s.title}</h3>
            {s.highlight && (
              <span
                css={css`
                  margin-left: auto;
                  font-size: 14px;
                  font-weight: 800;
                  color: ${theme.color.gold};
                `}
              >
                {s.highlight}
              </span>
            )}
          </div>
          <div css={css`margin-top: 10px; display: flex; flex-direction: column; gap: 8px;`}>
            {s.body.map((para, i) => (
              <p key={i} css={css`margin: 0; font-size: 14px; line-height: 1.7; color: ${theme.color.textSoft};`}>
                {para}
              </p>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
