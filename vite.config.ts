import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// 로컬 개발/데모용 Vite 설정.
// 앱인토스 배포 시에는 granite.config.ts + `ait` 툴체인이 번들링을 담당합니다.
// (README의 "앱인토스로 이관하기" 참고)
export default defineConfig({
  // 상대경로 base — GitHub Pages 프로젝트 하위경로(/repo/)에서도 에셋이 정상 로드됨.
  base: './',
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
      babel: { plugins: ['@emotion/babel-plugin'] },
    }),
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  server: { host: true, port: 5173, allowedHosts: true },
  preview: { host: true, port: 4173, allowedHosts: true },
});
