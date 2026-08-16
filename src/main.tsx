// 로컬 개발/브라우저 데모 진입점.
// 앱인토스 배포 시에는 src/_app.tsx + pages/ 라우팅(AppsInToss.registerApp)이 진입점이 됩니다.
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
