import { keyed, preflight } from '@/lib/api-v1';
import { tafsirs } from '@/lib/tafsir';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const OPTIONS = preflight;

/** The tafsirs. */
export async function GET(request: Request) {
  return keyed(request, async () =>
    tafsirs().map((t) => ({ id: t.id, title: t.title, author: t.author, page: `https://dhikr.ly/tafsir/${t.id}` }))
  );
}
