import { a as __toESM, r as require_react, t as require_jsx_runtime } from "./jsx-runtime-C_MSr2-h.js";
import { Ct as BookOpen, Z as toArabicDigits, et as X, gt as Download, lt as Play, mt as LoaderCircle } from "./index-rBLSx_gx.js";
import { n as renderHeartStoryCardPng } from "./storyCardCanvas-Ci3AflLS.js";
// src/data/moodAyahs.ts
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var MOOD_CATEGORIES = [
	{
		id: "calm",
		labelEn: "Calm & Anxiety",
		labelAr: "السكينة وزوال القلق",
		subtitleEn: "Tranquility when your heart feels heavy or restless",
		subtitleAr: "آيات تبعث الطمأنينة والسكينة في القلب"
	},
	{
		id: "gratitude",
		labelEn: "Gratitude",
		labelAr: "الشكر والامتنان",
		subtitleEn: "Recognizing Allah’s countless blessings",
		subtitleAr: "تذكّر نعم الله وشكره في كل حال"
	},
	{
		id: "patience",
		labelEn: "Patience",
		labelAr: "الصبر والثبات",
		subtitleEn: "Strength and reassurance during hardship",
		subtitleAr: "السلوى والثبات عند الابتلاءات"
	},
	{
		id: "forgiveness",
		labelEn: "Forgiveness",
		labelAr: "التوبة والمغفرة",
		subtitleEn: "Hope in Allah’s boundless mercy and pardon",
		subtitleAr: "الرجاء في رحمة الله الواسعة ومغفرته"
	},
	{
		id: "guidance",
		labelEn: "Guidance",
		labelAr: "الهداية والنور",
		subtitleEn: "Clarity and light for your path ahead",
		subtitleAr: "نور البصيرة وطلب الهداية للصراط المستقيم"
	}
];
var MOOD_AYAHS = [
	{
		id: "calm-94-5",
		mood: "calm",
		surah: 94,
		ayah: 5,
		page: 596,
		surahNameAr: "الشَّرْحِ",
		surahNameEn: "Ash-Sharh",
		arabic: "فَإِنَّ مَعَ ٱلْعُسْرِ يُسْرًا ۝ إِنَّ مَعَ ٱلْعُسْرِ يُسْرًا",
		translationEn: "For indeed, with hardship will be ease. Indeed, with hardship will be ease.",
		reflectionEn: "Ease does not merely come after hardship — Allah places ease right alongside it.",
		reflectionAr: "اليسر مقترن بالعسر لا ينفك عنه، ولن يغلب عسرٌ يسرين."
	},
	{
		id: "calm-13-28",
		mood: "calm",
		surah: 13,
		ayah: 28,
		page: 252,
		surahNameAr: "الرَّعْدِ",
		surahNameEn: "Ar-Ra’d",
		arabic: "أَلَا بِذِكْرِ ٱللَّهِ تَطْمَئِنُّ ٱلْقُلُوبُ",
		translationEn: "Unquestionably, by the remembrance of Allah hearts are assured.",
		reflectionEn: "True inner stillness returns the moment the heart reconnects with its Creator.",
		reflectionAr: "لا تسكن القلوب المضطربة إلا بالأنس بذكر الله تعالى."
	},
	{
		id: "calm-65-3",
		mood: "calm",
		surah: 65,
		ayah: 3,
		page: 558,
		surahNameAr: "الطَّلَاقِ",
		surahNameEn: "At-Talaq",
		arabic: "وَمَن يَتَوَكَّلْ عَلَى ٱللَّهِ فَهُوَ حَسْبُهُۥٓ ۚ إِنَّ ٱللَّهَ بَٰلِغُ أَمْرِهِۦ",
		translationEn: "And whoever relies upon Allah — then He is sufficient for him. Indeed, Allah will accomplish His purpose.",
		reflectionEn: "Entrusting what lies beyond your control to Allah lifts every anxiety.",
		reflectionAr: "من صدق توكله على الله كفاه همّه ويسّر له أمره."
	},
	{
		id: "gratitude-14-7",
		mood: "gratitude",
		surah: 14,
		ayah: 7,
		page: 256,
		surahNameAr: "إِبْرَاهِيمَ",
		surahNameEn: "Ibrahim",
		arabic: "لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ",
		translationEn: "If you are grateful, I will surely increase you in favor.",
		reflectionEn: "Gratitude preserves present blessings and opens doors to greater abundance.",
		reflectionAr: "الشكر قيدٌ للنعم الموجودة ومفتاحٌ لزيادتها وبركتها."
	},
	{
		id: "gratitude-55-13",
		mood: "gratitude",
		surah: 55,
		ayah: 13,
		page: 531,
		surahNameAr: "الرَّحْمَٰنِ",
		surahNameEn: "Ar-Rahman",
		arabic: "فَبِأَىِّ ءَالَآءِ رَبِّكُمَا تُكَذِّبَانِ",
		translationEn: "So which of the favors of your Lord would you deny?",
		reflectionEn: "Pause and count even one breath, one sight, one peaceful moment you were gifted today.",
		reflectionAr: "تأمّل في آلاء الله عليك في صحتك وسمعك وبصرك وهدايتك."
	},
	{
		id: "gratitude-2-152",
		mood: "gratitude",
		surah: 2,
		ayah: 152,
		page: 23,
		surahNameAr: "البَقَرَةِ",
		surahNameEn: "Al-Baqara",
		arabic: "فَٱذْكُرُونِىٓ أَذْكُرْكُمْ وَٱشْكُرُوا۟ لِى وَلَا تَكْفُرُونِ",
		translationEn: "So remember Me; I will remember you. And be grateful to Me and do not deny Me.",
		reflectionEn: "The Lord of the Worlds honors your remembrance by mentioning you in the highest assembly.",
		reflectionAr: "أي شرف أعظم من أن يذكرك ربُّ العالمين حين تذكره وتشكره."
	},
	{
		id: "patience-2-286",
		mood: "patience",
		surah: 2,
		ayah: 286,
		page: 49,
		surahNameAr: "البَقَرَةِ",
		surahNameEn: "Al-Baqara",
		arabic: "لَا يُكَلِّفُ ٱللَّهُ نَفْسًا إِلَّا وُسْعَهَا",
		translationEn: "Allah does not charge a soul except with that within its capacity.",
		reflectionEn: "Every trial placed in your path was measured with wisdom knowing you have the strength to endure it.",
		reflectionAr: "ما ابتلاك الله بأمرٍ إلا وفيك من القوة واللطف ما يعينك على تحمّله."
	},
	{
		id: "patience-39-10",
		mood: "patience",
		surah: 39,
		ayah: 10,
		page: 459,
		surahNameAr: "الزُّمَرِ",
		surahNameEn: "Az-Zumar",
		arabic: "إِنَّمَا يُوَفَّى ٱلصَّٰبِرُونَ أَجْرَهُم بِغَيْرِ حِسَابٍ",
		translationEn: "Indeed, the patient will be given their reward without account.",
		reflectionEn: "While other deeds have measured rewards, steadfast patience receives boundless recompense.",
		reflectionAr: "أجر الصابرين مفتوحٌ بلا عدٍّ ولا حدٍّ عند أكرم الأكرمين."
	},
	{
		id: "patience-2-153",
		mood: "patience",
		surah: 2,
		ayah: 153,
		page: 23,
		surahNameAr: "البَقَرَةِ",
		surahNameEn: "Al-Baqara",
		arabic: "يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ ٱسْتَعِينُوا۟ بِٱلصَّبْرِ وَٱلصَّلَوٰةِ ۚ إِنَّ ٱللَّهَ مَعَ ٱلصَّٰبِرِينَ",
		translationEn: "O you who have believed, seek help through patience and prayer. Indeed, Allah is with the patient.",
		reflectionEn: "In every quiet prayer, Allah draws near with help and comfort.",
		reflectionAr: "الصبر والصلاة زاد المؤمن، ومعية الله لا تفارق الصابرين."
	},
	{
		id: "forgiveness-39-53",
		mood: "forgiveness",
		surah: 39,
		ayah: 53,
		page: 464,
		surahNameAr: "الزُّمَرِ",
		surahNameEn: "Az-Zumar",
		arabic: "قُلْ يَٰعِبَادِىَ ٱلَّذِينَ أَسْرَفُوا۟ عَلَىٰٓ أَنفُسِهِمْ لَا تَقْنَطُوا۟ مِن رَّحْمَةِ ٱللَّهِ ۚ إِنَّ ٱللَّهَ يَغْفِرُ ٱلذُّنُوبَ جَمِيعًا",
		translationEn: "Say, “O My servants who have transgressed against themselves, do not despair of the mercy of Allah. Indeed, Allah forgives all sins.”",
		reflectionEn: "Never let guilt close the door — Allah calls you back as “My servants” and forgives all sins.",
		reflectionAr: "لا قنوط مع نداء الله الرؤوف لعباده، فباب التوبة مفتوح دائماً."
	},
	{
		id: "forgiveness-71-10",
		mood: "forgiveness",
		surah: 71,
		ayah: 10,
		page: 570,
		surahNameAr: "نُوحٍ",
		surahNameEn: "Nuh",
		arabic: "فَقُلْتُ ٱسْتَغْفِرُوا۟ رَبَّكُمْ إِنَّهُۥ كَانَ غَفَّارًا",
		translationEn: "And said, “Ask forgiveness of your Lord. Indeed, He is ever a Perpetual Forgiver.”",
		reflectionEn: "Istighfar opens the skies of mercy, peace, and unexpected provision.",
		reflectionAr: "الاستغفار مفتاح المغفرة والفرج والرزق والبركة."
	},
	{
		id: "guidance-1-6",
		mood: "guidance",
		surah: 1,
		ayah: 6,
		page: 1,
		surahNameAr: "الفَاتِحَةِ",
		surahNameEn: "Al-Faatiha",
		arabic: "ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ",
		translationEn: "Guide us to the straight path.",
		reflectionEn: "Every prayer begins with asking Allah for daily clarity, sincerity, and steady footing.",
		reflectionAr: "أعظم دعاء يكرره المسلم في كل ركعة طلباً للثبات والبصيرة."
	},
	{
		id: "guidance-24-35",
		mood: "guidance",
		surah: 24,
		ayah: 35,
		page: 354,
		surahNameAr: "النُّورِ",
		surahNameEn: "An-Nur",
		arabic: "ٱللَّهُ نُورُ ٱلسَّمَٰوَٰتِ وَٱلْأَرْضِ ۚ يَهْدِى ٱللَّهُ لِنُورِهِۦ مَن يَشَآءُ",
		translationEn: "Allah is the Light of the heavens and the earth. Allah guides to His light whom He wills.",
		reflectionEn: "When paths look uncertain, turn toward His Book — its light never fades.",
		reflectionAr: "نور الوحي يبدد حيرة القلب ويهدي إلى أوضح السبل."
	},
	{
		id: "guidance-20-114",
		mood: "guidance",
		surah: 20,
		ayah: 114,
		page: 320,
		surahNameAr: "طٰهٰ",
		surahNameEn: "Taha",
		arabic: "وَقُل رَّبِّ زِدْنِى عِلْمًا",
		translationEn: "And say, “My Lord, increase me in knowledge.”",
		reflectionEn: "Beneficial knowledge illuminates both worship and daily character.",
		reflectionAr: "طلب الزيادة في العلم النافع طريق الخشية والهداية."
	}
];
// src/components/HeartGuideModal.tsx
var import_jsx_runtime = require_jsx_runtime();
var HeartGuideModal = ({ isOpen, lang, t, onClose, onPlayAyah, onOpenSurah }) => {
	const [selectedMood, setSelectedMood] = (0, import_react.useState)("calm");
	const [renderingId, setRenderingId] = (0, import_react.useState)(null);
	const [previewCard, setPreviewCard] = (0, import_react.useState)(null);
	const moodMeta = (0, import_react.useMemo)(() => MOOD_CATEGORIES.find((m) => m.id === selectedMood) || MOOD_CATEGORIES[0], [selectedMood]);
	const filteredAyahs = (0, import_react.useMemo)(() => MOOD_AYAHS.filter((a) => a.mood === selectedMood), [selectedMood]);
	if (!isOpen) return null;
	const handleSaveStory = async (entry) => {
		try {
			setRenderingId(entry.id);
			const { dataUrl, filename } = await renderHeartStoryCardPng(entry, lang);
			setPreviewCard({
				dataUrl,
				filename,
				entry
			});
			const a = document.createElement("a");
			a.href = dataUrl;
			a.download = filename;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
		} finally {
			setRenderingId(null);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		role: "dialog",
		"aria-modal": "true",
		"aria-label": t.heartGuideTitle,
		className: "fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-white dark:bg-[#111C17] p-4 sm:p-7 shadow-2xl space-y-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between gap-3 border-b border-[#E2EAE5] dark:border-[#1E2E26] pb-3.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-lg sm:text-xl font-semibold text-[#142019] dark:text-[#F1F5F3]",
						children: t.heartGuideTitle
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-[#5A6B62] dark:text-[#92A59B]",
						children: lang === "ar" ? moodMeta.subtitleAr : moodMeta.subtitleEn
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onClose,
						"aria-label": t.closeWord,
						className: "min-h-[40px] min-w-[40px] flex items-center justify-center rounded-full border border-[#E2EAE5] dark:border-[#1E2E26] text-[#5A6B62] dark:text-[#92A59B] hover:text-[#142019] dark:hover:text-[#F1F5F3]",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
							className: "h-4.5 w-4.5",
							strokeWidth: 1.5
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: MOOD_CATEGORIES.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => {
							setSelectedMood(m.id);
							setPreviewCard(null);
						},
						className: `px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors whitespace-nowrap ${selectedMood === m.id ? "border-[#27784C] dark:border-[#52B77F] bg-[#27784C] dark:bg-[#52B77F] text-white dark:text-[#0A110E]" : "border-[#E2EAE5] dark:border-[#1E2E26] bg-[#F4F7F5] dark:bg-[#15241D] text-[#5A6B62] dark:text-[#92A59B]"}`,
						children: lang === "ar" ? m.labelAr : m.labelEn
					}, m.id))
				}),
				previewCard && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-[#27784C]/30 dark:border-[#52B77F]/35 bg-[#F4F7F5] dark:bg-[#15241D] p-4 flex flex-col sm:flex-row items-center gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: previewCard.dataUrl,
						alt: `${previewCard.entry.surahNameEn} ${previewCard.entry.surah}:${previewCard.entry.ayah} Story Card`,
						className: "w-24 aspect-[9/16] rounded-xl border border-[#E2EAE5] dark:border-[#1E2E26] object-cover shrink-0"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex-1 space-y-2 text-center sm:text-start",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-semibold text-[#27784C] dark:text-[#52B77F]",
								children: t.storyCardReadyTitle
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-[#5A6B62] dark:text-[#92A59B]",
								children: [
									t.storyCardReadyDesc,
									" (",
									previewCard.filename,
									")"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: previewCard.dataUrl,
								download: previewCard.filename,
								className: "inline-flex items-center gap-1.5 rounded-xl bg-[#27784C] dark:bg-[#52B77F] px-4 py-2 text-xs font-semibold text-white dark:text-[#0A110E]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {
									className: "h-3.5 w-3.5",
									strokeWidth: 1.5
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t.downloadPngAgain })]
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-4",
					children: filteredAyahs.map((entry) => {
						const isBusy = renderingId === entry.id;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-[#F4F7F5] dark:bg-[#15241D] p-4 sm:p-5 space-y-3.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between gap-2 text-xs font-semibold text-[#27784C] dark:text-[#52B77F] tabular-nums",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: lang === "ar" ? `${entry.surahNameAr} · الآية ${toArabicDigits(entry.ayah)}` : `${entry.surahNameEn} · ${entry.surah}:${entry.ayah}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[#5A6B62] dark:text-[#92A59B]",
										children: lang === "ar" ? `${t.pageWord} ${toArabicDigits(entry.page)}` : `${t.pageWord} ${entry.page}`
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									dir: "rtl",
									className: "font-quran-amiri text-2xl sm:text-[26px] leading-[2.25] tracking-normal text-[#142019] dark:text-[#F1F5F3] text-right",
									children: entry.arabic
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs sm:text-sm leading-relaxed text-[#5A6B62] dark:text-[#A1A1AA]",
									children: [
										"“",
										entry.translationEn,
										"”"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-[#27784C] dark:text-[#52B77F]",
									children: lang === "ar" ? entry.reflectionAr : entry.reflectionEn
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center gap-2 pt-2 border-t border-[#E2EAE5] dark:border-[#1E2E26]",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: () => onPlayAyah(entry.surah, entry.ayah),
											className: "inline-flex items-center gap-1.5 rounded-xl bg-[#27784C] dark:bg-[#52B77F] px-4 py-2 text-xs font-semibold text-white dark:text-[#0A110E]",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "h-3.5 w-3.5 fill-current" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t.listenAyah })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: () => {
												onClose();
												onOpenSurah(entry.surah, entry.ayah);
											},
											className: "inline-flex items-center gap-1.5 rounded-xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-white dark:bg-[#111C17] px-4 py-2 text-xs font-semibold text-[#142019] dark:text-[#F1F5F3] hover:border-[#27784C] dark:hover:border-[#52B77F]",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, {
												className: "h-3.5 w-3.5",
												strokeWidth: 1.5
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t.openInMushafBtn })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											disabled: isBusy,
											onClick: () => void handleSaveStory(entry),
											className: "ms-auto inline-flex items-center gap-1.5 rounded-xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-white dark:bg-[#111C17] px-4 py-2 text-xs font-semibold text-[#27784C] dark:text-[#52B77F] hover:border-[#27784C] dark:hover:border-[#52B77F] transition-colors",
											children: [isBusy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
												className: "h-3.5 w-3.5 animate-spin",
												strokeWidth: 1.5
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {
												className: "h-3.5 w-3.5",
												strokeWidth: 1.5
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t.saveStoryCardBtn })]
										})
									]
								})
							]
						}, entry.id);
					})
				})
			]
		})
	});
};
export { HeartGuideModal };
