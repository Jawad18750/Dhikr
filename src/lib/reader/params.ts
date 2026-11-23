// Server only: imported by the reader's API routes alone.
import { READER_ZOOMS } from './service';

export const surahOf = (value: string) => {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 && n <= 114 ? n : null;
};

export const zoomOf = (value: string | null) => {
  const n = Number(value);
  return (READER_ZOOMS as readonly number[]).includes(n) ? n : null;
};

/** Widths come in 40 px steps up to 1600, so a browser cannot ask for a print size. */
export const widthOf = (value: string | null) => {
  const n = Math.round(Number(value) / 40) * 40;
  return Number.isFinite(n) && n >= 200 && n <= 1600 ? n : null;
};
