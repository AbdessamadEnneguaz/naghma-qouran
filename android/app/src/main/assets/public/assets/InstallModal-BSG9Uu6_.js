import { n as createLucideIcon, r as require_react, t as require_jsx_runtime } from "./jsx-runtime-C_MSr2-h.js";
import { t as CircleCheck } from "./circle-check-BpkttCqY.js";
import { D as DEFAULT_APK_SIZE_BYTES, O as formatApkSizeMb, T as DEFAULT_APK_FILENAME, et as X, f as getApkDownloadUrl, gt as Download, l as NaghmaAppIconImg, nt as Smartphone } from "./index-rBLSx_gx.js";
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Share = createLucideIcon("share", [
	["path", {
		d: "M12 2v13",
		key: "1km8f5"
	}],
	["path", {
		d: "m16 6-4-4-4 4",
		key: "13yo43"
	}],
	["path", {
		d: "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8",
		key: "1b2hhj"
	}]
]);
require_react();
var import_jsx_runtime = require_jsx_runtime();
var InstallModal = ({ lang, t, isOpen, isInstallable, isInstalled, isIOS, onClose, onTriggerNativeInstall }) => {
	if (!isOpen) return null;
	const apkUrl = getApkDownloadUrl();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4",
		role: "dialog",
		"aria-modal": "true",
		"aria-label": t.installAppTitle,
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-md rounded-2xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-white dark:bg-[#111C17] p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto",
			onClick: (e) => e.stopPropagation(),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NaghmaAppIconImg, {
						alt: "Mihrab Noor",
						className: "h-11 w-11 rounded-xl shrink-0"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-base font-semibold text-[#142019] dark:text-[#F1F5F3]",
						children: t.installAppTitle
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-[#5A6B62] dark:text-[#92A59B]",
						children: "Android APK · PWA · iOS"
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onClose,
					"aria-label": "Close install modal",
					className: "min-h-[36px] min-w-[36px] flex items-center justify-center rounded-full text-[#5A6B62] dark:text-[#92A59B] hover:bg-[#EAF1EC] dark:hover:bg-[#1E3229]",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
						className: "h-4.5 w-4.5",
						strokeWidth: 1.5
					})
				})]
			}), isInstalled ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl border border-[#27784C]/30 dark:border-[#52B77F]/35 bg-[#27784C]/8 dark:bg-[#52B77F]/12 p-4 flex items-center gap-3 text-sm text-[#27784C] dark:text-[#52B77F] font-medium",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, {
					className: "h-5 w-5 shrink-0",
					strokeWidth: 1.5
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t.installedStandalone })]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-[#F4F7F5] dark:bg-[#15241D] p-4 space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 text-sm font-semibold text-[#142019] dark:text-[#F1F5F3]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smartphone, {
								className: "h-4 w-4 text-[#27784C] dark:text-[#52B77F] shrink-0",
								strokeWidth: 1.5
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t.downloadApkTitle })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-[#5A6B62] dark:text-[#92A59B] leading-relaxed",
							children: t.downloadApkDesc
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: apkUrl,
							download: DEFAULT_APK_FILENAME,
							type: "application/vnd.android.package-archive",
							className: "w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#27784C] dark:bg-[#52B77F] hover:opacity-90 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white dark:text-[#0A110E] transition-opacity",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {
									className: "h-4 w-4 shrink-0",
									strokeWidth: 1.5
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t.downloadApkCta }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-xs opacity-90 tabular-nums",
									dir: "ltr",
									children: [
										"(",
										formatApkSizeMb(DEFAULT_APK_SIZE_BYTES),
										")"
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
							className: "space-y-1.5 text-[11px] sm:text-xs text-[#5A6B62] dark:text-[#92A59B] pt-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: t.apkStep1 }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: t.apkStep2 }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: t.apkStep3 })
							]
						})
					]
				}), isInstallable ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2.5 pt-1 border-t border-[#E2EAE5] dark:border-[#1E2E26]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-[#5A6B62] dark:text-[#92A59B] leading-relaxed",
						children: t.installAppDesc
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: async () => {
							if (await onTriggerNativeInstall()) onClose();
						},
						className: "w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[#E2EAE5] dark:border-[#1E2E26] px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#142019] dark:text-[#F1F5F3] hover:border-[#27784C] dark:hover:border-[#52B77F] transition-colors",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {
							className: "h-4 w-4 text-[#27784C] dark:text-[#52B77F]",
							strokeWidth: 1.5
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t.installNowBtn })]
					})]
				}) : isIOS ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2 pt-2 border-t border-[#E2EAE5] dark:border-[#1E2E26] text-xs text-[#5A6B62] dark:text-[#92A59B]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-semibold text-[#142019] dark:text-[#F1F5F3]",
						children: lang === "ar" ? "التثبيت على iPhone أو iPad (متصفح Safari):" : "Install on iPhone or iPad (Safari):"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
						className: "space-y-1.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-center gap-1.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: lang === "ar" ? "١. اضغط على زر المشاركة" : "1. Tap the" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share, {
										className: "h-3.5 w-3.5 inline text-[#27784C] dark:text-[#52B77F]",
										strokeWidth: 1.5
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Share" })
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: lang === "ar" ? "٢. اختر \"إضافة إلى الشاشة الرئيسية\" (Add to Home Screen)." : "2. Scroll down and tap Add to Home Screen." }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: lang === "ar" ? "٣. اضغط \"إضافة\" لتشغيل مِحْرَاب النُّور دون إنترنت." : "3. Tap Add to launch Mihrab Noor offline anytime." })
						]
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2 pt-2 border-t border-[#E2EAE5] dark:border-[#1E2E26] text-xs text-[#5A6B62] dark:text-[#92A59B]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "leading-relaxed",
						children: t.installAppDesc
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: lang === "ar" ? "أندرويد (Chrome):" : "Android (Chrome / Edge):" }),
							" ",
							lang === "ar" ? "افتح قائمة المتصفح (⋮) واختر \"تثبيت التطبيق\" أو \"الإضافة للشاشة الرئيسية\"." : "Open the browser menu (⋮) and tap Install app or Add to Home screen."
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: lang === "ar" ? "الحاسوب (Chrome / Edge):" : "Desktop (Chrome / Edge):" }),
							" ",
							lang === "ar" ? "اضغط على أيقونة التثبيت في شريط العنوان." : "Click the Install icon in the address bar."
						] })]
					})]
				})]
			})]
		})
	});
};
export { InstallModal };
