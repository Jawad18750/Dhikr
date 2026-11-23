// The sign-in email: Arabic first, English under it; plain and short.

const escape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function signInEmail(url: string) {
  const link = escape(url);
  return {
    subject: 'رابط الدخول إلى ذكر',
    text: `رابط الدخول إلى ذكر، يعمل مرة واحدة خلال عشر دقائق:\n${url}\n\nإن لم تطلبه فتجاهل هذه الرسالة.\n\nYour Dhikr sign-in link, valid once for ten minutes:\n${url}\n\nIf you did not ask for it, ignore this email.`,
    html: `<!doctype html><html lang="ar" dir="rtl"><body style="margin:0;background:#f4f4f5;font-family:-apple-system,Segoe UI,Tahoma,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" style="max-width:480px;background:#ffffff;border-radius:20px;padding:32px" cellpadding="0" cellspacing="0">
<tr><td style="font-size:26px;font-weight:800;color:#0b0b0c;padding-bottom:12px">ذكر</td></tr>
<tr><td style="font-size:17px;line-height:1.8;color:#3f3f46;padding-bottom:24px">هذا رابط الدخول إلى حسابك في ذكر. يعمل مرة واحدة، خلال عشر دقائق.</td></tr>
<tr><td style="padding-bottom:24px"><a href="${link}" style="display:inline-block;background:#c5a059;color:#1b1712;text-decoration:none;font-weight:700;font-size:17px;padding:14px 28px;border-radius:999px">الدخول إلى ذكر</a></td></tr>
<tr><td style="font-size:14px;line-height:1.7;color:#71717a;padding-bottom:20px">إن لم تطلب هذا الرابط فتجاهل هذه الرسالة.</td></tr>
<tr><td dir="ltr" style="font-size:13px;line-height:1.7;color:#a1a1aa;border-top:1px solid #e4e4e7;padding-top:16px;text-align:left">Your Dhikr sign-in link, valid once for ten minutes. If you did not ask for it, ignore this email.</td></tr>
</table></td></tr></table></body></html>`,
  };
}
