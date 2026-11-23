import { keyed, preflight } from '@/lib/api-v1';
import { mawsuahArticle, topicOf } from '@/lib/mawsuah';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const OPTIONS = preflight;

/**
 * One topic as the apps hold it: blocks of runs and its footnotes. A run is prose (a
 * string), ["q", quote], ["a", surah, from, to, label] (Hafs numbers) or ["f", note].
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return keyed(request, async () => {
    const found = topicOf(Number(id));
    const article = found ? mawsuahArticle(found.topic.id) : null;
    if (!found || !article) return null;
    return {
      id: article.id,
      section: found.section.title_ar,
      title: article.title,
      blocks: article.blocks,
      notes: article.notes,
      page: `https://dhikr.ly/mawsuah/${article.id}`,
    };
  });
}
