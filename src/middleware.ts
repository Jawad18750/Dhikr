import { type NextRequest, NextResponse } from 'next/server';

import { DEFAULT_LOCALE, localeFromPath, stripLocale } from '@/lib/seo/routes';

const PUBLIC_FILE =
  /\.(?:png|jpe?g|gif|svg|ico|webp|avif|woff2?|ttf|otf|css|js|mjs|map|xml|txt|webmanifest)$/i;

// Paths that keep the rewrite into the Arabic tree. Everything else under /en
// and /de has a real page tree, including the catch-all 404, so it can be
// served directly and prerendered.
//
// A rewritten path renders inside the Arabic layout, which hard-codes
// `lang="ar"`, so a reader of /en/settings got an Arabic document until
// hydration corrected it. Settings and offline are user-facing and now live in
// the locale trees; design-preview is an internal harness and stays here.
const REWRITTEN_ROUTES = new Set(['/design-preview']);

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/sw.js' ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // The home is a destination (reciters, search, tools), so a returning
  // listener's route cookie no longer redirects it to their player.

  const locale = localeFromPath(pathname);

  if (locale === DEFAULT_LOCALE) {
    return NextResponse.next();
  }

  // Dynamic reciter routes are canonicalised Arabic documents. The explicit
  // /en and /de files redirect to the Arabic page; rewriting them into the bare
  // dynamic route made Next answer 404.
  const stripped = stripLocale(pathname);

  // A protocol-relative path such as `/en//evil.example` would resolve against
  // the attacker's origin. Only same-origin paths may be rewritten.
  if (stripped.startsWith('//')) {
    return NextResponse.next();
  }

  // Prefixed paths without a dedicated page keep the rewrite. Unknown paths
  // fall through to the locale catch-all so /en/foo gets the English 404.
  if (!REWRITTEN_ROUTES.has(stripped)) {
    return NextResponse.next();
  }

  const target = request.nextUrl.clone();
  target.pathname = stripped;
  target.search = search;

  return NextResponse.rewrite(target);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
