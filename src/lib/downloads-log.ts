// Server only: who took what in bulk (a khatma, or picked surahs), for the real numbers.
import { pool } from '@/lib/database';

export function logDownload(
  request: Request,
  entry: { userId: number; slug: string; kind: 'zip' | 'separate'; surahs: number; bytes: number | null }
) {
  void pool
    .query(
      'INSERT INTO downloads ("userId", slug, kind, surahs, bytes, country) VALUES ($1, $2, $3, $4, $5, $6)',
      [entry.userId, entry.slug, entry.kind, entry.surahs, entry.bytes, request.headers.get('cf-ipcountry')]
    )
    .catch(() => {});
}
