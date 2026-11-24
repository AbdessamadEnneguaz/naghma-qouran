import type {AppLang} from '../i18n/translations';
import type {MoodAyahEntry} from '../types/quran';
import {toArabicDigits} from './quranLogic';

export type AyahCardFormat = 'story' | 'square';

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
 * Renders a 1080x1920 (Story 9:16) or 1080x1080 (Post 1:1) Warm Desert-Gold
 * Ayah Image Card PNG client-side on an HTML5 canvas with Najm Quran watermark.
 */
export async function renderAyahShareCardPng(options: {
  surah: number;
  ayah: number;
  page: number;
  surahNameAr: string;
  surahNameEn: string;
  arabic: string;
  translation?: string;
  reflection?: string;
  format?: AyahCardFormat;
  lang?: AppLang;
}): Promise<{blob: Blob; dataUrl: string; filename: string}> {
  if (typeof document === 'undefined') {
    throw new Error('Canvas generation requires a browser environment');
  }
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  const format: AyahCardFormat = options.format || 'story';
  const W = 1080;
  const H = format === 'square' ? 1080 : 1920;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  // 1. Warm Desert-Gold Backdrop Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0, '#FDF8EE');
  bgGrad.addColorStop(0.5, '#F8EAD0');
  bgGrad.addColorStop(1, '#F1D6A8');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Luminous golden halo glow
  const glow = ctx.createRadialGradient(
    W / 2,
    H * (format === 'square' ? 0.42 : 0.34),
    20,
    W / 2,
    H * (format === 'square' ? 0.42 : 0.34),
    560
  );
  glow.addColorStop(0, 'rgba(217, 119, 6, 0.16)');
  glow.addColorStop(0.6, 'rgba(180, 83, 9, 0.06)');
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // 2. Refined Outer + Inner Double Frame
  ctx.strokeStyle = 'rgba(180, 83, 9, 0.38)';
  ctx.lineWidth = 3;
  ctx.strokeRect(48, 48, W - 96, H - 96);

  ctx.strokeStyle = 'rgba(217, 119, 6, 0.2)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(64, 64, W - 128, H - 128);

  // Subtle corner diamond accents
  const corners = [
    [64, 64],
    [W - 64, 64],
    [64, H - 64],
    [W - 64, H - 64],
  ];
  ctx.fillStyle = 'rgba(217, 119, 6, 0.55)';
  for (const [cx, cy] of corners) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-6, -6, 12, 12);
    ctx.restore();
  }

  // 3. Top Header Crest
  const topHeaderY = format === 'square' ? 148 : 200;
  const cleanArName = options.surahNameAr.replace('سُورَةُ ', '').trim();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#92400E';
  ctx.font = '700 34px "Scheherazade New", serif';
  ctx.fillText(
    `سُورَةُ ${cleanArName || toArabicDigits(options.surah)} · الآية ${toArabicDigits(options.ayah)}`,
    W / 2,
    topHeaderY
  );

  ctx.fillStyle = '#B45309';
  ctx.font = '600 21px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(
    `${options.surahNameEn.toUpperCase()}  ·  ${options.surah}:${options.ayah}`,
    W / 2,
    topHeaderY + 46
  );

  ctx.strokeStyle = 'rgba(180, 83, 9, 0.3)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 140, topHeaderY + 84);
  ctx.lineTo(W / 2 + 140, topHeaderY + 84);
  ctx.stroke();

  // 4. Primary Uthmani Arabic Ayah Typography
  ctx.fillStyle = '#241812';
  ctx.direction = 'rtl';
  const arFontSize =
    options.arabic.length > 260
      ? format === 'square'
        ? 44
        : 52
      : options.arabic.length > 140
        ? format === 'square'
          ? 52
          : 62
        : format === 'square'
          ? 60
          : 72;
  const arLineHeight = Math.round(arFontSize * 1.92);
  ctx.font = `400 ${arFontSize}px "Amiri Quran", "Scheherazade New", serif`;
  const arLines = wrapLines(ctx, `${options.arabic} ﴿${toArabicDigits(options.ayah)}﴾`, W - 190);
  const totalArHeight = arLines.length * arLineHeight;

  const anchorCenterY = format === 'square' ? H * 0.44 : H * 0.42;
  let currentY = Math.max(
    topHeaderY + 165,
    anchorCenterY - totalArHeight / 2 + arLineHeight * 0.3
  );

  for (const line of arLines) {
    ctx.fillText(line, W / 2, currentY);
    currentY += arLineHeight;
  }

  // 5. Optional Translation & Reflection (trimmed nicely so footer stays clean)
  const footerReservedY = H - (format === 'square' ? 145 : 190);
  if (options.translation && currentY + 90 < footerReservedY) {
    ctx.direction = 'ltr';
    currentY += 28;
    ctx.strokeStyle = 'rgba(180, 83, 9, 0.25)';
    ctx.beginPath();
    ctx.moveTo(W / 2 - 90, currentY);
    ctx.lineTo(W / 2 + 90, currentY);
    ctx.stroke();

    currentY += 56;
    ctx.fillStyle = '#4A3326';
    const trFont = format === 'square' ? 24 : 31;
    const trLineH = format === 'square' ? 36 : 46;
    ctx.font = `400 ${trFont}px "Plus Jakarta Sans", sans-serif`;
    const trLines = wrapLines(ctx, `“${options.translation}”`, W - 210);
    for (const line of trLines) {
      if (currentY + trLineH > footerReservedY - 24) break;
      ctx.fillText(line, W / 2, currentY);
      currentY += trLineH;
    }
  }

  if (options.reflection && currentY + 55 < footerReservedY) {
    currentY += 24;
    ctx.fillStyle = '#92400E';
    ctx.direction = options.lang === 'ar' ? 'rtl' : 'ltr';
    ctx.font =
      options.lang === 'ar'
        ? '400 28px "Scheherazade New", serif'
        : '500 23px "Plus Jakarta Sans", sans-serif';
    const refLines = wrapLines(ctx, options.reflection, W - 230);
    for (const line of refLines.slice(0, 2)) {
      if (currentY + 38 > footerReservedY - 10) break;
      ctx.fillText(line, W / 2, currentY);
      currentY += 38;
    }
  }

  // 6. Required Brand Watermark ("Najm Quran · نَجم القرآن")
  ctx.direction = 'ltr';
  ctx.fillStyle = '#92400E';
  ctx.font = '700 30px "Scheherazade New", serif';
  ctx.fillText('Najm Quran · نَجم القرآن', W / 2, H - (format === 'square' ? 110 : 145));

  ctx.fillStyle = 'rgba(74, 51, 38, 0.68)';
  ctx.font = '500 19px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(
    `Madani Mushaf · Page ${options.page} of 604`,
    W / 2,
    H - (format === 'square' ? 78 : 108)
  );

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => {
      if (b) resolve(b);
      else reject(new Error('Failed to export PNG card'));
    }, 'image/png');
  });

  const dataUrl = canvas.toDataURL('image/png');
  const suffix = format === 'square' ? '-square' : '';
  const filename = `najm-ayah-${options.surah}-${options.ayah}${suffix}.png`;
  return {blob, dataUrl, filename};
}

export async function renderHeartStoryCardPng(
  entry: MoodAyahEntry,
  lang: AppLang
): Promise<{blob: Blob; dataUrl: string; filename: string}> {
  return renderAyahShareCardPng({
    surah: entry.surah,
    ayah: entry.ayah,
    page: entry.page,
    surahNameAr: entry.surahNameAr,
    surahNameEn: entry.surahNameEn,
    arabic: entry.arabic,
    translation: entry.translationEn,
    reflection: lang === 'ar' ? entry.reflectionAr : entry.reflectionEn,
    format: 'story',
    lang,
  });
}
