// Browser only: the reader's session, opened once per page load and shared.

let session: Promise<boolean> | null = null;

/** Opens (once) the signed reader session every reader request needs. */
export const openReaderSession = () =>
  (session ??= fetch('/api/reader/session', { method: 'POST', credentials: 'same-origin' })
    .then((r) => r.ok)
    .catch(() => {
      session = null;
      return false;
    }));
