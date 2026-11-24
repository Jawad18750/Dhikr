import fs from 'node:fs';
import path from 'node:path';

import { IoCloudDownloadOutline, IoLogoGithub } from 'react-icons/io5';

import { CardMark } from '@/components/site/logo-mark';
import { PrayerLibyaTool } from '@/components/site/prayer-libya-tool';
import outline from '@/data/libya-outline.json';
import { cityDay, libyaCities, libyaCity, libyaToday, PRAYER_LIBYA_META } from '@/lib/prayer-libya';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const revalidate = 600;

export const metadata = buildPageMetadata({
  locale: 'ar',
  path: '/prayer-times',
  title: 'مواقيت الصلاة في المدن الليبية: الجداول الرسمية مفتوحة | ذكر',
  description:
    'جداول مواقيت الصلاة الرسمية لـ١٢٢ مدينة ليبية، كما تصدرها الهيئة العامة للأوقاف: خريطة تفاعلية، والسنة كاملة، وتنزيل مجاني (CSV وJSON وSQLite)، وواجهة برمجية دون مفتاح.',
  omitLanguages: true,
});

const DOWNLOADS = [
  { file: 'libya-prayer-times.csv', label: 'CSV', note: 'صف لكل مدينة ويوم' },
  { file: 'libya-prayer-times.json', label: 'JSON', note: 'المدن وأيامها' },
  { file: 'libya-prayer-times.sqlite', label: 'SQLite', note: 'جدولان: المدن والمواقيت' },
  { file: 'cities.json', label: 'المدن', note: 'الأسماء والإحداثيات' },
];
const ROOT = process.env.PRAYER_ROOT ?? path.join(process.cwd(), '.content/prayer');
const size = (file: string) => {
  try {
    const bytes = fs.statSync(path.join(ROOT, file)).size;
    return bytes > 1_000_000 ? `${(bytes / 1_048_576).toFixed(1)} م.ب` : `${Math.round(bytes / 1024)} ك.ب`;
  } catch {
    return null;
  }
};

const code = 'overflow-x-auto rounded-2xl bg-[#0f0f10] p-4 text-[13px] leading-[1.8] text-white/85';

/** Libya's official prayer tables, open: the tool, and everything a developer needs. */
export default function Page() {
  const today = libyaToday();
  const cities = libyaCities().map((c) => {
    const d = cityDay(libyaCity(c.slug)!, today.month, today.day)!;
    return { ...c, today: [d.fajr, d.sunrise, d.dhuhr, d.asr, d.maghrib, d.isha] };
  });

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-4 pb-16 pt-6 text-foreground sm:px-6 sm:pt-10">
      <section
        data-header-tone="dark"
        className="relative isolate flex flex-col gap-3 overflow-hidden rounded-[28px] bg-hero p-6 text-on-hero sm:rounded-[36px] sm:p-9"
      >
        <CardMark />
        <p className="text-[14px] font-bold text-hero-gold">بيانات مفتوحة · مجانية دون تسجيل</p>
        <h1 className="font-display text-[32px] font-black leading-[1.25] sm:text-[46px]">مواقيت الصلاة في المدن الليبية</h1>
        <p className="max-w-[720px] text-[17px] leading-[1.85] text-on-hero/75">
          الجداول الرسمية لـ{cities.length} مدينة ليبية كما تصدرها {PRAYER_LIBYA_META.source}: السنة كاملة، ٣٦٦ يومًا لكل مدينة،
          بتوقيت ليبيا. للمساجد والتطبيقات والباحثين، تُنزّل وتُستعمل بحرية مع ذكر المصدر.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <a href="#developers" className="flex h-11 items-center gap-2 rounded-full bg-gradient-to-b from-gold-light to-gold px-5 text-[15px] font-bold text-[#1b1712]">
            <IoCloudDownloadOutline className="h-[18px] w-[18px]" aria-hidden="true" />
            نزّل الجداول
          </a>
          <a
            href={PRAYER_LIBYA_META.repository}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-11 items-center gap-2 rounded-full bg-on-hero/[0.08] px-5 text-[15px] font-bold text-on-hero hover:bg-on-hero/15"
          >
            <IoLogoGithub className="h-[18px] w-[18px]" aria-hidden="true" />
            المستودع على GitHub
          </a>
        </div>
      </section>

      <PrayerLibyaTool cities={cities} outline={outline} today={{ month: today.month, day: today.day }} />

      <section id="developers" className="flex scroll-mt-24 flex-col gap-5">
        <h2 className="font-display text-[26px] font-black text-ink sm:text-[30px]">للمطوّرين</h2>
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,230px),1fr))] gap-3">
          {DOWNLOADS.map((d) => (
            <li key={d.file}>
              <a
                href={`/api/v1/prayer-times/libya/download/${d.file}`}
                download
                className="flex h-full flex-col gap-1 rounded-[20px] border border-border bg-surface p-4 transition-colors hover:border-border-strong"
              >
                <span className="flex items-center gap-2 text-[17px] font-bold text-ink">
                  <IoCloudDownloadOutline className="h-5 w-5 text-gold" aria-hidden="true" />
                  {d.label}
                </span>
                <span className="text-[14px] text-ink-muted">{d.note}</span>
                {size(d.file) && <span className="text-[13px] tabular-nums text-ink-subtle">{size(d.file)}</span>}
              </a>
            </li>
          ))}
        </ul>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="flex flex-col gap-2">
            <h3 className="text-[18px] font-bold text-ink">واجهة برمجية دون مفتاح</h3>
            <p className="text-[15px] leading-[1.8] text-ink-muted">
              لا تحتاج حسابًا ولا مفتاحًا. الأوقات بتوقيت ليبيا ({PRAYER_LIBYA_META.timezone})، والجدول لا يتغير خلال السنة، فاحفظ ما
              تأخذه عندك.
            </p>
            <pre dir="ltr" className={code}>{`GET /api/v1/prayer-times/libya            # the cities
GET /api/v1/prayer-times/libya/today      # today, every city
GET /api/v1/prayer-times/libya/tripoli    # today in Tripoli
GET /api/v1/prayer-times/libya/tripoli?date=2026-03-20
GET /api/v1/prayer-times/libya/benghazi?month=9
GET /api/v1/prayer-times/libya/sabha?year # all 366 days`}</pre>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-[18px] font-bold text-ink">مثال</h3>
            <pre dir="ltr" className={code}>{`curl https://dhikr.ly/api/v1/prayer-times/libya/tripoli

{ "data": { "city": { "slug": "tripoli", "name_ar": "طرابلس",
            "lat": 32.88132, "lng": 13.19252, "new_fajr": false },
            "timezone": "Africa/Tripoli", "month": 11, "day": 24,
            "fajr": "06:17", "sunrise": "07:45", "dhuhr": "12:57",
            "asr": "15:42", "maghrib": "18:05", "isha": "19:30" },
  "license": "CC BY 4.0", "source": "...", "site": "https://dhikr.ly/prayer-times" }`}</pre>
          </div>
        </div>

        <div className="rounded-[22px] bg-surface-sunken p-5 text-[15px] leading-[1.9] text-ink-muted">
          <p>
            <span className="font-bold text-ink">المصدر: </span>
            {PRAYER_LIBYA_META.source}، جداولها الرسمية لكل مدينة، كما جمعها تطبيق «مؤذن ليبيا» وموقع Tawkit، ونُقّحت أخطاء الطباعة
            فيها. مدن الشرق والجنوب على الفجر الصادق كما عدّلته الأوقاف.
          </p>
          <p>
            <span className="font-bold text-ink">الترخيص: </span>
            <a href={PRAYER_LIBYA_META.license_url} target="_blank" rel="noopener noreferrer" className="underline">
              المشاع الإبداعي، نسب المصنَّف 4.0
            </a>
            : استعملها في أي مكان، تجاريًا وغير تجاري، واذكر «الهيئة العامة للأوقاف» و«ذكر · dhikr.ly».
          </p>
        </div>
      </section>
    </div>
  );
}
