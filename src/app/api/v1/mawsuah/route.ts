import { keyed, preflight } from '@/lib/api-v1';
import { mawsuahIndex } from '@/lib/mawsuah';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const OPTIONS = preflight;

/** موسوعة التفسير الموضوعي: its sections and topics, each topic with its parts' titles. */
export async function GET(request: Request) {
  return keyed(request, async () => {
    const index = mawsuahIndex();
    if (!index) return null;
    return {
      title: index.title_ar,
      publisher: index.publisher_ar,
      sections: index.sections.map((s) => ({
        id: s.id,
        title: s.title_ar,
        topics: s.topics.map((t) => ({ id: t.id, title: t.title_ar, parts: t.headings, page: `https://dhikr.ly/mawsuah/${t.id}` })),
      })),
    };
  });
}
