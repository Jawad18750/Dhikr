'use client';

import { useState } from 'react';
import { FaFacebookF, FaTelegram, FaWhatsapp, FaXTwitter } from 'react-icons/fa6';
import { IoCheckmark, IoLinkOutline } from 'react-icons/io5';

/** A page shared where people share it: WhatsApp, Telegram, X, Facebook, or its link copied. */
export function ShareRow({ title, label, copied }: { title: string; label: string; copied: string }) {
  const [done, setDone] = useState(false);
  const here = () => (typeof window === 'undefined' ? '' : window.location.href);
  const open = (make: (url: string, text: string) => string) => () =>
    window.open(make(encodeURIComponent(here()), encodeURIComponent(title)), '_blank', 'noopener,noreferrer');
  const button =
    'flex h-10 w-10 items-center justify-center rounded-full border border-border text-ink-muted transition-colors hover:border-border-strong hover:text-ink';
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="me-1 text-[14px] text-ink-subtle">{label}</span>
      <button type="button" aria-label="WhatsApp" className={button} onClick={open((u, t) => `https://wa.me/?text=${t}%20${u}`)}>
        <FaWhatsapp className="h-[18px] w-[18px]" aria-hidden="true" />
      </button>
      <button type="button" aria-label="Telegram" className={button} onClick={open((u, t) => `https://t.me/share/url?url=${u}&text=${t}`)}>
        <FaTelegram className="h-[18px] w-[18px]" aria-hidden="true" />
      </button>
      <button type="button" aria-label="X" className={button} onClick={open((u, t) => `https://x.com/intent/post?url=${u}&text=${t}`)}>
        <FaXTwitter className="h-[16px] w-[16px]" aria-hidden="true" />
      </button>
      <button type="button" aria-label="Facebook" className={button} onClick={open((u) => `https://www.facebook.com/sharer/sharer.php?u=${u}`)}>
        <FaFacebookF className="h-[16px] w-[16px]" aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label={copied}
        className={button}
        onClick={() => {
          void navigator.clipboard.writeText(here());
          setDone(true);
          window.setTimeout(() => setDone(false), 1800);
        }}
      >
        {done ? <IoCheckmark className="h-[18px] w-[18px]" aria-hidden="true" /> : <IoLinkOutline className="h-[18px] w-[18px]" aria-hidden="true" />}
      </button>
    </div>
  );
}
