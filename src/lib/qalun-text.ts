// Server only: the Qalun text as the Jamahiriya mushaf prints it (see /api/v1/text).
import text from '@/data/qalun-text.json';

export type QalunAyah = { ayah: number; text: string; juz: number; thumun?: number; hizb?: number };

const TEXT = text as Record<string, QalunAyah[]>;

/** A surah's ayahs in Qalun, or an empty list. */
export const qalunSurah = (surah: number): QalunAyah[] => TEXT[String(surah)] ?? [];
