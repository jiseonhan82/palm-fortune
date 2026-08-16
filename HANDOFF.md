# 🔁 개발 이어가기 (HANDOFF)

다른 컴퓨터 / 새 세션에서 이 프로젝트를 곧바로 이어서 개발하기 위한 안내 문서.

## 0. 한눈에

| | |
|---|---|
| **라이브 링크** | https://ouiwefilm-cloud.github.io/palm-fortune/ (영구, GitHub Pages) |
| **저장소** | https://github.com/ouiwefilm-cloud/palm-fortune (public) |
| **정체** | 토스 **앱인토스 WebView 미니앱** — 손바닥 촬영 → 손금 풀이 + 오늘의 운세 |
| **스택** | Vite + React 18 + TypeScript + emotion (심사 전 TDS 이관 예정) |
| **배포** | `main`에 push → GitHub Actions가 자동 빌드·Pages 배포 |
| **핵심 원칙** | 💸 **유료 AI 안 씀.** 이미지 시드 기반 로컬 $0 콘텐츠 엔진 |
| **기획서** | 저장소에 없음 → `~/Downloads/손금-미니앱-기획서.md` (필요 시 따로 지참) |

## 1. 새 컴퓨터 셋업

**전제:** Node 20+ (CI는 20 사용), git, (배포하려면) GitHub 로그인.

```bash
git clone https://github.com/ouiwefilm-cloud/palm-fortune.git
cd palm-fortune
npm install
npm run dev          # http://localhost:5173  (브라우저 데모)
```

브라우저에서는 카메라=파일 선택(모바일=카메라 실행), 결제=모의(과금 없음)로 전체 플로우가 끝까지 동작합니다.

**검증 명령:**
```bash
npm run typecheck    # 타입 체크
npm run build        # 프로덕션 빌드 (dist/)
npm run smoke        # $0 손금 엔진 자체 테스트 (결정론·다양성·구조·분포)
```

## 2. 지금까지 완료 (핵심 수익 플로우)

`온보딩 → 촬영 → 로딩(5~8초 연출) → 무료결과 → 프리미엄 락 → IAP → 공유`

| 화면 | 파일 |
|---|---|
| 온보딩 | `src/screens/OnboardingScreen.tsx` |
| 촬영(가이드 오버레이) | `src/screens/CaptureScreen.tsx` |
| 분석 로딩 | `src/screens/LoadingScreen.tsx` |
| 무료 결과(희귀손금⭐+생명/두뇌선) | `src/screens/ResultScreen.tsx` |
| 프리미엄 락 + IAP | `src/screens/PaywallScreen.tsx` |
| 상세 리포트(해제 후) | `src/screens/PremiumReport.tsx` |
| 공유 카드(canvas 이미지) | `src/screens/ShareSheet.tsx` |

## 3. 아키텍처 파일 지도

```
src/
  App.tsx                 # 플로우 상태머신 (step: onboarding→...→paywall)
  main.tsx                # 로컬/브라우저 진입점
  theme.ts, global.tsx    # 디자인 토큰 · 전역 스타일
  types.ts                # 도메인 타입 (Reading, RarePattern, PremiumSection...)
  lib/
    bridge/index.ts       # 앱인토스 SDK 어댑터 (카메라/IAP/공유 + 브라우저 폴백)
    reading/
      seed.ts             # 이미지 해시 → 시드 RNG (결정론)
      content.ts          # ⭐ 콘텐츠 라이브러리 (여기만 늘리면 결과 변주↑)
      engine.ts           # 시드 → Reading 생성
    products.ts           # ⭐ IAP 상품 카탈로그 (sku, 가격 표시)
    storage.ts            # 결제/해제 상태 (localStorage)
    shareImage.ts         # 공유 카드 canvas 렌더링
  ui/primitives.tsx       # 버튼·카드·배경 (심사 시 TDS로 교체)
  screens/                # 각 화면
appsintoss-template/      # 앱인토스 이관용 타겟 파일 (granite.config 등)
scripts/smoke.ts          # 엔진 스모크 테스트
.github/workflows/deploy.yml  # Pages 자동 배포
```

## 4. 자주 만지는 곳

- **콘텐츠 늘리기(가장 흔함):** `src/lib/reading/content.ts` — 희귀문양/생명선/두뇌선/프리미엄 문구 풀에 항목 추가하면 변주가 늘어남. 톤은 "재미/오락", 단정적 의학·재정 표현 금지.
- **가격·상품:** `src/lib/products.ts` — `sku`는 앱인토스 콘솔 등록값과 반드시 일치.
- **화면/UX:** `src/screens/*`
- **SDK 연동 동작:** `src/lib/bridge/index.ts`

## 5. 배포 방법 (영구 링크)

```bash
git add -A && git commit -m "..." && git push
```
`main`에 push하면 GitHub Actions(`.github/workflows/deploy.yml`)가 빌드→Pages 배포. **1~2분 뒤 라이브 링크에 자동 반영**되고 **URL은 안 바뀝니다.**

배포 상태 보기: `gh run watch` 또는 저장소 Actions 탭.

⚠️ **건드리면 안 되는 것:**
- `vite.config.ts`의 `base: './'` — Pages 하위경로(`/palm-fortune/`)에서 에셋 로드에 필수.
- 저장소 **public 유지** — 무료 플랜은 **비공개 저장소 Pages 미지원(422)**.

## 6. 앱인토스 이관 (심사·출시 전)

`appsintoss-template/`에 타겟 파일(`granite.config.ts`, `pages/index.tsx`, `_app.tsx`, `require.context.ts`)이 있음. README의 "앱인토스로 이관하기" 참고.

1. `npm i -g @apps-in-toss/ax && ax mcp` 또는 `npm i @apps-in-toss/web-framework && npx ait init`
2. `granite.config.ts`에 콘솔 발급 `appName`/아이콘/권한(camera) 반영
3. 홈 라우트에서 `<App/>` 렌더 (`appsintoss-template/pages/index.tsx` 참고)
4. **TDS 이관**: `@toss/tds-mobile` 설치 후 `ui/primitives.tsx`를 TDS로 교체 (**비게임 WebView 심사 필수**)
5. IAP 상품 콘솔 등록 → `products.ts`의 `sku`와 일치

카메라/IAP/공유는 `bridge/index.ts`가 토스 앱 안에서 실제 SDK를 자동 감지해 호출함(밖에선 폴백).

## 7. 다음 로드맵

- **커플 궁합 리포트** — 초대 링크·기기 간 상태 (여기서 처음으로 백엔드 필요: 무료 서버리스 + 무료 DB). 원칙: 초대자만 결제, 파트너 무료.
- **오늘의 손금 운세** — 매일 갱신, 재방문 장치
- **토스 로그인 / 푸시 알림**
- **서버 영수증 검증** — 현재 결제 지급은 로컬(localStorage). 실제 서비스는 서버 검증 보강 필요.
- **TDS 이관**, **IAP 콘솔 상품 등록**

## 8. 사람이 직접 해야 하는 것 (코드로 대체 불가)

- 앱인토스 개발자센터에서 미니앱 등록 → `appName` 확보
- IAP 소모성 상품 3종 등록 → `products.ts`의 `sku`와 일치
- 개인정보 처리방침 작성 (손바닥 이미지 처리, 커플 시 파트너 정보)

## 9. 함정 / 교훈 (이 세션에서 확인)

- **유료 비전 AI 붙이지 말 것.** 기획서가 "정확성보다 재미"라 $0 로컬 엔진으로 충분. (비용 발생 = 사용자 반대)
- GitHub Pages는 **public 저장소만** 무료. 비공개는 422 에러.
- `vite.config.ts` `base:'./'`, `allowedHosts:true` 유지 (하위경로 에셋 / 터널·preview 접근).
- **Vercel** 팀 `ouiwefilm-8866`은 프로젝트 생성 권한 막힘(403) → 영구배포에 부적합.
- **cloudflared quick tunnel**은 세션에 매여 자주 죽음 → 임시 테스트용으로만. 영구 링크는 Pages.

---
_이 문서를 새 세션 Claude에게 먼저 읽히면 맥락을 빠르게 잡습니다._
