import fs from 'node:fs';

import { pdfPath } from '@/lib/library-pdfs';

export const runtime = 'nodejs';

/** A book's printed edition, to read in the browser or save (?download=1). */
export async function GET(request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const full = pdfPath(file);
  if (!full) return new Response('Not found', { status: 404 });
  const download = new URL(request.url).searchParams.has('download');
  const stream = fs.createReadStream(full);
  return new Response(stream as unknown as ReadableStream, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Length': String(fs.statSync(full).size),
      'Content-Disposition': `${download ? 'attachment' : 'inline'}; filename="${file}"`,
      'Cache-Control': 'public, max-age=604800',
    },
  });
}
