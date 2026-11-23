import { keyed, preflight } from '@/lib/api-v1';
import { collection, hadithsOfChapter } from '@/lib/hadith';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const OPTIONS = preflight;

/**
 * A collection's chapters; with `?chapter=n`, that chapter's hadiths too.
 */
export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return keyed(request, async () => {
    const c = collection(slug);
    if (!c) return null;
    const asked = new URL(request.url).searchParams.get('chapter');
    const chapter = asked === null ? null : c.chapters[Number(asked) - 1];
    if (asked !== null && !chapter) return null;
    return {
      slug: c.slug,
      title: c.title,
      source: c.source,
      chapters: c.chapters.map(({ n, title, from, to, count }) => ({ chapter: n, title, from, to, hadiths: count })),
      ...(chapter ? { chapter: chapter.n, hadiths: hadithsOfChapter(c, chapter) } : {}),
    };
  });
}
