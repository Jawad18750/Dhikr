'use client';

import { useActionState, useEffect, useRef } from 'react';
import { IoMailOutline } from 'react-icons/io5';
import { useIntl } from 'react-intl';

import { type EmailState, sendEmailLink, signInWithGoogle } from '@/app/(ar)/account/actions';

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: Record<string, unknown>) => string;
      reset: (id?: string) => void;
    };
  }
}


/** Signing in: Google in one tap, or a one-time link by email (behind Turnstile). */
export function AccountSignIn({ next, siteKey }: { next: string; siteKey: string }) {
  const { formatMessage, locale } = useIntl();
  const t = (id: string) => formatMessage({ id });
  const [state, action, pending] = useActionState<EmailState, FormData>(sendEmailLink, { status: 'idle' });
  const box = useRef<HTMLDivElement>(null);
  const widget = useRef<string | undefined>(undefined);

  useEffect(() => {
    const render = () => {
      if (!box.current || !window.turnstile || widget.current) return;
      widget.current = window.turnstile.render(box.current, {
        sitekey: siteKey,
        language: locale,
        theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
        size: 'flexible',
      });
    };
    if (window.turnstile) render();
    else {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.onload = render;
      document.head.append(script);
    }
  }, [siteKey, locale]);

  useEffect(() => {
    if (state.status !== 'idle' && state.status !== 'sent') window.turnstile?.reset(widget.current);
  }, [state]);

  return (
    <div className="flex w-full max-w-[440px] flex-col gap-5">
      <form action={signInWithGoogle}>
        <input type="hidden" name="next" value={next} />
        <button
          type="submit"
          className="flex h-[52px] w-full items-center justify-center gap-3 rounded-full border-[1.5px] border-border bg-surface text-[16px] font-bold text-ink transition-colors hover:border-border-strong"
        >
          <svg aria-hidden="true" viewBox="0 0 48 48" className="h-5 w-5">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.5z" />
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 38.2 44 33 44 24c0-1.3-.1-2.6-.4-3.5z" />
          </svg>
          {t('account.google')}
        </button>
      </form>

      <div className="flex items-center gap-3 text-[13px] text-ink-subtle">
        <span className="h-px flex-1 bg-border" />
        {t('account.orEmail')}
        <span className="h-px flex-1 bg-border" />
      </div>

      {state.status === 'sent' ? (
        <p role="status" className="rounded-[18px] bg-gold/10 px-4 py-3.5 text-[15px] leading-[1.8] text-ink">
          {t('account.sent')}
        </p>
      ) : (
        <form action={action} className="flex flex-col gap-3">
          <input type="hidden" name="next" value={next} />
          <label className="flex h-[52px] items-center gap-2.5 rounded-full border border-border bg-surface px-4 focus-within:border-border-strong">
            <IoMailOutline className="h-5 w-5 shrink-0 text-ink-muted" aria-hidden="true" />
            <span className="sr-only">{t('account.emailLabel')}</span>
            <input
              type="email"
              name="email"
              required
              dir="ltr"
              autoComplete="email"
              placeholder="you@example.com"
              className="h-full min-w-0 flex-1 border-0 bg-transparent p-0 text-left text-[16px] text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-0"
            />
          </label>
          <div ref={box} className="min-h-[65px]" />
          <button
            type="submit"
            disabled={pending}
            className="h-[52px] rounded-full bg-gradient-to-b from-gold-light to-gold text-[16px] font-bold text-[#1b1712] transition-opacity disabled:opacity-60"
          >
            {t('account.sendLink')}
          </button>
          {state.status !== 'idle' && (
            <p role="alert" className="text-[14px] text-danger">
              {t(`account.${state.status}`)}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
