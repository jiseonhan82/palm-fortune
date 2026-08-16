// ⚙️ 앱인토스 설정 템플릿.
// 실제 파일은 `npx ait init` 이 생성/갱신합니다. 아래는 채워 넣을 값 가이드입니다.
// appName 은 콘솔에 등록한 값과 일치해야 하며, 딥링크 intoss://{appName} 로 쓰입니다.
import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'palm-fortune', // TODO: 앱인토스 콘솔에 등록한 미니앱 ID로 교체
  displayName: 'AI 손금 · 오늘의 운세',
  brand: {
    primaryColor: '#8b6bff',
    icon: 'https://example.com/icon.png', // TODO: 앱 아이콘 URL
  },
  // 카메라 권한 선언 (Device.openCamera 사용). 콘솔 심사 항목과 일치시켜야 함.
  permissions: ['camera'],
  web: {
    // Vite 기반 빌드 산출물을 그대로 사용
    host: 'localhost',
    port: 5173,
    commands: {
      dev: 'vite',
      build: 'vite build',
    },
  },
});
