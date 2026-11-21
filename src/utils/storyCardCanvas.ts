import type {MoodAyahEntry} from '../types/quran';
import {toArabicDigits} from './quranLogic';

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/**
 * Renders a 1080x1920 high-resolution Emerald & Gold Islamic Story Card PNG
 * strictly client-side on an HTML5 canvas (zero external APIs).
 */
export async function renderHeartStoryCardPng(
  entry: MoodAyahEntry,
  lang: 'en' | 'ar'
): Promise<{blob: Blob; dataUrl: string; filename: string}> {
  if (typeof document === 'undefined') {
    throw new Error('Canvas generation requires a browser environment');
  }
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  const W = 1080;
  const H = 1920;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  // 1. Deep Emerald & Obsidian Gradient Backdrop
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0, '#07110D');
  bgGrad.addColorStop(0.5, '#0B1914');
  bgGrad.addColorStop(1, '#070E0B');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Subtle top golden radial glow
  const glow = ctx.createRadialGradient(W / 2, H * 0.34, 20, W / 2, H * 0.34, 520);
  glow.addColorStop(0, 'rgba(212, 175, 55, 0.14)');
  glow.addColorStop(0.6, 'rgba(16, 185, 129, 0.06)');
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // 2. Ornate Gold Double Frame
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.42)';
  ctx.lineWidth = 3;
  ctx.strokeRect(52, 52, W - 104, H - 104);

  ctx.strokeStyle = 'rgba(16, 185, 129, 0.25)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(70, 70, W - 140, H - 140);

  // Corner 8-pointed star medallions
  const drawStarCorner = (cx: number, cy: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.65)';
    ctx.lineWidth = 2;
    ctx.strokeRect(-14, -14, 28, 28);
    ctx.rotate(Math.PI / 4);
    ctx.strokeRect(-14, -14, 28, 28);
    ctx.restore();
  };
  drawStarCorner(70, 70);
  drawStarCorner(W - 70, 70);
  drawStarCorner(70, H - 70);
  drawStarCorner(W - 70, H - 70);

  // 3. Top Header Crest (Crescent + Surah Name)
  ctx.textAlign = 'center';
  ctx.fillStyle = '#D4AF37';
  ctx.font = '600 32px "Scheherazade New", serif';
  ctx.fillText(`سُورَةُ ${entry.surahNameAr} · الآية ${toArabicDigits(entry.ayah)}`, W / 2, 210);

  ctx.fillStyle = '#10B981';
  ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(
    `${entry.surahNameEn.toUpperCase()}  ·  ${entry.surah}:${entry.ayah}`,
    W / 2,
    260
  );

  // Thin ornamental divider line
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.32)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 140, 315);
  ctx.lineTo(W / 2 + 140, 315);
  ctx.stroke();

  // 4. Primary Arabic Ayah Typography
  ctx.fillStyle = '#F7F4EB';
  ctx.direction = 'rtl';
  ctx.font = '400 74px "Amiri Quran", "Scheherazade New", serif';
  const arLines = wrapLines(ctx, entry.arabic, W - 210);
  const arLineHeight = 148;
  const totalArHeight = arLines.length * arLineHeight;
  let currentY = Math.max(460, 720 - totalArHeight / 2);

  for (const line of arLines) {
    ctx.fillText(line, W / 2, currentY);
    currentY += arLineHeight;
  }

  // 5. English Translation + Reflection
  ctx.direction = 'ltr';
  currentY += 50;
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.25)';
  ctx.beginPath();
  ctx.moveTo(W / 2 - 90, currentY);
  ctx.lineTo(W / 2 + 90, currentY);
  ctx.stroke();

  currentY += 80;
  ctx.fillStyle = '#D6D3C9';
  ctx.font = '400 34px "Plus Jakarta Sans", sans-serif';
  const enLines = wrapLines(ctx, `“${entry.translationEn}”`, W - 220);
  for (const line of enLines) {
    ctx.fillText(line, W / 2, currentY);
    currentY += 52;
  }

  // Reflection note
  currentY += 46;
  ctx.fillStyle = '#34D399';
  if (lang === 'ar') {
    ctx.direction = 'rtl';
    ctx.font = '400 34px "Scheherazade New", serif';
    const refLines = wrapLines(ctx, entry.reflectionAr, W - 240);
    for (const line of refLines) {
      ctx.fillText(line, W / 2, currentY);
      currentY += 56;
    }
  } else {
    ctx.font = '500 26px "Plus Jakarta Sans", sans-serif';
    const refLines = wrapLines(ctx, entry.reflectionEn, W - 240);
    for (const line of refLines) {
      ctx.fillText(line, W / 2, currentY);
      currentY += 42;
    }
  }

  // 6. Footer Brand Mark
  ctx.direction = 'ltr';
  ctx.fillStyle = '#D4AF37';
  ctx.font = '700 30px "Scheherazade New", serif';
  ctx.fillText('نَغمة القرآن · Naghma Quran', W / 2, H - 155);

  ctx.fillStyle = 'rgba(244, 241, 234, 0.55)';
  ctx.font = '500 20px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`Madani Mushaf Page ${entry.page} of 604`, W / 2, H - 115);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => {
      if (b) resolve(b);
      else reject(new Error('Failed to export PNG story card'));
    }, 'image/png');
  });

  const dataUrl = canvas.toDataURL('image/png');
  const filename = `naghma-ayah-${entry.surah}-${entry.ayah}.png`;
  return {blob, dataUrl, filename};
}
