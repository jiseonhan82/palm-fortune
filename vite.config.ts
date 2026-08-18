import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import aitDevtools from '@apps-in-toss/devtools/unplugin';
import path from 'node:path';

// 로컬 개발/데모용 Vite 설정.
// 앱인토스 배포 시에는 apps-in-toss.config.ts + `ait build`/`ait deploy`가 패키징을 담당합니다.
// (README의 "앱인토스로 이관하기" 참고)
export default defineConfig({
  // 상대경로 base — GitHub Pages 프로젝트 하위경로(/repo/)에서도 에셋이 정상 로드됨.
  base: './',
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
      babel: { plugins: ['@emotion/babel-plugin'] },
    }),
    // 앱인토스 SDK를 mock으로 치환 + 플로팅 디버그 패널 주입.
    // production 빌드(vite build)에서는 자동으로 완전히 비활성화됨 → GitHub Pages 배포엔 영향 없음.
    aitDevtools.vite(),
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  server: { host: true, port: 5173, allowedHosts: true },
  preview: { host: true, port: 4173, allowedHosts: true },
});
