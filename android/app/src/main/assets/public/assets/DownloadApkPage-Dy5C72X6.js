import { a as __toESM, r as require_react, t as require_jsx_runtime } from "./jsx-runtime-C_MSr2-h.js";
import { A as isLocalApkPath, D as DEFAULT_APK_SIZE_BYTES, E as DEFAULT_APK_MIME, M as loadGithubRepo, O as buildGithubReleaseApkUrl, P as saveGithubRepo, T as DEFAULT_APK_FILENAME, Tt as Check, bt as Download, f as getApkDownloadUrl, ft as RefreshCw, k as formatApkSizeMb, l as NaghmaAppIconImg, ot as Smartphone, w as APP_VERSION } from "./index-DwzdC1FZ.js";
import { t as ExternalLink } from "./external-link-Co59r0nB.js";
// src/components/DownloadApkPage.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var DownloadApkPage = ({ lang, t, isInstallable, isInstalled, currentVersion = APP_VERSION, otaServerUrl = "", autoOtaSync = true, updateAvailable = false, updateStatus = "idle", onSetOtaServerUrl, onToggleAutoOtaSync, onCheckUpdates, onApplyUpdate, onTriggerNativeInstall }) => {
	const apkUrl = getApkDownloadUrl();
	const [apkSizeLabel, setApkSizeLabel] = (0, import_react.useState)(() => formatApkSizeMb(DEFAULT_APK_SIZE_BYTES));
	const [apkVerified, setApkVerified] = (0, import_react.useState)(false);
	const [downloadStarted, setDownloadStarted] = (0, import_react.useState)(false);
	const [otaUrlDraft, setOtaUrlDraft] = (0, import_react.useState)(otaServerUrl);
	const [otaSavedFeedback, setOtaSavedFeedback] = (0, import_react.useState)(false);
	const [githubRepo, setGithubRepo] = (0, import_react.useState)(() => loadGithubRepo());
	const [githubRepoDraft, setGithubRepoDraft] = (0, import_react.useState)(() => loadGithubRepo());
	const [repoSavedFeedback, setRepoSavedFeedback] = (0, import_react.useState)(false);
	const [pwaHintVisible, setPwaHintVisible] = (0, import_react.useState)(false);
	const nativeReleaseApkUrl = buildGithubReleaseApkUrl(githubRepo);
	(0, import_react.useEffect)(() => {
		setOtaUrlDraft(otaServerUrl);
	}, [otaServerUrl]);
	(0, import_react.useEffect)(() => {
		if (!isLocalApkPath(apkUrl) || isInstalled) return;
		let active = true;
		fetch(apkUrl, { method: "HEAD" }).then((res) => {
			if (!active || !res.ok) return;
			const len = Number(res.headers.get("content-length") || 0);
			if (len > 0) setApkSizeLabel(formatApkSizeMb(len));
			setApkVerified(true);
		}).catch(() => {});
		return () => {
			active = false;
		};
	}, [apkUrl, isInstalled]);
	const highlights = [
		t.downloadHighlight1,
		t.downloadHighlight2,
		t.downloadHighlight3,
		t.downloadHighlight4
	];
	const versionMetaText = lang === "ar" ? `v${currentVersion} · مجاني · ${apkSizeLabel} · تحديث تلقائي مباشر` : `v${currentVersion} · Free · ${apkSizeLabel} · Live OTA Updates`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-5xl px-4 sm:px-6 pt-6 sm:pt-10 pb-8 space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "grid grid-cols-1 lg:grid-cols-12 gap-7 items-center rounded-2xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-white dark:bg-[#111C17] p-5 sm:p-8 lg:p-10",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "lg:col-span-7 space-y-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-2.5 text-xs font-semibold text-[#27784C] dark:text-[#52B77F] tabular-nums",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"data-testid": "apk-version-meta",
									children: versionMetaText
								}), apkVerified && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"data-testid": "apk-verified-badge",
									className: "rounded-lg border border-[#27784C]/30 dark:border-[#52B77F]/35 bg-[#27784C]/8 dark:bg-[#52B77F]/12 px-2.5 py-0.5 text-[11px] font-semibold text-[#27784C] dark:text-[#52B77F]",
									children: lang === "ar" ? "جاهز للتحميل" : "APK Ready"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "text-2xl sm:text-3xl font-semibold tracking-tight text-[#142019] dark:text-[#F1F5F3] [text-wrap:balance]",
								children: t.downloadPageHeading
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm sm:text-base text-[#5A6B62] dark:text-[#92A59B] leading-relaxed max-w-xl",
								children: t.downloadPageSubheading
							})
						]
					}),
					isInstalled ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rounded-xl border border-[#27784C]/30 dark:border-[#52B77F]/35 bg-[#27784C]/8 dark:bg-[#52B77F]/12 p-4 text-sm font-semibold text-[#27784C] dark:text-[#52B77F]",
						children: t.installedStandalone
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
										href: nativeReleaseApkUrl,
										target: "_blank",
										rel: "noopener noreferrer",
										"data-testid": "download-native-github-apk-cta",
										className: "w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#27784C] dark:bg-[#52B77F] hover:opacity-90 px-4 sm:px-5 py-3.5 text-xs sm:text-sm font-semibold text-white dark:text-[#0A110E] transition-opacity text-center",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {
												className: "h-4 w-4 shrink-0",
												strokeWidth: 1.6
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: lang === "ar" ? "تحميل Native APK (خلفية + إشعارات)" : lang === "fr" ? "Télécharger APK Natif (GitHub)" : "Download Native APK (GitHub Release)" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, {
												className: "h-3.5 w-3.5 opacity-80 shrink-0",
												strokeWidth: 1.6
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										"data-testid": "download-instant-pwa-cta",
										onClick: async () => {
											if (isInstallable) await onTriggerNativeInstall();
											else setPwaHintVisible((prev) => !prev);
										},
										className: "w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-[#F4F7F5] dark:bg-[#15241D] px-4 sm:px-5 py-3.5 text-xs sm:text-sm font-semibold text-[#142019] dark:text-[#F1F5F3] hover:border-[#27784C] dark:hover:border-[#52B77F] transition-colors",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smartphone, {
											className: "h-4 w-4 shrink-0 text-[#27784C] dark:text-[#52B77F]",
											strokeWidth: 1.6
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: isInstallable ? t.installNowBtn : lang === "ar" ? "تثبيت فوري عبر Chrome (PWA)" : lang === "fr" ? "Installer PWA (Chrome)" : "Install Instant PWA" })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
										href: apkUrl,
										download: DEFAULT_APK_FILENAME,
										type: DEFAULT_APK_MIME,
										"data-testid": "download-page-apk-cta",
										onClick: () => setDownloadStarted(true),
										className: "w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-white dark:bg-[#0A110E] px-4 py-3 text-xs font-semibold text-[#5A6B62] dark:text-[#92A59B] hover:text-[#142019] dark:hover:text-[#F1F5F3] transition-colors",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {
												className: "h-3.5 w-3.5 shrink-0",
												strokeWidth: 1.5
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t.downloadApkCta }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-[11px] opacity-85 tabular-nums",
												dir: "ltr",
												children: [
													"(",
													apkSizeLabel,
													")"
												]
											})
										]
									})
								]
							}),
							pwaHintVisible && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-testid": "pwa-install-guide",
								className: "rounded-xl border border-[#27784C]/25 dark:border-[#52B77F]/30 bg-[#F4F7F5] dark:bg-[#0A110E] px-3.5 py-2.5 text-xs text-[#142019] dark:text-[#F1F5F3]",
								children: lang === "ar" ? "في متصفح Chrome على أندرويد: اضغط على قائمة ⋮ ثم اختر «تثبيت التطبيق / الإضافة إلى الشاشة الرئيسية» للاستماع في الخلفية وإشعارات النظام فوراً." : lang === "fr" ? "Dans Chrome Android : touchez le menu ⋮ puis « Installer l’application / Ajouter à l’écran d’accueil » pour l’audio en arrière-plan et les alertes système." : "In Chrome on Android: tap the ⋮ menu and select \"Install app\" / \"Add to Home screen\" for instant background audio and OS notifications."
							}),
							downloadStarted && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium text-[#27784C] dark:text-[#52B77F]",
								children: lang === "ar" ? "بدأ تنزيل mihrab-noor.apk — افتح الملف من إشعارات المتصفح للتثبيت." : "Downloading mihrab-noor.apk — open the file from your browser downloads to install."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
								onSubmit: (e) => {
									e.preventDefault();
									const saved = saveGithubRepo(githubRepoDraft);
									setGithubRepo(saved);
									setGithubRepoDraft(saved);
									setRepoSavedFeedback(true);
									window.setTimeout(() => setRepoSavedFeedback(false), 2400);
								},
								className: "rounded-xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-[#F4F7F5] dark:bg-[#0A110E] p-3 flex flex-wrap items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[11px] font-semibold text-[#5A6B62] dark:text-[#92A59B] whitespace-nowrap",
										children: lang === "ar" ? "مستودع GitHub:" : "GitHub Repo:"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "text",
										dir: "ltr",
										"data-testid": "github-repo-input",
										"aria-label": "GitHub repository owner/name",
										value: githubRepoDraft,
										onChange: (e) => setGithubRepoDraft(e.target.value),
										placeholder: "owner/repo",
										className: "flex-1 min-w-[180px] rounded-lg border border-[#E2EAE5] dark:border-[#1E2E26] bg-white dark:bg-[#111C17] px-2.5 py-1.5 text-xs text-[#142019] dark:text-[#F1F5F3] font-mono"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "submit",
										"data-testid": "save-github-repo-btn",
										className: "rounded-lg bg-[#27784C] px-3 py-1.5 text-[11px] font-bold text-white",
										children: repoSavedFeedback ? lang === "ar" ? "تم التحديث" : "Updated" : lang === "ar" ? "تحديث الرابط" : "Set Release Link"
									})
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-[#F4F7F5] dark:bg-[#0A110E] p-4 space-y-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-xs font-bold text-[#142019] dark:text-[#F1F5F3]",
								children: lang === "ar" ? "مزامنة التحديثات المباشرة من الموقع للـ APK" : "Website-to-APK Live OTA Sync"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] text-[#5A6B62] dark:text-[#92A59B]",
								children: lang === "ar" ? "عند نشر أي تحديث جديد في الموقع يتم اكتشافه وتطبيقه داخل التطبيق بأمان." : "Detects new website releases and syncs updates inside the installed APK safely."
							})] }), onToggleAutoOtaSync && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"data-testid": "toggle-auto-ota-btn",
								role: "switch",
								"aria-checked": autoOtaSync,
								onClick: () => onToggleAutoOtaSync(!autoOtaSync),
								className: `rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors ${autoOtaSync ? "bg-[#27784C] text-white" : "bg-[#E2EAE5] dark:bg-[#1E2E26] text-[#5A6B62] dark:text-[#92A59B]"}`,
								children: autoOtaSync ? lang === "ar" ? "مزامنة تلقائية: مفعّلة" : "Auto-Sync: ON" : lang === "ar" ? "مزامنة تلقائية: إيقاف" : "Auto-Sync: OFF"
							})]
						}), onSetOtaServerUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							onSubmit: (e) => {
								e.preventDefault();
								onSetOtaServerUrl(otaUrlDraft);
								setOtaSavedFeedback(true);
								window.setTimeout(() => setOtaSavedFeedback(false), 2e3);
								if (onCheckUpdates) onCheckUpdates();
							},
							className: "flex flex-wrap items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "url",
									dir: "ltr",
									value: otaUrlDraft,
									onChange: (e) => setOtaUrlDraft(e.target.value),
									"aria-label": "Live Website URL",
									placeholder: "https://your-site.com",
									className: "flex-1 min-w-[190px] rounded-xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-white dark:bg-[#111C17] px-3 py-1.5 text-xs text-[#142019] dark:text-[#F1F5F3]"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "submit",
									className: "rounded-xl bg-[#27784C] px-3.5 py-1.5 text-xs font-bold text-white",
									children: otaSavedFeedback ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "inline-flex items-center gap-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3.5 w-3.5" }), lang === "ar" ? "تم الحفظ" : "Saved"]
									}) : lang === "ar" ? "حفظ وفحص" : "Save & Check"
								}),
								onCheckUpdates && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									"data-testid": "apk-check-updates-btn",
									onClick: () => void (updateAvailable && onApplyUpdate ? onApplyUpdate() : onCheckUpdates()),
									className: "inline-flex items-center gap-1 rounded-xl border border-[#27784C]/35 bg-white dark:bg-[#111C17] px-3 py-1.5 text-xs font-semibold text-[#27784C] dark:text-[#52B77F]",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `h-3.5 w-3.5 ${updateStatus === "checking" ? "animate-spin" : ""}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: updateAvailable ? lang === "ar" ? "تطبيق التحديث" : "Apply Update" : updateStatus === "checking" ? lang === "ar" ? "جاري الفحص..." : "Checking..." : lang === "ar" ? "فحص التحديثات" : "Check Updates" })]
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "pt-2 border-t border-[#E2EAE5] dark:border-[#1E2E26] space-y-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-xs font-semibold tracking-wide text-[#142019] dark:text-[#F1F5F3]",
								children: lang === "ar" ? "خطوات التثبيت والتحديث التلقائي" : "Installation & Auto-Update Guide"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
								className: "space-y-1.5 text-xs sm:text-sm text-[#5A6B62] dark:text-[#92A59B]",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: t.apkStep1 }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: t.apkStep2 }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: t.apkStep3 })
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								"data-testid": "apk-uninstall-tip",
								className: "rounded-xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-[#F4F7F5] dark:bg-[#15241D] px-3.5 py-2.5 text-xs font-medium text-[#142019] dark:text-[#F1F5F3]",
								children: t.apkUninstallTip
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "rounded-xl border border-[#27784C]/25 dark:border-[#52B77F]/30 bg-[#27784C]/5 dark:bg-[#52B77F]/8 px-3.5 py-2.5 text-xs text-[#142019] dark:text-[#F1F5F3] leading-relaxed",
								children: lang === "ar" ? "ملاحظة: للصوت في الخلفية وإشعارات النظام خارج التطبيق مباشرة على هاتفك، يُنصح بتثبيت التطبيق عبر Chrome (إضافة للشاشة الرئيسية PWA) أو تجميع APK عبر Android Studio." : lang === "fr" ? "Astuce : Pour l’audio en arrière-plan et les notifications système sur le téléphone, installez la PWA via Chrome (« Ajouter à l’écran d’accueil ») ou compilez via Android Studio." : "Tip: For full background audio with lock-screen controls and phone notification-tray alerts right now, install the Chrome PWA (\"Add to Home Screen\") or compile natively with Android Studio."
							})
						]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "lg:col-span-5 flex justify-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"aria-label": "Mihrab Noor Android App Preview",
					className: "w-[248px] sm:w-[264px] rounded-[34px] border-[4px] border-[#1E3229] bg-[#F4F7F5] p-3.5 shadow-xl space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mx-auto h-1 w-12 rounded-full bg-black/15" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between px-1.5 text-[#142019]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NaghmaAppIconImg, {
									alt: "Mihrab Noor",
									className: "h-5 w-5 rounded-md"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-quran-scheherazade text-base font-bold text-[#27784C]",
									children: "مِحْرَاب النُّور"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								dir: "ltr",
								className: "text-[10px] text-[#5A6B62] tabular-nums",
								children: "١ / ٦٠٤"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl border border-[#E2EAE5] bg-white p-3.5 space-y-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-center border-b border-[#E2EAE5] pb-1.5",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-quran-scheherazade text-base text-[#27784C] font-bold",
										children: "سُورَةُ ٱلْفَاتِحَةِ"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									dir: "rtl",
									className: "font-quran-amiri text-[15px] leading-[2.05] text-[#142019] text-right",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "bg-[#27784C]/10 text-[#27784C] px-1 rounded",
											children: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ﴿١﴾"
										}),
										" ",
										"ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ ﴿٢﴾ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ﴿٣﴾"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "pt-1.5 border-t border-[#E2EAE5] flex items-center justify-between text-[10px] text-[#5A6B62] tabular-nums",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "الحزب ١" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											dir: "ltr",
											className: "text-[#27784C] font-semibold",
											children: "١ / ٦٠٤"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "الفاتحة" })
									]
								})
							]
						})
					]
				})
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "grid grid-cols-1 md:grid-cols-2 gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-white dark:bg-[#111C17] p-5 sm:p-6 space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm sm:text-base font-semibold text-[#142019] dark:text-[#F1F5F3]",
					children: t.downloadHighlightsTitle
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-2 text-xs sm:text-sm text-[#5A6B62] dark:text-[#92A59B]",
					children: highlights.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-start gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"aria-hidden": "true",
							className: "text-[#27784C] dark:text-[#52B77F] font-bold",
							children: "·"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item })]
					}, item))
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-white dark:bg-[#111C17] p-5 sm:p-6 space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm sm:text-base font-semibold text-[#142019] dark:text-[#F1F5F3]",
						children: t.downloadAndroidStudioTitle
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs sm:text-sm text-[#5A6B62] dark:text-[#92A59B] leading-relaxed",
						children: t.downloadAndroidStudioDesc
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						dir: "ltr",
						className: "rounded-xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-[#F4F7F5] dark:bg-[#0A110E] px-3.5 py-2.5 text-[11px] font-mono text-[#27784C] dark:text-[#52B77F] overflow-x-auto",
						children: "npm run android:sync && npx cap open android"
					})
				]
			})]
		})]
	});
};
export { DownloadApkPage };
