import { a as __toESM, n as createLucideIcon, r as require_react, t as require_jsx_runtime } from "./jsx-runtime-C_MSr2-h.js";
import { Et as Bookmark, Y as getBookmarkCategory, bt as Download, ot as Smartphone, q as formatBytes, rt as RECITERS, tt as toArabicDigits, vt as LoaderCircle } from "./index-DwzdC1FZ.js";
import { t as CircleCheck } from "./circle-check-BpkttCqY.js";
import { t as Trash2 } from "./trash-2-ZTSwKDgM.js";
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var HardDrive = createLucideIcon("hard-drive", [
	["line", {
		x1: "22",
		x2: "2",
		y1: "12",
		y2: "12",
		key: "1y58io"
	}],
	["path", {
		d: "M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z",
		key: "oot6mr"
	}],
	["line", {
		x1: "6",
		x2: "6.01",
		y1: "16",
		y2: "16",
		key: "sgf278"
	}],
	["line", {
		x1: "10",
		x2: "10.01",
		y1: "16",
		y2: "16",
		key: "1l4acy"
	}]
]);
// src/components/VaultView.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var RECOMMENDED_SURAH_IDS = [
	1,
	18,
	36,
	55,
	67,
	112,
	113,
	114
];
var BOOKMARK_CAT_STYLES = {
	wird: {
		dotClass: "bg-[#27784C] dark:bg-[#52B77F]",
		badgeClass: "text-[#27784C] dark:text-[#52B77F]"
	},
	memorization: {
		dotClass: "bg-[#27784C] dark:bg-[#34D399]",
		badgeClass: "text-[#27784C] dark:text-[#34D399]"
	},
	favorites: {
		dotClass: "bg-[#5A6B62] dark:bg-[#A1A1AA]",
		badgeClass: "text-[#5A6B62] dark:text-[#A1A1AA]"
	}
};
var VaultView = ({ lang, t, surahs, bookmarks, activeReciter, offlineRecords, vaultKeys, storageEstimate, downloadProgress, isInstalled, onOpenSurah, onRemoveBookmark, onDownloadSurah, onDeleteOfflineRecord, onClearAudioCache, onOpenInstall }) => {
	const [bmFilter, setBmFilter] = (0, import_react.useState)("all");
	const totalAudioBytes = offlineRecords.reduce((acc, r) => acc + r.bytes, 0);
	const filteredBookmarks = (0, import_react.useMemo)(() => {
		if (bmFilter === "all") return bookmarks;
		return bookmarks.filter((bm) => getBookmarkCategory(bm) === bmFilter);
	}, [bookmarks, bmFilter]);
	const getCategoryLabel = (cat) => cat === "wird" ? t.catWird : cat === "memorization" ? t.catMemorization : t.catFavorites;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-5xl px-4 sm:px-6 pt-6 pb-8 space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2EAE5] dark:border-[#1E2E26] pb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl sm:text-2xl font-semibold text-[#142019] dark:text-[#F1F5F3]",
					children: t.vaultTitle
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs sm:text-sm text-[#5A6B62] dark:text-[#92A59B] mt-0.5",
					children: t.vaultSubtitle
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-4 text-xs text-[#5A6B62] dark:text-[#92A59B] tabular-nums",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						t.audioCachedLabel,
						": ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
							className: "text-[#142019] dark:text-[#F1F5F3]",
							children: formatBytes(totalAudioBytes)
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						t.totalStorageLabel,
						": ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
							className: "text-[#142019] dark:text-[#F1F5F3]",
							children: formatBytes(storageEstimate.usage)
						})
					] })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 md:grid-cols-2 gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-[#27784C]/25 dark:border-[#52B77F]/30 bg-white dark:bg-[#111C17] p-5 space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 text-sm font-semibold text-[#27784C] dark:text-[#52B77F]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, {
							className: "h-4.5 w-4.5 shrink-0",
							strokeWidth: 1.5
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t.quranTextStoredTitle })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-[#5A6B62] dark:text-[#92A59B] tabular-nums",
						children: [
							t.quranTextStoredDesc,
							" (",
							lang === "ar" ? toArabicDigits(vaultKeys.length) : vaultKeys.length,
							")"
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-white dark:bg-[#111C17] p-5 flex items-center justify-between gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1 min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 text-sm font-semibold text-[#142019] dark:text-[#F1F5F3]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smartphone, {
								className: "h-4 w-4 text-[#27784C] dark:text-[#52B77F] shrink-0",
								strokeWidth: 1.5
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "truncate",
								children: t.installAppTitle
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-[#5A6B62] dark:text-[#92A59B]",
							children: isInstalled ? t.installedStandalone : t.installAppDesc
						})]
					}), !isInstalled && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onOpenInstall,
						className: "shrink-0 rounded-xl bg-[#27784C] dark:bg-[#52B77F] hover:opacity-90 px-4 py-2 text-xs font-semibold text-white dark:text-[#0A110E] transition-opacity whitespace-nowrap",
						children: t.installNowBtn
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "text-sm font-semibold text-[#142019] dark:text-[#F1F5F3] flex items-center gap-2 tabular-nums",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bookmark, {
							className: "h-4 w-4 text-[#27784C] dark:text-[#52B77F]",
							strokeWidth: 1.5
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							t.tabBookmarks,
							" (",
							bookmarks.length,
							")"
						] })]
					}), bookmarks.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setBmFilter("all"),
							className: `px-3 py-1 rounded-xl text-xs font-semibold border transition-colors ${bmFilter === "all" ? "border-[#27784C] dark:border-[#52B77F] bg-[#27784C] dark:bg-[#52B77F] text-white dark:text-[#0A110E]" : "border-[#E2EAE5] dark:border-[#1E2E26] bg-white dark:bg-[#111C17] text-[#5A6B62] dark:text-[#92A59B]"}`,
							children: t.filterAll
						}), [
							"wird",
							"memorization",
							"favorites"
						].map((cat) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setBmFilter(cat),
							className: `inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border transition-colors ${bmFilter === cat ? "border-[#27784C] dark:border-[#52B77F] bg-[#27784C]/10 dark:bg-[#52B77F]/15 text-[#27784C] dark:text-[#52B77F]" : "border-[#E2EAE5] dark:border-[#1E2E26] bg-white dark:bg-[#111C17] text-[#5A6B62] dark:text-[#92A59B]"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `h-2 w-2 rounded-full ${BOOKMARK_CAT_STYLES[cat].dotClass}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: getCategoryLabel(cat) })]
						}, cat))]
					})]
				}), filteredBookmarks.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-white dark:bg-[#111C17] p-8 text-center space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium text-[#142019] dark:text-[#F1F5F3]",
						children: t.noBookmarksTitle
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-[#5A6B62] dark:text-[#92A59B]",
						children: t.noBookmarksDesc
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-1 md:grid-cols-2 gap-3",
					children: filteredBookmarks.map((bm) => {
						const cat = getBookmarkCategory(bm);
						const style = BOOKMARK_CAT_STYLES[cat];
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-testid": `vault-bookmark-${bm.id}`,
							className: "rounded-2xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-white dark:bg-[#111C17] p-4 flex items-start justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => onOpenSurah(bm.surah, bm.ayah),
								className: "text-start flex-1 min-w-0 space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center gap-2 text-xs font-semibold tabular-nums",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: `inline-flex items-center gap-1.5 ${style.badgeClass}`,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `h-2 w-2 rounded-full shrink-0 ${style.dotClass}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: getCategoryLabel(cat) })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											"aria-hidden": "true",
											className: "text-[#5A6B62]/50",
											children: "·"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-[#27784C] dark:text-[#52B77F]",
											children: [
												lang === "ar" ? bm.surahNameAr : bm.surahNameEn,
												" ·",
												" ",
												lang === "ar" ? `${toArabicDigits(bm.surah)}:${toArabicDigits(bm.ayah)}` : `${bm.surah}:${bm.ayah}`,
												" ",
												"· ",
												t.pageWord,
												" ",
												lang === "ar" ? toArabicDigits(bm.page) : bm.page
											]
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									dir: "rtl",
									className: "font-quran-amiri text-xl leading-[2.1] text-[#142019] dark:text-[#F1F5F3] line-clamp-2",
									children: bm.snippet
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => onRemoveBookmark(bm.id),
								"aria-label": `Remove bookmark ${bm.surah}:${bm.ayah}`,
								className: "min-h-[38px] min-w-[38px] flex items-center justify-center rounded-full text-[#5A6B62] dark:text-[#92A59B] hover:text-rose-500",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {
									className: "h-4 w-4",
									strokeWidth: 1.5
								})
							})]
						}, bm.id);
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					className: "text-sm font-semibold text-[#142019] dark:text-[#F1F5F3] flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HardDrive, {
						className: "h-4 w-4 text-[#27784C] dark:text-[#52B77F]",
						strokeWidth: 1.5
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						t.quickDownloadFor,
						" ",
						lang === "ar" ? activeReciter.nameAr : activeReciter.nameEn
					] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5",
					children: RECOMMENDED_SURAH_IDS.map((id) => {
						const sMeta = surahs.find((s) => s.id === id);
						if (!sMeta) return null;
						const isCached = offlineRecords.some((r) => r.surah === id && r.reciterId === activeReciter.id);
						const isDownloading = downloadProgress?.surah === id;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-white dark:bg-[#111C17] px-3.5 py-2.5 flex items-center justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: `font-semibold text-[#142019] dark:text-[#F1F5F3] truncate ${lang === "ar" ? "font-quran-scheherazade text-base leading-normal" : "text-xs"}`,
									children: lang === "ar" ? `${toArabicDigits(sMeta.id)}. ${sMeta.nameAr}` : `${sMeta.id}. ${sMeta.nameEn}`
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-[11px] text-[#5A6B62] dark:text-[#92A59B] tabular-nums",
									children: [
										lang === "ar" ? toArabicDigits(sMeta.totalAyahs) : sMeta.totalAyahs,
										" ",
										t.ayahsWord
									]
								})]
							}), isDownloading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "inline-flex items-center gap-1.5 text-xs font-semibold text-[#27784C] dark:text-[#52B77F] tabular-nums",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
									className: "h-3.5 w-3.5 animate-spin",
									strokeWidth: 1.5
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									downloadProgress.completed,
									"/",
									downloadProgress.total
								] })]
							}) : isCached ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-semibold text-[#27784C] dark:text-[#52B77F]",
								children: t.savedBtn
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => onDownloadSurah(sMeta),
								className: "inline-flex items-center gap-1 rounded-xl border border-[#E2EAE5] dark:border-[#1E2E26] px-2.5 py-1.5 text-xs font-semibold text-[#142019] dark:text-[#F1F5F3] hover:border-[#27784C] dark:hover:border-[#52B77F]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {
									className: "h-3.5 w-3.5",
									strokeWidth: 1.5
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t.saveBtn })]
							})]
						}, id);
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "text-sm font-semibold text-[#142019] dark:text-[#F1F5F3] tabular-nums",
						children: [
							t.savedAudioTitle,
							" (",
							offlineRecords.length,
							")"
						]
					}), offlineRecords.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onClearAudioCache,
						className: "text-xs font-semibold text-rose-500 hover:underline",
						children: t.clearAllAudio
					})]
				}), offlineRecords.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-[#5A6B62] dark:text-[#92A59B] py-2",
					children: t.noAudioSavedDesc
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "divide-y divide-[#E2EAE5] dark:divide-[#1E2E26] rounded-2xl border border-[#E2EAE5] dark:border-[#1E2E26] overflow-hidden",
					children: offlineRecords.map((rec) => {
						const sMeta = surahs.find((s) => s.id === rec.surah);
						const rMeta = RECITERS.find((r) => r.id === rec.reciterId);
						if (!sMeta || !rMeta) return null;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "px-4 py-3 bg-white dark:bg-[#111C17] flex items-center justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: `font-semibold text-[#142019] dark:text-[#F1F5F3] truncate ${lang === "ar" ? "font-quran-scheherazade text-base leading-normal" : "text-xs"}`,
									children: lang === "ar" ? `${toArabicDigits(sMeta.id)}. ${sMeta.nameAr} · ${rMeta.nameAr}` : `${sMeta.id}. ${sMeta.nameEn} · ${rMeta.nameEn}`
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-[11px] text-[#5A6B62] dark:text-[#92A59B] tabular-nums",
									children: [
										rec.totalFiles,
										" MP3 · ",
										formatBytes(rec.bytes)
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => onDeleteOfflineRecord(rMeta, sMeta),
								"aria-label": `Delete offline audio for ${sMeta.nameEn}`,
								className: "min-h-[36px] min-w-[36px] flex items-center justify-center rounded-full text-[#5A6B62] dark:text-[#92A59B] hover:text-rose-500",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {
									className: "h-4 w-4",
									strokeWidth: 1.5
								})
							})]
						}, rec.key);
					})
				})]
			})
		]
	});
};
export { VaultView };
