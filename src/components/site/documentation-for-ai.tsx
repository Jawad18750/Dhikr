'use client';

import { useState } from 'react';
import { IoCheckmark, IoCopyOutline, IoOpenOutline } from 'react-icons/io5';

const PROMPT =
  'Read the Dhikr API documentation at https://dhikr.ly/developers.md and help me use it.';

/**
 * The documentation handed to an AI assistant: copied as Markdown, or opened in Claude or
 * ChatGPT with a prompt that points at it.
 */
const LABELS = {
  ar: { copy: 'نسخ للذكاء الاصطناعي', copied: 'نُسخت', open: 'افتح في' },
  en: { copy: 'Copy for AI', copied: 'Copied', open: 'Open in' },
} as const;

export function DocumentationForAi({ lang = 'ar', onLight = false }: { lang?: keyof typeof LABELS; onLight?: boolean }) {
  const [copied, setCopied] = useState(false);
  const label = LABELS[lang];
  const pill = onLight
    ? 'flex h-10 items-center gap-2 rounded-full border border-border px-4 text-[14px] font-bold text-ink transition-colors hover:border-border-strong'
    : 'flex h-10 items-center gap-2 rounded-full bg-on-hero/[0.08] px-4 text-[14px] font-bold text-on-hero transition-colors hover:bg-on-hero/15';
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        className={pill}
        onClick={async () => {
          const text = await fetch('/developers.md').then((r) => r.text()).catch(() => '');
          if (!text) return;
          await navigator.clipboard.writeText(text);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 2000);
        }}
      >
        {copied ? <IoCheckmark className="h-4 w-4" aria-hidden="true" /> : <IoCopyOutline className="h-4 w-4" aria-hidden="true" />}
        {copied ? label.copied : label.copy}
      </button>
      <a href={`https://claude.ai/new?q=${encodeURIComponent(PROMPT)}`} target="_blank" rel="noopener noreferrer" className={pill}>
        <IoOpenOutline className="h-4 w-4" aria-hidden="true" />
        {label.open} Claude
      </a>
      <a href={`https://chatgpt.com/?q=${encodeURIComponent(PROMPT)}`} target="_blank" rel="noopener noreferrer" className={pill}>
        <IoOpenOutline className="h-4 w-4" aria-hidden="true" />
        {label.open} ChatGPT
      </a>
    </div>
  );
}
