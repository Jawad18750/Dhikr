'use client';

import { useCallback, useEffect, useState } from 'react';

/** Chrome's install offer, held by the inline script in RootShell until a button asks for it. */
type InstallPrompt = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> };

declare global {
  interface Window {
    __dhikrInstall?: InstallPrompt | null;
  }
}

/**
 * How this browser installs the site:
 * - `installed`: already opened as the app (or just installed): nothing to offer;
 * - `prompt`: the browser's own install dialog is ready (Chrome, Edge, Samsung, Android);
 * - `ios`: iPhone and iPad, from the Share menu («Add to Home Screen»);
 * - `mac`: Safari on a Mac, from the File menu («Add to Dock»);
 * - `other`: from the browser's own menu.
 * `null` until the page has looked (the server cannot know).
 */
export type InstallWay = 'installed' | 'prompt' | 'ios' | 'mac' | 'other';

function detect(): InstallWay {
  const standalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: window-controls-overlay)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  if (standalone) return 'installed';
  if (window.__dhikrInstall) return 'prompt';
  const ua = navigator.userAgent;
  const ipad = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  if (/iPhone|iPad|iPod/.test(ua) || ipad) return 'ios';
  if (/Macintosh/.test(ua) && /Safari\//.test(ua) && !/Chrome|Chromium|Edg|Firefox|OPR/.test(ua)) return 'mac';
  return 'other';
}

export function useInstall() {
  const [way, setWay] = useState<InstallWay | null>(null);

  useEffect(() => {
    const update = () => setWay(detect());
    update();
    const installed = () => {
      window.__dhikrInstall = null;
      setWay('installed');
    };
    window.addEventListener('dhikr-installable', update);
    window.addEventListener('appinstalled', installed);
    return () => {
      window.removeEventListener('dhikr-installable', update);
      window.removeEventListener('appinstalled', installed);
    };
  }, []);

  /** Opens the browser's dialog; true when there was one to open. */
  const prompt = useCallback(async () => {
    const offer = window.__dhikrInstall;
    if (!offer) return false;
    await offer.prompt();
    const { outcome } = await offer.userChoice;
    window.__dhikrInstall = null;
    setWay(outcome === 'accepted' ? 'installed' : detect());
    return true;
  }, []);

  return { way, prompt };
}
