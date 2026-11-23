'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

import { auth, signIn, signOut } from '@/auth';
import { allowOnce, createApiKey, humanCheck, revokeKey } from '@/lib/account';

/** Only a path on this site may be the place to come back to. */
const safeNext = (value: ReturnType<FormData["get"]>) => {
  const next = typeof value === 'string' ? value : '';
  return next.startsWith('/') && !next.startsWith('//') ? next : '/account';
};

const clientIp = async () => {
  const h = await headers();
  return h.get('cf-connecting-ip') ?? h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;
};

export async function signInWithGoogle(formData: FormData) {
  await signIn('google', { redirectTo: safeNext(formData.get('next')) });
}

export type EmailState = { status: 'idle' | 'sent' | 'invalid' | 'human' | 'limited' | 'failed' };

/**
 * The email link, behind three guards against using the form to send mail to strangers:
 * Turnstile (a person sent it), a few links per address an hour, and a few per email.
 */
export async function sendEmailLink(_: EmailState, formData: FormData): Promise<EmailState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 200) return { status: 'invalid' };
  const ip = await clientIp();
  if (!(await humanCheck(String(formData.get('cf-turnstile-response') ?? ''), ip))) {
    return { status: 'human' };
  }
  if (!allowOnce(`ip:${ip ?? 'none'}`, 6, 3600_000) || !allowOnce(`email:${email}`, 3, 3600_000)) {
    return { status: 'limited' };
  }
  try {
    await signIn('nodemailer', { email, redirect: false, redirectTo: safeNext(formData.get('next')) });
  } catch {
    return { status: 'failed' };
  }
  return { status: 'sent' };
}

export async function signOutNow() {
  await signOut({ redirectTo: '/' });
}

export type KeyState = { key?: string; error?: 'signed-out' | 'too-many' };

export async function createKey(_: KeyState, formData: FormData): Promise<KeyState> {
  const session = await auth();
  const id = Number(session?.user?.id);
  if (!id) return { error: 'signed-out' };
  const made = await createApiKey(id, String(formData.get('name') ?? ''));
  if (!made) return { error: 'too-many' };
  revalidatePath('/account');
  return { key: made.key };
}

export async function deleteKey(formData: FormData) {
  const session = await auth();
  const id = Number(session?.user?.id);
  const key = Number(formData.get('id'));
  if (!id || !Number.isInteger(key)) return;
  await revokeKey(id, key);
  revalidatePath('/account');
}
