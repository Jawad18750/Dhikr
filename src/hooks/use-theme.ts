'use client';

import { useAtom } from 'jotai';
import { useEffect } from 'react';

import { type Palette, paletteAtom, type Theme, themeAtom } from '@/jotai/atom';

/** The one palette the site uses: the ذكر look. */
const SITE_PALETTE: Palette = 'warm';

/** Light unless dark was chosen: the site does not follow the system. */
export function resolveMode(mode: Theme): 'light' | 'dark' {
  return mode === 'dark' ? 'dark' : 'light';
}

/** Apply the mode class and the site palette to <html>. */
export function applyTheme(mode: Theme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.dataset.theme = SITE_PALETTE;
  const dark = resolveMode(mode) === 'dark';
  root.classList.toggle('dark', dark);
  root.classList.toggle('light', !dark);
}

export function useTheme() {
  const [mode, setMode] = useAtom(themeAtom);
  // Kept for the internal design harness only; the site never applies it.
  const [palette, setPalette] = useAtom(paletteAtom);

  useEffect(() => {
    applyTheme(mode);
  }, [mode]);

  return {
    mode,
    setMode,
    palette,
    setPalette,
    resolvedMode: resolveMode(mode),
  };
}
