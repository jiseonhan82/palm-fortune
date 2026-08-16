// 앱인토스 진입점(엔트리) 템플릿.
// `AppsInToss.registerApp` 이 파일 기반 라우팅/뒤로가기/가시성 감지 등을 자동 제공합니다.
// 정확한 시그니처는 `npx ait init` 이 생성하는 버전을 기준으로 하세요(SDK 버전에 따라 상이).
import { AppsInToss } from '@apps-in-toss/web-framework';
import type { PropsWithChildren } from 'react';
import { context } from '../require.context';

function AppContainer({ children }: PropsWithChildren) {
  // 전역 Provider/테마가 필요하면 여기에서 감쌉니다.
  return <>{children}</>;
}

export default AppsInToss.registerApp(AppContainer, { context });
