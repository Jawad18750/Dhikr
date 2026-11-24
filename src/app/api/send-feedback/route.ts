import { NextRequest, NextResponse } from 'next/server';

import { contactInbox, SITE_FROM, siteMail } from '@/lib/site-mail';
import { clientConfig, isValidEmail, sanitizeHTML } from '@/utils';

// --- Rate Limiting Logic ---
// In memory, one server process. A few messages an hour per address, and a cap a day
// for the whole form, so it cannot be turned into a way of filling the inbox.
const LIMIT = 5;
const WINDOW_MS = 60 * 60 * 1000;
const DAY_LIMIT = 100;
let day = { count: 0, start: 0 };
const MAX_RATE_LIMIT_ENTRIES = 10_000;

const MAX_BODY_BYTES = 16 * 1024;
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;
const MAX_MESSAGE_LENGTH = 5000;

const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
let lastCleanup = 0;

const cleanupRateLimit = (now: number) => {
  // Avoid an O(n) scan on every single request.
  if (
    now - lastCleanup < WINDOW_MS &&
    rateLimitMap.size <= MAX_RATE_LIMIT_ENTRIES
  ) {
    return;
  }
  lastCleanup = now;

  for (const [key, value] of rateLimitMap) {
    if (now - value.lastReset > WINDOW_MS) {
      rateLimitMap.delete(key);
    }
  }

  // Keep the map bounded even if an attacker rotates spoofed IPs.
  if (rateLimitMap.size > MAX_RATE_LIMIT_ENTRIES) {
    const excess = rateLimitMap.size - MAX_RATE_LIMIT_ENTRIES;
    let removed = 0;
    for (const key of rateLimitMap.keys()) {
      rateLimitMap.delete(key);
      removed += 1;
      if (removed >= excess) break;
    }
  }
};

const getClientIp = (request: NextRequest): string => {
  const cloudflare = request.headers.get('cf-connecting-ip');
  if (cloudflare) return cloudflare.trim();
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim() || 'unknown';

  return request.headers.get('x-real-ip')?.trim() || 'unknown';
};

const badRequest = (message: string, status: number) =>
  NextResponse.json({ message }, { status });

export async function POST(request: NextRequest) {
  const inbox = contactInbox();
  if (!inbox) {
    return badRequest('Feedback is not configured on this server.', 503);
  }

  const contentLength = Number(request.headers.get('content-length') ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return badRequest('Payload too large.', 413);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest('Invalid JSON body', 400);
  }

  if (typeof body !== 'object' || body === null) {
    return badRequest('Invalid data', 422);
  }

  const { name, email, message } = body as Record<string, unknown>;

  if (
    typeof name !== 'string' ||
    typeof email !== 'string' ||
    typeof message !== 'string'
  ) {
    return badRequest('Invalid data', 422);
  }

  const trimmedName = name.trim();
  const trimmedEmail = email.trim();
  const trimmedMessage = message.trim();

  if (
    trimmedName.length === 0 ||
    trimmedName.length > MAX_NAME_LENGTH ||
    trimmedEmail.length === 0 ||
    trimmedEmail.length > MAX_EMAIL_LENGTH ||
    !isValidEmail(trimmedEmail) ||
    trimmedMessage.length === 0 ||
    trimmedMessage.length > MAX_MESSAGE_LENGTH
  ) {
    return badRequest('Invalid data', 422);
  }

  const now = Date.now();
  const ip = getClientIp(request);

  cleanupRateLimit(now);

  const userData = rateLimitMap.get(ip) ?? { count: 0, lastReset: now };

  if (now - userData.lastReset > WINDOW_MS) {
    userData.count = 0;
    userData.lastReset = now;
  }

  if (userData.count >= LIMIT) {
    return NextResponse.json(
      { message: 'Too many requests, please try again later.' },
      { status: 429, statusText: 'Too Many Requests' }
    );
  }

  if (now - day.start > 24 * 3600 * 1000) day = { count: 0, start: now };
  if (day.count >= DAY_LIMIT) {
    return NextResponse.json({ message: 'Too many requests, please try again later.' }, { status: 429 });
  }

  userData.count += 1;
  rateLimitMap.set(ip, userData);
  day.count += 1;

  try {
    const safeName = sanitizeHTML(trimmedName);
    const safeEmail = sanitizeHTML(trimmedEmail);
    const safeMessage = sanitizeHTML(trimmedMessage);

    if (process.env.EMAIL_DEV_LOG === '1') {
      console.log(`contact form from ${trimmedEmail}: ${trimmedMessage.slice(0, 200)}`);
      return NextResponse.json({ message: 'Feedback sent successfully' });
    }
    // From the site's own address (signed, so it lands in the inbox), with the visitor
    // as Reply-To: answering is one tap.
    await siteMail.sendMail({
      from: SITE_FROM,
      to: inbox,
      replyTo: { name: trimmedName.replace(/[\r\n"<>]/g, ' '), address: trimmedEmail },
      subject: `${clientConfig.APP_NAME} - رسالة من صفحة التواصل: ${trimmedName.replace(/[\r\n]/g, ' ').slice(0, 60)}`,
      text: `Contact form submitted from ${clientConfig.APP_NAME}\nName: ${safeName}\nEmail: ${safeEmail}\nMessage: ${safeMessage}`,
      html: `
        <section style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
          <header><h1 style="color: #0066cc;">Contact form submitted from ${clientConfig.APP_NAME}</h1></header>
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <p><strong>Message:</strong> ${safeMessage}</p>
        </section>`,
    });

    return NextResponse.json({ message: 'Feedback sent successfully' });
  } catch (error) {
    console.error('Failed to send feedback email', error);
    return badRequest('Failed to send feedback, Please try again later.', 500);
  }
}
