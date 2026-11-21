import test from 'node:test';
import assert from 'node:assert/strict';
import {
  clampPage,
  evaluateSpokenWords,
  formatAudioTime,
  formatBytes,
  formatHizbLabel,
  getAyahAudioCandidates,
  getAyahAudioUrl,
  getNextAyah,
  getPrevAyah,
  getUpcomingAyahs,
  getUpcomingSurahs,
  normalizeSpeechWord,
  parseSearchQuery,
  searchQuran,
  stripLeadingBismillah,
  stripTashkeel,
  toArabicDigits,
  tokenizeVerseWords,
} from './quranLogic';
import {RECITERS} from '../data/reciters';
import type {QuranVerse, SurahMeta} from '../types/quran';

test('toArabicDigits converts numbers to Eastern Arabic numerals', () => {
  assert.equal(toArabicDigits(1), '١');
  assert.equal(toArabicDigits(255), '٢٥٥');
  assert.equal(toArabicDigits(604), '٦٠٤');
});

test('stripTashkeel removes Arabic diacritics and normalizes Alef forms', () => {
  const raw = 'بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ';
  assert.equal(stripTashkeel(raw), 'بسم الله الرحمن الرحيم');
  assert.equal(stripTashkeel('ٱلۡحَمۡدُ لِلَّهِ'), 'الحمد لله');
});

test('parseSearchQuery handles page jumps, Surah:Ayah jumps, and Arabic text', () => {
  assert.deepEqual(parseSearchQuery('p:604'), {kind: 'page', page: 604});
  assert.deepEqual(parseSearchQuery('page 12'), {kind: 'page', page: 12});
  assert.deepEqual(parseSearchQuery('2:255'), {kind: 'ayah', surah: 2, ayah: 255});
  assert.deepEqual(parseSearchQuery('114'), {kind: 'surah_num', surah: 114});
  const textParsed = parseSearchQuery('الْحَمْدُ');
  assert.equal(textParsed.kind, 'text');
  if (textParsed.kind === 'text') {
    assert.equal(textParsed.normalized, 'الحمد');
  }
});

test('getAyahAudioUrl and getAyahAudioCandidates handle Hafs, Warsh, and Muhammad Al-Luhaidan fallbacks', () => {
  const alafasy = RECITERS.find((r) => r.id === 'hafs_alafasy')!;
  const qazabri = RECITERS.find((r) => r.id === 'warsh_qazabri')!;
  const luhaidanIdx = RECITERS.findIndex((r) => r.id === 'hafs_luhaidan');
  const firstHafsIdx = RECITERS.findIndex((r) => r.riwayat === 'hafs');
  assert.ok(luhaidanIdx !== -1, 'Muhammad Al-Luhaidan should exist in RECITERS');
  assert.ok(
    luhaidanIdx - firstHafsIdx <= 2,
    'Muhammad Al-Luhaidan should be near the top of the Hafs reciters list'
  );
  const luhaidan = RECITERS[luhaidanIdx];
  assert.equal(luhaidan.nameAr, 'محمد اللحيدان');
  assert.deepEqual(getAyahAudioCandidates(luhaidan, 1, 1), [
    'https://cdn.mp3quran.net/audio/muhammad-luhaidan/r1/001.mp3',
    'https://server8.mp3quran.net/lhdan/001.mp3',
    'https://cdn.islamic.network/quran/audio-surah/128/ar.muhammadalluhaidan/1.mp3',
  ]);
  assert.equal(
    getAyahAudioUrl(alafasy, 2, 255),
    'https://everyayah.com/data/Alafasy_128kbps/002255.mp3'
  );
  assert.equal(
    getAyahAudioUrl(qazabri, 18, 1),
    'https://cdn.mp3quran.net/audio/omar-kazabri/r1/018.mp3'
  );
  assert.ok(RECITERS.length >= 25, 'Expected at least 25 reciters');
});

test('stripLeadingBismillah strips Bismillah on Surah 2+ ayah 1 except At-Tawbah (9)', () => {
  const b = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ الٓمٓ';
  assert.equal(stripLeadingBismillah(b, 2, 1), 'الٓمٓ');
  assert.equal(stripLeadingBismillah('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', 1, 1), 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ');
  assert.equal(stripLeadingBismillah('بَرَآءَةٌ مِّنَ ٱللَّهِ', 9, 1), 'بَرَآءَةٌ مِّنَ ٱللَّهِ');
});

test('searchQuran locates verses without tashkeel, Surah names, and 2:255 jumps', () => {
  const surahs: SurahMeta[] = [
    {
      id: 1,
      nameAr: 'سُورَةُ ٱلْفَاتِحَةِ',
      nameEn: 'Al-Faatiha',
      meaningEn: 'The Opening',
      meaningFr: "L'ouverture",
      transliteration: 'Al-Fatihah',
      revelationType: 'Meccan',
      totalAyahs: 7,
      startPage: 1,
      endPage: 1,
      juzStart: 1,
    },
    {
      id: 2,
      nameAr: 'سُورَةُ البَقَرَةِ',
      nameEn: 'Al-Baqara',
      meaningEn: 'The Cow',
      meaningFr: 'La vache',
      transliteration: 'Al-Baqarah',
      revelationType: 'Medinan',
      totalAyahs: 286,
      startPage: 2,
      endPage: 49,
      juzStart: 1,
    },
  ];
  const verses: QuranVerse[] = [
    {
      index: 0,
      surah: 1,
      ayah: 1,
      page: 1,
      juz: 1,
      hizbQuarter: 1,
      sajda: false,
      text: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
      searchNormalized: 'بسم الله الرحمن الرحيم',
    },
    {
      index: 1,
      surah: 2,
      ayah: 255,
      page: 42,
      juz: 3,
      hizbQuarter: 17,
      sajda: false,
      text: 'ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ',
      searchNormalized: 'الله لا اله الا هو الحي القيوم',
    },
  ];
  const jump = searchQuran(verses, surahs, '2:255');
  assert.equal(jump.length, 1);
  assert.equal(jump[0].page, 42);

  const pageJump = searchQuran(verses, surahs, 'p:1');
  assert.equal(pageJump.length, 1);
  assert.equal(pageJump[0].surah, 1);

  const textRes = searchQuran(verses, surahs, 'الحي القيوم');
  assert.equal(textRes.length, 1);
  assert.equal(textRes[0].ayah, 255);
});

test('navigation & formatting helpers behave deterministically', () => {
  const verses: QuranVerse[] = [
    {index: 0, surah: 1, ayah: 1, page: 1, juz: 1, hizbQuarter: 1, sajda: false, text: 'a'},
    {index: 1, surah: 1, ayah: 2, page: 1, juz: 1, hizbQuarter: 1, sajda: false, text: 'b'},
  ];
  assert.equal(getNextAyah(verses, 1, 1)?.ayah, 2);
  assert.equal(getNextAyah(verses, 1, 2), null);
  assert.equal(getPrevAyah(verses, 1, 2)?.ayah, 1);
  assert.equal(getPrevAyah(verses, 1, 1), null);
  assert.equal(clampPage(999), 604);
  assert.equal(clampPage(0), 1);
  assert.deepEqual(formatHizbLabel(5), {hizb: 2, quarter: 1});
  assert.equal(formatAudioTime(125), '2:05');
  assert.equal(formatBytes(1536), '1.5 KB');
});

test('tokenizeVerseWords & evaluateSpokenWords match recited Arabic words and flag skipped words', () => {
  const words = tokenizeVerseWords('ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ');
  assert.equal(words.length, 4);

  const pageWords = words.map((w, i) => ({
    key: `1:2:${i}`,
    ayahKey: '1:2',
    display: w,
    normalized: normalizeSpeechWord(w),
  }));

  // Exact match of first 2 words
  const res1 = evaluateSpokenWords('الحمد لله', pageWords, 0);
  assert.deepEqual(res1.newlyMatchedKeys, ['1:2:0', '1:2:1']);
  assert.deepEqual(res1.newlyMissedKeys, []);
  assert.equal(res1.nextCursor, 2);

  // Skip 3rd word ("رب") and recite 4th word ("العالمين")
  const res2 = evaluateSpokenWords('العالمين', pageWords, res1.nextCursor);
  assert.deepEqual(res2.newlyMissedKeys, ['1:2:2']);
  assert.deepEqual(res2.newlyMatchedKeys, ['1:2:3']);
  assert.equal(res2.mistakeKey, '1:2:2');
  assert.equal(res2.nextCursor, 4);
});

test('getUpcomingAyahs and getUpcomingSurahs return next 2 items across boundaries', () => {
  const verses: QuranVerse[] = [
    {index: 0, surah: 1, ayah: 6, page: 1, juz: 1, hizbQuarter: 1, sajda: false, text: 'a'},
    {index: 1, surah: 1, ayah: 7, page: 1, juz: 1, hizbQuarter: 1, sajda: false, text: 'b'},
    {index: 2, surah: 2, ayah: 1, page: 2, juz: 1, hizbQuarter: 1, sajda: false, text: 'c'},
    {index: 3, surah: 2, ayah: 2, page: 2, juz: 1, hizbQuarter: 1, sajda: false, text: 'd'},
  ];
  const next2 = getUpcomingAyahs(verses, 1, 7, 2);
  assert.deepEqual(
    next2.map((v) => `${v.surah}:${v.ayah}`),
    ['2:1', '2:2']
  );
  assert.deepEqual(
    getUpcomingAyahs(verses, 2, 1, 2).map((v) => `${v.surah}:${v.ayah}`),
    ['2:2']
  );
  assert.deepEqual(getUpcomingSurahs(1, 2), [2, 3]);
  assert.deepEqual(getUpcomingSurahs(113, 2), [114]);
  assert.deepEqual(getUpcomingSurahs(114, 2), []);
});
