import { a as __toESM, n as createLucideIcon, r as require_react, t as require_jsx_runtime } from "./jsx-runtime-C_MSr2-h.js";
import { B as getVerseTextByRiwayat, I as formatAyahLoopProgress, St as Bookmark, Z as toArabicDigits, _t as Copy, a as evaluateSwipeDismiss, d as triggerHaptic, et as X, gt as Download, it as Share2, lt as Play, mt as LoaderCircle, r as computeSheetDragOffset, st as Repeat, xt as Check, z as fetchVerseFrenchTranslation } from "./index-rBLSx_gx.js";
import { t as renderAyahShareCardPng } from "./storyCardCanvas-Ci3AflLS.js";
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Image = createLucideIcon("image", [
	["rect", {
		width: "18",
		height: "18",
		x: "3",
		y: "3",
		rx: "2",
		ry: "2",
		key: "1m3agn"
	}],
	["circle", {
		cx: "9",
		cy: "9",
		r: "2",
		key: "af1f0g"
	}],
	["path", {
		d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21",
		key: "1xmnt7"
	}]
]);
// src/components/TafsirDrawer.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var HIFZ_OPTIONS = [
	{
		value: 1,
		label: "1x"
	},
	{
		value: 3,
		label: "3x"
	},
	{
		value: 5,
		label: "5x"
	},
	{
		value: "inf",
		label: "∞"
	}
];
var BOOKMARK_CATEGORIES = [
	{
		id: "wird",
		dotClass: "bg-[#27784C] dark:bg-[#52B77F]",
		activeClass: "border-[#27784C] dark:border-[#52B77F] bg-[#27784C]/10 dark:bg-[#52B77F]/15 text-[#27784C] dark:text-[#52B77F]"
	},
	{
		id: "memorization",
		dotClass: "bg-[#27784C] dark:bg-[#34D399]",
		activeClass: "border-[#27784C] dark:border-[#34D399] bg-[#27784C]/10 dark:bg-emerald-500/15 text-[#27784C] dark:text-[#34D399]"
	},
	{
		id: "favorites",
		dotClass: "bg-[#142019] dark:bg-[#F1F5F3]",
		activeClass: "border-[#142019] dark:border-[#F1F5F3] bg-[#142019]/10 dark:bg-white/10 text-[#142019] dark:text-[#F1F5F3]"
	}
];
var TafsirDrawer = ({ lang, t, verse, surahMeta, riwayat, warshTexts, tafsirTexts, translations, frenchTexts, isBookmarked, bookmarkCategory, isPlayingThisVerse, hifzRepeatTarget, hifzRepeatDone, onClose, onRequestFrenchTranslation, onPlayAyahWithRepeat, onSelectHifzRepeat, onSetBookmarkCategory, onToggleBookmark }) => {
	const [copied, setCopied] = (0, import_react.useState)(false);
	const [activeSection, setActiveSection] = (0, import_react.useState)(() => lang === "fr" ? "fr" : "tafsir");
	const [singleFrText, setSingleFrText] = (0, import_react.useState)(null);
	const [loadingFr, setLoadingFr] = (0, import_react.useState)(false);
	const [cardFormat, setCardFormat] = (0, import_react.useState)("story");
	const [generatingCard, setGeneratingCard] = (0, import_react.useState)(false);
	const [cardPreview, setCardPreview] = (0, import_react.useState)(null);
	const sheetRef = (0, import_react.useRef)(null);
	const cardPreviewRef = (0, import_react.useRef)(null);
	const dragStateRef = (0, import_react.useRef)({
		active: false,
		startY: 0,
		startTimeMs: 0,
		offsetY: 0
	});
	(0, import_react.useEffect)(() => {
		setCardPreview(null);
		setSingleFrText(null);
		dragStateRef.current.active = false;
		dragStateRef.current.offsetY = 0;
		if (sheetRef.current) {
			sheetRef.current.style.transition = "";
			sheetRef.current.style.transform = "";
		}
	}, [verse?.surah, verse?.ayah]);
	(0, import_react.useEffect)(() => {
		if (!verse || activeSection !== "fr") return;
		if (frenchTexts?.[verse.index]) return;
		onRequestFrenchTranslation();
		let cancelled = false;
		setLoadingFr(true);
		fetchVerseFrenchTranslation(verse.surah, verse.ayah).then((txt) => {
			if (!cancelled && txt) setSingleFrText(txt);
		}).finally(() => {
			if (!cancelled) setLoadingFr(false);
		});
		return () => {
			cancelled = true;
		};
	}, [
		activeSection,
		verse,
		frenchTexts,
		onRequestFrenchTranslation
	]);
	if (!verse) return null;
	const arabicText = getVerseTextByRiwayat(verse, riwayat, warshTexts);
	const tafsir = tafsirTexts?.[verse.index];
	const translationEn = translations?.[verse.index];
	const translationFr = frenchTexts?.[verse.index] || singleFrText;
	const surahDisplay = lang === "ar" ? surahMeta?.nameAr || `${t.surahWord} ${toArabicDigits(verse.surah)}` : surahMeta?.nameEn || `Surah ${verse.surah}`;
	const getCategoryLabel = (cat) => cat === "wird" ? t.catWird : cat === "memorization" ? t.catMemorization : t.catFavorites;
	const handleCopy = async () => {
		try {
			const payload = `${arabicText} ﴿${toArabicDigits(verse.ayah)}﴾\n[${surahDisplay} ${verse.surah}:${verse.ayah}]`;
			await navigator.clipboard.writeText(payload);
			setCopied(true);
			window.setTimeout(() => setCopied(false), 1800);
		} catch {}
	};
	const handleShareImageCard = async () => {
		if (generatingCard) return;
		setGeneratingCard(true);
		try {
			const activeTranslation = activeSection === "fr" && translationFr ? translationFr : translationEn || translationFr || void 0;
			const { blob, dataUrl, filename } = await renderAyahShareCardPng({
				surah: verse.surah,
				ayah: verse.ayah,
				page: verse.page,
				surahNameAr: surahMeta?.nameAr || "",
				surahNameEn: surahMeta?.nameEn || `Surah ${verse.surah}`,
				arabic: arabicText,
				translation: activeTranslation,
				reflection: lang === "ar" ? `مصحف المدينة المنورة · صفحة ${toArabicDigits(verse.page)}` : `Madani Mushaf · Page ${verse.page}`,
				format: cardFormat,
				lang
			});
			let sharedViaSheet = false;
			if (typeof navigator !== "undefined" && typeof navigator.share === "function") try {
				const file = new File([blob], filename, { type: "image/png" });
				if (typeof navigator.canShare === "function" ? navigator.canShare({ files: [file] }) : true) {
					await navigator.share({
						files: [file],
						title: `${surahDisplay} ${verse.surah}:${verse.ayah}`,
						text: `${surahDisplay} (${verse.surah}:${verse.ayah}) · Mihrab Noor`
					});
					sharedViaSheet = true;
				}
			} catch {}
			if (!sharedViaSheet) {
				const a = document.createElement("a");
				a.href = dataUrl;
				a.download = filename;
				document.body.appendChild(a);
				a.click();
				a.remove();
			}
			setCardPreview({
				dataUrl,
				filename,
				shared: sharedViaSheet
			});
			window.requestAnimationFrame(() => {
				cardPreviewRef.current?.scrollIntoView({
					behavior: "smooth",
					block: "nearest"
				});
			});
		} catch {} finally {
			setGeneratingCard(false);
		}
	};
	const handlePointerDown = (e) => {
		if (e.target.closest("button, a, input, select")) return;
		dragStateRef.current = {
			active: true,
			startY: e.clientY,
			startTimeMs: performance.now(),
			offsetY: 0
		};
		if (sheetRef.current) sheetRef.current.style.transition = "none";
		try {
			e.currentTarget.setPointerCapture(e.pointerId);
		} catch {}
	};
	const handlePointerMove = (e) => {
		if (!dragStateRef.current.active || !sheetRef.current) return;
		const clamped = computeSheetDragOffset(e.clientY - dragStateRef.current.startY);
		dragStateRef.current.offsetY = clamped;
		sheetRef.current.style.transform = `translate3d(0, ${clamped}px, 0)`;
	};
	const handlePointerUp = () => {
		if (!dragStateRef.current.active) return;
		dragStateRef.current.active = false;
		const elapsedMs = performance.now() - dragStateRef.current.startTimeMs;
		const res = evaluateSwipeDismiss(dragStateRef.current.offsetY, elapsedMs);
		dragStateRef.current.offsetY = 0;
		if (res.shouldDismiss) {
			triggerHaptic("light");
			onClose();
		} else if (sheetRef.current) {
			sheetRef.current.style.transition = "transform 220ms cubic-bezier(0.22, 1, 0.36, 1)";
			sheetRef.current.style.transform = "translate3d(0, 0, 0)";
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 p-0 md:p-6",
		role: "dialog",
		"aria-modal": "true",
		"data-testid": "verse-bottom-sheet",
		"aria-label": `${t.tafsir} ${verse.surah}:${verse.ayah}`,
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			ref: sheetRef,
			className: "w-full max-w-2xl max-h-[88vh] flex flex-col rounded-t-3xl md:rounded-2xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-white dark:bg-[#111C17] shadow-2xl overflow-hidden will-change-transform",
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-testid": "sheet-drag-handle",
					onPointerDown: handlePointerDown,
					onPointerMove: handlePointerMove,
					onPointerUp: handlePointerUp,
					onPointerCancel: handlePointerUp,
					className: "touch-none select-none cursor-grab active:cursor-grabbing",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-12 h-1 bg-[#CBDAD0] dark:bg-[#243B30] rounded-full mx-auto mt-3 mb-1" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-4 px-5 py-3 border-b border-[#E2EAE5] dark:border-[#1E2E26]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
								className: "text-base font-semibold text-[#142019] dark:text-[#F1F5F3] truncate tabular-nums",
								children: [
									surahDisplay,
									" ·",
									" ",
									lang === "ar" ? `${toArabicDigits(verse.surah)}:${toArabicDigits(verse.ayah)}` : `Ayah ${verse.surah}:${verse.ayah}`
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-[#5A6B62] dark:text-[#92A59B] tabular-nums",
								children: [
									t.pageWord,
									" ",
									lang === "ar" ? toArabicDigits(verse.page) : verse.page,
									" ·",
									" ",
									t.juzWord,
									" ",
									lang === "ar" ? toArabicDigits(verse.juz) : verse.juz,
									" ·",
									" ",
									riwayat === "warsh" ? t.warshLabel : t.hafsLabel
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: onClose,
							"aria-label": t.closeWord,
							className: "min-h-[40px] min-w-[40px] flex items-center justify-center rounded-full text-[#5A6B62] dark:text-[#92A59B] hover:bg-[#EAF1EC] dark:hover:bg-[#1E3229] transition-colors",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
								className: "h-5 w-5",
								strokeWidth: 1.5
							})
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex-1 overflow-y-auto p-4 sm:p-5 space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							dir: "rtl",
							className: "rounded-2xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-[#F4F7F5] dark:bg-[#15241D] p-4 sm:p-5 font-quran-amiri text-2xl sm:text-3xl leading-[2.2] tracking-normal text-[#142019] dark:text-[#F1F5F3]",
							children: [
								arabicText,
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-[#27784C] dark:text-[#52B77F]",
									children: [
										"﴿",
										toArabicDigits(verse.ayah),
										"﴾"
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							role: "tablist",
							"aria-label": "Commentary & Translation",
							className: "flex items-center gap-1 p-1 rounded-xl bg-[#EAF1EC] dark:bg-[#15241D] border border-[#E2EAE5] dark:border-[#1E2E26]",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									role: "tab",
									"data-testid": "sheet-tab-tafsir",
									"aria-selected": activeSection === "tafsir",
									onClick: () => setActiveSection("tafsir"),
									className: `flex-1 py-2 px-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${activeSection === "tafsir" ? "bg-[#27784C] dark:bg-[#52B77F] text-white dark:text-[#0A110E]" : "text-[#5A6B62] dark:text-[#92A59B]"}`,
									children: t.tafsirMuyassarTab
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									role: "tab",
									"data-testid": "sheet-tab-en",
									"aria-selected": activeSection === "en",
									onClick: () => setActiveSection("en"),
									className: `flex-1 py-2 px-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${activeSection === "en" ? "bg-[#27784C] dark:bg-[#52B77F] text-white dark:text-[#0A110E]" : "text-[#5A6B62] dark:text-[#92A59B]"}`,
									children: t.englishTranslationTab
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									role: "tab",
									"data-testid": "sheet-tab-fr",
									"aria-selected": activeSection === "fr",
									onClick: () => setActiveSection("fr"),
									className: `flex-1 py-2 px-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${activeSection === "fr" ? "bg-[#27784C] dark:bg-[#52B77F] text-white dark:text-[#0A110E]" : "text-[#5A6B62] dark:text-[#92A59B]"}`,
									children: t.frenchTranslationTab
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "min-h-[72px]",
							children: activeSection === "tafsir" ? tafsir ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								dir: "rtl",
								"data-testid": "sheet-content-tafsir",
								className: "font-quran-scheherazade text-xl sm:text-2xl leading-[2.0] tracking-normal text-[#142019] dark:text-[#F1F5F3]",
								children: tafsir
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-[#5A6B62] dark:text-[#92A59B]",
								children: t.loadingTafsir
							}) : activeSection === "en" ? translationEn ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								dir: "ltr",
								"data-testid": "sheet-content-en",
								className: "text-sm sm:text-base leading-relaxed text-[#142019] dark:text-[#F1F5F3]",
								children: translationEn
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-[#5A6B62] dark:text-[#92A59B]",
								children: t.loadingTranslation
							}) : translationFr ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								dir: "ltr",
								"data-testid": "sheet-content-fr",
								className: "text-sm sm:text-base leading-relaxed text-[#142019] dark:text-[#F1F5F3]",
								children: translationFr
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm text-[#5A6B62] dark:text-[#92A59B] flex items-center gap-2",
								children: [loadingFr && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
									className: "h-4 w-4 animate-spin text-[#27784C] dark:text-[#52B77F]",
									strokeWidth: 1.5
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t.loadingFrenchTranslation })]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-[#F4F7F5] dark:bg-[#15241D] p-3.5 flex flex-wrap items-center justify-between gap-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 text-xs font-semibold text-[#142019] dark:text-[#F1F5F3]",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Repeat, {
										className: "h-4 w-4 text-[#27784C] dark:text-[#52B77F]",
										strokeWidth: 1.5
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t.hifzRepeatLabel }),
									isPlayingThisVerse && hifzRepeatTarget !== 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										"data-testid": "hifz-loop-progress",
										className: "text-[#27784C] dark:text-[#52B77F] font-semibold tabular-nums",
										children: ["· ", formatAyahLoopProgress(hifzRepeatDone, hifzRepeatTarget)]
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex items-center gap-1.5",
								children: HIFZ_OPTIONS.map((opt) => {
									const active = hifzRepeatTarget === opt.value;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										"data-testid": `hifz-loop-btn-${opt.value}`,
										onClick: () => {
											onSelectHifzRepeat(opt.value);
											onPlayAyahWithRepeat(verse.surah, verse.ayah, opt.value);
										},
										className: `min-w-[40px] px-3 py-1.5 rounded-lg text-xs font-semibold border tabular-nums transition-colors ${active ? "border-[#27784C] dark:border-[#52B77F] bg-[#27784C] dark:bg-[#52B77F] text-white dark:text-[#0A110E]" : "border-[#E2EAE5] dark:border-[#1E2E26] bg-white dark:bg-[#111C17] text-[#142019] dark:text-[#F1F5F3]"}`,
										children: opt.label
									}, String(opt.value));
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-[#F4F7F5] dark:bg-[#15241D] p-3.5 space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs font-semibold text-[#142019] dark:text-[#F1F5F3]",
								children: t.bookmarkCategoryLabel
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-wrap items-center gap-2",
								children: BOOKMARK_CATEGORIES.map((cat) => {
									const isSelectedCat = isBookmarked && bookmarkCategory === cat.id;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										"data-testid": `bookmark-cat-btn-${cat.id}`,
										onClick: () => {
											if (isSelectedCat) onToggleBookmark(verse, cat.id);
											else onSetBookmarkCategory(verse, cat.id);
										},
										className: `inline-flex items-center gap-2 rounded-xl border px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${isSelectedCat ? cat.activeClass : "border-[#E2EAE5] dark:border-[#1E2E26] bg-white dark:bg-[#111C17] text-[#5A6B62] dark:text-[#92A59B]"}`,
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `h-2 w-2 rounded-full shrink-0 ${cat.dotClass}` }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: getCategoryLabel(cat.id) }),
											isSelectedCat && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
												className: "h-3.5 w-3.5 shrink-0",
												strokeWidth: 1.5
											})
										]
									}, cat.id);
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-[#F4F7F5] dark:bg-[#15241D] p-3.5 space-y-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "inline-flex items-center gap-1 rounded-xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-white dark:bg-[#111C17] p-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										"data-testid": "card-format-story",
										onClick: () => {
											setCardFormat("story");
											setCardPreview(null);
										},
										className: `px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${cardFormat === "story" ? "bg-[#27784C] dark:bg-[#52B77F] text-white dark:text-[#0A110E]" : "text-[#5A6B62] dark:text-[#92A59B]"}`,
										children: t.cardFormatStory
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										"data-testid": "card-format-square",
										onClick: () => {
											setCardFormat("square");
											setCardPreview(null);
										},
										className: `px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${cardFormat === "square" ? "bg-[#27784C] dark:bg-[#52B77F] text-white dark:text-[#0A110E]" : "text-[#5A6B62] dark:text-[#92A59B]"}`,
										children: t.cardFormatSquare
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									"data-testid": "sheet-share-card-btn",
									onClick: () => void handleShareImageCard(),
									disabled: generatingCard,
									className: "inline-flex items-center gap-2 rounded-xl bg-[#27784C] dark:bg-[#52B77F] hover:opacity-90 px-4 py-2 text-xs font-semibold text-white dark:text-[#0A110E] transition-opacity whitespace-nowrap disabled:opacity-60",
									children: [generatingCard ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
										className: "h-3.5 w-3.5 animate-spin",
										strokeWidth: 1.5
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, {
										className: "h-3.5 w-3.5",
										strokeWidth: 1.5
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t.shareCardBtn })]
								})]
							}), cardPreview && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								ref: cardPreviewRef,
								"data-testid": "ayah-card-preview",
								className: "flex items-center justify-between gap-3 pt-2 border-t border-[#E2EAE5] dark:border-[#1E2E26]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-3 min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: cardPreview.dataUrl,
										alt: `${surahDisplay} ${verse.surah}:${verse.ayah}`,
										className: "h-14 w-14 rounded-xl object-cover border border-[#E2EAE5] dark:border-[#1E2E26] shrink-0"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs font-semibold text-[#142019] dark:text-[#F1F5F3] truncate",
											children: t.storyCardReadyTitle
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[11px] text-[#5A6B62] dark:text-[#92A59B] truncate",
											children: cardPreview.filename
										})]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
									href: cardPreview.dataUrl,
									download: cardPreview.filename,
									className: "inline-flex items-center gap-1.5 rounded-xl border border-[#E2EAE5] dark:border-[#1E2E26] px-3 py-1.5 text-xs font-semibold text-[#27784C] dark:text-[#52B77F] shrink-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {
										className: "h-3.5 w-3.5",
										strokeWidth: 1.5
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "PNG" })]
								})]
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-5 py-3.5 border-t border-[#E2EAE5] dark:border-[#1E2E26] bg-[#F4F7F5] dark:bg-[#111C17] flex flex-wrap items-center justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						"data-testid": "sheet-listen-btn",
						onClick: () => {
							triggerHaptic("medium");
							onPlayAyahWithRepeat(verse.surah, verse.ayah, hifzRepeatTarget);
						},
						className: "tactile-press inline-flex items-center gap-2 rounded-xl bg-[#27784C] dark:bg-[#52B77F] hover:opacity-90 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white dark:text-[#0A110E] transition-opacity",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "h-4 w-4 fill-current" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [t.listenAyah, hifzRepeatTarget !== 1 ? ` (${hifzRepeatTarget === "inf" ? "∞" : `${hifzRepeatTarget}x`})` : ""] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								"data-testid": "sheet-bookmark-btn",
								onClick: () => {
									triggerHaptic("success");
									onToggleBookmark(verse, bookmarkCategory || "favorites");
								},
								className: `tactile-press inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-xs sm:text-sm font-semibold transition-colors ${isBookmarked ? "border-[#27784C] dark:border-[#52B77F] bg-[#27784C]/10 dark:bg-[#52B77F]/15 text-[#27784C] dark:text-[#52B77F]" : "border-[#E2EAE5] dark:border-[#1E2E26] bg-white dark:bg-[#15241D] text-[#142019] dark:text-[#F1F5F3]"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bookmark, {
									className: "h-4 w-4",
									strokeWidth: 1.5
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: isBookmarked ? t.bookmarked : t.bookmark })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => void handleShareImageCard(),
								"aria-label": t.shareWord,
								className: "inline-flex items-center gap-1.5 rounded-xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-white dark:bg-[#15241D] px-3 py-2.5 text-xs sm:text-sm font-semibold text-[#142019] dark:text-[#F1F5F3] hover:border-[#27784C] dark:hover:border-[#52B77F] transition-colors",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, {
									className: "h-4 w-4",
									strokeWidth: 1.5
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: handleCopy,
								className: "inline-flex items-center gap-1.5 rounded-xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-white dark:bg-[#15241D] px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-[#142019] dark:text-[#F1F5F3] hover:border-[#27784C] dark:hover:border-[#52B77F] transition-colors",
								children: [copied ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
									className: "h-4 w-4 text-[#27784C] dark:text-[#52B77F]",
									strokeWidth: 1.5
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, {
									className: "h-4 w-4",
									strokeWidth: 1.5
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: copied ? t.copied : t.copy })]
							})
						]
					})]
				})
			]
		})
	});
};
export { TafsirDrawer };
