import { keyed, preflight } from '@/lib/api-v1';
import { ABOUT, collections } from '@/lib/hadith';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const OPTIONS = preflight;

/** The hadith collections the Dhikr apps carry. */
export async function GET(request: Request) {
  return keyed(request, async () =>
    collections().map((c) => ({
      slug: c.slug,
      title: c.title,
      author: ABOUT[c.slug]?.author || null,
      hadiths: c.count,
      page: `https://dhikr.ly/hadith/${c.slug}`,
    }))
  );
}
