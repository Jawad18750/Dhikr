import { API_DOCS_MARKDOWN } from '@/lib/api-documentation';

export const dynamic = 'force-static';

/** What an AI assistant should know about this site (the llms.txt convention). */
export function GET() {
  const body = `# ذكر · Dhikr (dhikr.ly)

> An open Quran library: recitations in the Qalun narration with the Jamahiriya mushaf, and
> the timing of every ayah and word, for listening, reading and building on.

- [API documentation](https://dhikr.ly/developers.md)
- [Surahs](https://dhikr.ly/surahs)
- [About](https://dhikr.ly/about)

${API_DOCS_MARKDOWN}`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
}
