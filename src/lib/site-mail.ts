// Server only: the site's own mail. Postfix on the VPS sends it, signed with dhikr.ly's
// DKIM key (the sign-in links and the contact form). In development, with no mail
// server, EMAIL_DEV_LOG=1 prints instead of sending.
import { createTransport } from 'nodemailer';

export const siteMail = process.env.EMAIL_SERVER
  ? createTransport(process.env.EMAIL_SERVER)
  : createTransport({ host: '127.0.0.1', port: 25, secure: false, tls: { rejectUnauthorized: false } });

export const SITE_FROM = 'ذكر <no-reply@dhikr.ly>';

/** Where the contact form's messages go: CONTACT_TO, or the first of ADMIN_EMAILS. */
export const contactInbox = () =>
  (process.env.CONTACT_TO ?? process.env.ADMIN_EMAILS ?? '').split(',')[0]?.trim() || null;
