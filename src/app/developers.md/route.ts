import { API_DOCS_MARKDOWN } from '@/lib/api-documentation';

export const dynamic = 'force-static';

/** The documentation as plain Markdown, for AI assistants and terminals. */
export function GET() {
  return new Response(API_DOCS_MARKDOWN, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
}
