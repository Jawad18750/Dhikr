import ContactPage from '@/components/pages/contact-page';
import { breadcrumbTrail } from '@/lib/seo/json-ld';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { type SeoLocale, withLocale } from '@/lib/seo/routes';
import { BRAND, SITE } from '@/lib/seo/site';
import { MESSAGES } from '@/locales';

const COPY = MESSAGES;

export const contactMetadata = (locale: SeoLocale) => {
  const copy = COPY[locale];

  return buildPageMetadata({
    locale,
    path: '/contact',
    title: `${copy['contact.contact_us']} | ${BRAND[locale]}`,
    description: copy['contact.contact_us'],
  });
};

export function ContactRoute({ locale }: { locale: SeoLocale }) {
  const copy = COPY[locale];
  const breadcrumb = breadcrumbTrail([
    {
      name: locale === 'ar' ? 'الرئيسية' : 'Home',
      url: `${SITE.url}${withLocale(locale, '/')}`,
    },
    {
      name: copy['contact.contact_us'],
      url: `${SITE.url}${withLocale(locale, '/contact')}`,
    },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumb).replace(/</g, '\\u003c'),
        }}
      />
      <ContactPage />
    </>
  );
}
