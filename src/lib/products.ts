// IAP 상품 카탈로그.
// 실제 상품/가격은 앱인토스 개발자센터 콘솔에서 등록하고, sku가 일치해야 합니다.
// 여기 priceLabel/originalLabel은 화면 표시(가격 앵커링)용입니다.

export type ProductKey = 'reportFull' | 'dailyFortune';

export interface Product {
  key: ProductKey;
  sku: string; // 콘솔에 등록할 상품 ID와 반드시 일치
  name: string;
  /** 표시 가격 (첫 구매 특가) */
  priceLabel: string;
  /** 앵커링용 정가(취소선) */
  originalLabel?: string;
  blurb: string;
  type: 'consumable';
}

export const PRODUCTS: Record<ProductKey, Product> = {
  reportFull: {
    key: 'reportFull',
    sku: 'ait.0000065818.954ede46.13812d1ef5.7142968874', // 콘솔 등록값(손금 상세 리포트 1회권)과 일치
    name: '상세 손금 리포트',
    priceLabel: '₩3,300',
    blurb: '재물·애정·건강·운명선 + 인생 전환점 나이 풀버전',
    type: 'consumable',
  },
  dailyFortune: {
    key: 'dailyFortune',
    sku: 'palm_daily_fortune_v1',
    name: '오늘의 손금 운세',
    priceLabel: '₩1,200',
    blurb: '매일 갱신되는 오늘의 손금 기운',
    type: 'consumable',
  },
};
