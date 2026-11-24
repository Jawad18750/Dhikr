// Browser only: the reader's session, opened once and shared by every reader request.

let session: Promise<boolean> | null = null;
let openedAt = 0;
// The cookie lasts 6 hours (guard.ts); a page open longer than 5 opens a fresh one.
const FRESH_MS = 5 * 3600_000;

/** Opens (once, and again when it is old) the signed reader session every reader request needs. */
export const openReaderSession = () => {
  if (session && Date.now() - openedAt < FRESH_MS) return session;
  openedAt = Date.now();
  session = fetch('/api/reader/session', { method: 'POST', credentials: 'same-origin' })
    .then((r) => r.ok)
    .catch(() => false)
    .then((ok) => {
      if (!ok) session = null;
      return ok;
    });
  return session;
};
