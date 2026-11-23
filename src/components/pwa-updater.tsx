'use client';

import { useEffect } from 'react';

/**
 * PwaUpdater
 *
 * Takes a new version quietly: when a new service worker is waiting, it is
 * told to take over, with no prompt and no reload. The page in hand carries
 * on (playback included); the next page load is the new version. The worker
 * is built with `skipWaiting: false` so this happens only from here.
 */
const PwaUpdater = () => {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    let cancelled = false;
    const activate = (worker: ServiceWorker | null) => {
      if (!cancelled) worker?.postMessage({ type: 'SKIP_WAITING' });
    };

    const watch = (registration: ServiceWorkerRegistration) => {
      // An update may already be waiting when the page loads.
      activate(registration.waiting);
      registration.addEventListener('updatefound', () => {
        const installing = registration.installing;
        installing?.addEventListener('statechange', () => {
          if (installing.state === 'installed') activate(installing);
        });
      });
    };

    navigator.serviceWorker
      .getRegistration()
      .then((registration) => {
        if (cancelled) return;
        if (registration) {
          watch(registration);
          return;
        }
        return navigator.serviceWorker.ready.then((ready) => {
          if (!cancelled) watch(ready);
        });
      })
      .catch(() => {
        /* no-op: the worker may not be registered yet in dev */
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
};

export default PwaUpdater;
