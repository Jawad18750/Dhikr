// Server only: imported by the reader's API routes alone.

export const surahOf = (value: string) => {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 && n <= 114 ? n : null;
};

/** Line heights come in 10 px steps from 60 to 400, so a browser cannot ask for a print size. */
export const heightOf = (value: string | null) => {
  const n = Math.round(Number(value) / 10) * 10;
  return Number.isFinite(n) && n >= 60 && n <= 400 ? n : null;
};
