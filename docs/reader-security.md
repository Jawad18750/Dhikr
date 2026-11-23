# The reader: keeping the mushaf private

The owner's rule (2026-11-23): **leak free, private, no one can steal it. That is the
ultimate priority.** Every reader design choice is checked against this file first.

What must never be taken: the الجماهيرية trace (page ink, `pages_svgz`), the word asset
(which ink is which word: word positions), the ayah regions and the baselines. Audio and
timings are not secret; the Quran text is not secret. What is shown on a screen can always
be photographed, so the aim is: **nothing more than what is on screen ever reaches the
browser, never in a reusable form, and never fast enough to collect the whole book.**

## At rest

- The VPS keeps only **sealed** copies (content_crypto `KCP1`, ChaCha20-Poly1305, a key per
  file) in a root-only directory outside every web root. Never a plaintext copy.
- The master key lives only in the render service's own environment file (root, 0600). Not
  in the site's `.env`, not in a repo, not in a log.
- The render service decrypts in memory only and never writes plaintext, SVG or rendered
  images to disk (no file cache of content; an in-memory LRU of rendered rows at most).

## The render service

- A native Dart binary (`packages/mushaf_reflow`, the apps' own engine), listening on
  127.0.0.1 only, reached through the site's server, never from the internet.
- It returns **raster images only** (PNG/WebP). Never SVG, never path data, never vector,
  never the word asset, never unit or word coordinates, never per-word boxes.
- Images are drawn at display size, capped (no 4x "print" renders), as an alpha mask the
  page colours with CSS, so the file alone is a grey shape, not a styled page.

## What the browser receives

- **The line:** the surah is laid out as one continuous line (right to left) at the
  screen's own height and density; the browser gets its total width in pixels and asks for
  it in tiles of 1200 px, each one image of that stretch of ink. Nothing about which word
  sits where.
- **A lit word:** the lit word is the word's own ink **recoloured** (no glow, no halo, no
  frame). It comes as a tile-sized image (two where it crosses a seam) that is transparent
  except that word's ink, with only the tile's number. It carries no box and no offset: the
  page finds where to centre it from its own pixels, the same pixels the screen shows.
- **Tap to jump:** the browser sends where on the line it was tapped (x, y); the server
  answers with the word there, which the page turns into a time to seek to. The server never
  answers "where is word N".

## Pace and abuse

- A signed, HttpOnly, Secure, SameSite=Strict session cookie scoped to the reader's API
  path; same-origin checks (`Sec-Fetch-Site`, `Origin`) on every request.
- **Served at listening pace:** a session gets rows around where its recitation is playing
  and a short look-ahead, and lit-word images only for words whose time is near. Reading
  the whole book takes as long as listening to it, per session and per IP.
- Rate limits per session and per IP, sized for one real listener; new sessions per IP
  limited.
- Every image carries an invisible per-session mark woven into the ink, so a leaked image
  can be traced to the session that fetched it.
- `Cache-Control: private, no-store` on every reader response, and the reader's paths bypass
  Cloudflare's cache, so no shared cache ever holds a copy.

## In the page

- Rows are drawn into a canvas, not `<img>` elements with fetchable URLs; no "save image".
  (A deterrent, not a lock: the real protection is everything above.)
- Nothing of the engine, the word asset or any geometry is ever in the JavaScript bundle.

## Audit (2026-11-23)

- Found and closed: mushaf-review.abdeljawad.com served every printed page and ayah crop
  with no login (gated by a signed-cookie proxy; cache purged).
- Tightened: a plaintext app checkout on the VPS was readable by other server accounts; now
  root-only.
