'use client';

import { useIntl } from 'react-intl';

/** What «ذكر» is: one opening line, four short sections, and the questions. */
const SECTIONS = ['reciter', 'mushaf', 'data', 'sources'] as const;

export default function AboutPage() {
  const { formatMessage } = useIntl();
  const t = (id: string) => formatMessage({ id });

  return (
    <article className="mx-auto flex w-full max-w-[760px] flex-col gap-12 px-4 pb-16 pt-10 sm:px-6 sm:pt-16">
      <header className="flex flex-col gap-5">
        <h1 className="font-display text-[36px] font-black leading-[1.3] text-ink sm:text-[52px]">
          {t('about.title')}
        </h1>
        <p className="text-lg leading-[1.9] text-ink-muted sm:text-[21px]">
          {t('about.description')}
        </p>
      </header>

      <div className="flex flex-col gap-10">
        {SECTIONS.map((key) => (
          <section key={key} className="flex flex-col gap-3">
            <h2 className="text-[22px] font-bold leading-[1.4] text-ink sm:text-2xl">
              {t(`about.${key}.title`)}
            </h2>
            <p className="text-[17px] leading-[1.9] text-ink-muted">{t(`about.${key}.body`)}</p>
          </section>
        ))}
      </div>

      <section className="flex flex-col gap-6 border-t border-border pt-10">
        <h2 className="text-[22px] font-bold leading-[1.4] text-ink sm:text-2xl">
          {t('about.faq.title')}
        </h2>
        <dl className="flex flex-col gap-6">
          {[1, 2, 3, 4].map((number) => (
            <div key={number} className="flex flex-col gap-1.5">
              <dt className="text-[17px] font-bold text-ink">{t(`about.faq.q${number}`)}</dt>
              <dd className="text-[17px] leading-[1.8] text-ink-muted">
                {t(`about.faq.a${number}`)}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </article>
  );
}
