// 공유 카드 이미지를 canvas로 직접 그려서 생성 (외부 라이브러리 없이 $0).
// 결제 여부와 무관하게 항상 생성 가능 — 무료 콘텐츠 확산이 목적.

import type { Reading } from '../types';

const W = 1080;
const H = 1350;

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const chars = [...text];
  const lines: string[] = [];
  let line = '';
  for (const ch of chars) {
    const test = line + ch;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = ch;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export async function renderShareImage(reading: Reading): Promise<Blob | null> {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // 배경 그라데이션
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#1a1240');
  bg.addColorStop(0.55, '#0e0b1a');
  bg.addColorStop(1, '#080611');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // 별
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  for (let i = 0; i < 60; i++) {
    const x = (i * 191) % W;
    const y = (i * 271) % H;
    const r = (i % 3) * 0.9 + 0.6;
    ctx.globalAlpha = 0.2 + ((i * 37) % 60) / 100;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  const cx = W / 2;

  // 상단 라벨
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f5c451';
  ctx.font = '700 34px sans-serif';
  ctx.fillText('AI 손금 리딩', cx, 150);

  // 종합 태그
  ctx.fillStyle = '#b9a4ff';
  ctx.font = '700 40px sans-serif';
  ctx.fillText(`# ${reading.overallTag}`, cx, 215);

  // 희귀 문양 카드
  const cardX = 90;
  const cardY = 300;
  const cardW = W - 180;
  const cardH = 620;
  const grad = ctx.createLinearGradient(cardX, cardY, cardX, cardY + cardH);
  grad.addColorStop(0, 'rgba(245,196,81,0.14)');
  grad.addColorStop(1, 'rgba(139,107,255,0.10)');
  ctx.fillStyle = grad;
  roundRect(ctx, cardX, cardY, cardW, cardH, 48);
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(245,196,81,0.4)';
  ctx.stroke();

  // 이모지
  ctx.font = '160px sans-serif';
  ctx.fillText(reading.rare.emoji, cx, cardY + 210);

  // 문양 이름
  ctx.fillStyle = '#f8d98a';
  ctx.font = '800 66px sans-serif';
  ctx.fillText(reading.rare.name, cx, cardY + 320);

  // 희소성
  ctx.fillStyle = '#f5c451';
  ctx.font = '700 40px sans-serif';
  ctx.fillText(`🔥 ${reading.rare.rarityLabel}만 가진 문양`, cx, cardY + 390);

  // 해석 (줄바꿈)
  ctx.fillStyle = '#e9e4ff';
  ctx.font = '400 36px sans-serif';
  ctx.textAlign = 'left';
  const lines = wrap(ctx, reading.rare.meaning, cardW - 120);
  lines.slice(0, 4).forEach((ln, i) => {
    ctx.fillText(ln, cardX + 60, cardY + 470 + i * 52);
  });

  // 하단 CTA
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 42px sans-serif';
  ctx.fillText('내 손금은 몇 명 중 한 명일까?', cx, 1040);
  ctx.fillStyle = '#8478a6';
  ctx.font = '400 34px sans-serif';
  ctx.fillText('토스에서 · AI 손금 · 오늘의 운세', cx, 1100);

  // 손 이모지 장식
  ctx.font = '80px sans-serif';
  ctx.fillText('🖐️', cx, 1230);

  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png', 0.92));
}
