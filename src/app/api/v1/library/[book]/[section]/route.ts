import { keyed, preflight } from '@/lib/api-v1';
import { loadBook, sectionAt } from '@/lib/library';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const OPTIONS = preflight;

/** One section's text, block by block (heading, paragraph, quote, footnote), with pages. */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ book: string; section: string }> }
) {
  const { book: id, section } = await params;
  return keyed(request, async () => {
    const book = loadBook(id);
    const at = book ? sectionAt(book, Number(section)) : null;
    if (!book || !at) return null;
    return {
      book: book.id,
      section: at.index,
      of: at.total,
      chapter: at.chapter.title,
      title: at.title,
      blocks: at.section.blocks.map(({ type, text, page, level }) => ({
        type,
        text,
        ...(page ? { page } : {}),
        ...(level ? { level } : {}),
      })),
    };
  });
}
