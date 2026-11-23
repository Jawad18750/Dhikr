import fs from 'node:fs';

import { coverPath } from '@/lib/library';

export const runtime = 'nodejs';

const TYPES: Record<string, string> = { webp: 'image/webp', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png' };

/** A book's cover, the apps' own image file. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const file = coverPath(id);
  if (!file) return new Response('Not found', { status: 404 });
  const type = TYPES[file.split('.').pop()?.toLowerCase() ?? ''] ?? 'application/octet-stream';
  return new Response(new Uint8Array(fs.readFileSync(file)), {
    headers: { 'Content-Type': type, 'Cache-Control': 'public, max-age=604800, stale-while-revalidate=86400' },
  });
}
