import { a as __toESM, r as require_react, t as require_jsx_runtime } from "./jsx-runtime-C_MSr2-h.js";
import { t as CircleCheck } from "./circle-check-BpkttCqY.js";
import { t as ChevronLeft } from "./chevron-left-fK3TiImw.js";
import { H as saveAdhkarProgress, R as getLocalDateISO, V as loadAdhkarProgress, Z as toArabicDigits, bt as ChevronRight, ft as MoonStar, ot as RotateCcw } from "./index-rBLSx_gx.js";
import { t as Sparkles } from "./sparkles-B8fhnMj3.js";
// src/data/adhkarData.ts
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
function getDefaultAdhkarPeriod(hour = (/* @__PURE__ */ new Date()).getHours()) {
	if (hour >= 4 && hour < 14) return "sabah";
	return "masaa";
}
var ADHKAR_ITEMS = [
	{
		id: "sabah-kursi",
		category: "sabah",
		titleAr: "آية الكرسي",
		titleEn: "Ayat al-Kursi",
		arabic: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ",
		transliteration: "Allahu la ilaha illa Huwal-Hayyul-Qayyum. La ta’khudhuhu sinatun wa la nawm...",
		translation: "Allah — there is no deity except Him, the Ever-Living, the Sustainer of existence. Neither drowsiness overtakes Him nor sleep...",
		virtueAr: "حرز من الشيطان حتى يمسي",
		virtueEn: "Protection throughout the day until evening.",
		targetCount: 1
	},
	{
		id: "sabah-muawwidhat",
		category: "sabah",
		titleAr: "المعوذات (الإخلاص والفلق والناس)",
		titleEn: "The Three Quls (Al-Ikhlas, Al-Falaq, An-Nas)",
		arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ ۝\nقُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ ... قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ ...",
		transliteration: "Qul Huwa Allahu Ahad... Qul a’udhu bi-Rabbil-Falaq... Qul a’udhu bi-Rabbin-Nas...",
		translation: "Recite Surah Al-Ikhlas, Surah Al-Falaq, and Surah An-Nas three times each morning.",
		virtueAr: "تكفيك من كل شيء",
		virtueEn: "Sufficient for protection against every harm.",
		targetCount: 3
	},
	{
		id: "sabah-mulk",
		category: "sabah",
		titleAr: "أصبحنا وأصبح الملك لله",
		titleEn: "Morning Praise & Seeking Goodness",
		arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَٰذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَٰذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ.",
		transliteration: "Asbahna wa asbahal-mulku lillah, wal-hamdu lillah, la ilaha illallahu wahdahu la sharika lah...",
		translation: "We have reached the morning and all sovereignty belongs to Allah. My Lord, I ask You for the good of this day and what follows it.",
		virtueAr: "ذكر الصباح الجامع",
		virtueEn: "Comprehensive morning supplication for blessing and refuge.",
		targetCount: 1
	},
	{
		id: "sabah-sayyid-istighfar",
		category: "sabah",
		titleAr: "سيد الاستغفار",
		titleEn: "Sayyid al-Istighfar (Master Supplication for Forgiveness)",
		arabic: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَىٰ عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ.",
		transliteration: "Allahumma Anta Rabbi la ilaha illa Anta, khalaqtani wa ana ‘abduka...",
		translation: "O Allah, You are my Lord, none has the right to be worshipped except You. You created me and I am Your servant... forgive me, for none forgives sins except You.",
		virtueAr: "من قالها موقناً بها فمات من يومه دخل الجنة",
		virtueEn: "Whoever recites it with conviction in the morning enters Paradise if they pass that day.",
		targetCount: 1
	},
	{
		id: "sabah-bismillah",
		category: "sabah",
		titleAr: "بسم الله الذي لا يضر مع اسمه شيء",
		titleEn: "In the Name of Allah Nothing Can Harm",
		arabic: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ.",
		transliteration: "Bismillahil-ladhi la yadurru ma’as-mihi shay’un fil-ardi wa la fis-sama’i wa Huwas-Sami’ul-‘Alim.",
		translation: "In the Name of Allah, with whose Name nothing on earth or in the heavens can cause harm, and He is the All-Hearing, All-Knowing.",
		virtueAr: "لم يضره شيء بإذن الله",
		virtueEn: "Nothing will harm the reciter throughout the day.",
		targetCount: 3
	},
	{
		id: "sabah-raditu",
		category: "sabah",
		titleAr: "رضيت بالله رباً",
		titleEn: "Contentment with Allah, Islam & Muhammad ﷺ",
		arabic: "رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا.",
		transliteration: "Raditu billahi Rabban, wa bil-Islami dinan, wa bi-Muhammadin (ﷺ) nabiyyan.",
		translation: "I am pleased with Allah as my Lord, with Islam as my religion, and with Muhammad ﷺ as my Prophet.",
		virtueAr: "كان حقاً على الله أن يرضيه يوم القيامة",
		virtueEn: "Allah promises to please the one who recites it three times.",
		targetCount: 3
	},
	{
		id: "sabah-hasbiyallah",
		category: "sabah",
		titleAr: "حسبي الله لا إله إلا هو",
		titleEn: "Allah is Sufficient for Me",
		arabic: "حَسْبِيَ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ ۖ عَلَيْهِ تَوَكَّلْتُ ۖ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ.",
		transliteration: "Hasbiyallahu la ilaha illa Huwa, ‘alayhi tawakkaltu, wa Huwa Rabbul-‘Arshil-‘Azim.",
		translation: "Allah is sufficient for me; there is no deity except Him. On Him I have relied, and He is the Lord of the Great Throne.",
		virtueAr: "كفاه الله ما أهمه من أمر الدنيا والآخرة",
		virtueEn: "Allah suffices the reciter against whatever worries them.",
		targetCount: 7
	},
	{
		id: "sabah-subhanallah",
		category: "sabah",
		titleAr: "سبحان الله وبحمده",
		titleEn: "Glory & Praise Be to Allah",
		arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ.",
		transliteration: "SubhanAllahi wa bihamdihi.",
		translation: "Glory be to Allah and praise be to Him.",
		virtueAr: "حُطَّت خطاياه وإن كانت مثل زبد البحر",
		virtueEn: "Reciting 100 times erases sins even if like the foam of the sea.",
		targetCount: 100
	},
	{
		id: "masaa-kursi",
		category: "masaa",
		titleAr: "آية الكرسي",
		titleEn: "Ayat al-Kursi",
		arabic: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ",
		transliteration: "Allahu la ilaha illa Huwal-Hayyul-Qayyum. La ta’khudhuhu sinatun wa la nawm...",
		translation: "Allah — there is no deity except Him, the Ever-Living, the Sustainer of existence...",
		virtueAr: "حرز من الشيطان حتى يصبح",
		virtueEn: "Guarded by Allah through the entire night.",
		targetCount: 1
	},
	{
		id: "masaa-muawwidhat",
		category: "masaa",
		titleAr: "المعوذات (الإخلاص والفلق والناس)",
		titleEn: "The Three Quls (Al-Ikhlas, Al-Falaq, An-Nas)",
		arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ ۝\nقُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ ... قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ ...",
		transliteration: "Qul Huwa Allahu Ahad... Qul a’udhu bi-Rabbil-Falaq... Qul a’udhu bi-Rabbin-Nas...",
		translation: "Recite Surah Al-Ikhlas, Surah Al-Falaq, and Surah An-Nas three times each evening.",
		virtueAr: "تكفيك من كل شيء",
		virtueEn: "Sufficient for protection against every evil at night.",
		targetCount: 3
	},
	{
		id: "masaa-mulk",
		category: "masaa",
		titleAr: "أمسينا وأمسى الملك لله",
		titleEn: "Evening Praise & Seeking Goodness",
		arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَٰذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَٰذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا.",
		transliteration: "Amsayna wa amsal-mulku lillah, wal-hamdu lillah, la ilaha illallahu wahdahu la sharika lah...",
		translation: "We have reached the evening and all sovereignty belongs to Allah. My Lord, I ask You for the good of this night and what follows it.",
		virtueAr: "ذكر المساء الجامع",
		virtueEn: "Comprehensive evening supplication for tranquility and protection.",
		targetCount: 1
	},
	{
		id: "masaa-sayyid-istighfar",
		category: "masaa",
		titleAr: "سيد الاستغفار",
		titleEn: "Sayyid al-Istighfar",
		arabic: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَىٰ عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ.",
		transliteration: "Allahumma Anta Rabbi la ilaha illa Anta, khalaqtani wa ana ‘abduka...",
		translation: "O Allah, You are my Lord, none has the right to be worshipped except You... forgive me, for none forgives sins except You.",
		virtueAr: "من قالها موقناً بها حين يمسي فمات من ليلته دخل الجنة",
		virtueEn: "Recited with conviction at evening brings immense mercy.",
		targetCount: 1
	},
	{
		id: "masaa-kalimat",
		category: "masaa",
		titleAr: "أعوذ بكلمات الله التامات",
		titleEn: "Refuge in Allah’s Perfect Words",
		arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ.",
		transliteration: "A’udhu bi-kalimatillahit-tammati min sharri ma khalaq.",
		translation: "I seek refuge in the perfect words of Allah from the evil of what He has created.",
		virtueAr: "تقي من كل أذى في المساء",
		virtueEn: "Protection throughout the night from all harm.",
		targetCount: 3
	},
	{
		id: "masaa-bismillah",
		category: "masaa",
		titleAr: "بسم الله الذي لا يضر مع اسمه شيء",
		titleEn: "In the Name of Allah Nothing Can Harm",
		arabic: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ.",
		transliteration: "Bismillahil-ladhi la yadurru ma’as-mihi shay’un fil-ardi wa la fis-sama’i wa Huwas-Sami’ul-‘Alim.",
		translation: "In the Name of Allah, with whose Name nothing on earth or in the heavens can cause harm.",
		virtueAr: "حفظٌ تامٌ طوال الليل",
		virtueEn: "Complete safeguard throughout the night.",
		targetCount: 3
	},
	{
		id: "masaa-salawat",
		category: "masaa",
		titleAr: "الصلاة على النبي ﷺ",
		titleEn: "Sending Peace & Blessings Upon the Prophet ﷺ",
		arabic: "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ.",
		transliteration: "Allahumma salli wa sallim ‘ala Nabiyyina Muhammad.",
		translation: "O Allah, send peace and blessings upon our Prophet Muhammad ﷺ.",
		virtueAr: "أدركته شفاعتي يوم القيامة",
		virtueEn: "Tenfold blessings from Allah and intercession on the Day of Judgment.",
		targetCount: 10
	},
	{
		id: "prayer-istighfar",
		category: "postPrayer",
		titleAr: "الاستغفار بعد السلام",
		titleEn: "Seeking Forgiveness & Peace",
		arabic: "أَسْتَغْفِرُ اللَّهَ (ثلاثاً) · اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ.",
		transliteration: "Astaghfirullah (3x). Allahumma Antas-Salam wa minkas-salam, tabarakta ya Dhal-Jalali wal-Ikram.",
		translation: "I seek the forgiveness of Allah. O Allah, You are Peace and from You comes peace. Blessed are You, O Possessor of Majesty and Honor.",
		virtueAr: "سُنة النبي ﷺ فور التسليم من كل صلاة مكتوبة",
		virtueEn: "Sunnah immediately following the Salam of every obligatory prayer.",
		targetCount: 3
	},
	{
		id: "prayer-subhanallah",
		category: "postPrayer",
		titleAr: "التسبيح: سبحان الله",
		titleEn: "SubhanAllah (Glory Be to Allah)",
		arabic: "سُبْحَانَ اللَّهِ.",
		transliteration: "SubhanAllah.",
		translation: "Glory be to Allah.",
		virtueAr: "٣٣ مرة بعد كل صلاة",
		virtueEn: "33 times after each obligatory prayer.",
		targetCount: 33
	},
	{
		id: "prayer-alhamdulillah",
		category: "postPrayer",
		titleAr: "التحميد: الحمد لله",
		titleEn: "Alhamdulillah (All Praise Be to Allah)",
		arabic: "الْحَمْدُ لِلَّهِ.",
		transliteration: "Alhamdulillah.",
		translation: "All praise is due to Allah.",
		virtueAr: "٣٣ مرة بعد كل صلاة",
		virtueEn: "33 times after each obligatory prayer.",
		targetCount: 33
	},
	{
		id: "prayer-allahuakbar",
		category: "postPrayer",
		titleAr: "التكبير: الله أكبر",
		titleEn: "Allahu Akbar (Allah is the Greatest)",
		arabic: "اللَّهُ أَكْبَرُ.",
		transliteration: "Allahu Akbar.",
		translation: "Allah is the Greatest.",
		virtueAr: "٣٣ مرة بعد كل صلاة",
		virtueEn: "33 times after each obligatory prayer.",
		targetCount: 33
	},
	{
		id: "prayer-khatm",
		category: "postPrayer",
		titleAr: "ختام المئة",
		titleEn: "Completing the Hundred",
		arabic: "لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ.",
		transliteration: "La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamdu wa Huwa ‘ala kulli shay’in Qadir.",
		translation: "There is no deity except Allah alone, without partner. To Him belongs dominion and praise, and He is over all things competent.",
		virtueAr: "غُفرت خطاياه وإن كانت مثل زبد البحر",
		virtueEn: "Completes 100 after the 33x praises for full forgiveness.",
		targetCount: 1
	}
];
// src/components/AdhkarPage.tsx
var import_jsx_runtime = require_jsx_runtime();
var AdhkarPage = ({ lang, t }) => {
	const [category, setCategory] = (0, import_react.useState)(() => getDefaultAdhkarPeriod());
	const [counts, setCounts] = (0, import_react.useState)({});
	const [activeIdx, setActiveIdx] = (0, import_react.useState)(0);
	const advanceTimerRef = (0, import_react.useRef)(null);
	const dateISO = getLocalDateISO();
	(0, import_react.useEffect)(() => {
		loadAdhkarProgress(dateISO).then((saved) => {
			setCounts(saved);
		});
	}, [dateISO]);
	(0, import_react.useEffect)(() => {
		return () => {
			if (advanceTimerRef.current !== null) window.clearTimeout(advanceTimerRef.current);
		};
	}, []);
	const items = (0, import_react.useMemo)(() => ADHKAR_ITEMS.filter((item) => item.category === category), [category]);
	const safeIdx = Math.min(activeIdx, Math.max(0, items.length - 1));
	const currentItem = items[safeIdx];
	const completedInCategory = (0, import_react.useMemo)(() => items.filter((item) => (counts[item.id] || 0) >= item.targetCount).length, [items, counts]);
	if (!currentItem) return null;
	const numFmt = (n) => lang === "ar" ? toArabicDigits(n) : String(n);
	const currentCount = counts[currentItem.id] || 0;
	const isDone = currentCount >= currentItem.targetCount;
	const progressRatio = Math.min(1, currentCount / Math.max(1, currentItem.targetCount));
	const ringRadius = 38;
	const ringCirc = 2 * Math.PI * ringRadius;
	const ringOffset = ringCirc * (1 - progressRatio);
	const handleCategorySwitch = (nextCat) => {
		if (advanceTimerRef.current !== null) {
			window.clearTimeout(advanceTimerRef.current);
			advanceTimerRef.current = null;
		}
		setCategory(nextCat);
		const firstPending = ADHKAR_ITEMS.filter((i) => i.category === nextCat).findIndex((i) => (counts[i.id] || 0) < i.targetCount);
		setActiveIdx(firstPending >= 0 ? firstPending : 0);
	};
	const handleTapDhikr = () => {
		if (isDone) {
			if (safeIdx < items.length - 1) setActiveIdx(safeIdx + 1);
			return;
		}
		const nextCount = Math.min(currentItem.targetCount, currentCount + 1);
		const nextCounts = {
			...counts,
			[currentItem.id]: nextCount
		};
		setCounts(nextCounts);
		saveAdhkarProgress(dateISO, nextCounts);
		if (typeof navigator !== "undefined" && navigator.vibrate) try {
			navigator.vibrate(nextCount >= currentItem.targetCount ? [
				18,
				30,
				18
			] : 14);
		} catch {}
		if (nextCount >= currentItem.targetCount && safeIdx < items.length - 1) {
			if (advanceTimerRef.current !== null) window.clearTimeout(advanceTimerRef.current);
			advanceTimerRef.current = window.setTimeout(() => {
				setActiveIdx((prev) => Math.min(items.length - 1, prev + 1));
			}, 280);
		}
	};
	const handleResetCategory = () => {
		const nextCounts = { ...counts };
		for (const item of items) delete nextCounts[item.id];
		setCounts(nextCounts);
		saveAdhkarProgress(dateISO, nextCounts);
		setActiveIdx(0);
	};
	const categories = [
		{
			id: "sabah",
			label: t.adhkarSabah
		},
		{
			id: "masaa",
			label: t.adhkarMasaa
		},
		{
			id: "postPrayer",
			label: t.adhkarPostPrayer
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-6xl px-4 sm:px-6 pt-6 sm:pt-8 pb-8 space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2EAE5] dark:border-[#1E2E26] pb-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-11 w-11 rounded-xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-white dark:bg-[#111C17] text-[#27784C] dark:text-[#52B77F] flex items-center justify-center shrink-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoonStar, {
						className: "h-5 w-5",
						strokeWidth: 1.5
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl sm:text-2xl font-semibold text-[#142019] dark:text-[#F1F5F3]",
					children: t.adhkarTitle
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs sm:text-sm text-[#5A6B62] dark:text-[#92A59B] tabular-nums",
					children: [
						numFmt(completedInCategory),
						" / ",
						numFmt(items.length),
						" ",
						t.completedWord,
						" ·",
						" ",
						t.tapToCountHint
					]
				})] })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-3 gap-1 p-1 rounded-xl bg-[#EAF1EC] dark:bg-[#15241D] border border-[#E2EAE5] dark:border-[#1E2E26]",
					children: categories.map((cat) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => handleCategorySwitch(cat.id),
						className: `py-1.5 px-3.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${category === cat.id ? "bg-[#27784C] dark:bg-[#52B77F] text-white dark:text-[#0A110E]" : "text-[#5A6B62] dark:text-[#92A59B] hover:text-[#142019] dark:hover:text-[#F1F5F3]"}`,
						children: cat.label
					}, cat.id))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: handleResetCategory,
					title: t.resetAdhkarBtn,
					"aria-label": t.resetAdhkarBtn,
					className: "min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-white dark:bg-[#111C17] text-[#5A6B62] dark:text-[#92A59B] hover:text-[#27784C] dark:hover:text-[#52B77F] transition-colors",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, {
						className: "h-4 w-4",
						strokeWidth: 1.5
					})
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-1 lg:grid-cols-12 gap-5 items-start",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "lg:col-span-8 space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					"data-testid": "adhkar-tap-card",
					onClick: handleTapDhikr,
					className: `w-full text-start rounded-2xl border p-5 sm:p-8 transition-colors active:scale-[0.99] space-y-6 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#27784C] dark:focus-visible:ring-[#52B77F] ${isDone ? "border-[#27784C]/40 dark:border-[#52B77F]/45 bg-[#27784C]/5 dark:bg-[#52B77F]/10" : "border-[#E2EAE5] dark:border-[#1E2E26] bg-white dark:bg-[#111C17] hover:border-[#27784C]/35 dark:hover:border-[#52B77F]/35"}`,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-2 text-xs font-semibold text-[#27784C] dark:text-[#52B77F] tabular-nums",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: lang === "ar" ? currentItem.titleAr : currentItem.titleEn }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								numFmt(safeIdx + 1),
								" / ",
								numFmt(items.length)
							] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							dir: "rtl",
							className: "font-quran-amiri text-2xl sm:text-[32px] leading-[2.25] tracking-normal text-[#142019] dark:text-[#F1F5F3] text-right whitespace-pre-line",
							children: currentItem.arabic
						}),
						lang !== "ar" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5 border-t border-[#E2EAE5] dark:border-[#1E2E26] pt-3.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs italic text-[#27784C] dark:text-[#52B77F]",
								children: currentItem.transliteration
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs sm:text-sm leading-relaxed text-[#5A6B62] dark:text-[#A1A1AA]",
								children: currentItem.translation
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-4 pt-4 border-t border-[#E2EAE5] dark:border-[#1E2E26]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-xs sm:text-sm text-[#5A6B62] dark:text-[#92A59B] space-y-1 min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-semibold text-[#27784C] dark:text-[#52B77F]",
									children: lang === "ar" ? currentItem.virtueAr : currentItem.virtueEn
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: isDone ? t.dhikrCompletedHint : t.tapToCountHint })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative h-24 w-24 shrink-0 flex items-center justify-center",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
									viewBox: "0 0 96 96",
									className: "h-24 w-24 -rotate-90",
									"aria-hidden": "true",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
										cx: "48",
										cy: "48",
										r: ringRadius,
										fill: "none",
										stroke: "currentColor",
										strokeWidth: "5",
										className: "text-[#E2EAE5] dark:text-[#1E2E26]"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
										cx: "48",
										cy: "48",
										r: ringRadius,
										fill: "none",
										stroke: "currentColor",
										strokeWidth: "5",
										strokeLinecap: "round",
										strokeDasharray: ringCirc,
										strokeDashoffset: ringOffset,
										className: "transition-all duration-200 text-[#27784C] dark:text-[#52B77F]"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-testid": "adhkar-counter-value",
									className: "absolute inset-0 flex flex-col items-center justify-center tabular-nums",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-lg font-semibold text-[#142019] dark:text-[#F1F5F3]",
										children: numFmt(currentCount)
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-[11px] text-[#5A6B62] dark:text-[#92A59B]",
										children: ["/ ", numFmt(currentItem.targetCount)]
									})]
								})]
							})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					dir: "ltr",
					className: "flex items-center justify-between gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							disabled: safeIdx === 0,
							onClick: () => setActiveIdx((i) => Math.max(0, i - 1)),
							className: "inline-flex items-center gap-1 rounded-xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-white dark:bg-[#111C17] px-4 py-2 text-xs sm:text-sm font-semibold text-[#142019] dark:text-[#F1F5F3] disabled:opacity-35",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, {
								className: "h-4 w-4",
								strokeWidth: 1.5
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t.prevWord })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1.5 text-xs font-medium text-[#5A6B62] dark:text-[#92A59B] tabular-nums",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
								className: "h-3.5 w-3.5 text-[#27784C] dark:text-[#52B77F]",
								strokeWidth: 1.5
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: completedInCategory === items.length ? t.allAdhkarDone : `${numFmt(completedInCategory)} / ${numFmt(items.length)}` })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							disabled: safeIdx >= items.length - 1,
							onClick: () => setActiveIdx((i) => Math.min(items.length - 1, i + 1)),
							className: "inline-flex items-center gap-1 rounded-xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-white dark:bg-[#111C17] px-4 py-2 text-xs sm:text-sm font-semibold text-[#142019] dark:text-[#F1F5F3] disabled:opacity-35",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t.nextWord }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, {
								className: "h-4 w-4",
								strokeWidth: 1.5
							})]
						})
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "lg:col-span-4 rounded-2xl border border-[#E2EAE5] dark:border-[#1E2E26] bg-white dark:bg-[#111C17] p-3.5 space-y-1.5",
				children: items.map((item, idx) => {
					const c = counts[item.id] || 0;
					const itemDone = c >= item.targetCount;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setActiveIdx(idx),
						className: `w-full text-start rounded-xl px-3.5 py-2.5 border transition-colors flex items-center justify-between gap-2.5 ${idx === safeIdx ? "border-[#27784C] dark:border-[#52B77F] bg-[#27784C]/8 dark:bg-[#52B77F]/12 text-[#142019] dark:text-[#F1F5F3]" : "border-transparent hover:bg-[#F4F7F5] dark:hover:bg-[#15241D] text-[#5A6B62] dark:text-[#92A59B]"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "min-w-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-xs font-semibold truncate text-[#142019] dark:text-[#F1F5F3]",
								children: [
									numFmt(idx + 1),
									". ",
									lang === "ar" ? item.titleAr : item.titleEn
								]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-1.5 shrink-0 text-xs tabular-nums",
							children: [itemDone && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, {
								className: "h-3.5 w-3.5 text-[#27784C] dark:text-[#52B77F]",
								strokeWidth: 1.5
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: itemDone ? "text-[#27784C] dark:text-[#52B77F] font-semibold" : "",
								children: [
									numFmt(c),
									"/",
									numFmt(item.targetCount)
								]
							})]
						})]
					}, item.id);
				})
			})]
		})]
	});
};
export { AdhkarPage };
