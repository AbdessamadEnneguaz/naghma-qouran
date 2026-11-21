import type {AdhkarCategory, AdhkarItem} from '../types/quran';

export function getDefaultAdhkarPeriod(hour: number = new Date().getHours()): AdhkarCategory {
  if (hour >= 4 && hour < 14) return 'sabah';
  return 'masaa';
}

export const ADHKAR_ITEMS: AdhkarItem[] = [
  // ── Morning Adhkar (أذكار الصباح) ───────────────────────────────────────────
  {
    id: 'sabah-kursi',
    category: 'sabah',
    titleAr: 'آية الكرسي',
    titleEn: 'Ayat al-Kursi',
    arabic:
      'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',
    transliteration:
      'Allahu la ilaha illa Huwal-Hayyul-Qayyum. La ta’khudhuhu sinatun wa la nawm...',
    translation:
      'Allah — there is no deity except Him, the Ever-Living, the Sustainer of existence. Neither drowsiness overtakes Him nor sleep...',
    virtueAr: 'حرز من الشيطان حتى يمسي',
    virtueEn: 'Protection throughout the day until evening.',
    targetCount: 1,
  },
  {
    id: 'sabah-muawwidhat',
    category: 'sabah',
    titleAr: 'المعوذات (الإخلاص والفلق والناس)',
    titleEn: 'The Three Quls (Al-Ikhlas, Al-Falaq, An-Nas)',
    arabic:
      'قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ ۝\nقُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ ... قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ ...',
    transliteration:
      'Qul Huwa Allahu Ahad... Qul a’udhu bi-Rabbil-Falaq... Qul a’udhu bi-Rabbin-Nas...',
    translation:
      'Recite Surah Al-Ikhlas, Surah Al-Falaq, and Surah An-Nas three times each morning.',
    virtueAr: 'تكفيك من كل شيء',
    virtueEn: 'Sufficient for protection against every harm.',
    targetCount: 3,
  },
  {
    id: 'sabah-mulk',
    category: 'sabah',
    titleAr: 'أصبحنا وأصبح الملك لله',
    titleEn: 'Morning Praise & Seeking Goodness',
    arabic:
      'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَٰذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَٰذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ.',
    transliteration:
      'Asbahna wa asbahal-mulku lillah, wal-hamdu lillah, la ilaha illallahu wahdahu la sharika lah...',
    translation:
      'We have reached the morning and all sovereignty belongs to Allah. My Lord, I ask You for the good of this day and what follows it.',
    virtueAr: 'ذكر الصباح الجامع',
    virtueEn: 'Comprehensive morning supplication for blessing and refuge.',
    targetCount: 1,
  },
  {
    id: 'sabah-sayyid-istighfar',
    category: 'sabah',
    titleAr: 'سيد الاستغفار',
    titleEn: 'Sayyid al-Istighfar (Master Supplication for Forgiveness)',
    arabic:
      'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَىٰ عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ.',
    transliteration:
      'Allahumma Anta Rabbi la ilaha illa Anta, khalaqtani wa ana ‘abduka...',
    translation:
      'O Allah, You are my Lord, none has the right to be worshipped except You. You created me and I am Your servant... forgive me, for none forgives sins except You.',
    virtueAr: 'من قالها موقناً بها فمات من يومه دخل الجنة',
    virtueEn: 'Whoever recites it with conviction in the morning enters Paradise if they pass that day.',
    targetCount: 1,
  },
  {
    id: 'sabah-bismillah',
    category: 'sabah',
    titleAr: 'بسم الله الذي لا يضر مع اسمه شيء',
    titleEn: 'In the Name of Allah Nothing Can Harm',
    arabic:
      'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ.',
    transliteration:
      'Bismillahil-ladhi la yadurru ma’as-mihi shay’un fil-ardi wa la fis-sama’i wa Huwas-Sami’ul-‘Alim.',
    translation:
      'In the Name of Allah, with whose Name nothing on earth or in the heavens can cause harm, and He is the All-Hearing, All-Knowing.',
    virtueAr: 'لم يضره شيء بإذن الله',
    virtueEn: 'Nothing will harm the reciter throughout the day.',
    targetCount: 3,
  },
  {
    id: 'sabah-raditu',
    category: 'sabah',
    titleAr: 'رضيت بالله رباً',
    titleEn: 'Contentment with Allah, Islam & Muhammad ﷺ',
    arabic:
      'رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا.',
    transliteration:
      'Raditu billahi Rabban, wa bil-Islami dinan, wa bi-Muhammadin (ﷺ) nabiyyan.',
    translation:
      'I am pleased with Allah as my Lord, with Islam as my religion, and with Muhammad ﷺ as my Prophet.',
    virtueAr: 'كان حقاً على الله أن يرضيه يوم القيامة',
    virtueEn: 'Allah promises to please the one who recites it three times.',
    targetCount: 3,
  },
  {
    id: 'sabah-hasbiyallah',
    category: 'sabah',
    titleAr: 'حسبي الله لا إله إلا هو',
    titleEn: 'Allah is Sufficient for Me',
    arabic:
      'حَسْبِيَ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ ۖ عَلَيْهِ تَوَكَّلْتُ ۖ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ.',
    transliteration:
      'Hasbiyallahu la ilaha illa Huwa, ‘alayhi tawakkaltu, wa Huwa Rabbul-‘Arshil-‘Azim.',
    translation:
      'Allah is sufficient for me; there is no deity except Him. On Him I have relied, and He is the Lord of the Great Throne.',
    virtueAr: 'كفاه الله ما أهمه من أمر الدنيا والآخرة',
    virtueEn: 'Allah suffices the reciter against whatever worries them.',
    targetCount: 7,
  },
  {
    id: 'sabah-subhanallah',
    category: 'sabah',
    titleAr: 'سبحان الله وبحمده',
    titleEn: 'Glory & Praise Be to Allah',
    arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ.',
    transliteration: 'SubhanAllahi wa bihamdihi.',
    translation: 'Glory be to Allah and praise be to Him.',
    virtueAr: 'حُطَّت خطاياه وإن كانت مثل زبد البحر',
    virtueEn: 'Reciting 100 times erases sins even if like the foam of the sea.',
    targetCount: 100,
  },

  // ── Evening Adhkar (أذكار المساء) ───────────────────────────────────────────
  {
    id: 'masaa-kursi',
    category: 'masaa',
    titleAr: 'آية الكرسي',
    titleEn: 'Ayat al-Kursi',
    arabic:
      'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',
    transliteration:
      'Allahu la ilaha illa Huwal-Hayyul-Qayyum. La ta’khudhuhu sinatun wa la nawm...',
    translation:
      'Allah — there is no deity except Him, the Ever-Living, the Sustainer of existence...',
    virtueAr: 'حرز من الشيطان حتى يصبح',
    virtueEn: 'Guarded by Allah through the entire night.',
    targetCount: 1,
  },
  {
    id: 'masaa-muawwidhat',
    category: 'masaa',
    titleAr: 'المعوذات (الإخلاص والفلق والناس)',
    titleEn: 'The Three Quls (Al-Ikhlas, Al-Falaq, An-Nas)',
    arabic:
      'قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ ۝\nقُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ ... قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ ...',
    transliteration:
      'Qul Huwa Allahu Ahad... Qul a’udhu bi-Rabbil-Falaq... Qul a’udhu bi-Rabbin-Nas...',
    translation:
      'Recite Surah Al-Ikhlas, Surah Al-Falaq, and Surah An-Nas three times each evening.',
    virtueAr: 'تكفيك من كل شيء',
    virtueEn: 'Sufficient for protection against every evil at night.',
    targetCount: 3,
  },
  {
    id: 'masaa-mulk',
    category: 'masaa',
    titleAr: 'أمسينا وأمسى الملك لله',
    titleEn: 'Evening Praise & Seeking Goodness',
    arabic:
      'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَٰذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَٰذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا.',
    transliteration:
      'Amsayna wa amsal-mulku lillah, wal-hamdu lillah, la ilaha illallahu wahdahu la sharika lah...',
    translation:
      'We have reached the evening and all sovereignty belongs to Allah. My Lord, I ask You for the good of this night and what follows it.',
    virtueAr: 'ذكر المساء الجامع',
    virtueEn: 'Comprehensive evening supplication for tranquility and protection.',
    targetCount: 1,
  },
  {
    id: 'masaa-sayyid-istighfar',
    category: 'masaa',
    titleAr: 'سيد الاستغفار',
    titleEn: 'Sayyid al-Istighfar',
    arabic:
      'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَىٰ عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ.',
    transliteration:
      'Allahumma Anta Rabbi la ilaha illa Anta, khalaqtani wa ana ‘abduka...',
    translation:
      'O Allah, You are my Lord, none has the right to be worshipped except You... forgive me, for none forgives sins except You.',
    virtueAr: 'من قالها موقناً بها حين يمسي فمات من ليلته دخل الجنة',
    virtueEn: 'Recited with conviction at evening brings immense mercy.',
    targetCount: 1,
  },
  {
    id: 'masaa-kalimat',
    category: 'masaa',
    titleAr: 'أعوذ بكلمات الله التامات',
    titleEn: 'Refuge in Allah’s Perfect Words',
    arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ.',
    transliteration: 'A’udhu bi-kalimatillahit-tammati min sharri ma khalaq.',
    translation:
      'I seek refuge in the perfect words of Allah from the evil of what He has created.',
    virtueAr: 'تقي من كل أذى في المساء',
    virtueEn: 'Protection throughout the night from all harm.',
    targetCount: 3,
  },
  {
    id: 'masaa-bismillah',
    category: 'masaa',
    titleAr: 'بسم الله الذي لا يضر مع اسمه شيء',
    titleEn: 'In the Name of Allah Nothing Can Harm',
    arabic:
      'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ.',
    transliteration:
      'Bismillahil-ladhi la yadurru ma’as-mihi shay’un fil-ardi wa la fis-sama’i wa Huwas-Sami’ul-‘Alim.',
    translation:
      'In the Name of Allah, with whose Name nothing on earth or in the heavens can cause harm.',
    virtueAr: 'حفظٌ تامٌ طوال الليل',
    virtueEn: 'Complete safeguard throughout the night.',
    targetCount: 3,
  },
  {
    id: 'masaa-salawat',
    category: 'masaa',
    titleAr: 'الصلاة على النبي ﷺ',
    titleEn: 'Sending Peace & Blessings Upon the Prophet ﷺ',
    arabic: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ.',
    transliteration: 'Allahumma salli wa sallim ‘ala Nabiyyina Muhammad.',
    translation: 'O Allah, send peace and blessings upon our Prophet Muhammad ﷺ.',
    virtueAr: 'أدركته شفاعتي يوم القيامة',
    virtueEn: 'Tenfold blessings from Allah and intercession on the Day of Judgment.',
    targetCount: 10,
  },

  // ── Post-Prayer Adhkar (أذكار بعد الصلاة) ──────────────────────────────────
  {
    id: 'prayer-istighfar',
    category: 'postPrayer',
    titleAr: 'الاستغفار بعد السلام',
    titleEn: 'Seeking Forgiveness & Peace',
    arabic:
      'أَسْتَغْفِرُ اللَّهَ (ثلاثاً) · اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ.',
    transliteration:
      'Astaghfirullah (3x). Allahumma Antas-Salam wa minkas-salam, tabarakta ya Dhal-Jalali wal-Ikram.',
    translation:
      'I seek the forgiveness of Allah. O Allah, You are Peace and from You comes peace. Blessed are You, O Possessor of Majesty and Honor.',
    virtueAr: 'سُنة النبي ﷺ فور التسليم من كل صلاة مكتوبة',
    virtueEn: 'Sunnah immediately following the Salam of every obligatory prayer.',
    targetCount: 3,
  },
  {
    id: 'prayer-subhanallah',
    category: 'postPrayer',
    titleAr: 'التسبيح: سبحان الله',
    titleEn: 'SubhanAllah (Glory Be to Allah)',
    arabic: 'سُبْحَانَ اللَّهِ.',
    transliteration: 'SubhanAllah.',
    translation: 'Glory be to Allah.',
    virtueAr: '٣٣ مرة بعد كل صلاة',
    virtueEn: '33 times after each obligatory prayer.',
    targetCount: 33,
  },
  {
    id: 'prayer-alhamdulillah',
    category: 'postPrayer',
    titleAr: 'التحميد: الحمد لله',
    titleEn: 'Alhamdulillah (All Praise Be to Allah)',
    arabic: 'الْحَمْدُ لِلَّهِ.',
    transliteration: 'Alhamdulillah.',
    translation: 'All praise is due to Allah.',
    virtueAr: '٣٣ مرة بعد كل صلاة',
    virtueEn: '33 times after each obligatory prayer.',
    targetCount: 33,
  },
  {
    id: 'prayer-allahuakbar',
    category: 'postPrayer',
    titleAr: 'التكبير: الله أكبر',
    titleEn: 'Allahu Akbar (Allah is the Greatest)',
    arabic: 'اللَّهُ أَكْبَرُ.',
    transliteration: 'Allahu Akbar.',
    translation: 'Allah is the Greatest.',
    virtueAr: '٣٣ مرة بعد كل صلاة',
    virtueEn: '33 times after each obligatory prayer.',
    targetCount: 33,
  },
  {
    id: 'prayer-khatm',
    category: 'postPrayer',
    titleAr: 'ختام المئة',
    titleEn: 'Completing the Hundred',
    arabic:
      'لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ.',
    transliteration:
      'La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamdu wa Huwa ‘ala kulli shay’in Qadir.',
    translation:
      'There is no deity except Allah alone, without partner. To Him belongs dominion and praise, and He is over all things competent.',
    virtueAr: 'غُفرت خطاياه وإن كانت مثل زبد البحر',
    virtueEn: 'Completes 100 after the 33x praises for full forgiveness.',
    targetCount: 1,
  },
];
