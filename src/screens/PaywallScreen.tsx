/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useState } from 'react';
import { purchase } from '../lib/bridge';
import { PRODUCTS } from '../lib/products';
import { grantEntitlement } from '../lib/storage';
import { theme } from '../theme';
import type { Reading } from '../types';
import { Button, Card, Screen } from '../ui/primitives';

export function PaywallScreen({
  reading,
  onPurchased,
  onClose,
}: {
  reading: Reading;
  onPurchased: () => void;
  onClose: () => void;
}) {
  const product = PRODUCTS.reportFull;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleBuy() {
    setBusy(true);
    setError(null);
    const result = await purchase(product.sku, (orderId) => {
      // 지급 처리: 이 손금 결과에 대해 상세 리포트 해제
      // (실제 서비스에선 서버 영수증 검증 후 지급 권장)
      grantEntitlement(reading.id, product.sku);
      return Boolean(orderId);
    });
    setBusy(false);

    if (result.ok) {
      onPurchased();
    } else if (result.reason === 'error') {
      setError(result.message ?? '결제 중 문제가 생겼어요. 다시 시도해주세요.');
    }
    // cancelled는 조용히 유지
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
        <div css={css`font-size: 48px;`}>🔮</div>
        <h1 css={css`margin: 10px 0 0; font-size: 24px; font-weight: 800; line-height: 1.35;`}>
          당신만의 상세 리포트가
          <br />
          준비됐어요
        </h1>
        <p css={css`margin: 12px 0 0; font-size: 14px; color: ${theme.color.textSoft}; line-height: 1.6;`}>
          <b css={css`color: ${theme.color.goldSoft};`}>{reading.rare.name}</b>을 가진 당신의
          <br />
          재물·애정·건강·운명선을 깊이 있게 풀어드려요.
        </p>
      </div>

      {/* 포함 항목 미리보기 */}
      <Card>
        <div css={css`display: flex; flex-direction: column; gap: 12px;`}>
          {reading.premium.map((s) => (
            <div key={s.key} css={css`display: flex; align-items: center; gap: 10px;`}>
              <span css={css`font-size: 18px;`}>{s.emoji}</span>
              <span css={css`font-size: 14px; font-weight: 600;`}>{s.title}</span>
              {s.highlight && (
                <span css={css`margin-left: auto; font-size: 12px; color: ${theme.color.gold};`}>
                  전환점 나이 포함
                </span>
              )}
            </div>
          ))}
        </div>
      </Card>

      <div css={css`flex: 1;`} />

      {/* 가격 */}
      <div css={css`text-align: center; margin: 20px 0 12px;`}>
        <span css={css`font-size: 32px; font-weight: 800; color: ${theme.color.goldSoft};`}>
          {product.priceLabel}
        </span>
      </div>

      {error && (
        <p css={css`color: ${theme.color.danger}; font-size: 13px; text-align: center; margin: 0 0 10px;`}>{error}</p>
      )}

      <Button variant="gold" onClick={handleBuy} disabled={busy}>
        {busy ? '결제 진행 중…' : `${product.priceLabel} · 상세 리포트 받기`}
      </Button>
      <p css={css`margin: 12px 0 0; font-size: 11px; color: ${theme.color.textDim}; text-align: center; line-height: 1.5;`}>
        결제는 토스 인앱결제로 안전하게 진행돼요.
        <br />
        본 콘텐츠는 오락 목적이며, 의학·재정적 조언이 아니에요.
      </p>
    </Screen>
  );
}
