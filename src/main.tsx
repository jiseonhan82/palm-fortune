// 앱 진입점. 로컬 개발/브라우저 데모와 앱인토스(토스 앱) 배포 모두 이 파일을 그대로 씁니다.
// (v3 SDK는 별도 pages/_app.tsx 라우팅 없이, 기존 Vite 엔트리에 apps-in-toss.config.ts만
// 더해서 배포하는 방식 — appsintoss-template/의 구 버전 안내는 더 이상 유효하지 않음)
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { GlobalStyles } from './global';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GlobalStyles />
    <App />
  </StrictMode>,
);
