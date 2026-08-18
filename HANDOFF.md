# 🔁 개발 이어가기 (HANDOFF)

다른 컴퓨터 / 새 세션에서 이 프로젝트를 곧바로 이어서 개발하기 위한 안내 문서.

## 0. 한눈에

| | |
|---|---|
| **라이브 링크** | https://jiseonhan82.github.io/palm-fortune/ (영구, GitHub Pages) |
| **저장소** | https://github.com/jiseonhan82/palm-fortune (public) |
| **정체** | 토스 **앱인토스 WebView 미니앱** — 손바닥 촬영 → 손금 풀이 + 오늘의 운세 |
| **스택** | Vite + React 18 + TypeScript + emotion (심사 전 TDS 이관 예정) |
| **배포** | `main`에 push → GitHub Actions가 자동 빌드·Pages 배포 |
| **핵심 원칙** | 💸 **유료 AI 안 씀.** 이미지 시드 기반 로컬 $0 콘텐츠 엔진 |
| **기획서** | 저장소에 없음 → `~/Downloads/손금-미니앱-기획서.md` (필요 시 따로 지참) |
| **앱인토스 appName** | `palmlab` (콘솔 등록 완료, 변경 불가) |

## 1. 새 컴퓨터 셋업

**전제:** Node 20+ (일반 개발/GH Pages CI는 20으로 충분), git, (배포하려면) GitHub 로그인.
**앱인토스 CLI(`ait`)/devtools를 쓰려면 Node 24+ 필요** (`@apps-in-toss/ait-format`, `unplugin` 등이 요구). 없으면 `npm run dev`/`npm run build`는 되지만 `npm run build:ait`/`npm run deploy`가 실패하거나 mock 패널이 안 뜰 수 있음.

```bash
git clone https://github.com/jiseonhan82/palm-fortune.git
cd palm-fortune
npm install
npm run dev          # http://localhost:5173  (브라우저 데모)
```

브라우저에서는 카메라=파일 선택(모바일=카메라 실행), 결제=모의(과금 없음)로 전체 플로우가 끝까지 동작합니다.

**검증 명령:**
```bash
npm run typecheck    # 타입 체크
npm run build        # 프로덕션 빌드 (dist/) — GitHub Pages용, ait 관여 없음
npm run smoke        # $0 손금 엔진 자체 테스트 (결정론·다양성·구조·분포)
npm run build:ait    # dist/ 빌드 + apps-in-toss.config.ts 읽어 palmlab.ait 아티팩트 생성 (Node 24+)
```

**`npm run dev` 실행 시 화면 우측 하단에 "AIT" 플로팅 버튼이 뜹니다.** `@apps-in-toss/devtools`가 실제 앱인토스 SDK를 mock으로 치환한 것 — 카메라·IAP 결제·이미지 저장·공유가 전부 **진짜 네이티브 브릿지 코드 경로**로 동작하고(파일선택 다이얼로그 없이 즉시 mock 이미지 반환, 실제 결제창 없이 IAP 성공 이벤트 발생 등), 그 버튼을 눌러 플랫폼(iOS/Android)·권한 거부·네트워크 등 상태도 바꿔볼 수 있습니다. **실기기 없이도 네이티브 경로 회귀 테스트가 가능**하다는 뜻 — 이 패널은 `vite build`(프로덕션)에서는 자동으로 완전히 빠집니다(번들에 0바이트 기여).

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
    bridge/index.ts       # 앱인토스 SDK 어댑터 (카메라/IAP/공유/저장 + 브라우저 폴백)
    supabase.ts           # 커플 궁합용 Supabase 클라이언트 + CRUD (env 없으면 null, 기능 자동 숨김)
    reading/
      seed.ts             # 이미지 해시 → 시드 RNG (결정론)
      content.ts          # ⭐ 개인 손금 콘텐츠 라이브러리 (여기만 늘리면 결과 변주↑)
      engine.ts           # 시드 → Reading 생성
      coupleContent.ts    # ⭐ 궁합 콘텐츠 라이브러리
      coupleEngine.ts     # 두 시드 결합 → CoupleReading 생성
    products.ts           # ⭐ IAP 상품 카탈로그 (sku, 가격 표시)
    storage.ts            # 결제/해제 상태 (localStorage)
    shareImage.ts         # 공유 카드 canvas 렌더링
  ui/primitives.tsx       # 버튼·카드·배경 (심사 시 TDS로 교체)
  screens/                # 각 화면 (Couple* 4개가 궁합 플로우)
apps-in-toss.config.ts    # 앱인토스 배포 설정 (appName·권한·webBundleDir) — @apps-in-toss/web-framework v3
supabase/schema.sql       # 커플 궁합용 DB 스키마 (Supabase SQL Editor에서 실행)
scripts/smoke.ts          # 엔진 스모크 테스트 (개인 + 궁합)
.github/workflows/deploy.yml  # Pages 자동 배포 (GitHub Pages 전용, ait와 무관)
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

## 6. 앱인토스 이관 — ✅ 코드 이관 완료 (테스트 배포만 남음)

`@apps-in-toss/web-framework` v3(SDK 3.0.4)로 실제 이관 끝. **주의: 예전에 있던 `appsintoss-template/`(granite.config.ts + pages/_app.tsx 파일기반 라우팅 방식)는 v2 시절 문서라 v3와 안 맞아서 삭제함.** v3는 새 프로젝트 스캐폴딩이 아니라, **기존 Vite 엔트리(`src/main.tsx`) 그대로에 설정 파일 하나만 추가**하는 방식.

**완료된 것:**
1. `@apps-in-toss/web-framework`(dependency) + `@apps-in-toss/devtools`(devDependency) 설치
2. `apps-in-toss.config.ts` 생성 — `appName: 'palmlab'`, `permissions: [{ name: 'camera', access: 'access' }]`, `webBundleDir: 'dist'`
3. `vite.config.ts`에 `aitDevtools.vite()` 플러그인 연결 (프로덕션 빌드에선 자동 비활성화)
4. `bridge/index.ts`를 실제 v3 SDK 시그니처에 맞게 수정 — **`Share.share`는 v3에 없는 API였음(구버전 가정 오류), 실제로는 `Share.sendMessage({ message })`**. `Device.openCamera`/`IAP.createOneTimePurchaseOrder`/`File.saveBase64`는 원래 코드가 맞았음(devtools mock으로 실제 호출까지 검증 완료).
5. `package.json`에 `build:ait`(`ait build`로 `.ait` 아티팩트 생성), `deploy`(`ait deploy`) 스크립트 추가. 기존 `build`(GH Pages용)는 그대로 둬서 CI 영향 없음.
6. 로컬에서 `npm run build:ait`로 `palmlab.ait` 생성까지 실제로 검증함.

**남은 건 사람이 해야 함 (8번 참고):** 콘솔에서 API 토큰 발급 → `ait token add` → `npm run deploy`로 실제 업로드해야 실기기(샌드박스 앱)에서 열어볼 수 있음.

**TDS 이관은 아직 안 함** — `ui/primitives.tsx`가 여전히 커스텀 컴포넌트. 정식 심사 전엔 `@toss/tds-mobile`로 교체 필요(테스트 배포 자체엔 필수 아님).

카메라/IAP/공유/저장은 `bridge/index.ts`가 실제 토스 앱 WebView 안에서 SDK를 감지해 네이티브로 호출하고, 그 밖(브라우저)에선 자동 폴백함.

## 6-1. 커플 궁합 리포트 — ✅ 코드 구현 완료 (Supabase 연결만 남음)

이 프로젝트에서 처음으로 백엔드(Supabase)가 필요한 기능. 설계 원칙:
- **초대자만 결제**, 파트너는 링크만 열면 무료
- **손바닥 사진 원본은 서버로 안 감** — 각자 기기에서 로컬로 계산한 시드(해시 문자열)만 Supabase에 저장
- **초대자의 개인 결과는 안 바뀜** — 궁합 진입 시 재촬영 없이 방금 본 `reading`을 그대로 재사용. 재촬영은 파트너만 함(그쪽은 "다시 찍기"가 아니라 "처음 찍기"라 문제 없음)

**흐름:**
1. 결과 화면 → "💌 커플 궁합 보기" → [CoupleInviteScreen](src/screens/CoupleInviteScreen.tsx)에서 결제(`PRODUCTS.coupleReport`) → Supabase에 초대(inviter 시드만) 생성 → 범용 URL 링크(`?invite={id}`) 공유 + 3초 간격 폴링으로 대기
2. 파트너가 링크 열면 → [CoupleJoinFlow](src/screens/CoupleJoinFlow.tsx) → 자기 손바닥 촬영(로컬에서 개인 `Reading` 생성) → Supabase에 파트너 시드 업데이트
3. 양쪽 시드가 모이면 [generateCoupleReading](src/lib/reading/coupleEngine.ts)이 **두 시드를 정렬 후 결합**해 새 시드를 만들고, 그걸로 궁합 콘텐츠 조립(개인 엔진과 동일한 $0·결정론적 방식 — 서버 연산 없음, 누가 초대했는지와 무관하게 항상 같은 결과)
4. 초대자는 폴링이 완료를 감지하면, 파트너는 촬영 직후 곧바로 [CoupleResultScreen](src/screens/CoupleResultScreen.tsx)으로 각자 진입

**남은 건 사람이 해야 함:**
1. https://supabase.com 프로젝트 생성 → SQL Editor에서 [supabase/schema.sql](supabase/schema.sql) 실행
2. Project Settings → API에서 URL/anon key 확인 → 로컬은 `.env`(← `.env.example` 복사), GitHub Actions는 **저장소 Settings → Secrets and variables → Actions**에 `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` 등록 (`.github/workflows/deploy.yml`이 이미 이 secrets를 참조하도록 되어 있음)
3. 값이 없으면 `isCoupleFeatureAvailable()`이 false를 반환해 결과 화면에서 "궁합 보기" 카드가 자동으로 숨겨짐(안전한 기본값) — 즉 지금 당장 GH Pages에 반영해도 문제없음

**알려진 한계 (v1, 의도적으로 단순화):**
- RLS가 인증 없이 "id를 아는 사람 누구나 읽기/쓰기 가능" 방식(비밀 URL 신뢰 모델). 실명 인증 아님 — 재미 목적 MVP 수준의 리스크로 판단.
- 초대자가 "대기 중" 화면에서 새로고침/앱을 나가면 `inviteId`를 잃어버림(세션에만 존재, localStorage 미저장). 나중에 개선하면 좋음.
- 오래된 미완료 초대 자동 정리(TTL) 없음 — 필요해지면 Supabase pg_cron이나 수동 정리로 추가.

## 7. 다음 로드맵

- ✅ **커플 궁합 리포트** — 코드 구현 완료, Supabase 프로젝트 연결만 남음 (아래 6-1 참고)
- **오늘의 손금 운세** — 매일 갱신, 재방문 장치
- **토스 로그인 / 푸시 알림**
- **서버 영수증 검증** — 현재 결제 지급은 로컬(localStorage). 실제 서비스는 서버 검증 보강 필요.
- **TDS 이관**, **IAP 콘솔 상품 등록**

## 8. 사람이 직접 해야 하는 것 (코드로 대체 불가)

- ~~앱인토스 개발자센터에서 미니앱 등록 → `appName` 확보~~ ✅ 완료 (`palmlab`)
- **Supabase 프로젝트 생성 + 연결** (커플 궁합용, 6-1 참고): 계정 생성 → `supabase/schema.sql` 실행 → URL/anon key를 `.env`와 GitHub Actions secrets에 등록
- **테스트 배포**: 콘솔(앱인토스 개발자센터 → 워크스페이스 → API 키 발급) → 로컬 터미널에서
  ```bash
  npx ait token add   # API 키 붙여넣기 (대화형 프롬프트, ~/.ait/credentials에 저장됨 — 저장소와 무관)
  npm run deploy       # palmlab.ait 업로드
  ```
  업로드 후 샌드박스 앱에서 `intoss://palmlab` 딥링크로 열어 실기기 확인.
  ⚠️ API 키는 비밀값이라 Claude에게 붙여넣지 말고 본인 터미널에서 직접 실행 권장.
- IAP 소모성 상품 3종 등록 → `products.ts`의 `sku`와 일치
- 개인정보 처리방침 작성 (손바닥 이미지 처리, 커플 시 파트너 정보)
- (정식 심사 신청 전) TDS 이관, 스토어 노출 정보(설명/스크린샷/카테고리) 콘솔에 채우기

## 9. 함정 / 교훈 (이 세션에서 확인)

- **유료 비전 AI 붙이지 말 것.** 기획서가 "정확성보다 재미"라 $0 로컬 엔진으로 충분. (비용 발생 = 사용자 반대)
- GitHub Pages는 **public 저장소만** 무료. 비공개는 422 에러.
- `vite.config.ts` `base:'./'`, `allowedHosts:true` 유지 (하위경로 에셋 / 터널·preview 접근).
- **Vercel** 팀 `ouiwefilm-8866`은 프로젝트 생성 권한 막힘(403) → 영구배포에 부적합.
- **cloudflared quick tunnel**은 세션에 매여 자주 죽음 → 임시 테스트용으로만. 영구 링크는 Pages.
- **`granite.config.ts` + `pages/`/`_app.tsx` 파일기반 라우팅은 `@apps-in-toss/web-framework` 2.x 방식.** 3.x(현재 최신, 2026-08 기준 3.0.4)는 `apps-in-toss.config.ts` + 기존 Vite 엔트리 그대로 쓰는 훨씬 단순한 방식으로 바뀜. `npx ait migrate v3`로 2.x→3.x 자동 전환 가능하지만, 이 프로젝트는 애초에 신규였어서 `npx ait init`으로 바로 시작함.
- **`npx ait init`은 완전 대화형(clack/prompts 기반)이라 파이프로 자동입력이 안 먹힘** — stdin에 문자만 "타이핑"되고 Enter가 제출로 안 이어짐(raw TTY 필요). `--app-name`으로 appName은 건너뛸 수 있지만 `webBundleDir` 질문에서 멈춤. → 이 세션에서는 CLI 대신 **수동으로 `apps-in-toss.config.ts`/`package.json`/`vite.config.ts`를 직접 작성**하는 우회로 진행함. 같은 문제 만나면 반복 실행하지 말 것(매번 실행될 때마다 package.json/gitignore가 중복 append됨 — 실제로 한 번 겪음, `git checkout`으로 되돌리고 수동 작성으로 정리).
- **`@apps-in-toss/ait-format`은 Node ≥24 필수.** Node 20으로 `npm install`하면 EBADENGINE 경고만 뜨고 설치는 되지만, `ait` CLI 실행이 이상 동작할 수 있어 Node 24 바이너리를 따로 받아 씀. 다만 **일반 `vite dev`/`vite build`는 Node 20에서도 정상 동작**(CI는 그대로 20 유지, 안 건드림).
- **`@apps-in-toss/devtools`가 실기기 없이 네이티브 SDK를 mock으로 완벽 대체**해줌 — `npm run dev` 화면 우측 하단 "AIT" 버튼. 카메라 촬영이 파일선택 다이얼로그 없이 즉시 mock 이미지를 반환하고, IAP 결제·이미지 저장도 실제 브릿지 코드 경로로 동작·검증 가능. 프로덕션 빌드에선 0바이트로 자동 제외됨. 앞으로 브릿지 관련 기능 만들 때 이걸로 먼저 검증할 것.
- **`bridge/index.ts`의 `Share.share(payload)` 호출은 실제 v3 SDK에 없는 메서드였음** — v3엔 `Share.sendMessage({ message: string })` 하나뿐(텍스트만, 파일 첨부 불가). SDK 미설치 상태로 작성돼서 지금까지 안 걸렸던 버그. 이관하며 devtools mock 타입 정의(`node_modules/@apps-in-toss/web-framework/dist/index.d.ts`)를 직접 읽고 맞춰 고침 — 공식 문서(WebFetch 요약)보다 **설치된 패키지의 `.d.ts`가 가장 정확한 소스**였음.

---
_이 문서를 새 세션 Claude에게 먼저 읽히면 맥락을 빠르게 잡습니다._
