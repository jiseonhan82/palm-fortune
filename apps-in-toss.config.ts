// 앱인토스 배포 설정 (@apps-in-toss/web-framework v3 / apps-in-toss.config 형식).
// appName은 앱인토스 콘솔(https://apps-in-toss.toss.im/)에 등록한 값과 반드시 일치해야 하며,
// 딥링크 intoss://{appName} 로도 쓰입니다. 등록 후에는 변경 불가.
//
// displayName · 아이콘 · 스토어 설명 등은 이 파일이 아니라 콘솔에서 관리합니다.
import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'palmlab',
  brand: {
    // theme.ts의 violet과 동일 (버튼/포인트 컬러)
    primaryColor: '#8b6bff',
  },
  // Device.openCamera 사용 (손바닥 촬영). 콘솔의 권한 심사 항목과 일치시켜야 함.
  permissions: [{ name: 'camera', access: 'access' }],
  // `npm run build:ait`가 먼저 vite build로 만든 산출물 위치
  webBundleDir: 'dist',
});
