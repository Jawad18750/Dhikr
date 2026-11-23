'use client';

import { useActionState, useState } from 'react';
import { IoCheckmark, IoCopyOutline, IoKeyOutline, IoTrashOutline } from 'react-icons/io5';

import { createKey, deleteKey, type KeyState } from '@/app/(ar)/account/actions';

type Key = { id: number; name: string; prefix: string; created: string; lastUsed: string | null };

const day = (iso: string) =>
  new Intl.DateTimeFormat('ar-u-nu-latn', { dateStyle: 'medium' }).format(new Date(iso));

/** Personal API keys: make one (shown once), see when each was last used, revoke. */
export function AccountKeys({ keys }: { keys: Key[] }) {
  const [state, action, pending] = useActionState<KeyState, FormData>(createKey, {});
  const [copied, setCopied] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <form action={action} className="flex gap-2">
        <label className="flex h-12 min-w-0 flex-1 items-center rounded-full border border-border bg-background px-4 focus-within:border-border-strong">
          <span className="sr-only">اسم المفتاح</span>
          <input
            name="name"
            maxLength={60}
            placeholder="اسم المفتاح، مثل: تطبيق التحفيظ"
            className="h-full min-w-0 flex-1 border-0 bg-transparent p-0 text-[15px] text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-0"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="flex h-12 shrink-0 items-center gap-2 rounded-full bg-ink px-5 text-[15px] font-bold text-background disabled:opacity-60"
        >
          <IoKeyOutline className="h-[18px] w-[18px]" aria-hidden="true" />
          مفتاح جديد
        </button>
      </form>

      {state.key && (
        <div className="flex flex-col gap-3 rounded-[20px] border border-gold/60 bg-gold/[0.08] p-4">
          <p className="text-[14px] font-bold leading-[1.7] text-ink">
            هذا مفتاحك الجديد. انسخه الآن واحفظه في مكان آمن: لن يظهر مرة أخرى.
          </p>
          <code dir="ltr" className="break-all rounded-xl bg-surface px-3 py-3 text-left font-mono text-[14px] leading-[1.6] text-ink">
            {state.key}
          </code>
          <button
            type="button"
            onClick={() => {
              void navigator.clipboard.writeText(state.key ?? '');
              setCopied(true);
            }}
            className="flex h-11 items-center justify-center gap-2 rounded-full bg-ink text-[15px] font-bold text-background"
          >
            {copied ? <IoCheckmark className="h-[18px] w-[18px]" aria-hidden="true" /> : <IoCopyOutline className="h-[18px] w-[18px]" aria-hidden="true" />}
            {copied ? 'نُسخ' : 'نسخ المفتاح'}
          </button>
        </div>
      )}
      {state.error === 'too-many' && (
        <p className="text-[14px] text-danger">لك عشرة مفاتيح. احذف واحدًا لتصنع غيره.</p>
      )}

      {keys.length === 0 ? (
        <p className="text-[15px] text-ink-muted">لا مفاتيح بعد.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {keys.map((key) => (
            <li key={key.id} className="flex items-center gap-3 rounded-[18px] border border-border bg-background px-4 py-3">
              <IoKeyOutline className="h-5 w-5 shrink-0 text-ink-muted" aria-hidden="true" />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-[16px] font-bold text-ink">{key.name}</span>
                <span dir="ltr" className="text-end font-mono text-[13px] text-ink-subtle">{key.prefix}…</span>
                <span className="text-[13px] text-ink-subtle">
                  أُنشئ {day(key.created)}
                  {' · '}
                  {key.lastUsed ? `آخر استعمال ${day(key.lastUsed)}` : 'لم يُستعمل بعد'}
                </span>
              </span>
              <form action={deleteKey}>
                <input type="hidden" name="id" value={key.id} />
                <button
                  type="submit"
                  aria-label={`حذف المفتاح ${key.name}`}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-ink-subtle transition-colors hover:bg-surface-sunken hover:text-danger"
                >
                  <IoTrashOutline className="h-[18px] w-[18px]" aria-hidden="true" />
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
