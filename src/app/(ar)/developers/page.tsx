import Link from 'next/link';
import { IoKeyOutline } from 'react-icons/io5';

import { CardMark } from '@/components/site/logo-mark';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata = buildPageMetadata({
  locale: 'ar',
  path: '/developers',
  title: 'الواجهة البرمجية | ذكر',
  description:
    'بيانات القرّاء والسور وتوقيت كل آية وكل كلمة برواية قالون، بصيغة JSON وبمفتاح شخصي مجاني.',
  omitLanguages: true,
});

const ENDPOINTS = [
  {
    id: 'reciters',
    path: '/api/v1/reciters',
    what: 'كل القرّاء: الاسم والرواية والبلد وعدد السور ورابط الصفحة.',
    sample: `{ "slug": "abdulhamid_algriw", "name": "عبدالحميد القريو",
  "riwaya": "قالون عن نافع", "style": "مرتل", "country": "LY",
  "surahs": 114, "rank": 1, "page": "https://dhikr.ly/reciter/…" }`,
  },
  {
    id: 'audio',
    path: '/api/v1/reciters/{slug}',
    what: 'قارئ واحد وسوره: عدد الآيات بعدّ قالون، والمدة، والحجم، ورابط ملف الصوت.',
    sample: `{ "surah": 2, "name": "البقرة", "ayahs": 285, "seconds": 7910,
  "bytes": 63301843,
  "audio": "https://quran-audio.abdeljawad.com/audio/abdulhamid_algriw/002.mp3" }`,
  },
  {
    id: 'timings',
    path: '/api/v1/timings/{slug}/{surah}',
    what: 'متى تبدأ كل آية ومتى تنتهي في السورة، بالملّي ثانية.',
    sample: `{ "slug": "abdulhamid_algriw", "surah": 1,
  "ayahs": [{ "ayah": 1, "start": 13080, "end": 17080 },
            { "ayah": 2, "start": 19480, "end": 22520 }, …] }`,
  },
  {
    id: 'word-timings',
    path: '/api/v1/word-timings/{slug}/{surah}',
    what: 'متى تبدأ كل كلمة ومتى تنتهي، بترقيم كلمات مصحف قالون.',
    sample: `{ "slug": "abdulhamid_algriw", "surah": 1,
  "words": [{ "ayah": 1, "word": 1, "start": 13080, "end": 13880 },
            { "ayah": 1, "word": 2, "start": 13880, "end": 14200 }, …] }`,
  },
];

const COMING = [
  { id: 'text', title: 'نص القرآن برواية قالون', what: 'النص كاملًا كما في مصحف الجماهيرية: 6214 آية في 114 سورة، بأجزائه وأحزابه وأثمانه.' },
  { id: 'converter', title: 'محوّل الترقيم', what: 'من ترقيم حفص إلى قالون وبالعكس، آية بآية: البقرة 286 عند حفص هي 285 عند قالون.' },
];

const ERRORS = [
  ['401', 'missing_key / invalid_key', 'لا مفتاح، أو مفتاح غير صحيح أو محذوف.'],
  ['404', 'not_found', 'لا قارئ بهذا الاسم أو لا سورة له بهذا الرقم.'],
  ['429', 'rate_limited', 'تجاوزت حدّ المفتاح؛ انتظر قليلًا.'],
  ['502', 'upstream', 'مصدر البيانات لم يجب؛ أعد المحاولة بعد قليل.'],
];

const code = 'rounded-2xl bg-[#0b0b0c] p-4 text-left font-mono text-[13px] leading-[1.8] text-white overflow-x-auto';
const h2 = 'font-display text-[24px] font-black text-ink sm:text-[30px]';
const p = 'text-[16px] leading-[1.9] text-ink-muted';

/** How to use the API: a key, the four endpoints, limits, errors, the licence. */
export default function Page() {
  return (
    <article className="mx-auto flex w-full max-w-[860px] flex-col gap-10 px-4 pb-16 pt-6 text-foreground sm:px-6 sm:pt-10">
      <section
        data-header-tone="dark"
        className="relative isolate flex flex-col gap-4 overflow-hidden rounded-[28px] bg-hero p-6 text-on-hero sm:rounded-[36px] sm:p-9"
      >
        <CardMark />
        <h1 className="font-display text-[32px] font-black leading-[1.25] sm:text-[48px]">الواجهة البرمجية</h1>
        <p className="max-w-[620px] text-[17px] leading-[1.85] text-on-hero/70">
          القرّاء والسور وتوقيت كل آية وكل كلمة برواية قالون، بصيغة JSON. لكل مطوّر مفتاح شخصي مجاني،
          ليبني عليها موقعه أو تطبيقه.
        </p>
        <Link
          href="/account?next=/developers"
          className="flex h-12 w-fit items-center gap-2 rounded-full bg-gradient-to-b from-gold-light to-gold px-6 text-[16px] font-bold text-[#1b1712]"
        >
          <IoKeyOutline className="h-[18px] w-[18px]" aria-hidden="true" />
          احصل على مفتاح
        </Link>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className={h2}>البدء</h2>
        <ol className="flex list-decimal flex-col gap-2 ps-6 text-[16px] leading-[1.9] text-ink-muted">
          <li>ادخل إلى حسابك بحساب Google أو برابط على البريد.</li>
          <li>أنشئ مفتاحًا من صفحة حسابك وانسخه؛ لا يظهر إلا مرة واحدة.</li>
          <li>
            أرسله في رأس كل طلب: <code dir="ltr" className="font-mono text-ink">Authorization: Bearer dk_…</code>
          </li>
        </ol>
        <pre dir="ltr" className={code}>{`curl https://dhikr.ly/api/v1/timings/abdulhamid_algriw/1 \\
  -H "Authorization: Bearer $DHIKR_KEY"`}</pre>
        <pre dir="ltr" className={code}>{`const response = await fetch('https://dhikr.ly/api/v1/reciters', {
  headers: { Authorization: \`Bearer \${process.env.DHIKR_KEY}\` },
});
const { data } = await response.json();`}</pre>
        <p className={p}>
          احفظ المفتاح في الخادم لا في كود يصل إلى المتصفح، فمن رآه استطاع استعماله باسمك. إن ظهر فاحذفه
          من حسابك وأنشئ غيره.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className={h2}>العناوين</h2>
        <ul className="flex flex-col gap-3">
          {ENDPOINTS.map((e) => (
            <li key={e.path} id={e.id} className="flex scroll-mt-24 flex-col gap-2.5 rounded-[20px] border border-border bg-surface p-4">
              <code dir="ltr" className="text-left font-mono text-[14px] font-bold text-ink">
                GET {e.path}
              </code>
              <span className="text-[15px] leading-[1.8] text-ink-muted">{e.what}</span>
              <pre dir="ltr" className={code}>{e.sample}</pre>
            </li>
          ))}
        </ul>
        <p className={p}>
          الـ slug هو اسم التلاوة كما في رابط صفحة القارئ (مثل abdulhamid_algriw)، ورقم السورة من 1 إلى
          114. كل جواب على هذه الصورة:
        </p>
        <pre dir="ltr" className={code}>{`{
  "data": { "slug": "abdulhamid_algriw", "surah": 1,
            "ayahs": [{ "ayah": 1, "start": 13080, "end": 17080 }, …] },
  "license": "CC BY-NC 4.0",
  "attribution": "ذكر · dhikr.ly"
}`}</pre>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className={h2}>الحدود والأخطاء</h2>
        <p className={p}>
          لكل مفتاح 120 طلبًا في الدقيقة و20000 في اليوم. والأخطاء تعود بـ{' '}
          <code dir="ltr" className="font-mono text-ink">{`{ "error": { "code", "message" } }`}</code>:
        </p>
        <ul className="flex flex-col gap-2">
          {ERRORS.map(([status, name, what]) => (
            <li key={status} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-[18px] border border-border bg-surface px-4 py-3">
              <code dir="ltr" className="font-mono text-[14px] font-bold text-ink">
                {status} {name}
              </code>
              <span className="text-[15px] text-ink-muted">{what}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className={h2}>الترخيص والاستعمال</h2>
        <p className={p}>
          البيانات مرخّصة بـ{' '}
          <a href="https://creativecommons.org/licenses/by-nc/4.0/deed.ar" className="font-bold text-ink underline">
            المشاع الإبداعي، نسب المصنَّف، غير تجاري 4.0
          </a>
          : استعملها وانقلها وابنِ عليها مع ذكر «ذكر · dhikr.ly»، في غير التجارة. وللاستعمال التجاري
          راسلنا.
        </p>
        <p className={p}>
          نسجّل كل طلب (العنوان والوقت والبلد وحجم الجواب) مع حساب صاحب المفتاح، لنعرف ما يُستعمل
          ونحسّنه. ترى استعمالك في صفحة حسابك.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className={h2}>قيد الإعداد</h2>
        <ul className="flex flex-col gap-2.5">
          {COMING.map((c) => (
            <li key={c.id} id={c.id} className="flex scroll-mt-24 flex-col gap-1.5 rounded-[20px] border border-dashed border-border-strong p-4">
              <span className="text-[17px] font-bold text-ink">{c.title}</span>
              <span className="text-[15px] leading-[1.8] text-ink-muted">{c.what}</span>
            </li>
          ))}
        </ul>
        <p className={p}>
          وتنزيل الصوتيات متاح الآن من صفحة كل قارئ: سورة واحدة لأي أحد، والختمة كاملة لمن دخل إلى
          حسابه.
        </p>
      </section>

      <section className="flex flex-col items-start gap-4 rounded-[28px] bg-hero p-6 text-on-hero sm:p-8">
        <h2 className="font-display text-[26px] font-black sm:text-[32px]">ابدأ الآن</h2>
        <p className="max-w-[560px] text-[16px] leading-[1.85] text-on-hero/70">
          ادخل بحساب Google أو برابط على بريدك، وأنشئ مفتاحك في دقيقة. مجانًا، ولا بطاقة ولا اشتراك.
        </p>
        <Link
          href="/account?next=/developers"
          className="flex h-12 items-center gap-2 rounded-full bg-gradient-to-b from-gold-light to-gold px-6 text-[16px] font-bold text-[#1b1712]"
        >
          <IoKeyOutline className="h-[18px] w-[18px]" aria-hidden="true" />
          احصل على مفتاح
        </Link>
      </section>
    </article>
  );
}
