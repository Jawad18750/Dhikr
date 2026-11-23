'use client';

import { useEffect, useRef, useState } from 'react';

import type { MenuLink } from './site-menu';

type Pill = { left: number; width: number } | null;

/**
 * The bar's sections on wider screens. A soft pill glides under the link the
 * pointer is on and, when it is elsewhere, rests under the section being read
 * (followed as the page scrolls) or the page that is open.
 */
export function SiteNav({ links, label }: { links: MenuLink[]; label: string }) {
  const navRef = useRef<HTMLElement>(null);
  const linkReferences = useRef<(HTMLAnchorElement | null)[]>([]);
  const [hovered, setHovered] = useState<number | null>(null);
  const [active, setActive] = useState<number | null>(null);
  const [pill, setPill] = useState<Pill>(null);

  // The section in view (by its #hash), or the page (by its path).
  useEffect(() => {
    const byPath = links.findIndex(
      (link) =>
        !link.href.includes('#') &&
        window.location.pathname.replace(/\/$/, '') ===
          link.href.replace(/\/$/, '')
    );
    if (byPath !== -1) {
      setActive(byPath);
      return;
    }
    const sections = links
      .map((link, index) => {
        const hash = link.href.split('#')[1];
        const element = hash ? document.getElementById(hash) : null;
        return element ? { element, index } : null;
      })
      .filter((item): item is { element: HTMLElement; index: number } =>
        Boolean(item)
      );
    if (sections.length === 0) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      // The last section whose top has passed the upper third of the screen.
      const line = window.innerHeight / 3;
      let current: number | null = null;
      for (const { element, index } of sections) {
        const rect = element.getBoundingClientRect();
        if (rect.top <= line && rect.bottom > line) current = index;
      }
      setActive(current);
    };
    const request = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', request);
      window.removeEventListener('resize', request);
    };
  }, [links]);

  // The pill follows the hovered link, else the active one.
  const target = hovered ?? active;
  useEffect(() => {
    const place = () => {
      const nav = navRef.current;
      const link = target === null ? null : linkReferences.current[target];
      if (!nav || !link) {
        setPill(null);
        return;
      }
      const box = nav.getBoundingClientRect();
      const rect = link.getBoundingClientRect();
      setPill({ left: rect.left - box.left, width: rect.width });
    };
    place();
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  }, [target]);

  return (
    <nav
      ref={navRef}
      aria-label={label}
      onMouseLeave={() => setHovered(null)}
      className="relative flex items-center gap-1 text-base font-medium"
    >
      <span
        aria-hidden="true"
        className="site-nav-pill pointer-events-none absolute inset-y-0 text-ink"
        style={{
          left: pill?.left ?? 0,
          width: pill?.width ?? 0,
          opacity: pill ? 1 : 0,
        }}
      >
        <span className="block h-full w-full rounded-full bg-current opacity-[0.08]" />
      </span>
      {links.map((link, index) => (
        <a
          key={link.href}
          ref={(element) => {
            linkReferences.current[index] = element;
          }}
          href={link.href}
          aria-current={active === index ? 'true' : undefined}
          onMouseEnter={() => setHovered(index)}
          onFocus={() => setHovered(index)}
          onBlur={() => setHovered(null)}
          className="site-nav-link relative flex h-10 items-center gap-1.5 whitespace-nowrap rounded-full px-4 text-ink"
        >
          <span className="site-nav-icon">{link.icon}</span>
          {link.label}
        </a>
      ))}
    </nav>
  );
}
