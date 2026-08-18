# AI 손금 · 오늘의 운세 (palm-fortune)

토스 **앱인토스(Apps in Toss) WebView 미니앱** — 손바닥 사진을 찍으면 AI가 손금을 풀이하고 오늘의 운세를 보여주는 미니앱.
[기획서](../Downloads/손금-미니앱-기획서.md) 기준으로 **핵심 수익 플로우**를 먼저 구현했습니다.

## 💸 핵심 설계 결정: 비용 0원

기획서에 **"실제 명리학적 정확성보다 콘텐츠 완성도/재미에 초점"** 이라고 명시돼 있어 정확한 손금 판독이 필요 없습니다. 그래서 유료 비전 API(Claude/GPT 등) 대신:

- **이미지 시드 기반 로컬 콘텐츠 엔진** (`src/lib/reading/`)
  - 손바닥 사진 바이트를 해시 → 시드 → 결정론적으로 풀이 생성
  - **같은 손금은 항상 같은 결과** → 공유 시 친구가 봐도 동일 → 신뢰감·바이럴에 유리
  - 콘텐츠 라이브러리(`content.ts`)를 가중 랜덤 조합해 방대한 변주
- 서버·API 키·호출당 과금 **전부 없음**. 앱인토스가 정적 번들을 무료 호스팅.
- "5~8초 로딩"은 기획서상 **기대감 연출 장치**라 실제 연산 불필요 → 애니메이션으로 처리.

> 매출은 IAP에서만 발생(=비용이 아니라 수익). 커플 궁합/서버 영수증 검증만 추후 백엔드가 필요하며, 그것도 무료 서버리스+무료 DB로 가능.

## 🗺️ 구현 범위 (이번 세션 = 핵심 수익 플로우)

```
온보딩 → 손바닥 촬영 → AI 분석 로딩 → 무료 기본 결과 → 프리미엄 락 → IAP 결제 → 결과 공유
```

| 화면 | 파일 | 상태 |
|---|---|---|
| 온보딩 | `screens/OnboardingScreen.tsx` | ✅ |
| 촬영(가이드 오버레이) | `screens/CaptureScreen.tsx` | ✅ |
| 분석 로딩(5~8초 연출) | `screens/LoadingScreen.tsx` | ✅ |
| 무료 결과(희귀손금⭐+생명/두뇌선) | `screens/ResultScreen.tsx` | ✅ |
| 프리미엄 락 + IAP | `screens/PaywallScreen.tsx` | ✅ |
| 상세 리포트(해제 후) | `screens/PremiumReport.tsx` | ✅ |
| 공유 카드(canvas 이미지) | `screens/ShareSheet.tsx` | ✅ |

**다음 세션 예정:** 커플 궁합 리포트(초대 링크·기기 간 상태), 오늘의 손금 운세(재방문), 토스 로그인/푸시, 서버 영수증 검증, TDS 컴포넌트 이관.

## 🧩 구조

```
src/
  App.tsx                 # 플로우 상태머신
  main.tsx                # 로컬/브라우저 진입점
  theme.ts, global.tsx    # 디자인 토큰 · 전역 스타일
  types.ts                # 도메인 타입
  lib/
    bridge/index.ts       # 앱인토스 SDK 어댑터 (카메라/IAP/공유 + 브라우저 폴백)
    reading/
      seed.ts             # 이미지 해시 → 시드 RNG
      content.ts          # 콘텐츠 라이브러리 (여기만 늘리면 변주↑)
      engine.ts           # 시드 → Reading 생성
    products.ts           # IAP 상품 카탈로그 (sku)
    storage.ts            # 결제/해제 상태 (localStorage)
    shareImage.ts         # 공유 카드 canvas 렌더링
  ui/primitives.tsx       # 버튼·카드·배경 등 (심사 시 TDS로 교체)
  screens/                # 각 화면
apps-in-toss.config.ts    # 앱인토스 배포 설정 (appName·권한·webBundleDir)
```

## ▶️ 로컬 실행 (브라우저 데모)

```bash
npm install
npm run dev      # http://localhost:5173
```

브라우저에서는 카메라 대신 **파일 선택(모바일=카메라)**, 결제는 **모의 결제(과금 없음)** 로 동작합니다.
데스크톱에서도 이미지를 아무거나 선택하면 전체 플로우를 끝까지 확인할 수 있습니다.

`npm run dev` 화면 우측 하단의 **"AIT" 버튼**을 누르면 `@apps-in-toss/devtools` 패널이 뜨는데, 실제 앱인토스 SDK를
mock으로 치환해 카메라·IAP 결제·이미지 저장·공유가 전부 **네이티브 브릿지 코드 경로 그대로** 동작합니다(실기기 없이도
회귀 테스트 가능). 이 패널은 프로덕션 빌드(`vite build`)에서는 자동으로 완전히 빠집니다.

```bash
npm run build     # 프로덕션 빌드 (dist/) — GitHub Pages용
npm run typecheck # 타입 체크
npm run build:ait # dist/ 빌드 + palmlab.ait 아티팩트 생성 (Node 24+ 필요)
npm run deploy    # ait deploy — 앱인토스 콘솔에 업로드
```

## 🚀 앱인토스 이관 — ✅ 완료

`@apps-in-toss/web-framework` v3(SDK 3.0.4) 기준으로 이미 이관됐습니다. v3는 새 프로젝트를 스캐폴딩하는 방식이 아니라
**기존 Vite 엔트리(`src/main.tsx`)에 설정 파일 하나만 추가**하는 방식이라, 별도 `pages/`/`_app.tsx` 라우팅이 필요 없습니다.

1. ✅ `npm install @apps-in-toss/web-framework @apps-in-toss/devtools`
2. ✅ `apps-in-toss.config.ts` 에 콘솔 발급 `appName`(`palmlab`)·권한(camera) 반영
3. ✅ `vite.config.ts` 에 `aitDevtools.vite()` 연결 (프로덕션 빌드에선 자동 비활성화)
4. ⬜ TDS 적용: `@toss/tds-mobile` 설치 후 `ui/primitives.tsx` 를 TDS 컴포넌트로 교체 (**정식 심사엔 필수, 테스트 배포엔 불필요**)
5. ⬜ IAP 상품 등록: 개발자센터 콘솔에서 소모성 상품 생성 → `src/lib/products.ts` 의 `sku` 와 일치시키기
6. ⬜ **실기기 테스트 배포** (사람이 직접): 콘솔에서 API 키 발급 → `npx ait token add` → `npm run deploy`

카메라/IAP/공유/저장은 `src/lib/bridge/index.ts` 가 실제 SDK를 감지해 호출하므로, 토스 앱 안에서 바로 네이티브 브릿지로 동작합니다.

## ⚠️ 컴플라이언스

- 모든 결과·결제 화면에 **"오락 목적, 의학·재정적 조언 아님"** 문구 노출 (구현됨)
- 손바닥 이미지는 로컬에서만 처리(서버 전송 없음) — 개인정보 처리방침 작성 시 반영
- 커플 기능 도입 시 파트너 정보 수집 범위를 처리방침에 포함
- 운세 카테고리 심사 제약 및 수수료 정책은 앱인토스 콘솔에서 최신 확인

## 📌 아직 미정 (기획서 §11)

희귀 문양 최종 리스트/확률, IAP 가격대, 상세 리포트 톤앤매너, 궁합 A/B 정보 차등 — `content.ts`/`products.ts` 값만 바꾸면 반영됩니다.
