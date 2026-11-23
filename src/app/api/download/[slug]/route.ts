import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';

import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import { SURAHS } from '@/constants';
import { getRecitationFiles } from '@/lib/dhikr-surah-facts';
import { logDownload } from '@/lib/downloads-log';
import { ZIP_LIMIT, zipLength, zipStream } from '@/lib/zip-stream';
import { DHIKR_AUDIO_BASE } from '@/services/reciters/dhikr.adapter';
import { removeTashkeel } from '@/utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * A recitation's surahs as one ZIP: `?s=all` or `?s=1,2,18`. The MP3s are public
 * already (quran-audio); this only saves fetching them one by one. On the server
 * they are read from disk (AUDIO_ROOT); elsewhere fetched from the audio host.
 * A few archives at a time per address, so one visitor cannot tie the box up.
 */
const active = new Map<string, number>();
const PER_ADDRESS = 2;
const SLUG = /^[a-z0-9_]+$/;

const pad = (n: number) => String(n).padStart(3, '0');

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // A whole khatma or picked surahs in one archive needs an account (single surahs do not).
  const session = await auth();
  const userId = Number(session?.user?.id);
  if (!userId) {
    const back = request.headers.get('referer');
    const next = back && new URL(back).origin === new URL(request.url).origin ? new URL(back).pathname + new URL(back).search : '/';
    return NextResponse.redirect(new URL(`/account?next=${encodeURIComponent(next)}`, request.url), 303);
  }
  if (!SLUG.test(slug)) return new NextResponse('Not found', { status: 404 });
  const files = await getRecitationFiles(slug);
  if (!files || files.sizes.size === 0) return new NextResponse('Not found', { status: 404 });

  const wanted = new URL(request.url).searchParams.get('s') ?? 'all';
  const surahs =
    wanted === 'all'
      ? [...files.sizes.keys()]
      : [...new Set(wanted.split(',').map(Number))].filter((s) => files.sizes.has(s));
  surahs.sort((a, b) => a - b);
  if (surahs.length === 0) return new NextResponse('No surahs', { status: 400 });
  if (surahs.length === 1) {
    return NextResponse.redirect(`${DHIKR_AUDIO_BASE}/audio/${slug}/${pad(surahs[0])}.mp3`, 302);
  }

  const address =
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'local';
  if ((active.get(address) ?? 0) >= PER_ADDRESS) {
    return new NextResponse('Too many downloads at once', { status: 429 });
  }

  const root = process.env.AUDIO_ROOT;
  const entries = await Promise.all(
    surahs.map(async (s) => {
      const surah = SURAHS.find((item) => item.id === s);
      const name = `${pad(s)} ${surah ? removeTashkeel(surah.name) : s}.mp3`;
      const file = root ? path.join(root, slug, `${pad(s)}.mp3`) : null;
      let size = files.sizes.get(s) ?? 0;
      if (file) {
        try {
          size = (await stat(file)).size;
        } catch {
          /* not on this disk: read it over HTTP below */
        }
      }
      return {
        name,
        size,
        read: async function* () {
          if (file) {
            try {
              await stat(file);
              for await (const chunk of createReadStream(file)) yield chunk as Uint8Array;
              return;
            } catch {
              /* fall through to HTTP */
            }
          }
          const response = await fetch(`${DHIKR_AUDIO_BASE}/audio/${slug}/${pad(s)}.mp3`);
          if (!response.ok || !response.body) throw new Error(`surah ${s}: ${response.status}`);
          for await (const chunk of response.body as unknown as AsyncIterable<Uint8Array>) {
            yield chunk;
          }
        },
      };
    })
  );
  const length = zipLength(entries);
  if (length > ZIP_LIMIT) return new NextResponse('Too large', { status: 413 });
  logDownload(request, { userId, slug, kind: 'zip', surahs: surahs.length, bytes: length });

  active.set(address, (active.get(address) ?? 0) + 1);
  const release = () => {
    const left = (active.get(address) ?? 1) - 1;
    if (left <= 0) active.delete(address);
    else active.set(address, left);
  };
  const inner = zipStream(entries);
  const reader = inner.getReader();
  let released = false;
  const done = () => {
    if (!released) {
      released = true;
      release();
    }
  };
  const body = new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const { value, done: finished } = await reader.read();
        if (finished) {
          done();
          controller.close();
        } else controller.enqueue(value);
      } catch (error) {
        done();
        controller.error(error);
      }
    },
    async cancel(reason) {
      done();
      await reader.cancel(reason);
    },
  });

  const title = `${files.name} - ${files.riwaya}${wanted === 'all' ? '' : ` (${surahs.length})`}.zip`;
  return new NextResponse(body, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Length': String(length),
      'Content-Disposition': `attachment; filename="${slug}.zip"; filename*=UTF-8''${encodeURIComponent(title)}`,
      'Cache-Control': 'no-store',
    },
  });
}
