import Link from 'next/link';
import {
  IoCloudDownloadOutline,
  IoCodeSlashOutline,
  IoKeyOutline,
  IoLogOutOutline,
  IoStatsChartOutline,
  IoTerminalOutline,
} from 'react-icons/io5';

import { signOutNow } from '@/app/(ar)/account/actions';
import { auth } from '@/auth';
import { AccountKeys } from '@/components/site/account-keys';
import { AccountSignIn } from '@/components/site/account-sign-in';
import { CardMark } from '@/components/site/logo-mark';
import { listKeys, usageOf } from '@/lib/account';
import { type SeoLocale, withLocale } from '@/lib/seo/routes';
import { MESSAGES } from '@/locales';

type Query = { next?: string; sent?: string; error?: string };

/**
 * The account: signing in (Google, or a link by email), then the personal API keys and
 * what the account used. Listening and reading never need it.
 */
export async function AccountPage({ locale, query }: { locale: SeoLocale; query: Query }) {
  const t = MESSAGES[locale];
  const next =
    query.next?.startsWith('/') && !query.next.startsWith('//') ? query.next : withLocale(locale, '/account');
  const session = await auth();
  const userId = Number(session?.user?.id);

  return (
    <div className="mx-auto flex w-full max-w-[880px] flex-col gap-6 px-4 pb-16 pt-6 text-foreground sm:gap-8 sm:px-6 sm:pt-10">
      {session?.user ? (
        <AccountBody
          locale={locale}
          userId={userId}
          name={session.user.name ?? null}
          email={session.user.email ?? ''}
          image={session.user.image ?? null}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-[1.1fr_1fr] md:items-start">
          <section
            data-header-tone="dark"
            className="relative isolate flex flex-col gap-5 overflow-hidden rounded-[28px] bg-hero p-6 text-on-hero sm:rounded-[36px] sm:p-8"
          >
            <CardMark />
            <h1 className="font-display text-[32px] font-black leading-[1.25] sm:text-[42px]">{t['account.heroTitle']}</h1>
            <p className="text-[16px] leading-[1.85] text-on-hero/70">
              {t['account.heroBody']}
            </p>
            <ul className="flex flex-col gap-3">
              {[
                [IoKeyOutline, t['account.perkKey'], t['account.perkKeyBody']],
                [IoCloudDownloadOutline, t['account.perkDownload'], t['account.perkDownloadBody']],
                [IoStatsChartOutline, t['account.perkUsage'], t['account.perkUsageBody']],
              ].map(([Icon, title, body]) => {
                const I = Icon as typeof IoKeyOutline;
                return (
                  <li key={title as string} className="flex gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-on-hero/10 text-hero-gold">
                      <I className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="flex flex-col">
                      <span className="text-[16px] font-bold">{title as string}</span>
                      <span className="text-[14px] text-on-hero/60">{body as string}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
          <section className="flex flex-col gap-5 rounded-[28px] border border-border bg-surface p-6 sm:p-8">
            <h2 className="font-display text-[24px] font-black text-ink">{t['account.signInTitle']}</h2>
            <AccountSignIn next={next} siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ''} />
            {query.error && (
              <p role="alert" className="text-[14px] text-danger">
                {t['account.linkError']}
              </p>
            )}
            <p className="text-[13px] leading-[1.7] text-ink-subtle">
              {t['account.consent']}{' '}
              <Link href={withLocale(locale, '/privacy')} className="underline">
                {t['account.privacyLink']}
              </Link>
              .
            </p>
          </section>
        </div>
      )}
    </div>
  );
}

async function AccountBody({
  locale,
  userId,
  name,
  email,
  image,
}: {
  locale: SeoLocale;
  userId: number;
  name: string | null;
  email: string;
  image: string | null;
}) {
  const [keys, usage] = await Promise.all([listKeys(userId), usageOf(userId)]);
  const t = MESSAGES[locale];
  const number = new Intl.NumberFormat(locale === 'ar' ? 'ar-u-nu-latn' : locale);
  const panel = 'flex flex-col gap-5 rounded-[28px] border border-border bg-surface p-5 sm:p-7';
  const title = 'flex items-center gap-2.5 font-display text-[22px] font-black text-ink sm:text-[26px]';
  return (
    <>
      <section
        data-header-tone="dark"
        className="relative isolate flex flex-col gap-6 overflow-hidden rounded-[28px] bg-hero p-5 text-on-hero sm:rounded-[36px] sm:p-8"
      >
        <CardMark />
        <div className="flex items-start gap-4">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt="" referrerPolicy="no-referrer" className="h-16 w-16 shrink-0 rounded-[20px] shadow-[0_0_0_3px_rgba(230,196,122,0.3)] sm:h-20 sm:w-20" />
          ) : (
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[20px] bg-on-hero/10 font-display text-3xl font-black text-hero-gold shadow-[0_0_0_3px_rgba(230,196,122,0.3)] sm:h-20 sm:w-20">
              {(name ?? email).charAt(0).toUpperCase()}
            </span>
          )}
          <span className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="font-display text-[26px] font-black leading-tight sm:text-[34px]">{name ?? t['account.fallbackName']}</span>
            <span dir="ltr" className="break-all text-end text-[14px] text-on-hero/60">{email}</span>
          </span>
          <form action={signOutNow}>
            <button
              type="submit"
              aria-label={t['account.signOut']}
              className="flex h-10 items-center gap-1.5 rounded-full border border-on-hero/20 px-3 text-[14px] text-on-hero/80 transition-colors hover:border-on-hero/40 hover:text-on-hero"
            >
              <IoLogOutOutline className="h-[17px] w-[17px]" aria-hidden="true" />
              <span className="hidden sm:inline">{t['account.signOut']}</span>
            </button>
          </form>
        </div>
        <dl className="grid grid-cols-3 divide-x divide-on-hero/10 rounded-[18px] bg-on-hero/[0.06] py-3 rtl:divide-x-reverse sm:py-4">
          {[
            [t['account.statCalls'], usage.calls, IoCodeSlashOutline],
            [t['account.statDownloads'], usage.downloads, IoCloudDownloadOutline],
            [t['account.statKeys'], keys.length, IoKeyOutline],
          ].map(([label, value, Icon]) => {
            const I = Icon as typeof IoKeyOutline;
            return (
              <div key={label as string} className="flex flex-col items-center gap-0.5 px-1 text-center">
                <dt className="order-last flex flex-col items-center gap-0.5 text-[11px] leading-tight text-on-hero/55 sm:flex-row sm:gap-1 sm:text-[13px]">
                  <I className="h-3.5 w-3.5 text-hero-gold/80" aria-hidden="true" />
                  {label as string}
                </dt>
                <dd className="text-[18px] font-bold tabular-nums sm:text-[24px]">{number.format(value as number)}</dd>
              </div>
            );
          })}
        </dl>
        <span className="text-[12px] text-on-hero/45">{t['account.statsNote']}</span>
      </section>

      <section className={panel}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className={title}>
            <IoKeyOutline className="h-6 w-6 text-gold" aria-hidden="true" />
            {t['account.keysTitle']}
          </h2>
          <Link
            href={withLocale(locale, '/developers')}
            className="flex h-10 items-center gap-2 rounded-full border border-border px-4 text-[14px] font-bold text-ink hover:border-border-strong"
          >
            <IoCodeSlashOutline className="h-[17px] w-[17px]" aria-hidden="true" />
            {t['account.docs']}
          </Link>
        </div>
        <AccountKeys
          keys={keys.map((k) => ({
            id: k.id,
            name: k.name,
            prefix: k.prefix,
            created: k.created_at.toISOString(),
            lastUsed: k.last_used_at?.toISOString() ?? null,
          }))}
        />
      </section>

      <section className={panel}>
        <h2 className={title}>
          <IoTerminalOutline className="h-6 w-6 text-gold" aria-hidden="true" />
          {t['account.tryTitle']}
        </h2>
        <pre dir="ltr" className="overflow-x-auto rounded-2xl bg-[#0b0b0c] p-4 text-left font-mono text-[13px] leading-[1.8] text-white">{`curl https://dhikr.ly/api/v1/reciters \
  -H "Authorization: Bearer dk_…"`}</pre>
        {usage.byPath.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-[14px] font-bold text-ink">{t['account.mostRequested']}</span>
            <ul dir="ltr" className="flex flex-col gap-1.5 font-mono text-[13px] text-ink-muted">
              {usage.byPath.map((row) => (
                <li key={row.path} className="flex justify-between gap-4 border-b border-border pb-1.5 last:border-0">
                  <span className="truncate">{row.path}</span>
                  <span className="tabular-nums">{row.count}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </>
  );
}
