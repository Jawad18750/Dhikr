// Server only: the client gets its own language's messages through RootShell.
import type { SeoLocale } from '@/lib/seo/routes';

import ar from './ar.json';
import bn from './bn.json';
import de from './de.json';
import en from './en.json';
import es from './es.json';
import fa from './fa.json';
import fr from './fr.json';
import id from './id.json';
import ms from './ms.json';
import ru from './ru.json';
import tr from './tr.json';
import ur from './ur.json';

export type Messages = Record<string, string>;

const RAW: Record<SeoLocale, Messages> = { ar, en, fr, de, es, tr, id, ms, ur, fa, bn, ru };

/**
 * Every language's messages, each over English so a key not yet translated shows in
 * English rather than as its id.
 */
export const MESSAGES = Object.fromEntries(
  Object.entries(RAW).map(([locale, messages]) => [locale, { ...en, ...messages }])
) as unknown as Record<SeoLocale, Messages>;
