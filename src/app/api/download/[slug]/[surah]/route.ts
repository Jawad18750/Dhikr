import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';

import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import { SURAHS } from '@/constants';
import { getRecitationFiles } from '@/lib/dhikr-surah-facts';
import { logDownload } from '@/lib/downloads-log';
import { DHIKR_AUDIO_BASE } from '@/services/reciters/dhikr.adapter';
import { removeTashkeel } from '@/utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * One surah's MP3 as a download, from this site: the audio host is another origin, where
 * a browser ignores «download» and plays the file instead. It lets a phone with no ZIP
 * extractor save a khatma surah by surah. A few at a time per address.
 */
const active = new Map<string, number>();
const PER_ADDRESS = 6;
const SLUG = /^[a-z0-9_]+$/;
const pad = (n: number) => String(n).padStart(3, '0');

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string; surah: string }> }
) {
  const { slug, surah: raw } = await params;
  const s = Number(raw);
  if (!SLUG.test(slug) || !Number.isInteger(s) || s < 1 || s > 114) {
    return new NextResponse('Not found', { status: 404 });
  }
  const files = await getRecitationFiles(slug);
  if (!files?.sizes.has(s)) return new NextResponse('Not found', { status: 404 });

  // As part of a khatma saved surah by surah (`?bulk=1`), it needs an account like the ZIP.
  if (new URL(request.url).searchParams.get('bulk') === '1') {
    const session = await auth();
    const userId = Number(session?.user?.id);
    if (!userId) return new NextResponse('Sign in to download in bulk', { status: 401 });
    logDownload(request, { userId, slug, kind: 'separate', surahs: 1, bytes: files.sizes.get(s) ?? null });
  }

  const address =
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'local';
  if ((active.get(address) ?? 0) >= PER_ADDRESS) {
    return new NextResponse('Too many downloads at once', { status: 429 });
  }

  const file = process.env.AUDIO_ROOT ? path.join(process.env.AUDIO_ROOT, slug, `${pad(s)}.mp3`) : null;
  let size: number | null = null;
  let source: AsyncIterable<Uint8Array>;
  try {
    if (!file) throw new Error('no disk');
    size = (await stat(file)).size;
    source = createReadStream(file) as unknown as AsyncIterable<Uint8Array>;
  } catch {
    const response = await fetch(`${DHIKR_AUDIO_BASE}/audio/${slug}/${pad(s)}.mp3`);
    if (!response.ok || !response.body) return new NextResponse('Not found', { status: 404 });
    size = Number(response.headers.get('content-length')) || null;
    source = response.body as unknown as AsyncIterable<Uint8Array>;
  }

  active.set(address, (active.get(address) ?? 0) + 1);
  let released = false;
  const release = () => {
    if (released) return;
    released = true;
    const left = (active.get(address) ?? 1) - 1;
    if (left <= 0) active.delete(address);
    else active.set(address, left);
  };
  const iterator = source[Symbol.asyncIterator]();
  const body = new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const { value, done } = await iterator.next();
        if (done) {
          release();
          controller.close();
        } else controller.enqueue(value);
      } catch (error) {
        release();
        controller.error(error);
      }
    },
    async cancel() {
      release();
      await iterator.return?.();
    },
  });

  const name = SURAHS.find((item) => item.id === s)?.name;
  const title = `${pad(s)} ${name ? removeTashkeel(name) : s} - ${files.name}.mp3`;
  return new NextResponse(body, {
    headers: {
      'Content-Type': 'audio/mpeg',
      ...(size ? { 'Content-Length': String(size) } : {}),
      'Content-Disposition': `attachment; filename="${slug}-${pad(s)}.mp3"; filename*=UTF-8''${encodeURIComponent(title)}`,
      'Cache-Control': 'no-store',
    },
  });
}
