'use client';

import { useEffect, useState } from 'react';

export type ContentsItem = { id: string; title: string; group: string; badge?: string };

/**
 * The documentation's frame: a reading-progress bar under the header, and a contents
 * list that marks the section on screen (a sticky column on wide screens, a folding list
 * above the text on phones).
 */
export function DocumentationShell({ toc, children }: { toc: ContentsItem[]; children: React.ReactNode }) {
  const [progress, setProgress] = useState(0);
  const [current, setCurrent] = useState(toc[0]?.id ?? '');

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    const seen = new IntersectionObserver(
      (entries) => {
        const top = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (top) setCurrent(top.target.id);
      },
      { rootMargin: '-90px 0px -65% 0px' }
    );
    for (const item of toc) {
      const node = document.getElementById(item.id);
      if (node) seen.observe(node);
    }
    return () => {
      window.removeEventListener('scroll', onScroll);
      seen.disconnect();
    };
  }, [toc]);

  const groups = [...new Set(toc.map((item) => item.group))];
  const list = (onPick?: () => void) => (
    <nav aria-label="المحتويات" className="flex flex-col gap-5">
      {groups.map((group) => (
        <div key={group} className="flex flex-col gap-1">
          <span className="px-3 pb-1 text-[12px] font-bold text-ink-subtle">{group}</span>
          {toc
            .filter((item) => item.group === group)
            .map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                // On a phone the list folds away once a section is picked.
                onClick={(event) => {
                  event.currentTarget.closest('details')?.removeAttribute('open');
                  onPick?.();
                }}
                aria-current={current === item.id ? 'location' : undefined}
                className={`flex items-center justify-between gap-2 rounded-[12px] px-3 py-1.5 text-[14.5px] transition-colors ${
                  current === item.id
                    ? 'bg-surface-sunken font-bold text-ink'
                    : 'text-ink-muted hover:bg-surface-sunken/60 hover:text-ink'
                }`}
              >
                <span>{item.title}</span>
                {item.badge && (
                  <span className="shrink-0 rounded-full bg-gold/15 px-2 py-0.5 text-[11px] font-bold text-gold">
                    {item.badge}
                  </span>
                )}
              </a>
            ))}
        </div>
      ))}
    </nav>
  );

  return (
    <>
      <div aria-hidden="true" className="fixed inset-x-0 top-0 z-[70] h-[3px] bg-transparent">
        <div
          className="h-full origin-[right] bg-gradient-to-l from-gold-light to-gold transition-transform duration-150 ltr:origin-left"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>
      <div className="mx-auto grid w-full max-w-[1180px] grid-cols-1 gap-8 px-4 pb-20 pt-6 sm:px-6 sm:pt-10 lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-12">
        <aside className="hidden lg:block">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pb-6">{list()}</div>
        </aside>
        <div className="flex min-w-0 flex-col gap-10">
          <details className="group rounded-[20px] border border-border bg-surface p-4 lg:hidden">
            <summary className="cursor-pointer list-none text-[15px] font-bold text-ink">
              تصفّح التوثيق
              <span className="ms-2 text-ink-subtle transition-transform group-open:rotate-90">›</span>
            </summary>
            <div className="pt-4">{list()}</div>
          </details>
          {children}
        </div>
      </div>
    </>
  );
}
