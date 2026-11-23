/**
 * The juz each surah begins in (1–114), the same in the Madinan mushafs Qalun and Hafs are
 * printed in: a surah that starts inside a juz is listed under that juz.
 */
export const SURAH_JUZ: readonly number[] = [
  1, 1, 3, 4, 6, 7, 8, 9, 10, 11, 11, 12, 13, 13, 14, 14, 15, 15, 16, 16, 17, 17, 18, 18, 18, 19,
  19, 20, 20, 21, 21, 21, 21, 22, 22, 22, 23, 23, 23, 24, 24, 25, 25, 25, 25, 26, 26, 26, 26, 26,
  26, 27, 27, 27, 27, 27, 27, 28, 28, 28, 28, 28, 28, 28, 28, 28, 29, 29, 29, 29, 29, 29, 29, 29,
  29, 29, 29, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30,
  30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30,
];

export const juzOfSurah = (surah: number) => SURAH_JUZ[surah - 1] ?? null;
