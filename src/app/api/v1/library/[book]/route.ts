import { keyed, preflight } from '@/lib/api-v1';
import { loadBook, sectionsOf } from '@/lib/library';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const OPTIONS = preflight;

/** One book: its details, source and contents (sections in reading order, from 1). */
export async function GET(request: Request, { params }: { params: Promise<{ book: string }> }) {
  const { book: id } = await params;
  return keyed(request, async () => {
    const book = loadBook(id);
    if (!book) return null;
    return {
      id: book.id,
      category: book.category,
      title: book.title,
      author: book.author,
      source: book.source,
      sections: sectionsOf(book).map((s, index) => ({
        section: index + 1,
        chapter: s.chapter.title,
        title: s.title,
        headings: s.headings,
      })),
    };
  });
}
