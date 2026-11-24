import type {
  BookmarkCategory,
  BookmarkEntry,
  QuranVerse,
  Reciter,
  SearchResult,
  SurahMeta,
} from '../types/quran';

const ARABIC_DIACRITICS_REGEX = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED\u0640]/g;

const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

export function toArabicDigits(num: number): string {
  return String(num)
    .split('')
    .map((ch) => {
      const idx = Number(ch);
      return Number.isInteger(idx) && ch >= '0' && ch <= '9' ? ARABIC_DIGITS[idx] : ch;
    })
    .join('');
}

export function pad3(num: number): string {
  return String(num).padStart(3, '0');
}

const SURAH_AYAH_COUNTS = [
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111, 110, 98,
  135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73, 54, 45, 83, 182, 88, 75, 85,
  54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60, 49, 62, 55, 78, 96, 29, 22, 24, 13, 14, 11,
  11, 18, 12, 12, 30, 52, 52, 44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25,
  22, 17, 19, 26, 30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3,
  5, 4, 5, 6,
];

export function getGlobalAyahNumber(surah: number, ayah: number): number {
  const safeSurah = Math.max(1, Math.min(114, Math.floor(surah)));
  const safeAyah = Math.max(1, Math.floor(ayah));
  let offset = 0;
  for (let i = 0; i < safeSurah - 1; i++) {
    offset += SURAH_AYAH_COUNTS[i];
  }
  return offset + Math.min(safeAyah, SURAH_AYAH_COUNTS[safeSurah - 1]);
}

export function getSurahAyahCount(surah: number): number {
  if (!Number.isFinite(surah) || surah < 1 || surah > 114) return 0;
  return SURAH_AYAH_COUNTS[Math.floor(surah) - 1] ?? 0;
}

export function getNextSurahAyah(
  surah: number,
  ayah: number
): {surah: number; ayah: number} | null {
  const count = getSurahAyahCount(surah);
  if (count === 0) return null;
  if (ayah < count) {
    return {surah, ayah: ayah + 1};
  }
  if (surah < 114) {
    return {surah: surah + 1, ayah: 1};
  }
  return null;
}

export function getPrevSurahAyah(
  surah: number,
  ayah: number
): {surah: number; ayah: number} | null {
  if (surah < 1 || surah > 114 || ayah < 1) return null;
  if (ayah > 1) {
    return {surah, ayah: ayah - 1};
  }
  if (surah > 1) {
    const prevSurah = surah - 1;
    return {surah: prevSurah, ayah: getSurahAyahCount(prevSurah)};
  }
  return null;
}

export function getUpcomingSurahAyahTargets(
  surah: number,
  ayah: number,
  count = 2
): Array<{surah: number; ayah: number}> {
  const out: Array<{surah: number; ayah: number}> = [];
  let curS = surah;
  let curA = ayah;
  for (let i = 0; i < count; i++) {
    const next = getNextSurahAyah(curS, curA);
    if (!next) break;
    out.push(next);
    curS = next.surah;
    curA = next.ayah;
  }
  return out;
}

function buildAudioUrlFromBase(
  baseOrTemplate: string,
  mode: Reciter['mode'],
  surah: number,
  ayah: number,
  globalAyah?: number
): string {
  const clean = baseOrTemplate.replace(/\/+$/, '');
  const resolvedGlobal = globalAyah ?? getGlobalAyahNumber(surah, ayah);
  if (
    clean.includes('{surah}') ||
    clean.includes('{padSurah}') ||
    clean.includes('{ayah}') ||
    clean.includes('{padAyah}') ||
    clean.includes('{globalAyah}')
  ) {
    return clean
      .replace(/\{padSurah\}/g, pad3(surah))
      .replace(/\{surah\}/g, String(surah))
      .replace(/\{padAyah\}/g, pad3(ayah))
      .replace(/\{ayah\}/g, String(ayah))
      .replace(/\{globalAyah\}/g, String(resolvedGlobal));
  }
  if (mode === 'surah') {
    return `${clean}/${pad3(surah)}.mp3`;
  }
  return `${clean}/${pad3(surah)}${pad3(ayah)}.mp3`;
}

export function getAyahAudioUrl(
  reciter: Reciter,
  surah: number,
  ayah: number,
  globalAyah?: number
): string {
  return buildAudioUrlFromBase(reciter.baseUrl, reciter.mode, surah, ayah, globalAyah);
}

export function getAyahAudioCandidates(
  reciter: Reciter,
  surah: number,
  ayah: number,
  globalAyah?: number
): string[] {
  const seen = new Set<string>();
  const urls: string[] = [];
  const bases = [reciter.baseUrl, ...(reciter.fallbackUrls || [])];
  for (const base of bases) {
    const url = buildAudioUrlFromBase(base, reciter.mode, surah, ayah, globalAyah);
    if (!seen.has(url)) {
      seen.add(url);
      urls.push(url);
    }
  }
  return urls;
}

export function getSurahAudioUrl(reciter: Reciter, surah: number): string {
  return buildAudioUrlFromBase(reciter.baseUrl, 'surah', surah, 1);
}

export function stripTashkeel(input: string): string {
  return input
    .replace(ARABIC_DIACRITICS_REGEX, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/\uFEFF/g, '')
    .trim();
}

export function formatAudioTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const total = Math.floor(seconds);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function formatHizbLabel(hizbQuarter: number): {hizb: number; quarter: number} {
  const safe = Math.max(1, Math.min(240, hizbQuarter));
  const hizb = Math.ceil(safe / 4);
  const quarter = ((safe - 1) % 4) + 1;
  return {hizb, quarter};
}

export function clampPage(page: number): number {
  if (!Number.isFinite(page)) return 1;
  return Math.max(1, Math.min(604, Math.round(page)));
}

export function stripLeadingBismillah(text: string, surah: number, ayah: number): string {
  if (surah === 1 || surah === 9 || ayah !== 1) return text;
  // Standard Uthmani Bismillah prefixes at start of Surah 2..114 except 9
  const cleaned = text.replace(/^\uFEFF/, '');
  const normalized = stripTashkeel(cleaned);
  if (normalized.startsWith('بسم الله الرحمن الرحيم')) {
    const parts = cleaned.trim().split(/\s+/);
    if (parts.length > 4) {
      return parts.slice(4).join(' ');
    }
  }
  return cleaned;
}

export type ParsedQuery =
  | {kind: 'empty'}
  | {kind: 'page'; page: number}
  | {kind: 'ayah'; surah: number; ayah: number}
  | {kind: 'surah_num'; surah: number}
  | {kind: 'text'; normalized: string; raw: string};

export function parseSearchQuery(query: string): ParsedQuery {
  const trimmed = query.trim();
  if (!trimmed) return {kind: 'empty'};

  // Page jump: p:604, page:604, page 604, ص:604, ص 604
  const pageMatch = trimmed.match(/^(?:p|page|ص)\s*[:\s]?\s*(\d{1,3})$/i);
  if (pageMatch) {
    const page = Number(pageMatch[1]);
    if (page >= 1 && page <= 604) {
      return {kind: 'page', page};
    }
  }

  // Surah:Ayah jump: 2:255 or 2/255 or 2 255
  const ayahMatch = trimmed.match(/^(\d{1,3})\s*[:/]\s*(\d{1,3})$/);
  if (ayahMatch) {
    const surah = Number(ayahMatch[1]);
    const ayah = Number(ayahMatch[2]);
    if (surah >= 1 && surah <= 114 && ayah >= 1) {
      return {kind: 'ayah', surah, ayah};
    }
  }

  // Direct Surah number 1..114
  if (/^\d{1,3}$/.test(trimmed)) {
    const num = Number(trimmed);
    if (num >= 1 && num <= 114) {
      return {kind: 'surah_num', surah: num};
    }
  }

  return {
    kind: 'text',
    raw: trimmed,
    normalized: stripTashkeel(trimmed).toLowerCase(),
  };
}

export function getBookmarkCategory(entry: BookmarkEntry): BookmarkCategory {
  return entry.category || 'favorites';
}

export interface HighlightSegment {
  text: string;
  highlighted: boolean;
}

/**
 * Splits Arabic text into whole words and marks matching words without ever
 * splitting inside an Arabic word so cursive ligatures remain unbroken.
 */
export function highlightArabicWords(arabicText: string, query: string): HighlightSegment[] {
  const cleaned = arabicText.replace(/^\uFEFF/, '').trim();
  if (!cleaned) return [];
  const normQuery = stripTashkeel(query).toLowerCase();
  if (!normQuery || normQuery.length < 2) {
    return [{text: cleaned, highlighted: false}];
  }
  const queryTokens = normQuery.split(/\s+/).filter((t) => t.length >= 2);
  if (queryTokens.length === 0) {
    return [{text: cleaned, highlighted: false}];
  }

  const rawWords = cleaned.split(/\s+/);
  return rawWords.map((word) => {
    const normWord = stripTashkeel(
      word.replace(/[\u06D6-\u06ED\u0610-\u061A\u0640\u06DD\u06DE\u06E9\uFD3E\uFD3F]/g, '')
    ).toLowerCase();
    const matched = queryTokens.some(
      (qt) => normWord === qt || (qt.length >= 2 && normWord.includes(qt))
    );
    return {text: word, highlighted: matched};
  });
}

export function highlightLatinQuery(text: string, query: string): HighlightSegment[] {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) {
    return [{text, highlighted: false}];
  }
  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);
  if (parts.length <= 1) {
    return [{text, highlighted: false}];
  }
  return parts
    .filter((p) => p.length > 0)
    .map((part) => ({
      text: part,
      highlighted: part.toLowerCase() === trimmed.toLowerCase(),
    }));
}

export function searchQuran(
  verses: QuranVerse[],
  surahs: SurahMeta[],
  query: string,
  translations?: string[],
  limit = 40,
  secondaryTranslations?: string[]
): SearchResult[] {
  const parsed = parseSearchQuery(query);
  if (parsed.kind === 'empty') return [];

  const surahMap = new Map<number, SurahMeta>();
  for (const s of surahs) surahMap.set(s.id, s);

  if (parsed.kind === 'page') {
    const pageVerses = verses.filter((v) => v.page === parsed.page);
    const first = pageVerses[0];
    if (!first) return [];
    const sMeta = surahMap.get(first.surah);
    return [
      {
        type: 'jump',
        surah: first.surah,
        ayah: first.ayah,
        page: parsed.page,
        juz: first.juz,
        surahNameAr: sMeta?.nameAr || '',
        surahNameEn: sMeta?.nameEn || '',
        text: first.text,
        translation: `Jump directly to Madani Mushaf Page ${parsed.page}`,
      },
    ];
  }

  if (parsed.kind === 'ayah') {
    const found = verses.find((v) => v.surah === parsed.surah && v.ayah === parsed.ayah);
    if (!found) return [];
    const sMeta = surahMap.get(found.surah);
    return [
      {
        type: 'jump',
        surah: found.surah,
        ayah: found.ayah,
        page: found.page,
        juz: found.juz,
        surahNameAr: sMeta?.nameAr || '',
        surahNameEn: sMeta?.nameEn || '',
        text: found.text,
        translation: translations?.[found.index] || secondaryTranslations?.[found.index],
      },
    ];
  }

  if (parsed.kind === 'surah_num') {
    const sMeta = surahMap.get(parsed.surah);
    const first = verses.find((v) => v.surah === parsed.surah && v.ayah === 1);
    if (!sMeta || !first) return [];
    return [
      {
        type: 'surah',
        surah: sMeta.id,
        ayah: 1,
        page: sMeta.startPage,
        juz: sMeta.juzStart,
        surahNameAr: sMeta.nameAr,
        surahNameEn: sMeta.nameEn,
        text: first.text,
        translation: `${sMeta.meaningEn} · ${sMeta.totalAyahs} verses · Page ${sMeta.startPage}`,
      },
    ];
  }

  const results: SearchResult[] = [];
  const norm = parsed.normalized;

  // Match Surah names first
  for (const s of surahs) {
    const matchAr = stripTashkeel(s.nameAr).includes(norm);
    const matchEn =
      s.nameEn.toLowerCase().includes(norm) ||
      s.transliteration.toLowerCase().includes(norm) ||
      s.meaningEn.toLowerCase().includes(norm) ||
      s.meaningFr.toLowerCase().includes(norm);
    if (matchAr || matchEn) {
      const first = verses.find((v) => v.surah === s.id && v.ayah === 1);
      results.push({
        type: 'surah',
        surah: s.id,
        ayah: 1,
        page: s.startPage,
        juz: s.juzStart,
        surahNameAr: s.nameAr,
        surahNameEn: s.nameEn,
        text: first?.text || s.nameAr,
        translation: `${s.meaningEn} · ${s.totalAyahs} verses · Page ${s.startPage}`,
      });
      if (results.length >= limit) return results;
    }
  }

  // Match Verses (Arabic without tashkeel or English/French translation)
  for (let i = 0; i < verses.length; i++) {
    const v = verses[i];
    const vNorm = v.searchNormalized ?? stripTashkeel(v.text);
    const trPrimary = translations?.[v.index];
    const trSecondary = secondaryTranslations?.[v.index];
    const matchAr = vNorm.includes(norm);
    const matchPrimary = trPrimary ? trPrimary.toLowerCase().includes(norm) : false;
    const matchSecondary = trSecondary ? trSecondary.toLowerCase().includes(norm) : false;
    if (matchAr || matchPrimary || matchSecondary) {
      const sMeta = surahMap.get(v.surah);
      results.push({
        type: 'verse',
        surah: v.surah,
        ayah: v.ayah,
        page: v.page,
        juz: v.juz,
        surahNameAr: sMeta?.nameAr || '',
        surahNameEn: sMeta?.nameEn || '',
        text: v.text,
        translation: matchSecondary && !matchPrimary ? trSecondary : trPrimary || trSecondary,
      });
      if (results.length >= limit) break;
    }
  }

  return results;
}

export function getNextAyah(
  verses: QuranVerse[],
  surah: number,
  ayah: number
): QuranVerse | null {
  const idx = verses.findIndex((v) => v.surah === surah && v.ayah === ayah);
  if (idx === -1 || idx + 1 >= verses.length) return null;
  return verses[idx + 1];
}

export function getUpcomingAyahs(
  verses: QuranVerse[],
  surah: number,
  ayah: number,
  count = 2
): QuranVerse[] {
  if (count <= 0) return [];
  const idx = verses.findIndex((v) => v.surah === surah && v.ayah === ayah);
  if (idx === -1) return [];
  return verses.slice(idx + 1, idx + 1 + count);
}

export function getUpcomingSurahs(surah: number, count = 2): number[] {
  const result: number[] = [];
  for (let i = 1; i <= count; i++) {
    const next = surah + i;
    if (next <= 114) result.push(next);
  }
  return result;
}

export function getPrevAyah(
  verses: QuranVerse[],
  surah: number,
  ayah: number
): QuranVerse | null {
  const idx = verses.findIndex((v) => v.surah === surah && v.ayah === ayah);
  if (idx <= 0) return null;
  return verses[idx - 1];
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let val = bytes;
  let unit = 0;
  while (val >= 1024 && unit < units.length - 1) {
    val /= 1024;
    unit++;
  }
  return `${val.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`;
}

const QURAN_WAQF_AND_SYMBOLS_REGEX = /[\u06D6-\u06ED\u0610-\u061A\u0640\u06DD\u06DE\u06E9\uFD3E\uFD3F.,،؛؟!:"'()\[\]]/g;

export function normalizeSpeechWord(word: string): string {
  return stripTashkeel(word.replace(QURAN_WAQF_AND_SYMBOLS_REGEX, ''))
    .replace(/[ؤئ]/g, 'ء')
    .replace(/ء+/g, 'ا')
    .replace(/\s+/g, '')
    .trim();
}

export function tokenizeVerseWords(text: string): string[] {
  return text
    .replace(/^\uFEFF/, '')
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0 && !/^[\u06D6-\u06ED۞۩]+$/.test(w));
}

export interface PageWordTarget {
  key: string; // `${surah}:${ayah}:${wordIndex}`
  ayahKey: string; // `${surah}:${ayah}`
  display: string;
  normalized: string;
}

export interface RecitationEvalResult {
  nextCursor: number;
  newlyMatchedKeys: string[];
  newlyMissedKeys: string[];
  mistakeKey: string | null;
}

function speechWordsMatch(targetNorm: string, spokenNorm: string): boolean {
  if (!targetNorm || !spokenNorm) return false;
  if (targetNorm === spokenNorm) return true;
  if (
    spokenNorm.length >= 3 &&
    targetNorm.length >= 3 &&
    (targetNorm.includes(spokenNorm) || spokenNorm.includes(targetNorm))
  ) {
    return true;
  }
  // Uthmani script often uses dagger Alef (omitted after stripTashkeel) whereas ar-SA speech outputs standard Alef (e.g., العلمين vs العالمين, ملك vs مالك)
  if (targetNorm.length >= 3 && spokenNorm.length >= 3) {
    const stripInternalAlef = (w: string) => w[0] + w.slice(1).replace(/ا/g, '');
    if (stripInternalAlef(targetNorm) === stripInternalAlef(spokenNorm)) {
      return true;
    }
  }
  return false;
}

/**
 * Matches spoken Arabic words from SpeechRecognition against flattened page words
 * starting from `cursor`, supporting small lookahead (up to 3 words) to detect skipped words.
 */
export function evaluateSpokenWords(
  spokenTranscript: string,
  pageWords: PageWordTarget[],
  cursor: number
): RecitationEvalResult {
  const spokenTokens = spokenTranscript
    .trim()
    .split(/\s+/)
    .map(normalizeSpeechWord)
    .filter(Boolean);

  let pos = Math.max(0, cursor);
  const newlyMatchedKeys: string[] = [];
  const newlyMissedKeys: string[] = [];
  let mistakeKey: string | null = null;

  for (const spoken of spokenTokens) {
    if (pos >= pageWords.length) break;

    let matchedOffset = -1;
    const maxLookahead = Math.min(3, pageWords.length - pos - 1);

    for (let offset = 0; offset <= maxLookahead; offset++) {
      const candidate = pageWords[pos + offset];
      if (speechWordsMatch(candidate.normalized, spoken)) {
        matchedOffset = offset;
        break;
      }
    }

    if (matchedOffset === 0) {
      newlyMatchedKeys.push(pageWords[pos].key);
      pos += 1;
      mistakeKey = null;
    } else if (matchedOffset > 0) {
      // Skipped intermediate words -> mark as missed (soft amber/red pulse)
      for (let skip = 0; skip < matchedOffset; skip++) {
        newlyMissedKeys.push(pageWords[pos + skip].key);
      }
      newlyMatchedKeys.push(pageWords[pos + matchedOffset].key);
      mistakeKey = pageWords[pos].key;
      pos = pos + matchedOffset + 1;
    } else {
      // Spoken word did not match expected window -> gently pulse expected word
      mistakeKey = pageWords[pos].key;
    }
  }

  return {
    nextCursor: pos,
    newlyMatchedKeys,
    newlyMissedKeys,
    mistakeKey,
  };
}

export interface ContextTargetInput {
  activeRoute: string;
  verses: QuranVerse[];
  currentPage: number;
  currentSurahId: number;
  highlightedAyahKey: string | null;
  lastRead: {surah: number; ayah: number; page: number} | null;
}

export function resolveActiveContextTarget(input: ContextTargetInput): {
  surah: number;
  ayah: number;
} {
  const {
    activeRoute,
    verses,
    currentPage,
    currentSurahId,
    highlightedAyahKey,
    lastRead,
  } = input;

  const fallbackSurah = Math.max(1, Math.min(114, Math.floor(currentSurahId || 1)));

  if (activeRoute === 'mushaf') {
    if (highlightedAyahKey) {
      const [sStr, aStr] = highlightedAyahKey.split(':');
      const s = Number(sStr);
      const a = Number(aStr);
      if (Number.isInteger(s) && Number.isInteger(a) && s >= 1 && a >= 1) {
        const matchOnPage = verses.find(
          (v) => v.page === currentPage && v.surah === s && v.ayah === a
        );
        if (matchOnPage) {
          return {surah: matchOnPage.surah, ayah: matchOnPage.ayah};
        }
      }
    }

    const firstOnPage = verses.find((v) => v.page === currentPage);
    if (firstOnPage) {
      return {surah: firstOnPage.surah, ayah: firstOnPage.ayah};
    }

    return {surah: fallbackSurah, ayah: 1};
  }

  if (lastRead && lastRead.surah >= 1 && lastRead.surah <= 114 && lastRead.ayah >= 1) {
    return {surah: lastRead.surah, ayah: lastRead.ayah};
  }

  return {surah: fallbackSurah, ayah: 1};
}


