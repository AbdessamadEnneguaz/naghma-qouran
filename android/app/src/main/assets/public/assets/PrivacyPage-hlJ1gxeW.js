import { n as createLucideIcon, r as require_react, t as require_jsx_runtime } from "./jsx-runtime-C_MSr2-h.js";
import { t as ArrowLeft } from "./arrow-left-NYAY938H.js";
import { t as ArrowRight } from "./arrow-right-LLkBzNqC.js";
import { t as ExternalLink } from "./external-link-Co59r0nB.js";
import { t as ShieldCheck } from "./shield-check-DpL6Rklr.js";
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Mail = createLucideIcon("mail", [["path", {
	d: "m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7",
	key: "132q7q"
}], ["rect", {
	x: "2",
	y: "4",
	width: "20",
	height: "16",
	rx: "2",
	key: "izxlao"
}]]);
require_react();
var import_jsx_runtime = require_jsx_runtime();
var PrivacyPage = ({ lang, t, onBackHome }) => {
	const isAr = lang === "ar";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-testid": "privacy-page",
		className: "mx-auto max-w-4xl px-4 sm:px-6 pt-6 sm:pt-10 pb-8 space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center justify-between gap-3 border-b border-[#E2EAE5] dark:border-[#1E2E26] pb-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-11 w-11 rounded-xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-white dark:bg-[#111C17] text-[#27784C] dark:text-[#52B77F] flex items-center justify-center shrink-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, {
						className: "h-5 w-5",
						strokeWidth: 1.5
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl sm:text-2xl font-semibold tracking-tight text-[#142019] dark:text-[#F1F5F3]",
					children: isAr ? "سياسة الخصوصية — مِحْرَاب النُّور" : "Privacy Policy — Mihrab Noor"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs sm:text-sm text-[#5A6B62] dark:text-[#92A59B] mt-0.5 tabular-nums",
					children: isAr ? "آخر تحديث: نوفمبر ٢٠٢٦ · تطبيق قرآني يحفظ خصوصيتك ويعمل محلياً دون اتصال" : "Last Updated: November 2026 · Local-first, privacy-respecting Holy Quran web & Android app"
				})] })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: onBackHome,
				className: "inline-flex items-center gap-1.5 rounded-xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-white dark:bg-[#111C17] px-4 py-2 text-xs font-semibold text-[#142019] dark:text-[#F1F5F3] hover:border-[#27784C] dark:hover:border-[#52B77F] transition-colors whitespace-nowrap",
				children: [isAr ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
					className: "h-3.5 w-3.5",
					strokeWidth: 1.5
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, {
					className: "h-3.5 w-3.5",
					strokeWidth: 1.5
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t.navHome })]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-2xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-white dark:bg-[#111C17] p-5 sm:p-6 space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-base font-semibold text-[#142019] dark:text-[#F1F5F3]",
						children: isAr ? "١. التخزين المحلي وحماية البيانات (IndexedDB & LocalStorage)" : "1. Local-First Storage & Data Collection"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm leading-relaxed text-[#5A6B62] dark:text-[#A1A1AA]",
						children: isAr ? "صُمم تطبيق مِحْرَاب النُّور (Mihrab Noor) ليعمل محلياً بالكامل دون الحاجة إلى تسجيل حساب أو إرسال بياناتك الشخصية إلى أي خادم خارجي. يتم حفظ نصوص المصحف الشريف، والإشارات المرجعية، وآخر موضع قراءة، وتقدم الختمة والأذكار، والتلاوات الصوتية المُحمّلة محلياً داخل متصفحك أو جهازك عبر قاعدة بيانات IndexedDB (najm_quran_db) وLocalStorage." : "Mihrab Noor is engineered as a local-first application that requires no user registration and collects no personal profile data on private servers. Quranic texts, bookmarks, last-read position, Khatma progress, Adhkar counters, reader preferences, and optional offline Surah audio recordings remain stored directly on your device inside IndexedDB (najm_quran_db) and LocalStorage."
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-2xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-white dark:bg-[#111C17] p-5 sm:p-6 space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-base font-semibold text-[#142019] dark:text-[#F1F5F3]",
						children: isAr ? "٢. أذونات الموقع وبوصلة القبلة ومواقيت الصلاة" : "2. Optional On-Device Location & Sensor Permissions"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm leading-relaxed text-[#5A6B62] dark:text-[#A1A1AA]",
						children: isAr ? "عند اختيارك تفعيل تحديد الموقع الجغرافي (GPS) أو مستشعر الاتجاه في صفحة بوصلة القبلة أو حساب مواقيت الصلاة، تُجرى جميع الحسابات الفلكية محلياً على جهازك فقط لحساب زاوية القبلة وأوقات الصلاة بدقة، ولا يتم إرسال إحداثياتك أو تخزينها لدى أي طرف." : "If you optionally grant GPS location or device orientation access inside the Qibla Finder or Prayer Times features, your coordinates are used exclusively for local on-device astronomical calculations and compass bearing rendering. Your coordinates are never transmitted to or stored on external tracking servers."
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					"data-testid": "privacy-adsense-section",
					className: "rounded-2xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-white dark:bg-[#111C17] p-5 sm:p-6 space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-base font-semibold text-[#142019] dark:text-[#F1F5F3]",
							children: isAr ? "٣. الإعلانات وملفات تعريف الارتباط (Google AdSense)" : "3. Advertising & Third-Party Cookies (Google AdSense)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm leading-relaxed text-[#5A6B62] dark:text-[#A1A1AA]",
							children: isAr ? "للمساعدة في تغطية تكاليف الخوادم وإبقاء تطبيق مِحْرَاب النُّور مجانياً للجميع، قد يعرض الموقع إعلانات عبر خدمة Google AdSense. تستخدم Google وبائعو الإعلانات التابعون لجهات خارجية ملفات تعريف الارتباط (بما في ذلك ملف تعريف ارتباط DART وإعلانات Google المخصصة) لعرض إعلانات ملائمة استناداً إلى زياراتك السابقة لهذا الموقع أو مواقع أخرى على شبكة الإنترنت." : "To sustain hosting and keep Mihrab Noor freely accessible, we may display advertisements served by Google AdSense. Third-party vendors, including Google, use cookies (such as the Google DoubleClick DART cookie) to serve ads based on a user’s prior visits to this website or other websites on the Internet."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm leading-relaxed text-[#5A6B62] dark:text-[#A1A1AA]",
							children: isAr ? "يمكنك في أي وقت إلغاء الاشتراك في الإعلانات المخصصة وإدارة تفضيلات ملفات تعريف الارتباط الإعلانية لـ Google عبر صفحة إعدادات إعلانات Google الرسمية:" : "Users may opt out of personalized advertising and manage Google AdSense DART cookie preferences at any time by visiting Google Ads Settings:"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-3 pt-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: "https://adssettings.google.com",
								target: "_blank",
								rel: "noopener noreferrer",
								className: "inline-flex items-center gap-1.5 rounded-xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-[#F4F7F5] dark:bg-[#15241D] px-4 py-2 text-xs font-semibold text-[#27784C] dark:text-[#52B77F] hover:border-[#27784C] dark:hover:border-[#52B77F] transition-colors",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, {
									className: "h-3.5 w-3.5",
									strokeWidth: 1.5
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "https://adssettings.google.com" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: "https://policies.google.com/technologies/ads",
								target: "_blank",
								rel: "noopener noreferrer",
								className: "inline-flex items-center gap-1.5 text-xs font-semibold text-[#5A6B62] dark:text-[#92A59B] hover:text-[#27784C] dark:hover:text-[#52B77F] underline underline-offset-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: isAr ? "سياسة إعلانات وتقنيات Google" : "Google Advertising Technologies Policy" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, {
									className: "h-3 w-3",
									strokeWidth: 1.5
								})]
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-2xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-white dark:bg-[#111C17] p-5 sm:p-6 space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-base font-semibold text-[#142019] dark:text-[#F1F5F3]",
						children: isAr ? "٤. خوادم التلاوات الصوتية والميكروفون" : "4. Recitation Streams & Optional Microphone"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm leading-relaxed text-[#5A6B62] dark:text-[#A1A1AA]",
						children: isAr ? "عند تشغيل التلاوة الصوتية دون تحميل مسبق، يتم جلب ملفات MP3 من خوادم التلاوة القرآنية العامة (مثل MP3Quran وEveryAyah وQuran.com). كما أن ميزة التسميع الصوتي بالمايكروفون لا تعمل إلا عند ضغطك المباشر عليها ووفق أذونات متصفحك." : "Streaming un-cached recitations requests public Quran MP3 streams and timestamp metadata directly from established Quran audio CDNs (such as MP3Quran, EveryAyah, and Quran.com). Voice recitation matching runs solely when explicitly started by you and honors standard browser microphone permissions."
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-2xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-white dark:bg-[#111C17] p-5 sm:p-6 space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-base font-semibold text-[#142019] dark:text-[#F1F5F3]",
							children: isAr ? "٥. المطوّر ومعلومات التواصل" : "5. Developer Attribution & Contact"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-sm text-[#5A6B62] dark:text-[#A1A1AA] space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-semibold text-[#142019] dark:text-[#F1F5F3]",
								children: isAr ? "تصميم وتطوير: عبد الصمد النكاز (Abdessamad Enneguaz)" : "Crafted & Developed by Abdessamad Enneguaz (عبد الصمد النكاز)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-[#5A6B62] dark:text-[#92A59B]",
								children: "© 2026 Mihrab Noor (مِحْرَاب النُّور). Crafted & Developed by Abdessamad Enneguaz · تطوير وتصميم: عبد الصمد"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: "mailto:enneguazabdo259@gmail.com",
							className: "inline-flex items-center gap-2 rounded-xl bg-[#27784C] dark:bg-[#52B77F] hover:opacity-90 px-5 py-2.5 text-xs font-semibold text-white dark:text-[#0A110E] transition-opacity",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, {
								className: "h-3.5 w-3.5",
								strokeWidth: 1.5
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "enneguazabdo259@gmail.com" })]
						})
					]
				})
			]
		})]
	});
};
export { PrivacyPage };
