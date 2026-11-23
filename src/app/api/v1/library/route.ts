import { keyed, preflight } from '@/lib/api-v1';
import { libraryIndex } from '@/lib/library';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const OPTIONS = preflight;

/** The library: its categories and books. */
export async function GET(request: Request) {
  return keyed(request, async () => {
    const { categories, books } = libraryIndex();
    return {
      categories: categories.map(({ id, title, subtitle }) => ({ id, title, subtitle })),
      books: books.map((b) => ({
        id: b.id,
        category: b.category,
        title: b.title,
        author: b.author,
        items: b.items,
        cover: b.hasCover ? `https://dhikr.ly/api/library/cover/${b.id}` : null,
        page: `https://dhikr.ly/library/${b.id}`,
      })),
    };
  });
}
