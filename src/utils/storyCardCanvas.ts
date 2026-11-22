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
 * Renders a 1080x1920 high-resolution Warm Sand & Honey Gold Islamic Story Card PNG
 * strictly client-side on an HTML5 canvas.
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

  // 1. Warm Sand & Honey Ivory Backdrop
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0, '#FDFBF7');
  bgGrad.addColorStop(0.5, '#FAF3E6');
  bgGrad.addColorStop(1, '#F5E7CE');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Warm sunset honey glow
  const glow = ctx.createRadialGradient(W / 2, H * 0.3, 20, W / 2, H * 0.3, 540);
  glow.addColorStop(0, 'rgba(217, 119, 6, 0.14)');
  glow.addColorStop(0.6, 'rgba(249, 115, 22, 0.06)');
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // 2. Refined Warm Gold Border Frame
  ctx.strokeStyle = 'rgba(217, 119, 6, 0.35)';
  ctx.lineWidth = 3;
  ctx.strokeRect(56, 56, W - 112, H - 112);

  ctx.strokeStyle = 'rgba(180, 83, 9, 0.16)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(72, 72, W - 144, H - 144);

  // 3. Top Header Crest
  ctx.textAlign = 'center';
  ctx.fillStyle = '#B45309';
  ctx.font = '600 34px "Scheherazade New", serif';
  ctx.fillText(`سُورَةُ ${entry.surahNameAr} · الآية ${toArabicDigits(entry.ayah)}`, W / 2, 210);

  ctx.fillStyle = '#D97706';
  ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(
    `${entry.surahNameEn.toUpperCase()}  ·  ${entry.surah}:${entry.ayah}`,
    W / 2,
    260
  );

  // Thin ornamental divider line
  ctx.strokeStyle = 'rgba(217, 119, 6, 0.32)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 140, 315);
  ctx.lineTo(W / 2 + 140, 315);
  ctx.stroke();

  // 4. Primary Arabic Ayah Typography
  ctx.fillStyle = '#2D231E';
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
  ctx.strokeStyle = 'rgba(217, 119, 6, 0.25)';
  ctx.beginPath();
  ctx.moveTo(W / 2 - 90, currentY);
  ctx.lineTo(W / 2 + 90, currentY);
  ctx.stroke();

  currentY += 80;
  ctx.fillStyle = '#4E3629';
  ctx.font = '400 34px "Plus Jakarta Sans", sans-serif';
  const enLines = wrapLines(ctx, `“${entry.translationEn}”`, W - 220);
  for (const line of enLines) {
    ctx.fillText(line, W / 2, currentY);
    currentY += 52;
  }

  // Reflection note
  currentY += 46;
  ctx.fillStyle = '#B45309';
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
  ctx.fillStyle = '#B45309';
  ctx.font = '700 30px "Scheherazade New", serif';
  ctx.fillText('نَجم القرآن · Najm Quran', W / 2, H - 155);

  ctx.fillStyle = 'rgba(78, 54, 41, 0.65)';
  ctx.font = '500 20px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`Madani Mushaf Page ${entry.page} of 604`, W / 2, H - 115);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => {
      if (b) resolve(b);
      else reject(new Error('Failed to export PNG story card'));
    }, 'image/png');
  });

  const dataUrl = canvas.toDataURL('image/png');
  const filename = `najm-ayah-${entry.surah}-${entry.ayah}.png`;
  return {blob, dataUrl, filename};
}
