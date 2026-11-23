import { describe, expect, it } from 'vitest';

import { AYAH_COUNTS, hafsForQalun, qalunForHafs } from './ayah-numbering';

describe('ayah numbering', () => {
  it('knows the classic cases', () => {
    expect(qalunForHafs(2, 286)).toEqual([285]);
    expect(hafsForQalun(2, 285)).toEqual([286]);
    expect(hafsForQalun(1, 1)).toEqual([2]);
    expect(qalunForHafs(1, 1)).toEqual([]);
  });

  it('counts 6214 and 6236', () => {
    const sum = (counts: Record<string, number>) => Object.values(counts).reduce((a, b) => a + b, 0);
    expect(sum(AYAH_COUNTS.qalun)).toBe(6214);
    expect(sum(AYAH_COUNTS.hafs)).toBe(6236);
  });

  it('round-trips every ayah of both counts', () => {
    for (let surah = 1; surah <= 114; surah++) {
      for (let ayah = 1; ayah <= AYAH_COUNTS.qalun[surah]; ayah++) {
        for (const hafs of hafsForQalun(surah, ayah)) expect(qalunForHafs(surah, hafs)).toContain(ayah);
      }
      for (let hafs = surah === 1 ? 2 : 1; hafs <= AYAH_COUNTS.hafs[surah]; hafs++) {
        const qalun = qalunForHafs(surah, hafs);
        expect(qalun.length).toBeGreaterThan(0);
        for (const ayah of qalun) expect(hafsForQalun(surah, ayah)).toContain(hafs);
      }
    }
  });

  it('answers nothing out of range', () => {
    expect(hafsForQalun(2, 286)).toEqual([]);
    expect(qalunForHafs(114, 7)).toEqual([]);
  });
});
