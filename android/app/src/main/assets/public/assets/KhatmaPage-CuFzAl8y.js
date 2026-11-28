import { a as __toESM, n as createLucideIcon, r as require_react, t as require_jsx_runtime } from "./jsx-runtime-C_MSr2-h.js";
import { Ct as BookOpen, Z as toArabicDigits, ot as RotateCcw, wt as Bell } from "./index-rBLSx_gx.js";
import { t as CircleCheck } from "./circle-check-BpkttCqY.js";
import { t as Send } from "./send-DGsZX9lW.js";
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var BellOff = createLucideIcon("bell-off", [
	["path", {
		d: "M10.268 21a2 2 0 0 0 3.464 0",
		key: "vwvbt9"
	}],
	["path", {
		d: "M17 17H4a1 1 0 0 1-.74-1.673C4.59 13.956 6 12.499 6 8a6 6 0 0 1 .258-1.742",
		key: "178tsu"
	}],
	["path", {
		d: "m2 2 20 20",
		key: "1ooewy"
	}],
	["path", {
		d: "M8.668 3.01A6 6 0 0 1 18 8c0 2.687.77 4.653 1.707 6.05",
		key: "1hqiys"
	}]
]);
// src/components/KhatmaPage.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var GOAL_PRESETS = [
	7,
	15,
	30
];
var KhatmaPage = ({ lang, t, plan, schedule, permission, onChangeGoalDays, onLogPages, onMarkTodayComplete, onResetPlan, onToggleReminder, onToggleFridayKahf, onChangeReminderTime, onSendTestReminder, onSendTestKahf, onOpenMushafPage, onOpenKahfSurah }) => {
	const [customDays, setCustomDays] = (0, import_react.useState)(String(plan.goalDays));
	const [pagesInput, setPagesInput] = (0, import_react.useState)("4");
	const [testSentMsg, setTestSentMsg] = (0, import_react.useState)(null);
	const numFmt = (n) => lang === "ar" ? toArabicDigits(n) : String(n);
	const radius = 44;
	const circumference = 2 * Math.PI * radius;
	const dashOffset = circumference * (1 - schedule.percentComplete / 100);
	const handleTest = async () => {
		await onSendTestReminder();
		setTestSentMsg(t.testReminderSent);
		window.setTimeout(() => setTestSentMsg(null), 3500);
	};
	const paceLabel = schedule.paceStatus === "completed" ? t.khatmaCompletedLabel : schedule.paceStatus === "ahead" ? t.paceAhead : schedule.paceStatus === "behind" ? t.paceAdaptiveCatchup : t.paceOnTrack;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-5xl px-4 sm:px-6 pt-6 sm:pt-8 pb-8 space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-b border-[#E2EAE5] dark:border-[#1E2E26] pb-4 space-y-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl sm:text-2xl font-semibold text-[#142019] dark:text-[#F1F5F3]",
					children: t.khatmaTitle
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs sm:text-sm text-[#5A6B62] dark:text-[#92A59B]",
					children: t.khatmaSubtitle
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid grid-cols-1 md:grid-cols-12 gap-5 items-center rounded-2xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-white dark:bg-[#111C17] p-5 sm:p-7",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "md:col-span-4 flex items-center justify-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative h-28 w-28 flex items-center justify-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
							viewBox: "0 0 110 110",
							className: "h-28 w-28 -rotate-90",
							"aria-hidden": "true",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
								cx: "55",
								cy: "55",
								r: radius,
								fill: "none",
								stroke: "currentColor",
								strokeWidth: "6",
								className: "text-[#E2EAE5] dark:text-[#1E2E26]"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
								cx: "55",
								cy: "55",
								r: radius,
								fill: "none",
								stroke: "currentColor",
								strokeWidth: "6",
								strokeLinecap: "round",
								strokeDasharray: circumference,
								strokeDashoffset: dashOffset,
								className: "transition-all duration-300 text-[#27784C] dark:text-[#52B77F]"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "absolute inset-0 flex flex-col items-center justify-center text-center tabular-nums",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xl font-semibold text-[#142019] dark:text-[#F1F5F3]",
								children: [numFmt(schedule.percentComplete), "%"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-[11px] text-[#5A6B62] dark:text-[#92A59B]",
								children: [
									numFmt(schedule.completedPages),
									"/",
									numFmt(604)
								]
							})]
						})]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "md:col-span-8 space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2 text-xs sm:text-sm font-semibold text-[#27784C] dark:text-[#52B77F]",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: paceLabel }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"aria-hidden": "true",
									children: "·"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "tabular-nums",
									children: [
										numFmt(schedule.daysRemaining),
										" ",
										t.daysRemainingLabel
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-lg sm:text-2xl font-semibold text-[#142019] dark:text-[#F1F5F3] tabular-nums",
							children: schedule.isTodayComplete ? t.todayWirdDone : lang === "ar" ? `وِرد اليوم: صفحات ${numFmt(schedule.todayStartPage)} – ${numFmt(schedule.todayEndPage)} (${numFmt(schedule.todayRemainingPages)} صفحة متبقية)` : lang === "fr" ? `Lecture du jour : pages ${schedule.todayStartPage}–${schedule.todayEndPage} (${schedule.todayRemainingPages} restantes)` : `Today's Wird: Pages ${schedule.todayStartPage}–${schedule.todayEndPage} (${schedule.todayRemainingPages} pages left)`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2.5 pt-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => onOpenMushafPage(schedule.todayStartPage),
								className: "inline-flex items-center gap-2 rounded-xl bg-[#27784C] dark:bg-[#52B77F] hover:opacity-90 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white dark:text-[#0A110E] transition-opacity",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, {
									className: "h-4 w-4",
									strokeWidth: 1.5
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									t.openTodayPagesBtn,
									" (",
									numFmt(schedule.todayStartPage),
									")"
								] })]
							}), !schedule.isTodayComplete && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: onMarkTodayComplete,
								className: "inline-flex items-center gap-1.5 rounded-xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-[#F4F7F5] dark:bg-[#15241D] px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#27784C] dark:text-[#52B77F] hover:border-[#27784C] dark:hover:border-[#52B77F] transition-colors",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, {
									className: "h-4 w-4",
									strokeWidth: 1.5
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t.markTodayDoneBtn })]
							})]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid grid-cols-1 md:grid-cols-2 gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-white dark:bg-[#111C17] p-5 space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "block text-xs font-semibold text-[#5A6B62] dark:text-[#92A59B]",
							children: t.khatmaGoalDuration
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [GOAL_PRESETS.map((days) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => {
									onChangeGoalDays(days);
									setCustomDays(String(days));
								},
								className: `px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors tabular-nums ${plan.goalDays === days ? "border-[#27784C] dark:border-[#52B77F] bg-[#27784C]/10 dark:bg-[#52B77F]/15 text-[#27784C] dark:text-[#52B77F]" : "border-[#E2EAE5] dark:border-[#1E2E26] bg-[#F4F7F5] dark:bg-[#0A110E] text-[#142019] dark:text-[#F1F5F3]"}`,
								children: [
									numFmt(days),
									" ",
									t.daysUnit
								]
							}, days)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
								onSubmit: (e) => {
									e.preventDefault();
									const val = Number(customDays);
									if (Number.isFinite(val) && val >= 1 && val <= 365) onChangeGoalDays(val);
								},
								className: "flex items-center gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "number",
									min: 1,
									max: 365,
									value: customDays,
									onChange: (e) => setCustomDays(e.target.value),
									"aria-label": t.customDaysLabel,
									className: "w-16 rounded-xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-[#F4F7F5] dark:bg-[#0A110E] px-3 py-2 text-xs font-semibold text-[#142019] dark:text-[#F1F5F3] tabular-nums"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "submit",
									className: "rounded-xl border border-[#E2EAE5] dark:border-[#1E2E26] px-3 py-2 text-xs font-semibold text-[#27784C] dark:text-[#52B77F]",
									children: t.applyBtn
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-[#5A6B62] dark:text-[#92A59B] tabular-nums",
							children: lang === "ar" ? `المعدل التكيفي الحالي: ${numFmt(schedule.adaptiveDailyTarget)} صفحة/يوم` : `Adaptive daily target: ${schedule.adaptiveDailyTarget} pages/day`
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-white dark:bg-[#111C17] p-5 space-y-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						htmlFor: "khatma-page-log-input",
						className: "block text-xs font-semibold text-[#5A6B62] dark:text-[#92A59B]",
						children: t.logCustomPagesLabel
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: (e) => {
							e.preventDefault();
							const val = Number(pagesInput);
							if (Number.isFinite(val) && val >= 1) onLogPages(val);
						},
						className: "flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								id: "khatma-page-log-input",
								type: "number",
								min: 1,
								max: 604,
								value: pagesInput,
								onChange: (e) => setPagesInput(e.target.value),
								className: "w-24 rounded-xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-[#F4F7F5] dark:bg-[#0A110E] px-3.5 py-2 text-xs font-semibold text-[#142019] dark:text-[#F1F5F3] tabular-nums"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "submit",
								className: "rounded-xl bg-[#27784C]/10 dark:bg-[#52B77F]/15 border border-[#27784C]/30 dark:border-[#52B77F]/35 px-4 py-2 text-xs font-semibold text-[#27784C] dark:text-[#52B77F] transition-colors",
								children: t.addPagesBtn
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => onResetPlan(plan.goalDays),
								title: t.resetKhatmaBtn,
								"aria-label": t.resetKhatmaBtn,
								className: "ms-auto min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl border border-[#E2EAE5] dark:border-[#1E2E26] text-[#5A6B62] dark:text-[#92A59B] hover:text-rose-500",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, {
									className: "h-4 w-4",
									strokeWidth: 1.5
								})
							})
						]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-2xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-white dark:bg-[#111C17] p-5 space-y-3.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [plan.reminderEnabled ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, {
								className: "h-5 w-5 text-[#27784C] dark:text-[#52B77F]",
								strokeWidth: 1.5
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BellOff, {
								className: "h-5 w-5 text-[#5A6B62] dark:text-[#92A59B]",
								strokeWidth: 1.5
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-sm font-semibold text-[#142019] dark:text-[#F1F5F3]",
								children: t.dailyReminderTitle
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-[#5A6B62] dark:text-[#92A59B]",
								children: t.dailyReminderDesc
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							role: "switch",
							"aria-checked": plan.reminderEnabled,
							onClick: () => void onToggleReminder(!plan.reminderEnabled),
							className: `px-4 py-2 rounded-xl text-xs font-semibold border transition-colors ${plan.reminderEnabled ? "border-[#27784C] dark:border-[#52B77F] bg-[#27784C] dark:bg-[#52B77F] text-white dark:text-[#0A110E]" : "border-[#E2EAE5] dark:border-[#1E2E26] bg-[#F4F7F5] dark:bg-[#0A110E] text-[#142019] dark:text-[#F1F5F3]"}`,
							children: plan.reminderEnabled ? t.reminderEnabledLabel : t.enableReminderBtn
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E2EAE5] dark:border-[#1E2E26]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								htmlFor: "khatma-page-reminder-time",
								className: "text-xs font-medium text-[#5A6B62] dark:text-[#92A59B]",
								children: t.reminderTimeLabel
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								id: "khatma-page-reminder-time",
								type: "time",
								value: plan.reminderTime,
								onChange: (e) => onChangeReminderTime(e.target.value),
								className: "rounded-xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-[#F4F7F5] dark:bg-[#0A110E] px-3 py-1.5 text-xs font-semibold text-[#142019] dark:text-[#F1F5F3] tabular-nums"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => void handleTest(),
							className: "inline-flex items-center gap-1.5 rounded-xl border border-[#E2EAE5] dark:border-[#1E2E26] px-4 py-2 text-xs font-semibold text-[#27784C] dark:text-[#52B77F] hover:border-[#27784C] dark:hover:border-[#52B77F] transition-colors",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, {
								className: "h-3.5 w-3.5",
								strokeWidth: 1.5
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t.sendTestReminderBtn })]
						})]
					}),
					(testSentMsg || permission === "denied") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium text-[#27784C] dark:text-[#52B77F]",
						children: permission === "denied" ? t.notificationBlockedHint : testSentMsg
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				"data-testid": "friday-kahf-section",
				className: "rounded-2xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-white dark:bg-[#111C17] p-5 space-y-3.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [plan.fridayKahfEnabled ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, {
							className: "h-5 w-5 text-[#27784C] dark:text-[#52B77F]",
							strokeWidth: 1.5
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BellOff, {
							className: "h-5 w-5 text-[#5A6B62] dark:text-[#92A59B]",
							strokeWidth: 1.5
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-sm font-semibold text-[#142019] dark:text-[#F1F5F3]",
							children: t.fridayKahfTitle
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-[#5A6B62] dark:text-[#92A59B]",
							children: t.fridayKahfDesc
						})] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						role: "switch",
						"data-testid": "friday-kahf-switch",
						"aria-checked": Boolean(plan.fridayKahfEnabled),
						onClick: () => void onToggleFridayKahf(!plan.fridayKahfEnabled),
						className: `px-4 py-2 rounded-xl text-xs font-semibold border transition-colors ${plan.fridayKahfEnabled ? "border-[#27784C] dark:border-[#52B77F] bg-[#27784C] dark:bg-[#52B77F] text-white dark:text-[#0A110E]" : "border-[#E2EAE5] dark:border-[#1E2E26] bg-[#F4F7F5] dark:bg-[#0A110E] text-[#142019] dark:text-[#F1F5F3]"}`,
						children: plan.fridayKahfEnabled ? t.reminderEnabledLabel : t.enableReminderBtn
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-[#E2EAE5] dark:border-[#1E2E26]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						"data-testid": "open-kahf-btn",
						onClick: onOpenKahfSurah,
						className: "inline-flex items-center gap-1.5 rounded-xl bg-[#27784C]/10 dark:bg-[#52B77F]/15 border border-[#27784C]/30 dark:border-[#52B77F]/35 px-4 py-2 text-xs font-semibold text-[#27784C] dark:text-[#52B77F] transition-colors",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, {
							className: "h-3.5 w-3.5",
							strokeWidth: 1.5
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t.openKahfBtn })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						"data-testid": "test-kahf-btn",
						onClick: () => void onSendTestKahf(),
						className: "inline-flex items-center gap-1.5 rounded-xl border border-[#E2EAE5] dark:border-[#1E2E26] px-4 py-2 text-xs font-semibold text-[#27784C] dark:text-[#52B77F] hover:border-[#27784C] dark:hover:border-[#52B77F] transition-colors",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, {
							className: "h-3.5 w-3.5",
							strokeWidth: 1.5
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t.testKahfBtn })]
					})]
				})]
			})
		]
	});
};
export { KhatmaPage };
