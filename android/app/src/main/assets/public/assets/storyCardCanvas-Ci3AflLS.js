import { Z as toArabicDigits } from "./index-rBLSx_gx.js";
// src/utils/storyCardCanvas.ts
function wrapLines(ctx, text, maxWidth) {
	const words = text.split(/\s+/).filter(Boolean);
	const lines = [];
	let current = "";
	for (const word of words) {
		const test = current ? `${current} ${word}` : word;
		if (ctx.measureText(test).width > maxWidth && current) {
			lines.push(current);
			current = word;
		} else current = test;
	}
	if (current) lines.push(current);
	return lines;
}
/**
* Renders a 1080x1920 (Story 9:16) or 1080x1080 (Post 1:1) Fine Ivory Paper
* & Deep Emerald Ayah Image Card PNG with Mihrab Noor watermark.
*/
async function renderAyahShareCardPng(options) {
	if (typeof document === "undefined") throw new Error("Canvas generation requires a browser environment");
	if (document.fonts?.ready) await document.fonts.ready;
	const format = options.format || "story";
	const W = 1080;
	const H = format === "square" ? 1080 : 1920;
	const canvas = document.createElement("canvas");
	canvas.width = W;
	canvas.height = H;
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("Canvas 2D context unavailable");
	const bgGrad = ctx.createLinearGradient(0, 0, W, H);
	bgGrad.addColorStop(0, "#F4F7F5");
	bgGrad.addColorStop(.55, "#EEF4F0");
	bgGrad.addColorStop(1, "#E2ECE6");
	ctx.fillStyle = bgGrad;
	ctx.fillRect(0, 0, W, H);
	const glow = ctx.createRadialGradient(W / 2, H * (format === "square" ? .42 : .34), 20, W / 2, H * (format === "square" ? .42 : .34), 560);
	glow.addColorStop(0, "rgba(39, 120, 76, 0.06)");
	glow.addColorStop(.6, "rgba(39, 120, 76, 0.03)");
	glow.addColorStop(1, "rgba(0, 0, 0, 0)");
	ctx.fillStyle = glow;
	ctx.fillRect(0, 0, W, H);
	ctx.strokeStyle = "rgba(39, 120, 76, 0.28)";
	ctx.lineWidth = 2.5;
	ctx.strokeRect(48, 48, 984, H - 96);
	ctx.strokeStyle = "rgba(39, 120, 76, 0.35)";
	ctx.lineWidth = 1.2;
	ctx.strokeRect(64, 64, 952, H - 128);
	const corners = [
		[64, 64],
		[1016, 64],
		[64, H - 64],
		[1016, H - 64]
	];
	ctx.fillStyle = "#27784C";
	for (const [cx, cy] of corners) {
		ctx.save();
		ctx.translate(cx, cy);
		ctx.rotate(Math.PI / 4);
		ctx.fillRect(-5, -5, 10, 10);
		ctx.restore();
	}
	const topHeaderY = format === "square" ? 148 : 200;
	const cleanArName = options.surahNameAr.replace("سُورَةُ ", "").trim();
	ctx.textAlign = "center";
	ctx.fillStyle = "#27784C";
	ctx.font = "700 34px \"Scheherazade New\", serif";
	ctx.fillText(`سُورَةُ ${cleanArName || toArabicDigits(options.surah)} · الآية ${toArabicDigits(options.ayah)}`, W / 2, topHeaderY);
	ctx.fillStyle = "#27784C";
	ctx.font = "600 20px \"Plus Jakarta Sans\", sans-serif";
	ctx.fillText(`${options.surahNameEn.toUpperCase()}  ·  ${options.surah}:${options.ayah}`, W / 2, topHeaderY + 46);
	ctx.strokeStyle = "rgba(39, 120, 76, 0.22)";
	ctx.lineWidth = 1.5;
	ctx.beginPath();
	ctx.moveTo(W / 2 - 140, topHeaderY + 84);
	ctx.lineTo(680, topHeaderY + 84);
	ctx.stroke();
	ctx.fillStyle = "#142019";
	ctx.direction = "rtl";
	const arFontSize = options.arabic.length > 260 ? format === "square" ? 44 : 52 : options.arabic.length > 140 ? format === "square" ? 52 : 62 : format === "square" ? 60 : 72;
	const arLineHeight = Math.round(arFontSize * 1.92);
	ctx.font = `400 ${arFontSize}px "Amiri Quran", "Scheherazade New", serif`;
	const arLines = wrapLines(ctx, `${options.arabic} ﴿${toArabicDigits(options.ayah)}﴾`, 890);
	const totalArHeight = arLines.length * arLineHeight;
	const anchorCenterY = format === "square" ? H * .44 : H * .42;
	let currentY = Math.max(topHeaderY + 165, anchorCenterY - totalArHeight / 2 + arLineHeight * .3);
	for (const line of arLines) {
		ctx.fillText(line, W / 2, currentY);
		currentY += arLineHeight;
	}
	const footerReservedY = H - (format === "square" ? 145 : 190);
	if (options.translation && currentY + 90 < footerReservedY) {
		ctx.direction = "ltr";
		currentY += 28;
		ctx.strokeStyle = "rgba(39, 120, 76, 0.28)";
		ctx.beginPath();
		ctx.moveTo(W / 2 - 90, currentY);
		ctx.lineTo(630, currentY);
		ctx.stroke();
		currentY += 56;
		ctx.fillStyle = "#4A4945";
		const trFont = format === "square" ? 24 : 31;
		const trLineH = format === "square" ? 36 : 46;
		ctx.font = `400 ${trFont}px "Plus Jakarta Sans", sans-serif`;
		const trLines = wrapLines(ctx, `“${options.translation}”`, 870);
		for (const line of trLines) {
			if (currentY + trLineH > footerReservedY - 24) break;
			ctx.fillText(line, W / 2, currentY);
			currentY += trLineH;
		}
	}
	if (options.reflection && currentY + 55 < footerReservedY) {
		currentY += 24;
		ctx.fillStyle = "#27784C";
		ctx.direction = options.lang === "ar" ? "rtl" : "ltr";
		ctx.font = options.lang === "ar" ? "400 28px \"Scheherazade New\", serif" : "500 23px \"Plus Jakarta Sans\", sans-serif";
		const refLines = wrapLines(ctx, options.reflection, 850);
		for (const line of refLines.slice(0, 2)) {
			if (currentY + 38 > footerReservedY - 10) break;
			ctx.fillText(line, W / 2, currentY);
			currentY += 38;
		}
	}
	ctx.direction = "ltr";
	ctx.fillStyle = "#27784C";
	ctx.font = "700 30px \"Scheherazade New\", serif";
	ctx.fillText("Mihrab Noor · مِحْرَاب النُّور", W / 2, H - (format === "square" ? 110 : 145));
	ctx.fillStyle = "#5A6B62";
	ctx.font = "500 19px \"Plus Jakarta Sans\", sans-serif";
	ctx.fillText(`Madani Mushaf · Page ${options.page} of 604`, W / 2, H - (format === "square" ? 78 : 108));
	const blob = await new Promise((resolve, reject) => {
		canvas.toBlob((b) => {
			if (b) resolve(b);
			else reject(/* @__PURE__ */ new Error("Failed to export PNG card"));
		}, "image/png");
	});
	const dataUrl = canvas.toDataURL("image/png");
	const suffix = format === "square" ? "-square" : "";
	return {
		blob,
		dataUrl,
		filename: `mihrab-ayah-${options.surah}-${options.ayah}${suffix}.png`
	};
}
async function renderHeartStoryCardPng(entry, lang) {
	return renderAyahShareCardPng({
		surah: entry.surah,
		ayah: entry.ayah,
		page: entry.page,
		surahNameAr: entry.surahNameAr,
		surahNameEn: entry.surahNameEn,
		arabic: entry.arabic,
		translation: entry.translationEn,
		reflection: lang === "ar" ? entry.reflectionAr : entry.reflectionEn,
		format: "story",
		lang
	});
}
export { renderHeartStoryCardPng as n, renderAyahShareCardPng as t };
