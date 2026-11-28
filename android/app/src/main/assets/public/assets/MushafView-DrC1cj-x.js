import { a as __toESM, n as createLucideIcon, r as require_react, t as require_jsx_runtime } from "./jsx-runtime-C_MSr2-h.js";
import { $ as stripLeadingBismillah, At as AudioLines, Dt as BookOpen, Et as Bookmark, J as formatHizbLabel, L as VERSE_KEY_ATTR, R as shouldAutoScrollToVerse, Tt as Check, W as getVerseTextByRiwayat, a as evaluateSwipeDismiss, at as Sun, bt as Download, ct as Share2, d as triggerHaptic, et as stripTashkeel, ht as Moon, i as evaluatePageSwipeTurn, it as X, n as computePageSwipeDrag, nt as tokenizeVerseWords, o as getReciterMonogram, pt as Play, r as computeSheetDragOffset, rt as RECITERS, s as localizeReciterSubtitle, st as SlidersHorizontal, t as ReciterPickerList, tt as toArabicDigits, u as SurahCartoucheBanner, vt as LoaderCircle, wt as ChevronRight, z as syncActiveVerseDomHighlight } from "./index-DwzdC1FZ.js";
import { t as ChevronLeft } from "./chevron-left-fK3TiImw.js";
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Maximize2 = createLucideIcon("maximize-2", [
	["path", {
		d: "M15 3h6v6",
		key: "1q9fwt"
	}],
	["path", {
		d: "m21 3-7 7",
		key: "1l2asr"
	}],
	["path", {
		d: "m3 21 7-7",
		key: "tjx5ai"
	}],
	["path", {
		d: "M9 21H3v-6",
		key: "wtvkvv"
	}]
]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Minus = createLucideIcon("minus", [["path", {
	d: "M5 12h14",
	key: "1ays0h"
}]]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Plus = createLucideIcon("plus", [["path", {
	d: "M5 12h14",
	key: "1ays0h"
}], ["path", {
	d: "M12 5v14",
	key: "s699le"
}]]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Type = createLucideIcon("type", [
	["path", {
		d: "M12 4v16",
		key: "1654pz"
	}],
	["path", {
		d: "M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2",
		key: "e0r10z"
	}],
	["path", {
		d: "M9 20h6",
		key: "s66wpe"
	}]
]);
// src/components/MushafSettingsSheet.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var MIN_FONT_SIZE = 18;
var MAX_FONT_SIZE = 38;
var MushafSettingsSheet = ({ isOpen, lang, t, settings, onUpdateSettings, onClose }) => {
	const [showReciters, setShowReciters] = (0, import_react.useState)(false);
	const sheetRef = (0, import_react.useRef)(null);
	const dragStateRef = (0, import_react.useRef)({
		active: false,
		startY: 0,
		startTimeMs: 0,
		offsetY: 0
	});
	(0, import_react.useEffect)(() => {
		if (!isOpen) return;
		const onKeyDown = (e) => {
			if (e.key === "Escape") {
				e.stopPropagation();
				onClose();
			}
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [isOpen, onClose]);
	(0, import_react.useEffect)(() => {
		if (isOpen) {
			setShowReciters(false);
			if (sheetRef.current) {
				sheetRef.current.style.transition = "";
				sheetRef.current.style.transform = "";
				dragStateRef.current.active = false;
				dragStateRef.current.offsetY = 0;
			}
		}
	}, [isOpen]);
	const handlePointerDown = (0, import_react.useCallback)((e) => {
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
	}, []);
	const handlePointerMove = (0, import_react.useCallback)((e) => {
		if (!dragStateRef.current.active || !sheetRef.current) return;
		const rawDelta = e.clientY - dragStateRef.current.startY;
		const clamped = computeSheetDragOffset(rawDelta);
		dragStateRef.current.offsetY = clamped;
		sheetRef.current.style.transform = `translate3d(0, ${clamped}px, 0)`;
	}, []);
	const finishDrag = (0, import_react.useCallback)(() => {
		if (!dragStateRef.current.active) return;
		dragStateRef.current.active = false;
		const elapsedMs = performance.now() - dragStateRef.current.startTimeMs;
		const result = evaluateSwipeDismiss(dragStateRef.current.offsetY, elapsedMs);
		dragStateRef.current.offsetY = 0;
		if (result.shouldDismiss) {
			onClose();
			return;
		}
		if (sheetRef.current) {
			sheetRef.current.style.transition = "transform 220ms cubic-bezier(0.22, 1, 0.36, 1)";
			sheetRef.current.style.transform = "translate3d(0, 0, 0)";
		}
	}, [onClose]);
	const activeReciter = (0, import_react.useMemo)(() => RECITERS.find((r) => r.id === settings.reciterId) || RECITERS[0], [settings.reciterId]);
	if (!isOpen) return null;
	const numFmt = (n) => lang === "ar" ? toArabicDigits(n) : String(n);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		role: "dialog",
		"aria-modal": "true",
		"aria-label": t.quickSettingsTitle,
		"data-testid": "mushaf-settings-sheet",
		onClick: (e) => {
			e.stopPropagation();
			onClose();
		},
		className: "fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 p-0 md:p-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			ref: sheetRef,
			onClick: (e) => e.stopPropagation(),
			className: "w-full max-w-lg rounded-t-3xl md:rounded-2xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-white dark:bg-[#111C17] pb-safe-bottom shadow-2xl overflow-hidden will-change-transform",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-testid": "settings-drag-handle",
				onPointerDown: handlePointerDown,
				onPointerMove: handlePointerMove,
				onPointerUp: finishDrag,
				onPointerCancel: finishDrag,
				className: "touch-none select-none cursor-grab active:cursor-grabbing px-5 pt-3 pb-3.5 border-b border-[#E2EAE5] dark:border-[#1E2E26]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-12 h-1 rounded-full bg-[#CBDAD0] dark:bg-[#243B30] mx-auto mb-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2.5 min-w-0",
						children: [showReciters && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"data-testid": "settings-reciters-back",
							onClick: () => setShowReciters(false),
							"aria-label": "Back to settings",
							className: "h-9 w-9 rounded-full surface-3d flex items-center justify-center text-[#27784C] dark:text-[#52B77F] shrink-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, {
								className: "h-4 w-4 rtl:rotate-180",
								strokeWidth: 2
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-base font-bold text-[#142019] dark:text-[#F1F5F3] truncate",
								children: showReciters ? lang === "ar" ? `اختيار القارئ (${numFmt(RECITERS.length)})` : lang === "fr" ? `Choisir un récitateur (${RECITERS.length})` : `Select Reciter (${RECITERS.length})` : t.quickSettingsTitle
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] text-[#5A6B62] dark:text-[#92A59B] truncate",
								children: t.swipeDownToCloseHint
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"data-testid": "settings-close-btn",
						onClick: onClose,
						"aria-label": t.closeWord,
						className: "min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-[#5A6B62] dark:text-[#92A59B] hover:bg-[#EAF1EC] dark:hover:bg-[#1E3229] transition-colors shrink-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
							className: "h-5 w-5",
							strokeWidth: 1.5
						})
					})]
				})]
			}), showReciters ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "p-4 sm:p-5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReciterPickerList, {
					lang,
					activeReciterId: settings.reciterId,
					onSelectReciter: (id) => {
						onUpdateSettings({ reciterId: id });
						setShowReciters(false);
					},
					maxHeightClass: "max-h-[52vh]"
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-4 sm:p-5 space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-h-[76px] rounded-2xl surface-3d px-4 py-3 flex items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3 min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "h-11 w-11 rounded-xl btn-3d-emerald text-white flex items-center justify-center shrink-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Type, {
									className: "h-5 w-5",
									strokeWidth: 1.75
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-sm font-bold text-[#142019] dark:text-[#F1F5F3] truncate",
									children: t.fontSizeLabel
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-testid": "settings-font-size-value",
									className: "text-xs font-semibold text-[#27784C] dark:text-[#52B77F] tabular-nums",
									children: [
										numFmt(settings.fontSize),
										" px ·",
										" ",
										lang === "ar" ? "تكبير أو تصغير الخط" : lang === "fr" ? "Taille du texte" : "Text size"
									]
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 shrink-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"data-testid": "settings-font-decrease",
								"aria-label": "Decrease font size",
								disabled: settings.fontSize <= MIN_FONT_SIZE,
								onClick: () => onUpdateSettings({ fontSize: Math.max(MIN_FONT_SIZE, settings.fontSize - 2) }),
								className: "min-h-[44px] min-w-[44px] rounded-xl surface-3d surface-3d-interactive text-[#142019] dark:text-[#F1F5F3] disabled:opacity-35 flex items-center justify-center",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, {
									className: "h-4 w-4",
									strokeWidth: 1.75
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"data-testid": "settings-font-increase",
								"aria-label": "Increase font size",
								disabled: settings.fontSize >= MAX_FONT_SIZE,
								onClick: () => onUpdateSettings({ fontSize: Math.min(MAX_FONT_SIZE, settings.fontSize + 2) }),
								className: "min-h-[44px] min-w-[44px] rounded-xl surface-3d surface-3d-interactive text-[#142019] dark:text-[#F1F5F3] disabled:opacity-35 flex items-center justify-center",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
									className: "h-4 w-4",
									strokeWidth: 1.75
								})
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-2 gap-3",
						children: [{
							id: "hafs",
							titleAr: "حفص",
							titleEn: "Hafs",
							descAr: "المصحف الشريف الشائع",
							descEn: "Standard narration"
						}, {
							id: "warsh",
							titleAr: "ورش",
							titleEn: "Warsh",
							descAr: "الرواية المغاربية العريقة",
							descEn: "Maghrebi narration"
						}].map((opt) => {
							const active = settings.riwayat === opt.id;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								"data-testid": `settings-riwayat-${opt.id}`,
								onClick: () => {
									triggerHaptic("light");
									onUpdateSettings({ riwayat: opt.id });
								},
								className: `min-h-[84px] rounded-2xl p-3.5 flex flex-col justify-between gap-2 text-start tactile-press ${active ? "emerald-3d-hero led-backdrop text-white" : "surface-3d surface-3d-interactive text-[#142019] dark:text-[#F1F5F3]"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: `h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${active ? "bg-white/20 text-white" : "led-icon-tile text-[#27784C] dark:text-[#52B77F]"}`,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, {
											className: "h-5 w-5",
											strokeWidth: 1.75
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-quran-scheherazade text-xl font-bold leading-none",
										children: opt.titleAr
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs font-bold leading-tight",
									children: opt.titleEn
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: `text-[10.5px] leading-snug ${active ? "text-white/85" : "text-[#5A6B62] dark:text-[#92A59B]"}`,
									children: lang === "ar" ? opt.descAr : opt.descEn
								})] })]
							}, opt.id);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							"data-testid": "settings-theme-light",
							onClick: () => {
								triggerHaptic("light");
								onUpdateSettings({ theme: "light" });
							},
							className: `min-h-[80px] rounded-2xl p-3.5 flex items-center gap-3 text-start tactile-press ${settings.theme === "light" ? "emerald-3d-hero led-backdrop text-white" : "surface-3d surface-3d-interactive text-[#142019] dark:text-[#F1F5F3]"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${settings.theme === "light" ? "bg-white/20 text-white" : "led-icon-tile text-[#27784C] dark:text-[#52B77F]"}`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, {
									className: "h-5 w-5",
									strokeWidth: 1.75
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs sm:text-sm font-bold leading-tight",
								children: t.themeWarmDay
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							"data-testid": "settings-theme-dark",
							onClick: () => {
								triggerHaptic("light");
								onUpdateSettings({ theme: "dark" });
							},
							className: `min-h-[80px] rounded-2xl p-3.5 flex items-center gap-3 text-start tactile-press ${settings.theme === "dark" ? "emerald-3d-hero led-backdrop text-white" : "surface-3d surface-3d-interactive text-[#142019] dark:text-[#F1F5F3]"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${settings.theme === "dark" ? "bg-white/20 text-white" : "led-icon-tile text-[#27784C] dark:text-[#52B77F]"}`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, {
									className: "h-5 w-5",
									strokeWidth: 1.75
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs sm:text-sm font-bold leading-tight",
								children: t.themeNightComfort
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						"data-testid": "settings-reciter-select",
						onClick: () => {
							triggerHaptic("light");
							setShowReciters(true);
						},
						className: "w-full min-h-[76px] rounded-2xl surface-3d surface-3d-interactive tactile-press p-3.5 flex items-center gap-3.5 text-start",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "h-12 w-12 rounded-2xl btn-3d-emerald text-white flex items-center justify-center font-bold text-sm shrink-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AudioLines, {
									className: "h-5 w-5",
									strokeWidth: 1.85
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1 space-y-0.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-[11px] font-semibold text-[#27784C] dark:text-[#52B77F]",
										children: [
											t.reciterSelectLabel,
											" (",
											numFmt(RECITERS.length),
											") ·",
											" ",
											getReciterMonogram(activeReciter.nameEn)
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-sm font-bold text-[#142019] dark:text-[#F1F5F3] truncate",
										children: lang === "ar" ? activeReciter.nameAr : activeReciter.nameEn
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[11px] text-[#5A6B62] dark:text-[#92A59B] truncate",
										children: localizeReciterSubtitle(activeReciter, lang)
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "h-8 w-8 rounded-full border border-[#27784C]/25 dark:border-[#52B77F]/30 text-[#27784C] dark:text-[#52B77F] flex items-center justify-center shrink-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, {
									className: "h-4 w-4 rtl:rotate-180",
									strokeWidth: 2
								})
							})
						]
					})
				]
			})]
		})
	});
};
// src/components/MushafView.tsx
var AyahMedallion = ({ ayah, isBookmarked, isSajda }) => {
	const digits = toArabicDigits(ayah);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "inline-flex items-center justify-center align-baseline mx-1 whitespace-nowrap select-none",
		style: { verticalAlign: "-0.22em" },
		"aria-hidden": "true",
		children: [isSajda && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-[0.72em] text-[#27784C] dark:text-[#52B77F] me-0.5 leading-none",
			children: "۩"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			viewBox: "0 0 36 36",
			className: `w-[1.28em] h-[1.28em] shrink-0 overflow-visible ${isBookmarked ? "text-[#27784C] dark:text-[#52B77F]" : "text-[#27784C] dark:text-[#52B77F]"}`,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: "6.5",
					y: "6.5",
					width: "23",
					height: "23",
					rx: "4",
					fill: "currentColor",
					fillOpacity: isBookmarked ? "0.14" : "0.07",
					stroke: "currentColor",
					strokeWidth: "1.2"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: "6.5",
					y: "6.5",
					width: "23",
					height: "23",
					rx: "4",
					fill: "none",
					stroke: "currentColor",
					strokeWidth: "1",
					transform: "rotate(45 18 18)"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "18",
					cy: "18",
					r: "9.8",
					fill: "none",
					stroke: "currentColor",
					strokeWidth: "0.7",
					strokeOpacity: "0.5"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
					x: "18",
					y: "19",
					textAnchor: "middle",
					dominantBaseline: "central",
					fill: "currentColor",
					className: isBookmarked ? "text-[#27784C] dark:text-[#52B77F]" : "text-[#142019] dark:text-[#F1F5F3]",
					style: {
						fontFamily: "var(--font-quran-scheherazade)",
						fontSize: `${ayah >= 100 ? "9.5" : ayah >= 10 ? "11" : "13"}px`,
						fontWeight: 700
					},
					children: digits
				})
			]
		})]
	});
};
var JUZ_START_PAGES = [
	1,
	22,
	42,
	62,
	82,
	102,
	121,
	142,
	162,
	182,
	201,
	222,
	242,
	262,
	282,
	302,
	322,
	342,
	362,
	382,
	402,
	422,
	442,
	462,
	482,
	502,
	522,
	542,
	562,
	582
];
var MushafViewInner = ({ lang, t, surahs, verses, warshTexts, translations, currentPage, currentSurahId, selectedAyahKey, playingSurah, playingAyah, isPlaying, settings, activeReciter, bookmarks, offlineRecords, downloadProgress, focusMode, hifzMode, hifzFirstWordHint, revealedAyahKeys, matchedWordKeys, missedWordKeys, mistakePulseKey, onToggleFocusMode, onToggleFirstWordHint, onToggleRevealAyah, onRevealAllOnPage, onMaskAllOnPage, onUpdateSettings, onChangePage, onChangeSurah, onOpenTafsir, onPlayAyah, onToggleBookmark, onDownloadSurah }) => {
	const [browseTab, setBrowseTab] = (0, import_react.useState)("quran");
	const [settingsSheetOpen, setSettingsSheetOpen] = (0, import_react.useState)(false);
	const [surahQuery, setSurahQuery] = (0, import_react.useState)("");
	const [sharedKey, setSharedKey] = (0, import_react.useState)(null);
	const [pageJumpInput, setPageJumpInput] = (0, import_react.useState)(String(currentPage));
	const [swipeDragX, setSwipeDragX] = (0, import_react.useState)(0);
	const swipeGestureRef = (0, import_react.useRef)({
		active: false,
		pointerId: null,
		startX: 0,
		startY: 0,
		startMs: 0,
		axisLocked: null,
		lastDx: 0
	});
	const containerRef = (0, import_react.useRef)(null);
	const pageFrameRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		setPageJumpInput(String(currentPage));
		setSwipeDragX(0);
	}, [currentPage]);
	const surahMap = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		for (const s of surahs) map.set(s.id, s);
		return map;
	}, [surahs]);
	const bookmarkIds = (0, import_react.useMemo)(() => new Set(bookmarks.map((b) => b.id)), [bookmarks]);
	const displayVerses = (0, import_react.useMemo)(() => verses.filter((v) => v.page === currentPage), [verses, currentPage]);
	const pageAyahKeys = (0, import_react.useMemo)(() => displayVerses.map((v) => `${v.surah}:${v.ayah}`), [displayVerses]);
	const primaryVerse = displayVerses[0];
	const headerSurahMeta = (0, import_react.useMemo)(() => {
		const idOnPage = displayVerses.find((v) => v.ayah === 1)?.surah || (displayVerses.some((v) => v.surah === currentSurahId) ? currentSurahId : primaryVerse?.surah || currentSurahId);
		return surahMap.get(idOnPage);
	}, [
		displayVerses,
		currentSurahId,
		primaryVerse?.surah,
		surahMap
	]);
	const isSurahDownloaded = (0, import_react.useMemo)(() => !!headerSurahMeta && offlineRecords.some((r) => r.surah === headerSurahMeta.id && r.reciterId === activeReciter.id), [
		headerSurahMeta,
		offlineRecords,
		activeReciter.id
	]);
	const isDownloadingThisSurah = !!headerSurahMeta && downloadProgress?.surah === headerSurahMeta.id;
	const hizbInfo = primaryVerse ? formatHizbLabel(primaryVerse.hizbQuarter) : {
		hizb: 1,
		quarter: 1
	};
	const surahGroups = (0, import_react.useMemo)(() => {
		const groups = [];
		for (const v of displayVerses) {
			const last = groups[groups.length - 1];
			if (!last || last.surah.id !== v.surah) {
				const meta = surahMap.get(v.surah);
				if (meta) groups.push({
					surah: meta,
					items: [v]
				});
			} else last.items.push(v);
		}
		return groups;
	}, [displayVerses, surahMap]);
	const filteredSurahs = (0, import_react.useMemo)(() => {
		const q = surahQuery.trim().toLowerCase();
		const qAr = stripTashkeel(surahQuery.trim());
		if (!q) return surahs;
		return surahs.filter((s) => String(s.id) === q || s.nameEn.toLowerCase().includes(q) || s.meaningEn.toLowerCase().includes(q) || stripTashkeel(s.nameAr).includes(qAr));
	}, [surahs, surahQuery]);
	const fontClass = settings.font === "amiri" ? "font-quran-amiri" : "font-quran-scheherazade";
	const lastScrolledPlayingRef = (0, import_react.useRef)(null);
	const lastUserScrollMsRef = (0, import_react.useRef)(0);
	(0, import_react.useEffect)(() => {
		const markUserScroll = () => {
			lastUserScrollMsRef.current = Date.now();
		};
		window.addEventListener("wheel", markUserScroll, { passive: true });
		window.addEventListener("touchmove", markUserScroll, { passive: true });
		return () => {
			window.removeEventListener("wheel", markUserScroll);
			window.removeEventListener("touchmove", markUserScroll);
		};
	}, []);
	(0, import_react.useEffect)(() => {
		if (!containerRef.current) return;
		syncActiveVerseDomHighlight(playingSurah, playingAyah, isPlaying, containerRef.current);
		if (!isPlaying) {
			lastScrolledPlayingRef.current = null;
			return;
		}
		const key = `${playingSurah}:${playingAyah}@${currentPage}`;
		if (lastScrolledPlayingRef.current === key) return;
		const el = containerRef.current.querySelector(`[${VERSE_KEY_ATTR}="${playingSurah}:${playingAyah}"]`);
		if (el) {
			lastScrolledPlayingRef.current = key;
			if (shouldAutoScrollToVerse(lastUserScrollMsRef.current, Date.now(), 4e3)) el.scrollIntoView({
				behavior: "smooth",
				block: "center"
			});
		}
	}, [
		isPlaying,
		playingSurah,
		playingAyah,
		currentPage,
		displayVerses
	]);
	(0, import_react.useEffect)(() => {
		if (!selectedAyahKey || !containerRef.current) return;
		if (displayVerses.findIndex((v) => `${v.surah}:${v.ayah}` === selectedAyahKey) > 0 && shouldAutoScrollToVerse(lastUserScrollMsRef.current, Date.now(), 2500)) {
			const raf = requestAnimationFrame(() => {
				(containerRef.current?.querySelector(`[${VERSE_KEY_ATTR}="${selectedAyahKey}"]`))?.scrollIntoView({
					behavior: "smooth",
					block: "center"
				});
			});
			return () => cancelAnimationFrame(raf);
		}
	}, [selectedAyahKey, displayVerses]);
	const handlePagePointerDown = (e) => {
		if (browseTab !== "quran" || settingsSheetOpen) return;
		if (e.pointerType === "mouse" && e.button !== 0) return;
		if (e.target.closest("button, input, select, a")) return;
		swipeGestureRef.current = {
			active: true,
			pointerId: e.pointerId,
			startX: e.clientX,
			startY: e.clientY,
			startMs: performance.now(),
			axisLocked: null,
			lastDx: 0
		};
	};
	const handlePagePointerMove = (e) => {
		const g = swipeGestureRef.current;
		if (!g.active || g.pointerId !== e.pointerId) return;
		const dx = e.clientX - g.startX;
		const dy = e.clientY - g.startY;
		if (!g.axisLocked) {
			if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
			g.axisLocked = Math.abs(dx) > Math.abs(dy) * 1.1 ? "x" : "y";
		}
		if (g.axisLocked !== "x") return;
		g.lastDx = dx;
		setSwipeDragX(computePageSwipeDrag(dx, currentPage, 1, 604));
	};
	const finishPageSwipe = (e) => {
		const g = swipeGestureRef.current;
		if (!g.active || g.pointerId !== e.pointerId) return;
		g.active = false;
		g.pointerId = null;
		if (g.axisLocked === "x") {
			const elapsedMs = performance.now() - g.startMs;
			const result = evaluatePageSwipeTurn(g.lastDx, elapsedMs, currentPage, 1, 604);
			setSwipeDragX(0);
			if (result.direction) {
				triggerHaptic("light");
				onChangePage(result.targetPage);
			}
		} else setSwipeDragX(0);
		g.axisLocked = null;
		g.lastDx = 0;
	};
	const handleCanvasTap = (e) => {
		if (browseTab !== "quran" || settingsSheetOpen) return;
		if (e.target.closest("button, [role=\"button\"], select, input, a, [role=\"region\"], [role=\"dialog\"]")) return;
		onToggleFocusMode();
	};
	const handleVerseInteraction = (verse) => {
		const ayahKey = `${verse.surah}:${verse.ayah}`;
		if (hifzMode && !revealedAyahKeys.has(ayahKey)) {
			onToggleRevealAyah(ayahKey);
			return;
		}
		onOpenTafsir(verse);
	};
	const formatVersePayload = (verse) => {
		const text = getVerseTextByRiwayat(verse, settings.riwayat, warshTexts);
		const sMeta = surahMap.get(verse.surah);
		const tr = translations?.[verse.index];
		return `${text} ﴿${toArabicDigits(verse.ayah)}﴾${tr ? `\n"${tr}"` : ""}\n[${sMeta?.nameEn || verse.surah} ${verse.surah}:${verse.ayah} · Mihrab Noor]`;
	};
	const handleShareVerse = async (verse) => {
		const key = `${verse.surah}:${verse.ayah}`;
		const payload = formatVersePayload(verse);
		try {
			if (typeof navigator !== "undefined" && typeof navigator.share === "function") await navigator.share({
				title: `Mihrab Noor ${verse.surah}:${verse.ayah}`,
				text: payload
			});
			else await navigator.clipboard.writeText(payload);
			setSharedKey(key);
			setTimeout(() => setSharedKey(null), 1800);
		} catch {
			try {
				await navigator.clipboard.writeText(payload);
				setSharedKey(key);
				setTimeout(() => setSharedKey(null), 1800);
			} catch {}
		}
	};
	const numFmt = (n) => lang === "ar" ? toArabicDigits(n) : String(n);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: containerRef,
		onClick: handleCanvasTap,
		className: `min-h-[calc(100vh-52px)] mushaf-frame transition-all duration-300 ${focusMode ? "pt-5 pb-16" : "pt-2 sm:pt-4 pb-44 md:pb-32"}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: `mx-auto max-w-3xl px-4 sm:px-8 transition-all duration-300 ${focusMode ? "h-0 overflow-hidden opacity-0 pointer-events-none" : "opacity-100 mb-3 sm:mb-4 space-y-2.5"}`,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						role: "tablist",
						"aria-label": "Mushaf Browse Modes",
						"data-testid": "mushaf-browse-toggle",
						className: "inline-flex items-center rounded-xl bg-[#EAF1EC] dark:bg-[#15241D] border border-[#E2EAE5] dark:border-[#1E2E26] p-1",
						children: [
							{
								id: "quran",
								label: t.modeQuran
							},
							{
								id: "surah",
								label: t.modeSurah
							},
							{
								id: "juz",
								label: t.modeJuz
							},
							{
								id: "page",
								label: t.modePage
							}
						].map((tab) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							role: "tab",
							"data-testid": `mushaf-tab-${tab.id}`,
							"aria-selected": browseTab === tab.id,
							onClick: () => setBrowseTab(tab.id),
							className: `px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${browseTab === tab.id ? "bg-white dark:bg-[#111C17] text-[#27784C] dark:text-[#52B77F] shadow-sm border border-[#E2EAE5] dark:border-[#1E2E26]" : "text-[#5A6B62] dark:text-[#92A59B] hover:text-[#142019] dark:hover:text-[#F1F5F3]"}`,
							children: tab.label
						}, tab.id))
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2.5",
						children: [headerSurahMeta && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => {
								triggerHaptic("light");
								onDownloadSurah(headerSurahMeta);
							},
							disabled: isDownloadingThisSurah,
							title: isSurahDownloaded ? t.offlineReady : t.downloadSurahOffline,
							"aria-label": isSurahDownloaded ? t.offlineReady : t.downloadSurahOffline,
							className: `h-11 w-11 flex items-center justify-center rounded-2xl tactile-press transition-all ${isSurahDownloaded ? "btn-3d-emerald led-backdrop text-white" : "led-icon-tile text-[#27784C] dark:text-[#52B77F]"}`,
							children: isDownloadingThisSurah ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
								className: "h-[18px] w-[18px] animate-spin",
								strokeWidth: 1.85
							}) : isSurahDownloaded ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
								className: "h-[18px] w-[18px]",
								strokeWidth: 2
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {
								className: "h-[18px] w-[18px]",
								strokeWidth: 1.85
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"data-testid": "mushaf-settings-trigger",
							onClick: () => {
								triggerHaptic("medium");
								setSettingsSheetOpen(true);
							},
							"aria-label": t.settingsBtn,
							title: t.settingsBtn,
							className: "relative h-11 w-11 flex items-center justify-center rounded-2xl led-icon-tile text-[#27784C] dark:text-[#52B77F] tactile-press",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersHorizontal, {
								className: "h-[19px] w-[19px]",
								strokeWidth: 1.9
							})
						})]
					})]
				}), hifzMode && browseTab === "quran" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#27784C]/25 dark:border-[#52B77F]/30 bg-white dark:bg-[#111C17] px-3.5 py-2 text-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-semibold text-[#27784C] dark:text-[#52B77F]",
						children: t.hifzActiveBanner
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: onToggleFirstWordHint,
							className: `px-2.5 py-1 rounded-lg font-semibold transition-colors ${hifzFirstWordHint ? "bg-[#27784C] dark:bg-[#52B77F] text-white dark:text-[#0A110E]" : "bg-[#EAF1EC] dark:bg-[#1A1A1E] text-[#142019] dark:text-[#F1F5F3]"}`,
							children: t.hifzHintLabel
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => revealedAyahKeys.size >= pageAyahKeys.length ? onMaskAllOnPage() : onRevealAllOnPage(pageAyahKeys),
							className: "px-2.5 py-1 rounded-lg bg-[#EAF1EC] dark:bg-[#1A1A1E] font-semibold text-[#142019] dark:text-[#F1F5F3]",
							children: revealedAyahKeys.size >= pageAyahKeys.length ? t.hideAll : t.revealAll
						})]
					})]
				})]
			}),
			browseTab === "surah" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto max-w-3xl px-4 sm:px-8 space-y-3",
				"data-testid": "mushaf-surah-panel",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "text",
					value: surahQuery,
					onChange: (e) => setSurahQuery(e.target.value),
					placeholder: t.filterSurahPlaceholder,
					"aria-label": t.filterSurahPlaceholder,
					className: "w-full rounded-xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-white dark:bg-[#111C17] px-4 py-2.5 text-sm text-[#142019] dark:text-[#F1F5F3] focus:outline-none focus:ring-1 focus:ring-[#27784C] dark:focus:ring-[#52B77F]"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-2xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-white dark:bg-[#111C17] divide-y divide-[#E2EAE5] dark:divide-[#1E2E26] overflow-hidden",
					children: filteredSurahs.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => {
							onChangeSurah(s.id);
							setBrowseTab("quran");
						},
						className: "w-full px-4 py-3 text-start hover:bg-[#F4F7F5] dark:hover:bg-[#15241D] transition-colors flex items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3 min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "h-8 w-8 rounded-lg border border-[#E2EAE5] dark:border-[#1E2E26] bg-[#F4F7F5] dark:bg-[#15241D] text-xs font-semibold text-[#27784C] dark:text-[#52B77F] flex items-center justify-center tabular-nums shrink-0",
								children: String(s.id).padStart(2, "0")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-sm font-semibold text-[#142019] dark:text-[#F1F5F3] truncate",
									children: lang === "ar" ? s.nameAr : s.nameEn
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-xs text-[#5A6B62] dark:text-[#92A59B] tabular-nums",
									children: [
										numFmt(s.totalAyahs),
										" ",
										t.ayahsWord,
										" · ",
										t.pageShort,
										" ",
										numFmt(s.startPage)
									]
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							dir: "rtl",
							className: "font-quran-scheherazade text-lg text-[#142019] dark:text-[#F1F5F3] shrink-0",
							children: s.nameAr.replace("سُورَةُ ", "")
						})]
					}, s.id))
				})]
			}),
			browseTab === "juz" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mx-auto max-w-3xl px-4 sm:px-8",
				"data-testid": "mushaf-juz-panel",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5",
					children: JUZ_START_PAGES.map((startPage, idx) => {
						const juzNum = idx + 1;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => {
								onChangePage(startPage);
								setBrowseTab("quran");
							},
							className: "rounded-xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-white dark:bg-[#111C17] p-3.5 text-start hover:border-[#27784C]/40 dark:hover:border-[#52B77F]/40 transition-colors space-y-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-xs font-semibold text-[#5A6B62] dark:text-[#92A59B] tabular-nums",
									children: [
										t.juzWord,
										" ",
										numFmt(juzNum)
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "font-quran-scheherazade text-base font-bold text-[#142019] dark:text-[#F1F5F3]",
									children: ["الجزء ", toArabicDigits(juzNum)]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-xs text-[#27784C] dark:text-[#52B77F] tabular-nums",
									children: [
										t.pageShort,
										" ",
										numFmt(startPage)
									]
								})
							]
						}, juzNum);
					})
				})
			}),
			browseTab === "page" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mx-auto max-w-3xl px-4 sm:px-8",
				"data-testid": "mushaf-page-panel",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-white dark:bg-[#111C17] p-5 sm:p-6 space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-sm font-semibold text-[#142019] dark:text-[#F1F5F3]",
								children: t.jumpToPageLabel
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-[#5A6B62] dark:text-[#92A59B] tabular-nums",
								children: [
									t.pageWord,
									" ",
									numFmt(currentPage),
									" ",
									t.ofWord,
									" ",
									numFmt(604),
									" ·",
									" ",
									lang === "ar" ? "الحزب" : "Hizb",
									" ",
									numFmt(hizbInfo.hizb)
								]
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
								onSubmit: (e) => {
									e.preventDefault();
									const num = Number(pageJumpInput);
									if (Number.isFinite(num) && num >= 1 && num <= 604) {
										onChangePage(Math.round(num));
										setBrowseTab("quran");
									}
								},
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "number",
									min: 1,
									max: 604,
									value: pageJumpInput,
									onChange: (e) => setPageJumpInput(e.target.value),
									"aria-label": t.pageWord,
									className: "w-20 rounded-xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-[#F4F7F5] dark:bg-[#0A110E] px-3 py-1.5 text-xs font-semibold text-[#142019] dark:text-[#F1F5F3] tabular-nums"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "submit",
									className: "rounded-xl bg-[#27784C] dark:bg-[#52B77F] px-4 py-1.5 text-xs font-semibold text-white dark:text-[#0A110E]",
									children: t.goBtn
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "range",
							min: 1,
							max: 604,
							value: currentPage,
							onChange: (e) => onChangePage(Number(e.target.value)),
							"aria-label": t.jumpToPageLabel,
							className: "w-full accent-[#27784C] dark:accent-[#52B77F] cursor-pointer"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-2 pt-1",
							children: [
								{
									label: lang === "ar" ? "الفاتحة · ص ١" : "Al-Fatihah · p.1",
									p: 1
								},
								{
									label: lang === "ar" ? "البقرة · ص ٢" : "Al-Baqarah · p.2",
									p: 2
								},
								{
									label: lang === "ar" ? "الكهف · ص ٢٩٣" : "Al-Kahf · p.293",
									p: 293
								},
								{
									label: lang === "ar" ? "يس · ص ٤٤٠" : "Ya-Sin · p.440",
									p: 440
								},
								{
									label: lang === "ar" ? "الملك · ص ٥٦٢" : "Al-Mulk · p.562",
									p: 562
								}
							].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => {
									onChangePage(item.p);
									setBrowseTab("quran");
								},
								className: "rounded-xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-[#F4F7F5] dark:bg-[#0A110E] px-3.5 py-1.5 text-xs font-medium text-[#142019] dark:text-[#F1F5F3] hover:border-[#27784C] dark:hover:border-[#52B77F]",
								children: item.label
							}, item.p))
						})
					]
				})
			}),
			browseTab === "quran" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative mx-auto max-w-4xl lg:px-14 pb-6",
				dir: "ltr",
				children: [
					!focusMode && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => {
							triggerHaptic("light");
							onChangePage(Math.min(604, currentPage + 1));
						},
						disabled: currentPage >= 604,
						"aria-label": `${t.nextPage} (${Math.min(604, currentPage + 1)})`,
						className: "hidden lg:flex absolute left-1 top-1/2 -translate-y-1/2 h-11 w-11 items-center justify-center rounded-full led-icon-tile text-[#27784C] dark:text-[#52B77F] disabled:opacity-25 tactile-press",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, {
							className: "h-5 w-5",
							strokeWidth: 1.85
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => {
							triggerHaptic("light");
							onChangePage(Math.max(1, currentPage - 1));
						},
						disabled: currentPage <= 1,
						"aria-label": `${t.prevPage} (${Math.max(1, currentPage - 1)})`,
						className: "hidden lg:flex absolute right-1 top-1/2 -translate-y-1/2 h-11 w-11 items-center justify-center rounded-full led-icon-tile text-[#27784C] dark:text-[#52B77F] disabled:opacity-25 tactile-press",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, {
							className: "h-5 w-5",
							strokeWidth: 1.85
						})
					})] }),
					Math.abs(swipeDragX) > 16 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						"aria-hidden": "true",
						className: `pointer-events-none absolute top-1/2 -translate-y-1/2 z-20 flex items-center gap-1.5 rounded-full btn-3d-emerald px-3.5 py-2 text-xs font-bold text-white shadow-lg ${swipeDragX > 0 ? "left-4" : "right-4"}`,
						children: swipeDragX > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: numFmt(Math.min(604, currentPage + 1)) })] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: numFmt(Math.max(1, currentPage - 1)) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-4 w-4" })] })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("article", {
						ref: pageFrameRef,
						"data-testid": "mushaf-page-frame",
						"data-page": currentPage,
						dir: lang === "ar" ? "rtl" : "ltr",
						onPointerDown: handlePagePointerDown,
						onPointerMove: handlePagePointerMove,
						onPointerUp: finishPageSwipe,
						onPointerCancel: finishPageSwipe,
						style: {
							transform: `translate3d(${swipeDragX}px, 0, 0) rotate(${(swipeDragX * .014).toFixed(2)}deg)`,
							transition: swipeDragX === 0 ? "transform 260ms cubic-bezier(0.22, 1, 0.36, 1)" : "none"
						},
						className: "touch-pan-y relative mx-2.5 my-1 sm:mx-auto max-w-3xl rounded-2xl surface-3d led-backdrop p-4 sm:p-8 overflow-hidden will-change-transform",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative z-10 px-0.5 sm:px-2 py-0.5 sm:py-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									dir: "rtl",
									"data-testid": "mushaf-top-header",
									className: "flex items-center justify-between gap-2 text-xs font-medium text-[#5A6B62] dark:text-[#92A59B] px-2 sm:px-4 pt-0.5 pb-2.5 mb-3.5 sm:mb-5 border-b border-[#E2EAE5] dark:border-[#1E2E26] tabular-nums",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-quran-scheherazade text-sm sm:text-base whitespace-nowrap truncate text-[#142019] dark:text-[#F1F5F3]",
										children: lang === "ar" ? headerSurahMeta?.nameAr.replace("سُورَةُ ", "") : `${headerSurahMeta?.nameAr.replace("سُورَةُ ", "") || ""} · ${headerSurahMeta?.transliteration || headerSurahMeta?.nameEn || ""}`
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "whitespace-nowrap",
										children: lang === "ar" ? `الجزء ${toArabicDigits(primaryVerse?.juz || 1)}` : `الجزء ${toArabicDigits(primaryVerse?.juz || 1)} · Part ${primaryVerse?.juz || 1}`
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "space-y-4 sm:space-y-6",
									children: surahGroups.map(({ surah, items }) => {
										const startsAtBeginning = items[0]?.ayah === 1;
										const showBismillah = startsAtBeginning && surah.id !== 1 && surah.id !== 9;
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-2.5 sm:space-y-3.5",
											children: [
												startsAtBeginning && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SurahCartoucheBanner, {
													surah,
													lang,
													t,
													onPlaySurah: () => onPlayAyah(surah.id, 1)
												}),
												showBismillah && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													dir: "rtl",
													"data-testid": `surah-bismillah-${surah.id}`,
													className: `${fontClass} tracking-normal text-center text-[21px] sm:text-[26px] leading-[2.05] text-[#142019] dark:text-[#F1F5F3] py-0.5`,
													children: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ"
												}),
												settings.showTranslation ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "divide-y divide-[#E2EAE5] dark:divide-[#1E2E26]",
													children: items.map((verse) => {
														const ayahKey = `${verse.surah}:${verse.ayah}`;
														const isActiveAudio = isPlaying && playingSurah === verse.surah && playingAyah === verse.ayah;
														const isSelected = selectedAyahKey === ayahKey || isActiveAudio;
														const isBookmarked = bookmarkIds.has(ayahKey);
														const isRevealed = !hifzMode || revealedAyahKeys.has(ayahKey);
														const rawText = getVerseTextByRiwayat(verse, settings.riwayat, warshTexts);
														const displayText = settings.riwayat === "hafs" ? stripLeadingBismillah(rawText, verse.surah, verse.ayah) : rawText;
														const words = tokenizeVerseWords(displayText);
														return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															"data-ayah-key": ayahKey,
															["data-verse-key"]: ayahKey,
															...isActiveAudio ? { ["data-active-verse"]: "true" } : {},
															className: `py-4 px-2.5 sm:px-4 rounded-xl transition-colors ${isSelected ? "bg-[#27784C]/8 dark:bg-[#52B77F]/14" : "hover:bg-[#F4F7F5] dark:hover:bg-[#15241D]"}`,
															children: [
																/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																	className: "flex items-center justify-between gap-2 mb-2",
																	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																		className: "rounded-lg border border-[#E2EAE5] dark:border-[#1E2E26] bg-[#F4F7F5] dark:bg-[#15241D] px-2.5 py-0.5 text-xs font-semibold text-[#27784C] dark:text-[#52B77F] tabular-nums",
																		children: [
																			verse.surah,
																			":",
																			verse.ayah,
																			verse.sajda && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																				className: "ms-1.5",
																				children: "· Sajdah ۩"
																			})
																		]
																	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
																		type: "button",
																		onClick: () => onOpenTafsir(verse),
																		className: "text-xs font-medium text-[#5A6B62] dark:text-[#92A59B] hover:text-[#27784C] dark:hover:text-[#52B77F]",
																		children: t.tafsir
																	})]
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																	role: "button",
																	tabIndex: 0,
																	onClick: () => handleVerseInteraction(verse),
																	onKeyDown: (e) => {
																		if (e.key === "Enter" || e.key === " ") {
																			e.preventDefault();
																			handleVerseInteraction(verse);
																		}
																	},
																	dir: "rtl",
																	className: `w-full text-right ${fontClass} mushaf-script-flow tracking-normal text-[#142019] dark:text-[#F1F5F3] cursor-pointer`,
																	style: {
																		"--q-size": `${settings.fontSize}px`,
																		"--q-lh": String(settings.lineHeight)
																	},
																	children: [words.map((word, wIdx) => {
																		const wKey = `${ayahKey}:${wIdx}`;
																		const isWordMatched = matchedWordKeys.has(wKey);
																		const isWordMissed = missedWordKeys.has(wKey) || mistakePulseKey === wKey;
																		const isWordVisible = isRevealed || isWordMatched || hifzFirstWordHint && wIdx === 0;
																		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																			className: `inline tracking-normal transition-all duration-300 rounded-sm ${!isWordVisible ? "blur-[7px] opacity-25 select-none" : isWordMissed ? "bg-rose-500/20 text-rose-600 dark:text-rose-300 underline decoration-rose-400 underline-offset-8 animate-pulse" : isWordMatched ? "text-[#27784C] dark:text-[#52B77F]" : ""}`,
																			children: word
																		}), " "] }, wKey);
																	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																		className: "inline-block whitespace-nowrap align-baseline mx-1 text-[0.8em] leading-none text-[#27784C] dark:text-[#52B77F]",
																		children: [
																			"﴿",
																			toArabicDigits(verse.ayah),
																			"﴾"
																		]
																	})]
																}),
																translations && translations[verse.index] && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
																	dir: "ltr",
																	className: `mt-2.5 text-sm leading-relaxed text-[#5A6B62] dark:text-[#A1A1AA] text-left transition-all duration-300 ${!isRevealed ? "blur-[4px] opacity-25 select-none" : ""}`,
																	children: translations[verse.index]
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																	className: "mt-3 flex items-center gap-2",
																	children: [
																		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
																			type: "button",
																			onClick: () => onPlayAyah(verse.surah, verse.ayah),
																			"aria-label": `Play Ayah ${verse.surah}:${verse.ayah}`,
																			className: "h-8 w-8 flex items-center justify-center rounded-full border border-[#E2EAE5] dark:border-[#1E2E26] bg-[#F4F7F5] dark:bg-[#15241D] text-[#142019] dark:text-[#F1F5F3] hover:border-[#27784C] dark:hover:border-[#52B77F] transition-colors",
																			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, {
																				className: "h-3.5 w-3.5 ms-0.5",
																				strokeWidth: 1.5
																			})
																		}),
																		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
																			type: "button",
																			onClick: () => onToggleBookmark(verse),
																			"aria-label": `Bookmark Ayah ${verse.surah}:${verse.ayah}`,
																			className: `h-8 w-8 flex items-center justify-center rounded-full border transition-colors ${isBookmarked ? "border-[#27784C] dark:border-[#52B77F] bg-[#27784C] dark:bg-[#52B77F] text-white dark:text-[#0A110E]" : "border-[#E2EAE5] dark:border-[#1E2E26] bg-[#F4F7F5] dark:bg-[#15241D] text-[#142019] dark:text-[#F1F5F3] hover:border-[#27784C]"}`,
																			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bookmark, {
																				className: "h-3.5 w-3.5",
																				strokeWidth: 1.5
																			})
																		}),
																		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
																			type: "button",
																			onClick: () => void handleShareVerse(verse),
																			"aria-label": `Share Ayah ${verse.surah}:${verse.ayah}`,
																			className: "h-8 w-8 flex items-center justify-center rounded-full border border-[#E2EAE5] dark:border-[#1E2E26] bg-[#F4F7F5] dark:bg-[#15241D] text-[#142019] dark:text-[#F1F5F3] hover:border-[#27784C] transition-colors",
																			children: sharedKey === ayahKey ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
																				className: "h-3.5 w-3.5 text-[#27784C] dark:text-[#52B77F]",
																				strokeWidth: 1.5
																			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, {
																				className: "h-3.5 w-3.5",
																				strokeWidth: 1.5
																			})
																		})
																	]
																})
															]
														}, ayahKey);
													})
												}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													dir: "rtl",
													"data-testid": `mushaf-justified-block-${surah.id}`,
													className: `${fontClass} mushaf-script-flow mushaf-justified px-1 sm:px-3 text-[#142019] dark:text-[#F1F5F3]`,
													style: {
														"--q-size": `${settings.fontSize}px`,
														"--q-lh": String(settings.lineHeight)
													},
													children: items.map((verse) => {
														const ayahKey = `${verse.surah}:${verse.ayah}`;
														const isActiveAudio = playingSurah === verse.surah && playingAyah === verse.ayah && isPlaying;
														const isSelected = selectedAyahKey === ayahKey || isActiveAudio;
														const isBookmarked = bookmarkIds.has(ayahKey);
														const isRevealed = !hifzMode || revealedAyahKeys.has(ayahKey);
														const rawText = getVerseTextByRiwayat(verse, settings.riwayat, warshTexts);
														const displayText = settings.riwayat === "hafs" ? stripLeadingBismillah(rawText, verse.surah, verse.ayah) : rawText;
														const words = tokenizeVerseWords(displayText);
														return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															"data-ayah-key": ayahKey,
															["data-verse-key"]: ayahKey,
															...isActiveAudio ? { ["data-active-verse"]: "true" } : {},
															role: "button",
															tabIndex: 0,
															onClick: () => handleVerseInteraction(verse),
															onKeyDown: (e) => {
																if (e.key === "Enter" || e.key === " ") {
																	e.preventDefault();
																	handleVerseInteraction(verse);
																}
															},
															"aria-label": `Ayah ${verse.surah}:${verse.ayah}`,
															className: `inline px-0.5 [box-decoration-break:clone] tracking-normal rounded transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#27784C] dark:focus-visible:ring-[#52B77F] ${isSelected ? "bg-[#27784C]/12 dark:bg-[#52B77F]/18" : "[@media(hover:hover)]:hover:bg-[#27784C]/6 dark:[@media(hover:hover)]:hover:bg-[#52B77F]/10"}`,
															children: [
																words.map((word, wIdx) => {
																	const wKey = `${ayahKey}:${wIdx}`;
																	const isWordMatched = matchedWordKeys.has(wKey);
																	const isWordMissed = missedWordKeys.has(wKey) || mistakePulseKey === wKey;
																	const isWordVisible = isRevealed || isWordMatched || hifzFirstWordHint && wIdx === 0;
																	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																		className: `inline tracking-normal transition-all duration-300 rounded-sm ${!isWordVisible ? "blur-[7px] opacity-25 select-none" : isWordMissed ? "bg-rose-500/20 text-rose-600 dark:text-rose-300 underline decoration-rose-400 underline-offset-8 animate-pulse" : isWordMatched ? "text-[#27784C] dark:text-[#52B77F]" : ""}`,
																		children: word
																	}), wIdx < words.length - 1 ? " " : "\xA0"] }, wKey);
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AyahMedallion, {
																	ayah: verse.ayah,
																	isBookmarked,
																	isSajda: verse.sajda
																}),
																" "
															]
														}, ayahKey);
													})
												})
											]
										}, surah.id);
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									dir: "ltr",
									className: `mt-6 sm:mt-8 pt-3.5 sm:pt-4 px-2 sm:px-4 pb-0.5 border-t border-[#E2EAE5] dark:border-[#1E2E26] flex items-center justify-between gap-2 sm:gap-4 transition-opacity duration-300 ${focusMode ? "opacity-30 hover:opacity-100" : "opacity-100"}`,
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: () => {
												triggerHaptic("light");
												onChangePage(Math.min(604, currentPage + 1));
											},
											disabled: currentPage >= 604,
											className: "min-h-[42px] inline-flex items-center gap-1 sm:gap-1.5 rounded-xl surface-3d tactile-press px-3.5 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold text-[#142019] dark:text-[#F1F5F3] disabled:opacity-35 hover:border-[#27784C] dark:hover:border-[#52B77F] whitespace-nowrap",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, {
												className: "h-4 w-4",
												strokeWidth: 1.75
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t.nextPage })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => {
												triggerHaptic("light");
												setBrowseTab("page");
											},
											className: "min-h-[40px] inline-flex items-center justify-center gap-1.5 px-4 py-1 rounded-xl led-icon-tile text-[#27784C] dark:text-[#52B77F] tabular-nums tactile-press whitespace-nowrap",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "font-quran-scheherazade text-base sm:text-lg leading-none",
												children: [toArabicDigits(currentPage), " / ٦٠٤"]
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: () => {
												triggerHaptic("light");
												onChangePage(Math.max(1, currentPage - 1));
											},
											disabled: currentPage <= 1,
											className: "min-h-[42px] inline-flex items-center gap-1 sm:gap-1.5 rounded-xl surface-3d tactile-press px-3.5 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold text-[#142019] dark:text-[#F1F5F3] disabled:opacity-35 hover:border-[#27784C] dark:hover:border-[#52B77F] whitespace-nowrap",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t.prevPage }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, {
												className: "h-4 w-4",
												strokeWidth: 1.75
											})]
										})
									]
								})
							]
						})
					})
				]
			}),
			focusMode && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: onToggleFocusMode,
				className: "fixed bottom-5 right-5 z-40 inline-flex items-center gap-1.5 rounded-full border border-[#E2EAE5] dark:border-[#1E2E26] bg-white dark:bg-[#111C17] px-3.5 py-2 text-xs font-semibold text-[#142019] dark:text-[#F1F5F3] shadow-lg",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Maximize2, {
					className: "h-3.5 w-3.5 text-[#27784C] dark:text-[#52B77F]",
					strokeWidth: 1.5
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t.exitFocus })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MushafSettingsSheet, {
				isOpen: settingsSheetOpen,
				lang,
				t,
				settings,
				onUpdateSettings,
				onClose: () => setSettingsSheetOpen(false)
			})
		]
	});
};
var MushafView = import_react.memo(MushafViewInner);
export { MushafView };
