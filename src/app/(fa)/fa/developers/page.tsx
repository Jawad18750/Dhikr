import Link from 'next/link';

import { DocumentationForAi } from '@/components/site/documentation-for-ai';
import { Markdown } from '@/components/site/markdown';
import { API_DOCS_LANG, API_DOCS_MARKDOWN } from '@/lib/api-documentation';
import { withLocale } from '@/lib/seo/routes';

export const metadata = {
  title: 'API documentation | Dhikr',
  description:
    'The Dhikr API: reciters and surahs, the timing of every ayah and word, the Qalun text, and Hafs↔Qalun numbering. JSON, free, with a personal key.',
  robots: { index: false, follow: true },
  alternates: { canonical: '/developers' },
};

/**
 * The developers' documentation in English, for every language but Arabic (which has its
 * own page): the same text /developers.md serves, rendered.
 */
export default function Page() {
  return (
    <article dir="ltr" lang={API_DOCS_LANG} className="mx-auto flex w-full max-w-[860px] flex-col gap-5 px-4 pb-20 pt-6 text-start sm:px-6 sm:pt-10">
      <div className="flex flex-wrap gap-2">
        <Link
          href={withLocale('fa', '/account')}
          className="flex h-11 items-center rounded-full bg-gradient-to-b from-gold-light to-gold px-5 text-[15px] font-bold text-[#1b1712]"
        >
          Get a key
        </Link>
        <a
          href="/developers.md"
          className="flex h-11 items-center rounded-full border border-border px-5 text-[15px] font-bold text-ink"
        >
          Markdown
        </a>
      </div>
      <DocumentationForAi lang={API_DOCS_LANG} onLight />
      <Markdown source={API_DOCS_MARKDOWN} />
    </article>
  );
}
