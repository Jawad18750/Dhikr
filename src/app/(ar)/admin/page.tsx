import { notFound } from 'next/navigation';

import { auth } from '@/auth';
import { type AppTraffic, appTraffic } from '@/lib/app-traffic';
import { pool } from '@/lib/database';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'لوحة ذكر', robots: { index: false, follow: false } };

const admins = () =>
  new Set((process.env.ADMIN_EMAILS ?? '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean));

const n = new Intl.NumberFormat('ar-u-nu-latn');

/**
 * The real numbers, for the owner only (ADMIN_EMAILS): accounts, keys, API calls and bulk
 * downloads over 30 days, and who and what is behind them. Anyone else gets a 404.
 */
const APP_NAMES: Record<string, string> = {
  adhan: 'أذان وأذكار',
  quran: 'مصحف الجماهيرية',
  masahif: 'مصاحف ليبيا',
  other: 'دون اسم تطبيق في الرابط',
};

/** The apps' API, per app and per resource, 30 days, from Cloudflare (totals only). */
function AppsSection({
  traffic,
  box,
  row,
  n,
}: {
  traffic: AppTraffic | null;
  box: string;
  row: string;
  n: Intl.NumberFormat;
}) {
  return (
    <section className={box}>
      <h2 className="text-[17px] font-bold text-ink">واجهة التطبيقات (30 يومًا)</h2>
      {traffic === null ? (
        <p className="text-[14px] text-ink-subtle">تعذّرت قراءة الأرقام من Cloudflare.</p>
      ) : traffic.total === 0 ? (
        <p className="text-[14px] text-ink-subtle">
          لا طلبات بعد: تبدأ الأرقام حين تصدر التطبيقات المبنية على /api/v1/app.
        </p>
      ) : (
        <>
          {traffic.apps.map((a) => (
            <div key={a.app} className={row}>
              <span>{APP_NAMES[a.app] ?? a.app}</span>
              <span className="tabular-nums">{n.format(a.count)}</span>
            </div>
          ))}
          <h2 className="mt-3 text-[17px] font-bold text-ink">الموارد</h2>
          {traffic.resources.map((r) => (
            <div key={r.resource} className={row}>
              <span dir="ltr" className="truncate font-mono">{r.resource}</span>
              <span className="tabular-nums">{n.format(r.count)}</span>
            </div>
          ))}
        </>
      )}
    </section>
  );
}

export default async function Page() {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase();
  if (!email || !admins().has(email)) notFound();

  const traffic = appTraffic();
  const q = async <T extends Record<string, unknown>>(sql: string) => (await pool.query<T>(sql)).rows;
  const [totals, perDay, paths, accounts, downloads, countries] = await Promise.all([
    q<{ users: string; new7: string; keys: string; calls: string; dls: string }>(`
      SELECT (SELECT count(*) FROM users) AS users,
             (SELECT count(*) FROM users WHERE created_at > now() - interval '7 days') AS new7,
             (SELECT count(*) FROM api_keys WHERE revoked_at IS NULL) AS keys,
             (SELECT count(*) FROM api_requests WHERE at > now() - interval '30 days') AS calls,
             (SELECT count(*) FROM downloads WHERE at > now() - interval '30 days') AS dls`),
    q<{ day: string; calls: string; dls: string }>(`
      SELECT to_char(d, 'MM-DD') AS day,
             (SELECT count(*) FROM api_requests WHERE at::date = d) AS calls,
             (SELECT count(*) FROM downloads WHERE at::date = d) AS dls
      FROM generate_series(current_date - 13, current_date, interval '1 day') AS g(d) ORDER BY d DESC`),
    q<{ path: string; count: string }>(`
      SELECT regexp_replace(regexp_replace(path, '/[0-9]+$', '/{surah}'), '^(/api/v1/[a-z-]+/)[a-z0-9_]+', '\\1{slug}') AS path,
             count(*) FROM api_requests WHERE at > now() - interval '30 days' GROUP BY 1 ORDER BY 2 DESC LIMIT 8`),
    q<{ email: string; calls: string; dls: string; joined: Date }>(`
      SELECT u.email, u.created_at AS joined,
             (SELECT count(*) FROM api_requests r WHERE r."userId" = u.id AND r.at > now() - interval '30 days') AS calls,
             (SELECT count(*) FROM downloads d WHERE d."userId" = u.id AND d.at > now() - interval '30 days') AS dls
      FROM users u ORDER BY calls DESC, dls DESC, u.created_at DESC LIMIT 25`),
    q<{ slug: string; kind: string; count: string }>(`
      SELECT slug, kind, count(*) FROM downloads WHERE at > now() - interval '30 days'
      GROUP BY 1, 2 ORDER BY 3 DESC LIMIT 10`),
    q<{ country: string; count: string }>(`
      SELECT coalesce(country, '؟') AS country, count(*) FROM (
        SELECT country FROM api_requests WHERE at > now() - interval '30 days'
        UNION ALL SELECT country FROM downloads WHERE at > now() - interval '30 days') x
      GROUP BY 1 ORDER BY 2 DESC LIMIT 10`),
  ]);
  const t = totals[0];
  const card = 'flex flex-col gap-1 rounded-[20px] border border-border bg-surface px-4 py-3.5';
  const box = 'flex flex-col gap-2 rounded-[20px] border border-border bg-surface p-4';
  const row = 'flex justify-between gap-4 text-[14px] text-ink-muted';

  return (
    <div className="mx-auto flex w-full max-w-[1000px] flex-col gap-6 px-4 pb-16 pt-6 text-foreground sm:px-6">
      <h1 className="font-display text-[30px] font-black text-ink">لوحة ذكر</h1>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
        {[
          ['الحسابات', t.users],
          ['جديدة في 7 أيام', t.new7],
          ['مفاتيح فعّالة', t.keys],
          ['طلبات الواجهة · 30 يومًا', t.calls],
          ['تنزيلات الختمات · 30 يومًا', t.dls],
        ].map(([label, value]) => (
          <div key={label} className={card}>
            <span className="text-[13px] text-ink-subtle">{label}</span>
            <span className="text-[24px] font-bold tabular-nums text-ink">{n.format(Number(value))}</span>
          </div>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <section className={box}>
          <h2 className="text-[17px] font-bold text-ink">آخر 14 يومًا (طلبات · تنزيلات)</h2>
          {perDay.map((d) => (
            <div key={d.day} className={row}>
              <span dir="ltr" className="font-mono">{d.day}</span>
              <span className="tabular-nums">{n.format(Number(d.calls))} · {n.format(Number(d.dls))}</span>
            </div>
          ))}
        </section>
        <section className={box}>
          <h2 className="text-[17px] font-bold text-ink">العناوين الأكثر طلبًا</h2>
          {paths.map((p) => (
            <div key={p.path} className={row}>
              <span dir="ltr" className="truncate font-mono">{p.path}</span>
              <span className="tabular-nums">{n.format(Number(p.count))}</span>
            </div>
          ))}
          <h2 className="mt-3 text-[17px] font-bold text-ink">البلدان</h2>
          {countries.map((c) => (
            <div key={c.country} className={row}>
              <span>{c.country}</span>
              <span className="tabular-nums">{n.format(Number(c.count))}</span>
            </div>
          ))}
        </section>
        <section className={box}>
          <h2 className="text-[17px] font-bold text-ink">الحسابات (طلبات · تنزيلات، 30 يومًا)</h2>
          {accounts.map((a) => (
            <div key={a.email} className={row}>
              <span dir="ltr" className="truncate">{a.email}</span>
              <span className="tabular-nums">{n.format(Number(a.calls))} · {n.format(Number(a.dls))}</span>
            </div>
          ))}
        </section>
        <AppsSection traffic={await traffic} box={box} row={row} n={n} />
        <section className={box}>
          <h2 className="text-[17px] font-bold text-ink">الختمات الأكثر تنزيلًا</h2>
          {downloads.map((d) => (
            <div key={`${d.slug}:${d.kind}`} className={row}>
              <span dir="ltr" className="truncate font-mono">{d.slug} · {d.kind}</span>
              <span className="tabular-nums">{n.format(Number(d.count))}</span>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
