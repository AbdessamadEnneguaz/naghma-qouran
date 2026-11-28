import { a as __toESM, r as require_react, t as require_jsx_runtime } from "./jsx-runtime-C_MSr2-h.js";
import { t as ArrowLeft } from "./arrow-left-NYAY938H.js";
import { t as ArrowRight } from "./arrow-right-LLkBzNqC.js";
import { J as searchQuran, K as highlightArabicWords, Z as toArabicDigits, at as Search, et as X, q as highlightLatinQuery } from "./index-rBLSx_gx.js";
// src/components/SearchModal.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var SearchModal = ({ lang, t, isOpen, verses, surahs, translations, frenchTexts, onClose, onSelectResult }) => {
	const [query, setQuery] = (0, import_react.useState)("");
	const inputRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (isOpen) setTimeout(() => inputRef.current?.focus(), 40);
	}, [isOpen]);
	const results = (0, import_react.useMemo)(() => {
		if (!query.trim()) return [];
		return searchQuran(verses, surahs, query, lang === "fr" && frenchTexts ? frenchTexts : translations || void 0, 40, lang === "fr" ? translations || void 0 : frenchTexts || void 0);
	}, [
		verses,
		surahs,
		query,
		translations,
		frenchTexts,
		lang
	]);
	if (!isOpen) return null;
	const numFmt = (n) => lang === "ar" ? toArabicDigits(n) : String(n);
	const suggestions = [
		{
			label: lang === "ar" ? "2:255 (آية الكرسي)" : "2:255 (Ayat al-Kursi)",
			query: "2:255"
		},
		{
			label: lang === "ar" ? "p:604 (الصفحة الأخيرة)" : lang === "fr" ? "p:604 (Dernière page)" : "p:604 (Last Page)",
			query: "p:604"
		},
		{
			label: "الرحمن",
			query: "الرحمن"
		},
		{
			label: lang === "ar" ? "الحمد لله" : lang === "fr" ? "mercy / الحمد لله" : "mercy",
			query: lang === "ar" ? "الحمد لله" : "mercy"
		}
	];
	const DirArrow = lang === "ar" ? ArrowLeft : ArrowRight;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-3 sm:p-6 pt-10 sm:pt-16",
		role: "dialog",
		"aria-modal": "true",
		"data-testid": "search-modal",
		"aria-label": t.searchBtn,
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-2xl max-h-[82vh] flex flex-col rounded-2xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-white dark:bg-[#111C17] shadow-2xl overflow-hidden",
			onClick: (e) => e.stopPropagation(),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3 px-4 py-3.5 border-b border-[#E2EAE5] dark:border-[#1E2E26]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
						className: "h-5 w-5 text-[#27784C] dark:text-[#52B77F] shrink-0",
						strokeWidth: 1.5
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						ref: inputRef,
						"data-testid": "search-modal-input",
						type: "text",
						value: query,
						onChange: (e) => setQuery(e.target.value),
						placeholder: t.searchPlaceholder,
						"aria-label": t.searchBtn,
						className: "flex-1 min-w-0 bg-transparent text-sm sm:text-base text-[#142019] dark:text-[#F1F5F3] placeholder:text-[#5A6B62]/65 focus:outline-none"
					}),
					query && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setQuery(""),
						className: "text-xs font-medium text-[#5A6B62] dark:text-[#92A59B] hover:text-[#142019] dark:hover:text-[#F1F5F3] px-2 py-1",
						children: t.clear
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onClose,
						"aria-label": t.closeWord,
						className: "min-h-[36px] min-w-[36px] flex items-center justify-center rounded-full text-[#5A6B62] dark:text-[#92A59B] hover:bg-[#EAF1EC] dark:hover:bg-[#1E3229]",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
							className: "h-4.5 w-4.5",
							strokeWidth: 1.5
						})
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex-1 overflow-y-auto p-4 space-y-3",
				children: !query.trim() ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4 py-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-semibold text-[#5A6B62] dark:text-[#92A59B]",
							children: t.searchShortcutsTitle
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-1 sm:grid-cols-2 gap-2.5",
							children: suggestions.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setQuery(s.query),
								className: "rounded-xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-[#F4F7F5] dark:bg-[#15241D] px-3.5 py-2.5 text-start text-xs sm:text-sm font-medium text-[#142019] dark:text-[#F1F5F3] hover:border-[#27784C] dark:hover:border-[#52B77F] transition-colors flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: s.label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DirArrow, {
									className: "h-3.5 w-3.5 text-[#27784C] dark:text-[#52B77F]",
									strokeWidth: 1.5
								})]
							}, s.query))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-[#5A6B62] dark:text-[#92A59B]",
							children: t.searchFooterNote
						})
					]
				}) : results.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "py-12 text-center text-sm text-[#5A6B62] dark:text-[#92A59B]",
					children: t.noSearchMatch
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-[#5A6B62] dark:text-[#92A59B] tabular-nums",
						children: [
							numFmt(results.length),
							" ",
							t.matchesFound
						]
					}), results.map((item, idx) => {
						const arSegments = highlightArabicWords(item.text, query);
						const trSegments = item.translation ? highlightLatinQuery(item.translation, query) : [];
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							"data-testid": `search-result-${item.surah}-${item.ayah}`,
							onClick: () => {
								onSelectResult(item);
								onClose();
							},
							className: "w-full text-start rounded-xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-[#F4F7F5] dark:bg-[#15241D] p-3.5 hover:border-[#27784C] dark:hover:border-[#52B77F] transition-colors space-y-1.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between gap-2 text-xs font-semibold text-[#27784C] dark:text-[#52B77F] tabular-nums",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "truncate",
										children: [
											lang === "ar" ? item.surahNameAr : item.surahNameEn,
											" ·",
											" ",
											lang === "ar" ? `${toArabicDigits(item.surah)}:${toArabicDigits(item.ayah)}` : `${item.surah}:${item.ayah}`,
											" ",
											"· ",
											t.pageWord,
											" ",
											numFmt(item.page),
											" · ",
											t.juzWord,
											" ",
											numFmt(item.juz || 1)
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-quran-scheherazade text-base shrink-0",
										children: item.surahNameAr
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									dir: "rtl",
									className: "font-quran-amiri text-xl leading-[2.0] tracking-normal text-[#142019] dark:text-[#F1F5F3]",
									children: [
										arSegments.map((seg, sIdx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [seg.highlighted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("mark", {
											className: "bg-[#27784C]/15 dark:bg-[#52B77F]/25 text-inherit rounded px-0.5",
											children: seg.text
										}) : seg.text, sIdx < arSegments.length - 1 ? " " : ""] }, sIdx)),
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-[#27784C] dark:text-[#52B77F]",
											children: [
												"﴿",
												toArabicDigits(item.ayah),
												"﴾"
											]
										})
									]
								}),
								trSegments.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									dir: "ltr",
									className: "text-xs text-[#5A6B62] dark:text-[#92A59B] line-clamp-2",
									children: trSegments.map((seg, sIdx) => seg.highlighted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("mark", {
										className: "bg-[#27784C]/15 dark:bg-[#52B77F]/25 text-[#142019] dark:text-[#F1F5F3] rounded px-0.5 font-semibold",
										children: seg.text
									}, sIdx) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Fragment, { children: seg.text }, sIdx))
								})
							]
						}, `${item.type}-${item.surah}-${item.ayah}-${idx}`);
					})]
				})
			})]
		})
	});
};
export { SearchModal };
