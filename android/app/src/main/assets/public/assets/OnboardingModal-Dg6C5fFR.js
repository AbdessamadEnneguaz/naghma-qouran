import { a as __toESM, n as createLucideIcon, r as require_react, t as require_jsx_runtime } from "./jsx-runtime-C_MSr2-h.js";
import { $ as RECITERS, Tt as BellRing, bt as ChevronRight, l as NaghmaAppIconImg, xt as Check } from "./index-rBLSx_gx.js";
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Volume2 = createLucideIcon("volume-2", [
	["path", {
		d: "M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z",
		key: "uqj9uw"
	}],
	["path", {
		d: "M16 9a5 5 0 0 1 0 6",
		key: "1q6k2b"
	}],
	["path", {
		d: "M19.364 18.364a9 9 0 0 0 0-12.728",
		key: "ijwkga"
	}]
]);
// src/components/OnboardingModal.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var OnboardingModal = ({ isOpen, lang, t, riwayat, reciterId, notificationPermission = "default", onRequestNotifications, onChangeLang, onChangeRiwayat, onChangeReciter, onComplete }) => {
	const [step, setStep] = (0, import_react.useState)(1);
	const recommendedReciters = (0, import_react.useMemo)(() => {
		return RECITERS.filter((r) => r.riwayat === riwayat).slice(0, 6);
	}, [riwayat]);
	if (!isOpen) return null;
	const stepTitle = step === 1 ? t.onboardingStep1 : step === 2 ? t.onboardingStep2 : t.onboardingStep3;
	const isNotifGranted = notificationPermission === "granted";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		role: "dialog",
		"aria-modal": "true",
		"data-testid": "onboarding-modal",
		"aria-label": t.onboardingTitle,
		className: "fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-lg rounded-2xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-white dark:bg-[#111C17] p-6 sm:p-7 shadow-2xl space-y-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3 min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NaghmaAppIconImg, {
							alt: t.appName,
							className: "h-11 w-11 rounded-xl shrink-0"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-lg font-semibold text-[#142019] dark:text-[#F1F5F3] truncate",
								children: t.onboardingTitle
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-[#5A6B62] dark:text-[#92A59B] mt-0.5",
								children: t.onboardingSubtitle
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"data-testid": "onboarding-skip-btn",
						onClick: onComplete,
						className: "text-xs font-semibold text-[#5A6B62] dark:text-[#92A59B] hover:text-[#27784C] dark:hover:text-[#52B77F] px-2.5 py-1.5 rounded-lg whitespace-nowrap shrink-0",
						children: t.onboardingSkip
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between text-xs font-semibold text-[#27784C] dark:text-[#52B77F]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: stepTitle }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "tabular-nums",
							children: [step, " / 3"]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-3 gap-2",
						children: [
							1,
							2,
							3
						].map((idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-label": `Step ${idx}`,
							onClick: () => setStep(idx),
							className: `h-1 rounded-full transition-colors ${idx <= step ? "bg-[#27784C] dark:bg-[#52B77F]" : "bg-[#E2EAE5] dark:bg-[#1E2E26]"}`
						}, idx))
					})]
				}),
				step === 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-1 gap-2.5",
					"data-testid": "onboarding-step-1",
					children: [
						{
							id: "ar",
							primary: "العربية",
							secondary: "واجهة عربية أصيلة من اليمين لليسار"
						},
						{
							id: "en",
							primary: "English",
							secondary: "Clean English navigation & Sahih translation"
						},
						{
							id: "fr",
							primary: "Français",
							secondary: "Interface française & traduction Hamidullah"
						}
					].map((opt) => {
						const selected = lang === opt.id;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							"data-testid": `onboarding-lang-${opt.id}`,
							onClick: () => onChangeLang(opt.id),
							className: `rounded-xl border p-4 text-start flex items-center justify-between gap-3 transition-colors ${selected ? "border-[#27784C] dark:border-[#52B77F] bg-[#27784C]/8 dark:bg-[#52B77F]/12" : "border-[#E2EAE5] dark:border-[#1E2E26] bg-[#F4F7F5] dark:bg-[#15241D]"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-sm font-semibold text-[#142019] dark:text-[#F1F5F3]",
								children: opt.primary
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs text-[#5A6B62] dark:text-[#92A59B] mt-0.5",
								children: opt.secondary
							})] }), selected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "h-6 w-6 rounded-full bg-[#27784C] dark:bg-[#52B77F] text-white dark:text-[#0A110E] flex items-center justify-center shrink-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
									className: "h-3.5 w-3.5",
									strokeWidth: 1.75
								})
							})]
						}, opt.id);
					})
				}),
				step === 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-1 gap-2.5",
					"data-testid": "onboarding-step-2",
					children: [{
						id: "hafs",
						title: t.hafsLabel,
						subAr: "رواية حفص عن عاصم · مصحف المدينة",
						subFr: "Lecture la plus répandue dans le monde avec récitateurs Tajwid",
						subEn: "Most widely read narration worldwide with Tajweed reciters"
					}, {
						id: "warsh",
						title: t.warshLabel,
						subAr: "رواية ورش عن نافع من طريق الأزرق",
						subFr: "Lecture maghrébine authentique avec Omar Al-Qazabri & Laayoune Al-Kouchi",
						subEn: "Beloved Maghrebi narration with Omar Al-Qazabri & Laayoune Al-Kouchi"
					}].map((opt) => {
						const selected = riwayat === opt.id;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							"data-testid": `onboarding-riwayat-${opt.id}`,
							onClick: () => {
								onChangeRiwayat(opt.id);
								const match = RECITERS.find((r) => r.riwayat === opt.id);
								if (match) onChangeReciter(match.id);
							},
							className: `rounded-xl border p-4 text-start flex items-center justify-between gap-3 transition-colors ${selected ? "border-[#27784C] dark:border-[#52B77F] bg-[#27784C]/8 dark:bg-[#52B77F]/12" : "border-[#E2EAE5] dark:border-[#1E2E26] bg-[#F4F7F5] dark:bg-[#15241D]"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-0.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-sm font-semibold text-[#142019] dark:text-[#F1F5F3]",
									children: opt.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs text-[#5A6B62] dark:text-[#92A59B]",
									children: lang === "ar" ? opt.subAr : lang === "fr" ? opt.subFr : opt.subEn
								})]
							}), selected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "h-6 w-6 rounded-full bg-[#27784C] dark:bg-[#52B77F] text-white dark:text-[#0A110E] flex items-center justify-center shrink-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
									className: "h-3.5 w-3.5",
									strokeWidth: 1.75
								})
							})]
						}, opt.id);
					})
				}),
				step === 3 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3",
					"data-testid": "onboarding-step-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-52 overflow-y-auto pe-1",
						children: recommendedReciters.map((r) => {
							const selected = reciterId === r.id;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								"data-testid": `onboarding-reciter-${r.id}`,
								onClick: () => onChangeReciter(r.id),
								className: `rounded-xl border p-3 text-start flex items-center justify-between gap-2.5 transition-colors ${selected ? "border-[#27784C] dark:border-[#52B77F] bg-[#27784C]/8 dark:bg-[#52B77F]/12" : "border-[#E2EAE5] dark:border-[#1E2E26] bg-[#F4F7F5] dark:bg-[#15241D]"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-xs font-semibold text-[#142019] dark:text-[#F1F5F3] truncate",
										children: lang === "ar" ? r.nameAr : r.nameEn
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[11px] text-[#5A6B62] dark:text-[#92A59B] truncate",
										children: lang === "ar" ? r.nameEn : r.nameAr
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, {
									strokeWidth: 1.5,
									className: `h-4 w-4 shrink-0 ${selected ? "text-[#27784C] dark:text-[#52B77F]" : "text-[#5A6B62]/60 dark:text-[#92A59B]/60"}`
								})]
							}, r.id);
						})
					}), onRequestNotifications && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-[#27784C]/25 dark:border-[#52B77F]/30 bg-[#F4F7F5] dark:bg-[#15241D] p-3 flex items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2.5 min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "h-9 w-9 rounded-xl emerald-3d-hero text-white flex items-center justify-center shrink-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BellRing, {
									className: "h-4 w-4",
									strokeWidth: 1.8
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs font-bold text-[#142019] dark:text-[#F1F5F3] truncate",
									children: lang === "ar" ? "الإشعارات اليومية للقرآن والصلاة" : lang === "fr" ? "Rappels quotidiens Coran & Prières" : "Daily Quran & Prayer Alerts"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] text-[#5A6B62] dark:text-[#92A59B] truncate",
									children: isNotifGranted ? lang === "ar" ? "مفعّل! ستصلك تنبيهات يومية" : "Enabled! Daily alerts active" : lang === "ar" ? "اسمح بالإشعارات ليذكرك يومياً" : "Allow permission for daily reminders"
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"data-testid": "onboarding-notif-btn",
							disabled: isNotifGranted,
							onClick: () => void onRequestNotifications(),
							className: `shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold whitespace-nowrap ${isNotifGranted ? "bg-[#27784C]/15 text-[#27784C] dark:text-[#52B77F]" : "btn-3d-emerald text-white"}`,
							children: isNotifGranted ? lang === "ar" ? "مفعّل" : "Enabled" : lang === "ar" ? "سماح" : lang === "fr" ? "Autoriser" : "Allow"
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-3 pt-1",
					children: [step > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setStep((s) => s > 1 ? s - 1 : 1),
						className: "rounded-xl border border-[#E2EAE5] dark:border-[#1E2E26] px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#5A6B62] dark:text-[#92A59B]",
						children: t.prevWord
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}), step < 3 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						"data-testid": "onboarding-next-btn",
						onClick: () => setStep((s) => s < 3 ? s + 1 : 3),
						className: "inline-flex items-center gap-1.5 rounded-xl bg-[#27784C] dark:bg-[#52B77F] hover:opacity-90 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white dark:text-[#0A110E] transition-opacity",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t.onboardingNext }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, {
							className: "h-4 w-4",
							strokeWidth: 1.5
						})]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						"data-testid": "onboarding-start-btn",
						onClick: onComplete,
						className: "inline-flex items-center gap-1.5 rounded-xl bg-[#27784C] dark:bg-[#52B77F] hover:opacity-90 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white dark:text-[#0A110E] transition-opacity",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
							className: "h-4 w-4",
							strokeWidth: 1.5
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t.onboardingStart })]
					})]
				})
			]
		})
	});
};
export { OnboardingModal };
