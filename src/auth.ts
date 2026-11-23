// Server only: who is signed in. Google, or a one-time link by email; sessions in Postgres.
import PostgresAdapter from '@auth/pg-adapter';
import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Nodemailer from 'next-auth/providers/nodemailer';
import { createTransport } from 'nodemailer';

import { pool } from '@/lib/database';
import { signInEmail } from '@/lib/sign-in-email';

/**
 * The email link is sent by this server's own mail (Postfix on the VPS, signed with
 * dhikr.ly's DKIM key). In development, with no mail server, the link is printed instead.
 */
const transport = process.env.EMAIL_SERVER
  ? createTransport(process.env.EMAIL_SERVER)
  : createTransport({ host: '127.0.0.1', port: 25, secure: false, tls: { rejectUnauthorized: false } });

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PostgresAdapter(pool),
  session: { strategy: 'database', maxAge: 90 * 24 * 3600 },
  trustHost: true,
  providers: [
    Google,
    Nodemailer({
      server: {},
      from: 'ذكر <no-reply@dhikr.ly>',
      // A link works once, for ten minutes.
      maxAge: 10 * 60,
      async sendVerificationRequest({ identifier, url }) {
        const message = signInEmail(url);
        if (process.env.EMAIL_DEV_LOG === '1') {
          console.log(`sign-in link for ${identifier}: ${url}`);
          return;
        }
        await transport.sendMail({
          from: 'ذكر <no-reply@dhikr.ly>',
          to: identifier,
          subject: message.subject,
          text: message.text,
          html: message.html,
        });
      },
    }),
  ],
  pages: { signIn: '/account', verifyRequest: '/account?sent=1', error: '/account' },
  callbacks: {
    // The account's id rides on the session, for its keys and its usage.
    session({ session, user }) {
      if (session.user) session.user.id = user.id;
      return session;
    },
  },
});
