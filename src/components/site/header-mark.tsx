'use client';

import { useEffect, useState } from 'react';

import { LogoMark3D } from './logo-mark-3d';

/**
 * The header's mark on every page but the home: the 3D mark, small, gold and
 * turning. On the home the hero's own mark flies or docks into this slot, so
 * nothing is drawn here there.
 */
export function HeaderMark({ label }: { label: string }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    setShow(!document.querySelector('[data-mark-anchor]'));
  }, []);
  if (!show) return null;
  return <LogoMark3D badge label={label} className="h-9 w-9 shrink-0 sm:h-11 sm:w-11" />;
}
