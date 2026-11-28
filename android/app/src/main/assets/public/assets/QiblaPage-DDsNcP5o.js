import { a as __toESM, n as createLucideIcon, r as require_react, t as require_jsx_runtime } from "./jsx-runtime-C_MSr2-h.js";
import { C as saveStoredPrayerMethod, Ct as Clock, S as saveSelectedCity, St as Compass, _ as QIBLA_CITIES, _t as LocateFixed, b as loadActiveLocation, c as KaabaIconSvg, g as LOCATION_UPDATED_EVENT, h as fetchOfficialPrayerEntries, m as computeDailyPrayerSchedule, p as PRAYER_METHODS, tt as toArabicDigits, v as computeQiblaBearing, x as saveGpsLocation, y as getRotationGuidance } from "./index-DwzdC1FZ.js";
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var RotateCw = createLucideIcon("rotate-cw", [["path", {
	d: "M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8",
	key: "1p45f6"
}], ["path", {
	d: "M21 3v5h-5",
	key: "1q7to0"
}]]);
// src/components/QiblaPage.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var DEGREE_TICKS = Array.from({ length: 72 }, (_, idx) => idx * 5);
var QiblaPage = ({ lang, t }) => {
	const [activeLoc, setActiveLoc] = (0, import_react.useState)(() => loadActiveLocation());
	const [officialEntries, setOfficialEntries] = (0, import_react.useState)(null);
	const [deviceHeading, setDeviceHeading] = (0, import_react.useState)(0);
	const [sensorActive, setSensorActive] = (0, import_react.useState)(false);
	const [gpsStatus, setGpsStatus] = (0, import_react.useState)(() => activeLoc.mode === "gps" ? "active" : "idle");
	(0, import_react.useEffect)(() => {
		const syncLoc = () => setActiveLoc(loadActiveLocation());
		window.addEventListener(LOCATION_UPDATED_EVENT, syncLoc);
		return () => window.removeEventListener(LOCATION_UPDATED_EVENT, syncLoc);
	}, []);
	(0, import_react.useEffect)(() => {
		let active = true;
		setOfficialEntries(null);
		fetchOfficialPrayerEntries(/* @__PURE__ */ new Date(), activeLoc.lat, activeLoc.lng, activeLoc.method, activeLoc.ianaTz).then((entries) => {
			if (active && entries) setOfficialEntries(entries);
		});
		return () => {
			active = false;
		};
	}, [
		activeLoc.lat,
		activeLoc.lng,
		activeLoc.method,
		activeLoc.ianaTz
	]);
	const prayerSchedule = (0, import_react.useMemo)(() => computeDailyPrayerSchedule(/* @__PURE__ */ new Date(), activeLoc.lat, activeLoc.lng, activeLoc.tzOffsetHours, {
		method: activeLoc.method,
		officialEntries
	}), [activeLoc, officialEntries]);
	const qiblaBearing = (0, import_react.useMemo)(() => computeQiblaBearing(activeLoc.lat, activeLoc.lng), [activeLoc.lat, activeLoc.lng]);
	const guidance = (0, import_react.useMemo)(() => getRotationGuidance(qiblaBearing, deviceHeading), [qiblaBearing, deviceHeading]);
	const handleSelectCity = (cityId) => {
		setActiveLoc(saveSelectedCity(cityId));
		setGpsStatus("idle");
	};
	const handleSelectMethod = (method) => {
		saveStoredPrayerMethod(method);
		setActiveLoc(loadActiveLocation());
	};
	const handleUseGps = (0, import_react.useCallback)(() => {
		if (typeof navigator === "undefined" || !navigator.geolocation) {
			setGpsStatus("denied");
			return;
		}
		setGpsStatus("loading");
		navigator.geolocation.getCurrentPosition((pos) => {
			setActiveLoc(saveGpsLocation(pos.coords.latitude, pos.coords.longitude));
			setGpsStatus("active");
		}, () => {
			setGpsStatus("denied");
		}, {
			enableHighAccuracy: true,
			timeout: 7e3
		});
	}, []);
	(0, import_react.useEffect)(() => {
		if (typeof window === "undefined") return;
		const onOrientation = (ev) => {
			const anyEv = ev;
			let heading = null;
			if (typeof anyEv.webkitCompassHeading === "number" && !Number.isNaN(anyEv.webkitCompassHeading)) heading = anyEv.webkitCompassHeading;
			else if (typeof ev.alpha === "number" && !Number.isNaN(ev.alpha)) heading = (360 - ev.alpha) % 360;
			if (heading !== null) {
				setSensorActive(true);
				setDeviceHeading(Math.round((heading % 360 + 360) % 360));
			}
		};
		window.addEventListener("deviceorientation", onOrientation, true);
		return () => {
			window.removeEventListener("deviceorientation", onOrientation, true);
		};
	}, []);
	const requestCompassPermission = async () => {
		const DevOrient = window.DeviceOrientationEvent;
		if (typeof DevOrient?.requestPermission === "function") try {
			if (await DevOrient.requestPermission() === "granted") setSensorActive(true);
		} catch {}
	};
	const dialRotation = -deviceHeading;
	const kaabaAngleFromDeviceForward = guidance.delta;
	const numFmt = (n) => lang === "ar" ? toArabicDigits(n) : String(n);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl px-4 sm:px-6 pt-5 sm:pt-8 pb-8 space-y-4 sm:space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-center space-y-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl sm:text-2xl font-semibold tracking-tight text-[#142019] dark:text-[#F1F5F3]",
					children: t.qiblaTitle
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs sm:text-sm text-[#5A6B62] dark:text-[#92A59B] tabular-nums",
					children: [
						lang === "ar" ? activeLoc.nameAr : activeLoc.nameEn,
						" ·",
						" ",
						activeLoc.lat.toFixed(2),
						"°, ",
						activeLoc.lng.toFixed(2),
						"°"
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-white dark:bg-[#111C17] p-3 sm:p-4 space-y-2.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 flex-1 min-w-[165px]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							htmlFor: "qibla-city-select",
							className: "text-xs font-medium text-[#5A6B62] dark:text-[#92A59B] whitespace-nowrap shrink-0",
							children: [t.selectCityLabel, ":"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							id: "qibla-city-select",
							"data-testid": "qibla-city-select",
							value: activeLoc.cityId,
							onChange: (e) => handleSelectCity(e.target.value),
							className: "min-w-0 flex-1 rounded-xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-[#F4F7F5] dark:bg-[#0A110E] px-2.5 py-2 text-xs sm:text-sm font-medium text-[#142019] dark:text-[#F1F5F3] truncate focus:outline-none focus:ring-1 focus:ring-[#27784C] dark:focus:ring-[#52B77F]",
							children: QIBLA_CITIES.map((city) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: city.id,
								children: lang === "ar" ? city.nameAr : city.nameEn
							}, city.id))
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: handleUseGps,
						"data-testid": "qibla-gps-btn",
						className: "shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-[#F4F7F5] dark:bg-[#15241D] border border-[#E2EAE5] dark:border-[#1E2E26] px-3 py-2 text-xs font-semibold text-[#27784C] dark:text-[#52B77F] hover:border-[#27784C]/40 dark:hover:border-[#52B77F]/40 transition-colors whitespace-nowrap",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocateFixed, {
							className: "h-3.5 w-3.5",
							strokeWidth: 1.5
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: gpsStatus === "loading" ? lang === "ar" ? "جارٍ التحديد..." : "Locating..." : gpsStatus === "active" ? lang === "ar" ? "GPS مفعّل" : "GPS Active" : t.useGpsBtn })]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 pt-1 border-t border-[#E2EAE5]/70 dark:border-[#1E2E26]/70",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						htmlFor: "prayer-method-select",
						className: "text-xs font-medium text-[#5A6B62] dark:text-[#92A59B] whitespace-nowrap shrink-0",
						children: lang === "ar" ? "طريقة الحساب:" : "Method:"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						id: "prayer-method-select",
						"data-testid": "prayer-method-select",
						value: activeLoc.method,
						onChange: (e) => handleSelectMethod(e.target.value),
						className: "min-w-0 flex-1 rounded-xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-[#F4F7F5] dark:bg-[#0A110E] px-2.5 py-1.5 text-xs font-medium text-[#142019] dark:text-[#F1F5F3] truncate focus:outline-none focus:ring-1 focus:ring-[#27784C] dark:focus:ring-[#52B77F]",
						children: Object.values(PRAYER_METHODS).map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: m.id,
							children: lang === "ar" ? m.nameAr : m.nameEn
						}, m.id))
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				"aria-label": t.prayerTimesTitle,
				"data-testid": "qibla-prayer-schedule",
				className: "rounded-2xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-white dark:bg-[#111C17] p-4 space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#142019] dark:text-[#F1F5F3]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, {
							className: "h-4 w-4 text-[#27784C] dark:text-[#52B77F]",
							strokeWidth: 1.75
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t.prayerTimesTitle })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[11px] font-semibold text-[#27784C] dark:text-[#52B77F]",
						children: prayerSchedule.source === "official-api" ? lang === "ar" ? "توقيت رسمي مطابق" : "Official Synced" : lang === "ar" ? "حساب فلكي دقيق" : "Precision Calculation"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-5 gap-1.5 sm:gap-2.5",
					children: prayerSchedule.entries.map((entry) => {
						const isNext = entry.id === prayerSchedule.nextPrayer.id;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: `rounded-xl p-2 sm:p-3 text-center border transition-colors ${isNext ? "emerald-3d-hero text-white border-transparent" : "bg-[#F4F7F5] dark:bg-[#0A110E] border-[#E2EAE5] dark:border-[#1E2E26] text-[#142019] dark:text-[#F1F5F3]"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: `text-[10.5px] sm:text-xs font-medium ${isNext ? "text-white/90" : "text-[#5A6B62] dark:text-[#92A59B]"}`,
								children: lang === "ar" ? entry.nameAr : entry.nameEn
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs sm:text-sm font-bold tabular-nums mt-0.5",
								children: entry.formatted24
							})]
						}, entry.id);
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-2xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-white dark:bg-[#111C17] p-5 sm:p-8 flex flex-col items-center space-y-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-col items-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: `w-0.5 h-3 rounded-full transition-colors ${guidance.isAligned ? "bg-[#27784C] dark:bg-[#52B77F]" : "bg-[#142019]/40 dark:bg-white/40"}`,
							"aria-hidden": "true"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						"data-testid": "qibla-compass-dial",
						className: "relative h-60 w-60 sm:h-72 sm:w-72 flex items-center justify-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: `relative h-full w-full rounded-full bg-[#F4F7F5] dark:bg-[#0A110E] border transition-colors duration-300 ${guidance.isAligned ? "border-[#27784C] dark:border-[#52B77F] ring-4 ring-[#27784C]/12 dark:ring-[#52B77F]/18" : "border-[#E2EAE5] dark:border-[#1E2E26]"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "absolute inset-0 transition-transform duration-200 ease-out",
								style: { transform: `rotate(${dialRotation}deg)` },
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
										viewBox: "0 0 240 240",
										className: "absolute inset-0 h-full w-full",
										"aria-hidden": "true",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
											cx: "120",
											cy: "120",
											r: "108",
											fill: "none",
											stroke: "currentColor",
											strokeOpacity: "0.08",
											strokeWidth: "1",
											className: "text-[#142019] dark:text-white"
										}), DEGREE_TICKS.map((deg) => {
											const isMajor = deg % 30 === 0;
											return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
												x1: "120",
												y1: isMajor ? "10" : "13",
												x2: "120",
												y2: isMajor ? "19" : "17",
												stroke: "currentColor",
												strokeOpacity: isMajor ? "0.45" : "0.18",
												strokeWidth: isMajor ? "1.3" : "0.8",
												strokeLinecap: "round",
												transform: `rotate(${deg} 120 120)`,
												className: deg === 0 ? "text-[#27784C] dark:text-[#52B77F]" : "text-[#142019] dark:text-[#F1F5F3]"
											}, deg);
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "absolute top-6 left-1/2 -translate-x-1/2 text-xs font-semibold tracking-wider text-[#27784C] dark:text-[#52B77F]",
										children: "N"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "absolute bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium tracking-wider text-[#5A6B62] dark:text-[#92A59B]",
										children: "S"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "absolute right-6 top-1/2 -translate-y-1/2 text-xs font-medium tracking-wider text-[#5A6B62] dark:text-[#92A59B]",
										children: "E"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "absolute left-6 top-1/2 -translate-y-1/2 text-xs font-medium tracking-wider text-[#5A6B62] dark:text-[#92A59B]",
										children: "W"
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "absolute inset-0 transition-transform duration-200 ease-out",
								style: { transform: `rotate(${kaabaAngleFromDeviceForward}deg)` },
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "absolute -top-3.5 left-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-white dark:bg-[#111C17] border border-[#27784C]/40 dark:border-[#52B77F]/45 shadow-sm flex items-center justify-center text-[#27784C] dark:text-[#52B77F]",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KaabaIconSvg, { className: "h-4 w-4" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
									viewBox: "0 0 80 200",
									className: "h-full w-full p-12",
									"aria-hidden": "true",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
											d: "M40 16 L46 96 L34 96 Z",
											className: "fill-[#27784C] dark:fill-[#52B77F]"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
											d: "M36 104 L44 104 L40 132 Z",
											className: "fill-[#142019]/20 dark:fill-white/25"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
											cx: "40",
											cy: "100",
											r: "6.5",
											className: "fill-white dark:fill-[#111C17] stroke-[#27784C] dark:stroke-[#52B77F]",
											strokeWidth: "2.5"
										})
									]
								})]
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "w-full max-w-xs rounded-xl bg-[#F4F7F5] dark:bg-[#0A110E] border border-[#E2EAE5] dark:border-[#1E2E26] px-5 py-3.5 text-center space-y-0.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							"data-testid": "qibla-angle-readout",
							className: "text-2xl sm:text-3xl font-semibold text-[#142019] dark:text-[#F1F5F3] tabular-nums",
							children: [numFmt(qiblaBearing), "°"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium text-[#5A6B62] dark:text-[#92A59B]",
							children: t.qiblaAngleLabel
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						"data-testid": "qibla-guidance-pill",
						className: `rounded-xl px-5 py-2 text-xs sm:text-sm font-semibold tabular-nums transition-colors ${guidance.isAligned ? "bg-[#27784C] dark:bg-[#52B77F] text-white dark:text-[#0A110E]" : "bg-[#F4F7F5] dark:bg-[#15241D] text-[#27784C] dark:text-[#52B77F] border border-[#E2EAE5] dark:border-[#1E2E26]"}`,
						children: lang === "ar" ? guidance.labelAr : guidance.labelEn
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "w-full max-w-sm pt-3 border-t border-[#E2EAE5] dark:border-[#1E2E26] space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between text-xs text-[#5A6B62] dark:text-[#92A59B] tabular-nums",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "inline-flex items-center gap-1.5 font-medium",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Compass, {
									className: "h-3.5 w-3.5 text-[#27784C] dark:text-[#52B77F]",
									strokeWidth: 1.5
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t.compassCalibrationHint })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "font-semibold text-[#142019] dark:text-[#F1F5F3]",
								children: [numFmt(deviceHeading), "°"]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "range",
								min: 0,
								max: 359,
								value: deviceHeading,
								onChange: (e) => setDeviceHeading(Number(e.target.value)),
								"aria-label": t.compassCalibrationHint,
								className: "flex-1 accent-[#27784C] dark:accent-[#52B77F] cursor-pointer"
							}), !sensorActive && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => void requestCompassPermission(),
								"aria-label": "Enable compass sensors",
								className: "p-2 rounded-xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-[#F4F7F5] dark:bg-[#15241D] text-[#27784C] dark:text-[#52B77F]",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCw, {
									className: "h-3.5 w-3.5",
									strokeWidth: 1.5
								})
							})]
						})]
					})
				]
			})
		]
	});
};
export { QiblaPage };
