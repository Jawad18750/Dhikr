'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { IoCheckmarkCircle, IoCodeSlashOutline, IoLogoGithub, IoPaperPlaneOutline, IoPhonePortraitOutline } from 'react-icons/io5';
import { useIntl } from 'react-intl';

import { CardMark } from '@/components/site/logo-mark';
import { cn, isValidEmail } from '@/utils';

const TOPICS = ['general', 'text', 'reciter', 'api', 'apps'] as const;

/** Write to us: what it is about, the message, and the other ways in. */
export default function ContactPage() {
  const { formatMessage, locale } = useIntl();
  const t = (id: string) => formatMessage({ id });
  const [topic, setTopic] = useState<(typeof TOPICS)[number]>('general');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const send = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return setError(t('contact.please_enter_name'));
    if (!email.trim()) return setError(t('contact.please_enter_email'));
    if (!isValidEmail(email)) return setError(t('contact.please_enter_valid_email'));
    if (!message.trim()) return setError(t('contact.please_enter_message'));
    setError('');
    setLoading(true);
    try {
      const response = await fetch('/api/send-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message: `[${t(`contact.topic.${topic}`)}]\n\n${message}` }),
      });
      if (response.status === 200) setSent(true);
      else setError(t('contact.error_sending_message'));
    } catch {
      setError(t('contact.error_sending_message'));
    } finally {
      setLoading(false);
    }
  };

  const field = 'h-12 w-full rounded-2xl border border-border bg-background px-4 text-[16px] text-ink outline-none transition-colors placeholder:text-ink-subtle focus:border-border-strong';
  const label = 'mb-1.5 block text-[14px] font-bold text-ink';
  const home = locale === 'ar' ? '/' : `/${locale}`;

  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-6 px-4 pb-16 pt-6 text-foreground sm:px-6 sm:pt-10">
      <section data-header-tone="dark" className="relative isolate flex flex-col gap-3 overflow-hidden rounded-[28px] bg-hero p-6 text-on-hero sm:rounded-[36px] sm:p-9">
        <CardMark />
        <h1 className="font-display text-[32px] font-black leading-[1.25] sm:text-[46px]">{t('contact.contact_us')}</h1>
        <p className="max-w-[640px] text-[17px] leading-[1.85] text-on-hero/70">{t('contact.lead')}</p>
      </section>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <section className="rounded-[26px] border border-border bg-surface p-5 sm:p-7">
          {sent ? (
            <div className="flex flex-col items-center gap-4 py-10 text-center" role="status">
              <IoCheckmarkCircle className="h-16 w-16 text-gold" aria-hidden="true" />
              <p className="font-display text-[26px] font-black text-ink">{t('contact.thank_you_for_contacting')}</p>
              <p className="text-[15px] text-ink-muted">{t('contact.reply_note')}</p>
              <Link href={home} className="mt-2 flex h-11 items-center rounded-full bg-ink px-6 text-[15px] font-bold text-background hover:opacity-90">
                {t('contact.back_to_home')}
              </Link>
            </div>
          ) : (
            <form className="flex flex-col gap-5" onSubmit={send} noValidate>
              <fieldset>
                <legend className={label}>{t('contact.topic')}</legend>
                <div className="flex flex-wrap gap-2">
                  {TOPICS.map((id) => (
                    <button
                      key={id}
                      type="button"
                      aria-pressed={topic === id}
                      onClick={() => setTopic(id)}
                      className={cn(
                        'rounded-full px-4 py-2 text-[14px] font-bold transition-colors',
                        topic === id ? 'bg-ink text-background' : 'bg-surface-sunken text-ink hover:bg-border'
                      )}
                    >
                      {t(`contact.topic.${id}`)}
                    </button>
                  ))}
                </div>
              </fieldset>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className={label}>
                    {t('contact.name')}
                  </label>
                  <input id="name" type="text" autoComplete="name" maxLength={100} value={name} onChange={(e) => setName(e.target.value)} className={field} />
                </div>
                <div>
                  <label htmlFor="email" className={label}>
                    {t('contact.email')}
                  </label>
                  <input id="email" type="email" dir="ltr" autoComplete="email" maxLength={254} value={email} onChange={(e) => setEmail(e.target.value)} className={cn(field, 'text-start')} />
                </div>
              </div>
              <div>
                <label htmlFor="message" className={label}>
                  {t('contact.message')}
                </label>
                <textarea
                  id="message"
                  rows={7}
                  maxLength={5000}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t('contact.message_hint')}
                  className={cn(field, 'h-auto min-h-[180px] resize-y py-3 leading-[1.8]')}
                />
              </div>
              {error && (
                <p role="alert" className="rounded-2xl bg-red-500/10 px-4 py-3 text-[14px] font-bold text-red-600 dark:text-red-400">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-b from-gold-light to-gold px-6 text-[16px] font-bold text-[#1b1712] transition-opacity disabled:opacity-60"
              >
                <IoPaperPlaneOutline className="h-5 w-5 rtl:-scale-x-100" aria-hidden="true" />
                {loading ? t('contact.sending') : t('contact.send')}
              </button>
            </form>
          )}
        </section>

        <aside className="flex flex-col gap-3">
          <h2 className="text-[17px] font-bold text-ink">{t('contact.other_ways')}</h2>
          {[
            { href: 'https://adhan.dhikr.ly/support', icon: IoPhonePortraitOutline, title: t('contact.apps_support'), body: t('contact.apps_support_body') },
            { href: '/developers', icon: IoCodeSlashOutline, title: t('nav.developers'), body: t('contact.developers_body') },
            { href: 'https://github.com/Jawad18750/libya-prayer-times/issues', icon: IoLogoGithub, title: t('contact.dataset'), body: t('contact.dataset_body') },
          ].map(({ href, icon: Icon, title, body }) => (
            <a key={href} href={href} className="flex items-start gap-3 rounded-[20px] border border-border bg-surface p-4 transition-colors hover:border-border-strong">
              <span className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-surface-sunken text-gold">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="text-[15px] font-bold text-ink">{title}</span>
                <span className="text-[14px] leading-[1.7] text-ink-muted">{body}</span>
              </span>
            </a>
          ))}
          <p className="px-1 text-[13px] leading-[1.8] text-ink-subtle">{t('contact.privacy_note')}</p>
        </aside>
      </div>
    </div>
  );
}
