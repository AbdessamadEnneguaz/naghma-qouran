import { a as __toESM, n as createLucideIcon, r as require_react, t as require_jsx_runtime } from "./jsx-runtime-C_MSr2-h.js";
import { A as isPrebuiltApkMissingNativePlugins, Ct as BookOpen, Tt as BellRing, a as evaluateSwipeDismiss, d as triggerHaptic, et as X, ft as MoonStar, j as loadOtaServerUrl, r as computeSheetDragOffset, wt as Bell, yt as Clock } from "./index-rBLSx_gx.js";
import { t as CircleCheck } from "./circle-check-BpkttCqY.js";
import { t as Send } from "./send-DGsZX9lW.js";
import { t as Sparkles } from "./sparkles-B8fhnMj3.js";
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var CalendarClock = createLucideIcon("calendar-clock", [
	["path", {
		d: "M16 14v2.2l1.6 1",
		key: "fo4ql5"
	}],
	["path", {
		d: "M16 2v4",
		key: "4m81vk"
	}],
	["path", {
		d: "M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5",
		key: "1osxxc"
	}],
	["path", {
		d: "M3 10h5",
		key: "r794hk"
	}],
	["path", {
		d: "M8 2v4",
		key: "1cmpym"
	}],
	["circle", {
		cx: "16",
		cy: "16",
		r: "6",
		key: "qoo3c4"
	}]
]);
// src/components/NotificationsModal.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var NotificationsModal = ({ isOpen, lang, t, permission, plan, channelPrefs, onClose, onEnsurePermission, onToggleReminder, onChangeReminderTime, onToggleFridayKahf, onTogglePrayerAlerts, onToggleAdhkarAlerts, onSendTestNotification }) => {
	const [testSent, setTestSent] = (0, import_react.useState)(false);
	const sheetRef = (0, import_react.useRef)(null);
	const dragRef = (0, import_react.useRef)({
		active: false,
		startY: 0,
		startMs: 0,
		offsetY: 0
	});
	(0, import_react.useEffect)(() => {
		if (!isOpen) return;
		setTestSent(false);
		if (sheetRef.current) {
			sheetRef.current.style.transition = "";
			sheetRef.current.style.transform = "";
		}
		const onKey = (e) => {
			if (e.key === "Escape") {
				e.stopPropagation();
				onClose();
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [isOpen, onClose]);
	const handlePointerDown = (0, import_react.useCallback)((e) => {
		if (e.target.closest("button, input, a")) return;
		dragRef.current = {
			active: true,
			startY: e.clientY,
			startMs: performance.now(),
			offsetY: 0
		};
		if (sheetRef.current) sheetRef.current.style.transition = "none";
		try {
			e.currentTarget.setPointerCapture(e.pointerId);
		} catch {}
	}, []);
	const handlePointerMove = (0, import_react.useCallback)((e) => {
		if (!dragRef.current.active || !sheetRef.current) return;
		const clamped = computeSheetDragOffset(e.clientY - dragRef.current.startY);
		dragRef.current.offsetY = clamped;
		sheetRef.current.style.transform = `translate3d(0, ${clamped}px, 0)`;
	}, []);
	const finishDrag = (0, import_react.useCallback)(() => {
		if (!dragRef.current.active) return;
		dragRef.current.active = false;
		const elapsed = performance.now() - dragRef.current.startMs;
		const res = evaluateSwipeDismiss(dragRef.current.offsetY, elapsed);
		dragRef.current.offsetY = 0;
		if (res.shouldDismiss) {
			triggerHaptic("light");
			onClose();
		} else if (sheetRef.current) {
			sheetRef.current.style.transition = "transform 220ms cubic-bezier(0.22, 1, 0.36, 1)";
			sheetRef.current.style.transform = "translate3d(0, 0, 0)";
		}
	}, [onClose]);
	if (!isOpen) return null;
	const isPermGranted = permission === "granted";
	const isPermDenied = permission === "denied";
	const needsPwaOrNativeBuild = isPrebuiltApkMissingNativePlugins();
	const pwaLiveUrl = loadOtaServerUrl();
	const channels = [
		{
			id: "prayer",
			testId: "notif-tile-prayer",
			active: channelPrefs.prayerAlertsEnabled,
			Icon: Clock,
			title: lang === "ar" ? "تنبيهات أوقات الصلاة" : lang === "fr" ? "Alertes des Prières" : "Prayer Alerts",
			desc: lang === "ar" ? "إشعار قبل الأذان بـ ١٠ دقائق" : lang === "fr" ? "Rappel 10 min avant chaque prière" : "Alert 10 min before Adhan",
			statusOn: lang === "ar" ? "مفعّل" : "Active",
			statusOff: lang === "ar" ? "إيقاف" : "OFF",
			onToggle: () => {
				triggerHaptic("medium");
				onTogglePrayerAlerts(!channelPrefs.prayerAlertsEnabled);
			}
		},
		{
			id: "wird",
			testId: "notif-tile-wird",
			active: plan.reminderEnabled,
			Icon: BookOpen,
			title: t.dailyReminderTitle,
			desc: lang === "ar" ? `تذكير يومي في ${plan.reminderTime}` : lang === "fr" ? `Rappel quotidien à ${plan.reminderTime}` : `Daily reminder at ${plan.reminderTime}`,
			statusOn: lang === "ar" ? "مفعّل" : "Active",
			statusOff: lang === "ar" ? "إيقاف" : "OFF",
			onToggle: () => {
				triggerHaptic("medium");
				onToggleReminder(!plan.reminderEnabled);
			}
		},
		{
			id: "adhkar",
			testId: "notif-tile-adhkar",
			active: channelPrefs.adhkarEnabled,
			Icon: MoonStar,
			title: lang === "ar" ? "أذكار الصباح والمساء" : lang === "fr" ? "Adhkar Matin & Soir" : "Morning & Evening Adhkar",
			desc: lang === "ar" ? "تذكير يومي صباحاً ومساءً" : lang === "fr" ? "Rappels matin & soir automatiques" : "Daily morning & evening reminders",
			statusOn: lang === "ar" ? "مفعّل" : "Active",
			statusOff: lang === "ar" ? "إيقاف" : "OFF",
			onToggle: () => {
				triggerHaptic("medium");
				onToggleAdhkarAlerts(!channelPrefs.adhkarEnabled);
			}
		},
		{
			id: "kahf",
			testId: "notif-tile-kahf",
			active: Boolean(plan.fridayKahfEnabled),
			Icon: CalendarClock,
			title: t.fridayKahfTitle,
			desc: lang === "ar" ? "كل جمعة صباحاً · سورة الكهف" : lang === "fr" ? "Chaque vendredi matin · Al-Kahf" : "Every Friday morning · Al-Kahf",
			statusOn: lang === "ar" ? "مفعّل" : "Active",
			statusOff: lang === "ar" ? "إيقاف" : "OFF",
			onToggle: () => {
				triggerHaptic("medium");
				onToggleFridayKahf(!plan.fridayKahfEnabled);
			}
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		role: "dialog",
		"aria-modal": "true",
		"aria-label": lang === "ar" ? "إشعارات التطبيق" : "App Notifications",
		"data-testid": "notifications-modal",
		onClick: onClose,
		className: "fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-[2px] p-0 md:p-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			ref: sheetRef,
			onClick: (e) => e.stopPropagation(),
			className: "w-full max-w-lg max-h-[88vh] flex flex-col rounded-t-3xl md:rounded-3xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-white dark:bg-[#111C17] pb-safe-bottom shadow-2xl overflow-hidden will-change-transform",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-testid": "notifications-drag-handle",
				onPointerDown: handlePointerDown,
				onPointerMove: handlePointerMove,
				onPointerUp: finishDrag,
				onPointerCancel: finishDrag,
				className: "touch-none select-none cursor-grab active:cursor-grabbing px-5 pt-3 pb-3.5 border-b border-[#E2EAE5] dark:border-[#1E2E26]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-12 h-1 rounded-full bg-[#CBDAD0] dark:bg-[#243B30] mx-auto mb-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3 min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "h-11 w-11 rounded-2xl led-icon-tile flex items-center justify-center text-[#27784C] dark:text-[#52B77F] shrink-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BellRing, {
								className: "h-5 w-5",
								strokeWidth: 1.85
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-base font-bold text-[#142019] dark:text-[#F1F5F3] truncate",
								children: lang === "ar" ? "إشعارات وتنبيهات مِحْرَاب النُّور" : lang === "fr" ? "Notifications de l’application" : "App Notifications & Alerts"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] text-[#5A6B62] dark:text-[#92A59B] truncate",
								children: lang === "ar" ? "تصلك مباشرة على هاتفك · اسحب للأسفل للإغلاق" : lang === "fr" ? "Envoyées sur votre appareil · glissez pour fermer" : "Sent straight to your phone · swipe down to close"
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"data-testid": "notifications-close-btn",
						onClick: () => {
							triggerHaptic("light");
							onClose();
						},
						"aria-label": t.closeWord,
						className: "min-h-[42px] min-w-[42px] rounded-full surface-3d tactile-press flex items-center justify-center text-[#5A6B62] dark:text-[#92A59B] shrink-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
							className: "h-4 w-4",
							strokeWidth: 1.75
						})
					})]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1 overflow-y-auto p-4 sm:p-5 space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl led-backdrop emerald-3d-hero p-4 text-white flex items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3 min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "h-10 w-10 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center shrink-0",
								children: isPermGranted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, {
									className: "h-5 w-5 text-white",
									strokeWidth: 1.9
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, {
									className: "h-5 w-5 text-white",
									strokeWidth: 1.9
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs sm:text-sm font-bold leading-tight",
									children: isPermGranted ? lang === "ar" ? "الإشعارات مفعّلة على جهازك" : lang === "fr" ? "Notifications autorisées" : "Device Notifications Enabled" : isPermDenied ? lang === "ar" ? "الإشعارات محظورة من المتصفح" : lang === "fr" ? "Notifications bloquées" : "Notifications Blocked in Browser" : lang === "ar" ? "فعّل إشعارات الهاتف والتطبيق" : lang === "fr" ? "Activer les alertes push" : "Enable Device Notifications"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] text-white/85 truncate mt-0.5",
									children: isPermDenied ? t.notificationBlockedHint : lang === "ar" ? "يعمل في الموقع وتطبيق أندرويد APK" : lang === "fr" ? "Fonctionne sur le web & APK Android" : "Works across Web, PWA & Android APK"
								})]
							})]
						}), !isPermGranted && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"data-testid": "notif-enable-permission-btn",
							onClick: () => {
								triggerHaptic("medium");
								onEnsurePermission();
							},
							className: "shrink-0 rounded-xl bg-white px-3.5 py-2 text-xs font-bold text-[#1D633D] shadow-sm tactile-press whitespace-nowrap",
							children: lang === "ar" ? "تفعيل الآن" : lang === "fr" ? "Autoriser" : "Allow"
						})]
					}),
					needsPwaOrNativeBuild && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						"data-testid": "apk-native-limitation-notice",
						className: "rounded-2xl border border-[#27784C]/25 dark:border-[#52B77F]/30 bg-[#F4F7F5] dark:bg-[#0A110E] p-3.5 space-y-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-semibold text-[#142019] dark:text-[#F1F5F3]",
								children: lang === "ar" ? "لإشعارات شريط الهاتف والصوت في الخلفية:" : lang === "fr" ? "Notifications système & audio en arrière-plan :" : "Phone Status-Bar Alerts & Background Audio:"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] text-[#5A6B62] dark:text-[#92A59B] leading-relaxed",
								children: lang === "ar" ? "النسخة المجمّعة من المتصفح (APK) تعرض التنبيهات داخل التطبيق فقط. لتشغيل الإشعارات خارج التطبيق والقراءة في الخلفية فوراً على هاتفك، افتح الموقع في Chrome واختر «تثبيت التطبيق / Add to Home Screen»." : lang === "fr" ? "Cet APK précompilé ne contient pas le service natif d’arrière-plan. Pour recevoir les notifications système et garder l’audio en arrière-plan, ouvrez le site dans Chrome et installez la PWA." : "This prebuilt WebView APK lacks compiled native background services. Open the live site in Chrome and tap Install App (PWA) for full background audio & OS notifications."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: pwaLiveUrl,
								target: "_blank",
								rel: "noopener noreferrer",
								className: "inline-flex items-center gap-1.5 rounded-xl bg-[#27784C] px-3.5 py-1.5 text-[11px] font-bold text-white",
								children: lang === "ar" ? "فتح نسخة Chrome (PWA)" : lang === "fr" ? "Ouvrir dans Chrome (PWA)" : "Open Chrome PWA"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-2 gap-3",
						"data-testid": "notification-channels-grid",
						children: channels.map(({ id, testId, active, Icon, title, desc, statusOn, statusOff, onToggle }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							"data-testid": testId,
							role: "switch",
							"aria-checked": active,
							onClick: onToggle,
							className: `min-h-[126px] rounded-2xl p-3.5 text-start flex flex-col justify-between gap-2 tactile-press ${active ? "emerald-3d-hero led-backdrop text-white" : "surface-3d surface-3d-interactive text-[#142019] dark:text-[#F1F5F3]"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start justify-between gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: `h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${active ? "bg-white/20 text-white shadow-[0_0_16px_rgba(255,255,255,0.3)]" : "led-icon-tile text-[#27784C] dark:text-[#52B77F]"}`,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
										className: "h-5 w-5",
										strokeWidth: 1.85
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: `px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap shrink-0 ${active ? "bg-white text-[#27784C]" : "bg-[#EAF1EC] dark:bg-[#192A22] text-[#5A6B62] dark:text-[#92A59B]"}`,
									children: active ? statusOn : statusOff
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs sm:text-sm font-bold leading-tight",
								children: title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: `text-[10.5px] leading-snug mt-0.5 ${active ? "text-white/85" : "text-[#5A6B62] dark:text-[#92A59B]"}`,
								children: desc
							})] })]
						}, id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl surface-3d p-4 flex flex-wrap items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
									className: "h-4 w-4 text-[#27784C] dark:text-[#52B77F]",
									strokeWidth: 1.75
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									htmlFor: "modal-daily-reminder-time",
									className: "text-xs font-semibold text-[#142019] dark:text-[#F1F5F3]",
									children: t.reminderTimeLabel
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									id: "modal-daily-reminder-time",
									type: "time",
									value: plan.reminderTime,
									onChange: (e) => onChangeReminderTime(e.target.value),
									className: "rounded-xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-[#F4F7F5] dark:bg-[#0A110E] px-3 py-1.5 text-xs font-bold text-[#142019] dark:text-[#F1F5F3] tabular-nums"
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							"data-testid": "notif-send-test-btn",
							onClick: async () => {
								triggerHaptic("success");
								await onSendTestNotification();
								setTestSent(true);
								window.setTimeout(() => setTestSent(false), 3200);
							},
							className: "inline-flex items-center gap-1.5 rounded-xl btn-3d-emerald px-4 py-2 text-xs font-bold text-white tactile-press whitespace-nowrap",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, {
								className: "h-3.5 w-3.5",
								strokeWidth: 1.85
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: testSent ? lang === "ar" ? "تم إرسال الإشعار!" : lang === "fr" ? "Envoyée !" : "Notification Sent!" : t.sendTestReminderBtn })]
						})]
					})
				]
			})]
		})
	});
};
export { NotificationsModal };
