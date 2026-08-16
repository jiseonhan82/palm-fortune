// 앱인토스 파일 기반 라우팅의 홈 라우트.
// 이관 시 이 파일을 프로젝트 루트의 pages/index.tsx 로 옮기고,
// 우리 앱 진입 컴포넌트(<App/>)를 그대로 렌더링하면 됩니다.
import { App } from '../../src/App';
import { GlobalStyles } from '../../src/global';

export default function Home() {
  return (
    <>
      <GlobalStyles />
      <App />
    </>
  );
}
