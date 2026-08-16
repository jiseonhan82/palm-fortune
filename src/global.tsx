import { Global, css } from '@emotion/react';
import { theme } from './theme';

export function GlobalStyles() {
  return (
    <Global
      styles={css`
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css');

        * {
          box-sizing: border-box;
          -webkit-tap-highlight-color: transparent;
        }
        html,
        body,
        #root {
          margin: 0;
          padding: 0;
          height: 100%;
        }
        body {
          font-family: ${theme.font.family};
          background: ${theme.color.bgDeep};
          color: ${theme.color.text};
          overscroll-behavior: none;
          -webkit-font-smoothing: antialiased;
        }
        #root {
          display: flex;
          justify-content: center;
        }
        button {
          font-family: inherit;
          cursor: pointer;
          border: none;
          background: none;
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        @keyframes twinkle {
          0%,
          100% {
            opacity: 0.2;
          }
          50% {
            opacity: 1;
          }
        }
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}
    />
  );
}
