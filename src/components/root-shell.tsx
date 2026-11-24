import { Inter, Noto_Sans_Arabic } from 'next/font/google';
import localFont from 'next/font/local';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

import { EnabledSourcesCookieSync } from '@/components/enabled-sources-cookie-sync';
import FullscreenController from '@/components/fullscreen-controller';
import HtmlWrapper from '@/components/html-wrapper';
import IntlProviderWrapper from '@/components/intl-provider-wrapper';
import OfflineRedirect from '@/components/offline-redirect';
import PwaUpdater from '@/components/pwa-updater';
import ReciterRouteCookie from '@/components/reciter-route-cookie';
import { ServiceWorkerRefresh } from '@/components/service-worker-refresh';
import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
import { PlayerProvider } from '@/components/site/site-player';
import StoragePersist from '@/components/storage-persist';
import { websiteGraph } from '@/lib/seo/json-ld';
import { isRtl, type SeoLocale } from '@/lib/seo/routes';
import { MESSAGES } from '@/locales';

// Thmanyah ships inside the build (hashed, unmodified files), never from a
// public folder: its licence allows web use only as part of a packaged
// product and forbids offering the font files for download. The licence
// travels with the files in src/fonts/thmanyah.
const thmanyah = localFont({
  src: [
    { path: '../fonts/thmanyah/thmanyahsans-Regular.woff2', weight: '400' },
    { path: '../fonts/thmanyah/thmanyahsans-Medium.woff2', weight: '500' },
    { path: '../fonts/thmanyah/thmanyahsans-Bold.woff2', weight: '700' },
    { path: '../fonts/thmanyah/thmanyahsans-Black.woff2', weight: '900' },
  ],
  variable: '--font-thmanyah',
  display: 'swap',
  preload: true,
});

// Urdu and Persian letters (ی ک گ ے ٹ …) are not in Thmanyah: those two languages take
// Noto Sans Arabic in its place, under the same variable. Not preloaded, so no other
// page ever downloads it.
const notoArabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  variable: '--font-thmanyah',
  display: 'swap',
  preload: false,
});

// Inter for every Latin character, digits included, in Arabic text and English alike:
// it carries only the Latin range, so Arabic letters fall through to Thmanyah
// (tailwind.config: Inter first, then Thmanyah).
const inter = Inter({
  // Latin, Turkish and Malay accents, and Cyrillic for Russian; Bengali has its own system face.
  subsets: ['latin', 'latin-ext', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
  // No generated fallback face: it is Arial, which has Arabic letters, and would draw
  // Arabic before Thmanyah is reached. Whatever Inter's Latin range does not cover goes
  // straight to Thmanyah.
  adjustFontFallback: false,
  fallback: [],
});

/**
 * The document shell shared by the three locale root layouts.
 *
 * The locale is a route-group constant, so this tree has no request-dependent
 * API and each page can be prerendered.
 */
export function RootShell({
  locale,
  children,
}: {
  locale: SeoLocale;
  children: React.ReactNode;
}) {
  return (
    <NuqsAdapter>
      <IntlProviderWrapper initialLocale={locale} messages={MESSAGES[locale]}>
        <HtmlWrapper>
          <body
            suppressHydrationWarning
            className={`${isRtl(locale) && locale !== 'ar' ? notoArabic.variable : thmanyah.variable} ${inter.variable} min-h-full bg-background font-sans antialiased`}
          >
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-gray-900 focus:shadow-lg dark:focus:bg-gray-800 dark:focus:text-gray-100"
            >
              {MESSAGES[locale]['a11y.skip']}
            </a>
            {/* Chrome offers the install once, often before the page is interactive: keep
                the offer for the install button (hooks/use-install.ts). */}
            <script
              dangerouslySetInnerHTML={{
                __html:
                  "addEventListener('beforeinstallprompt',function(e){e.preventDefault();window.__dhikrInstall=e;dispatchEvent(new Event('dhikr-installable'))})",
              }}
            />
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(websiteGraph({ locale })).replace(
                  /</g,
                  '\\u003c'
                ),
              }}
            />
            <main
              id="main-content"
              tabIndex={-1}
              className="relative flex min-h-dvh w-full flex-col bg-background text-foreground"
            >
              <EnabledSourcesCookieSync />
              <ReciterRouteCookie />
              <StoragePersist />
              <OfflineRedirect />
              {process.env.NEXT_PUBLIC_IS_PREVIEW === 'true' ? (
                <ServiceWorkerRefresh />
              ) : (
                <PwaUpdater />
              )}
              <PlayerProvider>
                <FullscreenController
                  header={<SiteHeader locale={locale} />}
                  footer={<SiteFooter locale={locale} />}
                >
                  {children}
                </FullscreenController>
              </PlayerProvider>
            </main>
          </body>
        </HtmlWrapper>
      </IntlProviderWrapper>
    </NuqsAdapter>
  );
}
