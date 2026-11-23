'use client';

import { useEffect, useRef, useState } from 'react';

type Tone = 'top' | 'light' | 'dark';

/**
 * The sticky bar around the site header. It looks at what passes behind it:
 * over a section marked `data-header-tone="dark"` (the black cards) it turns
 * to dark glass with light ink, over the page to light glass with dark ink,
 * and at the very top it is clear. Before the script runs it is light glass,
 * so it is never clear over a photo.
 */
export function HeaderShell({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [tone, setTone] = useState<Tone>('light');

  useEffect(() => {
    const shell = ref.current;
    if (!shell) return;
    const update = () => {
      if (window.scrollY < 4) {
        setTone('top');
        return;
      }
      // The line through the middle of the bar decides.
      const line = shell.getBoundingClientRect().height / 2;
      const dark = [
        ...document.querySelectorAll<HTMLElement>('[data-header-tone="dark"]'),
      ].some((section) => {
        const rect = section.getBoundingClientRect();
        return rect.top <= line && rect.bottom >= line;
      });
      setTone(dark ? 'dark' : 'light');
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <div
      ref={ref}
      data-tone={tone}
      className="header-shell sticky top-0 z-50 w-full transition-[background-color,box-shadow] duration-300"
    >
      {children}
    </div>
  );
}
