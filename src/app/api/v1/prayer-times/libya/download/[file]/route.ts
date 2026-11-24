import fs from 'node:fs';
import path from 'node:path';

import { OPEN_CORS } from '@/lib/api-open';

export const runtime = 'nodejs';

/** The whole dataset as a file, free: CSV, JSON or SQLite (built by scripts/build-prayer-libya.mjs). */
const FILES: Record<string, string> = {
  'libya-prayer-times.csv': 'text/csv; charset=utf-8',
  'libya-prayer-times.json': 'application/json; charset=utf-8',
  'libya-prayer-times.sqlite': 'application/vnd.sqlite3',
  'cities.json': 'application/json; charset=utf-8',
};
const ROOT = process.env.PRAYER_ROOT ?? path.join(process.cwd(), '.content/prayer');

export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const type = FILES[file];
  const full = path.join(ROOT, file);
  if (!type || !fs.existsSync(full)) return new Response('Not found', { status: 404 });
  const size = fs.statSync(full).size;
  return new Response(fs.createReadStream(full) as unknown as ReadableStream, {
    headers: {
      'Content-Type': type,
      'Content-Length': String(size),
      'Content-Disposition': `attachment; filename="${file}"`,
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      ...OPEN_CORS,
    },
  });
}
