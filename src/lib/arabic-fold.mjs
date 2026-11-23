// Arabic folded for search, shared by the site (src/lib/search.ts) and the indexer
// (scripts/index-tafsir.mjs), so a query and an index fold alike: no diacritics, Quranic
// marks or tatweel; one alef; ى/ئ/ے as ي, ؤ as و, ة as ه; Arabic-Indic digits as 0–9;
// anything not a letter or digit a space.

/** @param {number} c */
const isMark = (c) =>
  (c >= 0x06_10 && c <= 0x06_1a) ||
  (c >= 0x06_4b && c <= 0x06_5f) ||
  c === 0x06_70 ||
  (c >= 0x06_d6 && c <= 0x06_ed) ||
  c === 0x06_40 ||
  (c >= 0x08_d3 && c <= 0x08_ff);

/**
 * One letter folded: '' to drop it, else what it is searched as.
 * @param {string} ch
 * @returns {string}
 */
export function foldLetter(ch) {
  const c = ch.codePointAt(0) ?? 0;
  if (isMark(c)) return '';
  switch (ch) {
    case 'أ':
    case 'إ':
    case 'آ':
    case 'ٱ': {
      return 'ا';
    }
    case 'ى':
    case 'ئ':
    case 'ے':
    case 'ی': {
      return 'ي';
    }
    case 'ؤ': {
      return 'و';
    }
    case 'ة': {
      return 'ه';
    }
  }
  if (c >= 0x06_21 && c <= 0x06_4a) return ch;
  if ((c >= 0x30 && c <= 0x39) || (c >= 0x61 && c <= 0x7a)) return ch;
  if (c >= 0x41 && c <= 0x5a) return ch.toLowerCase();
  if (c >= 0x06_60 && c <= 0x06_69) return String(c - 0x06_60);
  return /\p{L}/u.test(ch) ? ch : ' ';
}

/**
 * @param {string} text
 * @returns {string}
 */
export function fold(text) {
  let out = '';
  for (const ch of text) out += foldLetter(ch);
  return out.replaceAll(/\s+/g, ' ').trim();
}
