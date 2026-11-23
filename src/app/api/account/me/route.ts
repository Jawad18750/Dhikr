import { NextResponse } from 'next/server';

import { auth } from '@/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Whether this browser is signed in (for the pages that offer what needs an account). */
export async function GET() {
  const session = await auth();
  return NextResponse.json({ signedIn: Boolean(session?.user) }, { headers: { 'Cache-Control': 'private, no-store' } });
}
