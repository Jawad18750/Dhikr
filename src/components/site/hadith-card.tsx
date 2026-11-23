import Link from 'next/link';

import type { Hadith } from '@/lib/hadith';

const number = new Intl.NumberFormat('ar-u-nu-latn');

/** One hadith: its باب where it has one, the text, and where it is found. */
export function HadithCard({ slug, hadith, link = true }: { slug: string; hadith: Hadith; link?: boolean }) {
  return (
    <article id={`h-${hadith.number}`} className="flex scroll-mt-24 flex-col gap-3 rounded-[22px] border border-border bg-surface p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        {hadith.title ? <h3 className="text-[15px] font-bold leading-[1.7] text-ink-muted">{hadith.title}</h3> : <span />}
        {link ? (
          <Link
            href={`/hadith/${slug}/${hadith.number}`}
            className="shrink-0 rounded-full border border-border px-2.5 py-0.5 text-[13px] tabular-nums text-ink-subtle hover:border-border-strong hover:text-ink"
          >
            {number.format(hadith.number)}
          </Link>
        ) : (
          <span className="shrink-0 rounded-full border border-border px-2.5 py-0.5 text-[13px] tabular-nums text-ink-subtle">
            {number.format(hadith.number)}
          </span>
        )}
      </div>
      <p className="whitespace-pre-line text-[18px] leading-[2.1] text-ink">{hadith.text}</p>
      {(hadith.reference || hadith.narrator || hadith.grade) && (
        <p className="text-[13.5px] leading-[1.8] text-ink-subtle">
          {[hadith.narrator, hadith.grade, hadith.reference].filter(Boolean).join(' · ')}
        </p>
      )}
    </article>
  );
}
