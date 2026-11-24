import Link from 'next/link';

import { DocumentationForAi } from '@/components/site/documentation-for-ai';
import { type ContentsItem,DocumentationShell } from '@/components/site/documentation-shell';
import { CardMark } from '@/components/site/logo-mark';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata = buildPageMetadata({
  locale: 'ar',
  path: '/developers',
  title: 'الواجهة البرمجية | ذكر',
  description:
    'توثيق واجهة ذكر البرمجية: القرّاء والسور، وتوقيت كل آية وكل كلمة، ونص القرآن برواية قالون، ومحوّل الترقيم بين حفص وقالون. بصيغة JSON وبمفتاح شخصي مجاني.',
  omitLanguages: true,
});

const BASE = 'https://dhikr.ly/api/v1';

const TOC: ContentsItem[] = [
  { id: 'overview', title: 'نظرة عامة', group: 'البداية' },
  { id: 'start', title: 'البدء في خمس دقائق', group: 'البداية' },
  { id: 'auth', title: 'المفتاح والمصادقة', group: 'البداية' },
  { id: 'responses', title: 'شكل الجواب', group: 'البداية' },
  { id: 'model', title: 'المفاهيم والترقيم', group: 'البداية' },
  { id: 'reciters', title: 'القرّاء', group: 'المرجع' },
  { id: 'audio', title: 'قارئ وسوره', group: 'المرجع' },
  { id: 'timings', title: 'توقيت الآيات', group: 'المرجع' },
  { id: 'word-timings', title: 'توقيت الكلمات', group: 'المرجع' },
  { id: 'text', title: 'النص برواية قالون', group: 'المرجع' },
  { id: 'converter', title: 'محوّل الترقيم', group: 'المرجع' },
  { id: 'tafsir', title: 'التفاسير', group: 'المرجع' },
  { id: 'ayah', title: 'دراسة الآية', group: 'المرجع' },
  { id: 'library', title: 'المكتبة', group: 'المرجع' },
  { id: 'mawsuah', title: 'التفسير الموضوعي', group: 'المرجع' },
  { id: 'hadith', title: 'كتب الحديث', group: 'المرجع' },
  { id: 'prayer', title: 'مواقيت الصلاة (مفتوحة)', group: 'المرجع' },
  { id: 'errors', title: 'الأخطاء', group: 'المرجع' },
  { id: 'guide-ayah', title: 'تظليل الآية مع التلاوة', group: 'دروس' },
  { id: 'guide-words', title: 'تظليل كلمة كلمة', group: 'دروس' },
  { id: 'guide-tafsir', title: 'تفسير مرقّم بحفص لآية قالون', group: 'دروس' },
  { id: 'guide-download', title: 'تنزيل تلاوة كاملة', group: 'دروس' },
  { id: 'limits', title: 'الحدود والتخزين', group: 'سياسات' },
  { id: 'license', title: 'الترخيص والنسبة', group: 'سياسات' },
  { id: 'logging', title: 'ما نسجّله', group: 'سياسات' },
  { id: 'changelog', title: 'سجل التغييرات', group: 'سياسات' },
  { id: 'faq', title: 'أسئلة شائعة', group: 'سياسات' },
];

// Monospace for code, with the site's Arabic face for the Arabic inside samples.
const mono = '[font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,var(--font-thmanyah),monospace]';
const code = `overflow-x-auto rounded-2xl bg-[#0b0b0c] p-4 text-left ${mono} text-[13px] leading-[1.8] text-white`;
const h2 = 'font-display text-[26px] font-black leading-[1.3] text-ink sm:text-[30px]';
const h3 = 'text-[18px] font-bold text-ink';
const p = 'text-[16px] leading-[1.95] text-ink-muted';
const inline = `rounded-md bg-surface-sunken px-1.5 py-0.5 ${mono} text-[13.5px] text-ink`;

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="flex scroll-mt-24 flex-col gap-4">
      <h2 className={h2}>{title}</h2>
      {children}
    </section>
  );
}

function Code({ children }: { children: string }) {
  return (
    <pre dir="ltr" className={code}>
      {children}
    </pre>
  );
}

function C({ children }: { children: string }) {
  return (
    <code dir="ltr" className={inline}>
      {children}
    </code>
  );
}

/** A table of names: field or parameter, its type, what it holds. */
function Fields({ rows, head = ['الحقل', 'النوع', 'المعنى'] }: { rows: [string, string, string][]; head?: string[] }) {
  return (
    <div className="overflow-x-auto rounded-[18px] border border-border">
      <table className="w-full min-w-[520px] border-collapse text-[14.5px]">
        <thead>
          <tr className="bg-surface-sunken text-start">
            {head.map((cell) => (
              <th key={cell} className="px-4 py-2.5 text-start font-bold text-ink">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([name, type, what], index) => (
            <tr key={`${name}-${index}`} className="border-t border-border align-top">
              <td className="whitespace-nowrap px-4 py-2.5">
                <C>{name}</C>
              </td>
              {/^[\x20-\x7E–]+$/.test(type) ? (
                <td dir="ltr" className="whitespace-nowrap px-4 py-2.5 text-start font-mono text-[13px] text-ink-subtle">
                  {type}
                </td>
              ) : (
                <td className="whitespace-nowrap px-4 py-2.5 text-[14px] text-ink">{type}</td>
              )}
              <td className="px-4 py-2.5 leading-[1.8] text-ink-muted">{what}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Endpoint({ path, children }: { path: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-[16px] border border-border bg-surface px-4 py-3">
      <span className="rounded-lg bg-[#1f5a43] px-2 py-0.5 font-mono text-[12px] font-bold text-white">GET</span>
      <code dir="ltr" className="font-mono text-[14px] font-bold text-ink">
        {path}
      </code>
      {children}
    </div>
  );
}

/** The developers' documentation: everything the keyed API offers, how and on what terms. */
export default function Page() {
  return (
    <DocumentationShell toc={TOC}>
      <header
        data-header-tone="dark"
        className="relative isolate flex flex-col gap-4 overflow-hidden rounded-[28px] bg-hero p-6 text-on-hero sm:rounded-[36px] sm:p-9"
      >
        <CardMark />
        <span className="text-[13px] font-bold tracking-wide text-gold-light">التوثيق · الإصدار 1</span>
        <h1 className="font-display text-[32px] font-black leading-[1.25] sm:text-[46px]">الواجهة البرمجية</h1>
        <p className="max-w-[640px] text-[17px] leading-[1.85] text-on-hero/70">
          القرّاء والسور، وتوقيت كل آية وكل كلمة، ونص القرآن برواية قالون، ومحوّل الترقيم بين حفص وقالون،
          بصيغة JSON. لكل مطوّر مفتاح شخصي مجاني، بلا حدود للاستعمال.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/account?next=/developers"
            className="flex h-11 items-center rounded-full bg-gradient-to-b from-gold-light to-gold px-5 text-[15px] font-bold text-[#1b1712]"
          >
            احصل على مفتاح
          </Link>
          <a
            href="#start"
            className="flex h-11 items-center rounded-full bg-on-hero/[0.08] px-5 text-[15px] font-bold text-on-hero hover:bg-on-hero/15"
          >
            ابدأ من هنا
          </a>
        </div>
        <DocumentationForAi />
      </header>

      <Section id="overview" title="نظرة عامة">
        <p className={p}>
          العنوان الأساسي لكل الطلبات <C>{BASE}</C>. كل الطلبات من نوع GET، وكل الأجوبة JSON بترميز UTF-8.
          البيانات كلها برواية قالون عن نافع، وبحدود آيات مصحف الجماهيرية كما هي مطبوعة (6214 آية)، إلا
          حيث يُذكر حفص صراحة.
        </p>
        <Fields
          head={['العنوان', 'المصدر', 'ما يعطيه']}
          rows={[
            ['/reciters', 'كل القرّاء', 'الاسم والرواية والنمط والبلد وعدد السور والترتيب والصورة والرابط.'],
            ['/reciters/{slug}', 'قارئ واحد', 'كل سوره: عدد الآيات والمدة والحجم ورابط ملف MP3.'],
            ['/timings/{slug}/{surah}', 'توقيت الآيات', 'بداية كل آية ونهايتها بالملّي ثانية، لكل القرّاء.'],
            ['/word-timings/{slug}/{surah}', 'توقيت الكلمات', 'بداية كل كلمة ونهايتها، لأغلب القرّاء.'],
            ['/text/{surah}', 'النص', 'نص السورة آيةً آيةً، مع الجزء والحزب والثُمن.'],
            ['/numbering/{from}/{surah}/{ayah}', 'محوّل الترقيم', 'رقم الآية بين حفص وقالون في الاتجاهين.'],
            ['/tafsir/{id}/{surah}', 'التفاسير', 'تسعة تفاسير كاملة على آيات قالون.'],
            ['/ayah/{surah}/{ayah}', 'دراسة الآية', 'المعاني والأسباب والبلاغة والأحكام والإعراب والتدبّر، من موسوعة quranpedia.'],
            ['/library/{book}/{section}', 'المكتبة', 'كتب التجويد والرسم والضبط والمتون، نصًّا مقسّمًا.'],
            ['/mawsuah/{id}', 'التفسير الموضوعي', '333 موضوعًا من موسوعة التفسير الموضوعي، بنصها وحواشيها.'],
            ['/hadith/{slug}/{number}', 'كتب الحديث', 'سبعة كتب: اللؤلؤ والمرجان ورياض الصالحين وبلوغ المرام وغيرها، مبوّبة.'],
          ]}
        />
      </Section>

      <Section id="start" title="البدء في خمس دقائق">
        <ol className="flex list-decimal flex-col gap-2 ps-6 text-[16px] leading-[1.9] text-ink-muted">
          <li>
            ادخل إلى{' '}
            <Link href="/account?next=/developers" className="font-bold text-ink underline">
              حسابك
            </Link>{' '}
            بحساب Google أو برابط يصلك على البريد.
          </li>
          <li>أنشئ مفتاحًا من صفحة الحساب وانسخه؛ لا يظهر كاملًا إلا مرة واحدة.</li>
          <li>اطلب أول عنوان، وأرسل المفتاح في رأس الطلب:</li>
        </ol>
        <Code>{`curl ${BASE}/reciters \\
  -H "Authorization: Bearer $DHIKR_KEY"`}</Code>
        <h3 className={h3}>JavaScript</h3>
        <Code>{`const response = await fetch('${BASE}/timings/abdulhamid_algriw/1', {
  headers: { Authorization: \`Bearer \${process.env.DHIKR_KEY}\` },
});
if (!response.ok) throw new Error((await response.json()).error.message);
const { data } = await response.json();
console.log(data.ayahs[0]); // { ayah: 1, start: 13080, end: 17080 }`}</Code>
        <h3 className={h3}>Python</h3>
        <Code>{`import os, requests

r = requests.get(
    "${BASE}/text/1",
    headers={"Authorization": f"Bearer {os.environ['DHIKR_KEY']}"},
    timeout=10,
)
r.raise_for_status()
for ayah in r.json()["data"]["ayahs"]:
    print(ayah["ayah"], ayah["text"])`}</Code>
      </Section>

      <Section id="auth" title="المفتاح والمصادقة">
        <p className={p}>
          كل طلب يحمل مفتاحًا شخصيًا في رأس <C>Authorization</C> بصيغة <C>Bearer dk_…</C>. يبدأ كل مفتاح بـ{' '}
          <C>dk_</C>. لك حتى عشرة مفاتيح، تنشئها وتحذفها من صفحة حسابك، وترى هناك استعمال كل منها.
        </p>
        <ul className="flex list-disc flex-col gap-1.5 ps-6 text-[16px] leading-[1.9] text-ink-muted">
          <li>احفظ المفتاح في الخادم، لا في كود يصل إلى المتصفح أو داخل تطبيق منشور؛ من رآه استعمله باسمك.</li>
          <li>نحفظ بصمة المفتاح لا المفتاح نفسه، فلا نستطيع أن نريك إياه مرة أخرى. إن ضاع فأنشئ غيره.</li>
          <li>إن ظهر مفتاحك لأحد فاحذفه من صفحة الحساب؛ يتوقف في أقل من دقيقة.</li>
          <li>
            تقبل الواجهة الطلب من أي موقع (CORS مفتوح)، لكن الأسلم أن يمرّ الطلب عبر خادمك ليبقى المفتاح سرًا.
          </li>
        </ul>
      </Section>

      <Section id="responses" title="شكل الجواب">
        <p className={p}>
          كل جواب ناجح (200) يحمل البيانات في <C>data</C>، ومعها الترخيص والنسبة:
        </p>
        <Code>{`{
  "data": { … },
  "license": "CC BY-NC 4.0",
  "attribution": "ذكر · dhikr.ly"
}`}</Code>
        <p className={p}>
          وفي الرؤوس: <C>X-License</C> بالترخيص، و<C>Link</C> برابط الترخيص والتوثيق، و
          <C>Cache-Control: private, no-store</C>. الأرقام كلها أعداد صحيحة، والأوقات بالملّي ثانية من بداية ملف
          الصوت، والنصوص بالعربية كما في المصحف.
        </p>
      </Section>

      <Section id="model" title="المفاهيم والترقيم">
        <h3 className={h3}>slug: اسم التلاوة</h3>
        <p className={p}>
          لكل تلاوة اسم ثابت بحروف لاتينية صغيرة وأرقام وشرطة سفلية، مثل <C>abdulhamid_algriw</C>. هو نفسه في
          رابط صفحة القارئ وفي روابط ملفات الصوت، ولا يتغير أبدًا. تجد القائمة كاملة في <C>/reciters</C>.
        </p>
        <h3 className={h3}>عدّ الآي: قالون وحفص</h3>
        <p className={p}>
          نرقّم الآيات كما يطبعها مصحف الجماهيرية برواية قالون، بالعدّ المدني: 6214 آية. أما حفص فبالعدّ الكوفي:
          6236 آية. يختلف الرقمان في مواضع كثيرة، فالبقرة 285 آية عندنا و286 عند حفص. والبسملة في أول الفاتحة
          غير معدودة آيةً في قالون، فأول الفاتحة عندنا «الحمد لله رب العالمين». أغلب التفاسير والترجمات مرقّمة
          بحفص؛ فحوّل الرقم بـ<C>/numbering</C> قبل أن تربطها بآياتنا.
        </p>
        <h3 className={h3}>ترقيم الكلمات</h3>
        <p className={p}>
          تُرقّم الكلمات داخل كل آية من 1 كما تظهر في المصحف المطبوع. علامة الحزب «۞» ليست كلمة ولا يقابلها صوت،
          فلا تُعدّ.
        </p>
        <h3 className={h3}>الأجزاء والأحزاب والأثمان</h3>
        <p className={p}>
          30 جزءًا، في كل جزء حزبان، وفي كل حزب ثمانية أثمان: 480 ثُمنًا. نقرأ بدايات الأثمان من علامات «۞»
          المطبوعة في المصحف، وتقع بداية كل جزء على ثُمن.
        </p>
        <h3 className={h3}>الصوت</h3>
        <p className={p}>
          ملف كل سورة MP3 كامل، واسمه رقم السورة بثلاث خانات (<C>001.mp3</C> إلى <C>114.mp3</C>). قد يسبق
          الآيةَ الأولى استعاذة أو بسملة، ولذلك يبدأ توقيت الآية الأولى بعد بداية الملف.
        </p>
      </Section>

      <Section id="reciters" title="القرّاء">
        <Endpoint path="/reciters" />
        <p className={p}>كل التلاوات، الأكثر استماعًا أولًا.</p>
        <Fields
          rows={[
            ['slug', 'string', 'اسم التلاوة الثابت.'],
            ['name', 'string', 'اسم القارئ بالعربية.'],
            ['riwaya', 'string', 'الرواية، مثل «قالون عن نافع».'],
            ['style', 'string | null', 'نمط التلاوة: مرتل، مجود، حدر، معلم.'],
            ['country', 'string | null', 'رمز بلد القارئ (ISO 3166)، مثل LY.'],
            ['surahs', 'number', 'عدد السور المسجّلة.'],
            ['rank', 'number | null', 'ترتيبه في الأكثر استماعًا.'],
            ['portrait', 'string | null', 'رابط صورته.'],
            ['page', 'string', 'رابط صفحته في ذكر.'],
          ]}
        />
        <Code>{`[{ "slug": "abdulhamid_algriw", "name": "عبدالحميد القريو",
   "riwaya": "قالون عن نافع", "style": "مرتل", "country": "LY",
   "surahs": 114, "rank": 1,
   "portrait": "https://quran-audio.abdeljawad.com/images/abdulhamid_algriw.jpg?v=…",
   "page": "https://dhikr.ly/reciter/…" }, …]`}</Code>
      </Section>

      <Section id="audio" title="قارئ وسوره">
        <Endpoint path="/reciters/{slug}" />
        <p className={p}>تلاوة واحدة وكل سورها، بالعدّ والمدة والحجم ورابط الصوت.</p>
        <Fields
          rows={[
            ['slug, name, riwaya, style, country, page', '…', 'كما في /reciters.'],
            ['surahs[].surah', 'number', 'رقم السورة.'],
            ['surahs[].name', 'string | null', 'اسم السورة.'],
            ['surahs[].ayahs', 'number | null', 'عدد آياتها بعدّ قالون.'],
            ['surahs[].seconds', 'number | null', 'مدتها بالثواني.'],
            ['surahs[].bytes', 'number', 'حجم الملف بالبايت.'],
            ['surahs[].audio', 'string', 'رابط ملف MP3.'],
          ]}
        />
        <Code>{`{ "slug": "abdulhamid_algriw", "name": "عبدالحميد القريو", …,
  "surahs": [{ "surah": 2, "name": "البقرة", "ayahs": 285, "seconds": 7910,
               "bytes": 63301843,
               "audio": "https://quran-audio.abdeljawad.com/audio/abdulhamid_algriw/002.mp3" }, …] }`}</Code>
      </Section>

      <Section id="timings" title="توقيت الآيات">
        <Endpoint path="/timings/{slug}/{surah}" />
        <p className={p}>
          متى تبدأ كل آية ومتى تنتهي في ملف السورة. متاح لكل التلاوات. حيث يوجد صف رقمه 0 فهو ما قبل الآية
          الأولى (الاستعاذة أو البسملة).
        </p>
        <Fields
          head={['المُدخل', 'النوع', 'المعنى']}
          rows={[
            ['slug', 'string', 'اسم التلاوة.'],
            ['surah', '1–114', 'رقم السورة.'],
          ]}
        />
        <Fields
          rows={[
            ['ayahs[].ayah', 'number', 'رقم الآية بعدّ قالون (0 لما قبل الأولى).'],
            ['ayahs[].start', 'number', 'بدايتها بالملّي ثانية.'],
            ['ayahs[].end', 'number', 'نهايتها بالملّي ثانية.'],
          ]}
        />
        <Code>{`{ "slug": "abdulhamid_algriw", "surah": 1,
  "ayahs": [{ "ayah": 1, "start": 13080, "end": 17080 },
            { "ayah": 2, "start": 19480, "end": 22520 }, …] }`}</Code>
      </Section>

      <Section id="word-timings" title="توقيت الكلمات">
        <Endpoint path="/word-timings/{slug}/{surah}" />
        <p className={p}>
          متى تبدأ كل كلمة ومتى تنتهي، بترقيم كلمات المصحف. متاح لأغلب التلاوات؛ والتلاوة التي لا توقيت لكلماتها
          بعد تجيب 404.
        </p>
        <Fields
          rows={[
            ['words[].ayah', 'number', 'رقم الآية.'],
            ['words[].word', 'number', 'رقم الكلمة داخل الآية، من 1.'],
            ['words[].start', 'number', 'بدايتها بالملّي ثانية.'],
            ['words[].end', 'number', 'نهايتها بالملّي ثانية.'],
          ]}
        />
        <Code>{`{ "slug": "abdulhamid_algriw", "surah": 1,
  "words": [{ "ayah": 1, "word": 1, "start": 13080, "end": 13880 },
            { "ayah": 1, "word": 2, "start": 13880, "end": 14200 }, …] }`}</Code>
      </Section>

      <Section id="text" title="النص برواية قالون">
        <Endpoint path="/text/{surah}" />
        <p className={p}>
          نص السورة آيةً آيةً كما يطبعها مصحف الجماهيرية، بالرسم والضبط على رواية قالون، ومع كل آية جزؤها. وعلى
          الآية التي يبدأ عندها ثُمن رقمُه ورقم حزبه.
        </p>
        <Fields
          rows={[
            ['surah', 'number', 'رقم السورة.'],
            ['name', 'string', 'اسم السورة.'],
            ['riwaya', '"qalun"', 'الرواية.'],
            ['count', 'number', 'عدد الآيات.'],
            ['ayahs[].ayah', 'number', 'رقم الآية.'],
            ['ayahs[].text', 'string', 'نص الآية، بلا رقمها.'],
            ['ayahs[].juz', '1–30', 'الجزء.'],
            ['ayahs[].thumun', '1–480', 'رقم الثُمن، على الآية التي يبدأ عندها فقط.'],
            ['ayahs[].hizb', '1–60', 'رقم الحزب، مع الثُمن.'],
          ]}
        />
        <Code>{`{ "surah": 1, "name": "الفاتحة", "riwaya": "qalun", "count": 7,
  "ayahs": [{ "ayah": 1, "text": "اِ۬لْحَمْدُ لِلهِ رَبِّ اِ۬لْعَٰلَمِينَ",
              "juz": 1, "thumun": 1, "hizb": 1 }, …] }`}</Code>
        <p className={p}>
          في موضعين تقع علامة الثُمن داخل الآية لا في أولها (البقرة 84 والكهف 22)، كما في المصحف؛ والثُمن ينسب
          إلى تلك الآية.
        </p>
      </Section>

      <Section id="converter" title="محوّل الترقيم">
        <Endpoint path="/numbering/{hafs|qalun}/{surah}/{ayah}" />
        <p className={p}>
          رقم الآية في العدّ الآخر. <C>hafs</C> يحوّل من حفص إلى قالون، و<C>qalun</C> من قالون إلى حفص. قد تقابل
          الآيةُ أكثر من آية في العدّ الآخر، فالجواب قائمة. وبسملة الفاتحة (حفص 1:1) لا رقم لها في قالون، فقائمتها
          فارغة ومعها ملاحظة.
        </p>
        <Fields
          rows={[
            ['from, to', '"hafs" | "qalun"', 'العدّ المحوَّل منه وإليه.'],
            ['surah, ayah', 'number', 'الآية المطلوبة.'],
            ['ayahs', 'number[]', 'رقمها أو أرقامها في العدّ الآخر.'],
            ['note', 'string', 'عند البسملة وحدها.'],
          ]}
        />
        <Code>{`GET /numbering/hafs/2/286
{ "from": "hafs", "to": "qalun", "surah": 2, "ayah": 286, "ayahs": [285] }

GET /numbering/qalun/1/1
{ "from": "qalun", "to": "hafs", "surah": 1, "ayah": 1, "ayahs": [2] }`}</Code>
        <p className={p}>
          الجداول نفسها التي تستعملها تطبيقاتنا، مطابَقة على فهرس المصحف المطبوع، وكل آية في العدّين تعود إلى
          نفسها إذا حُوّلت ذهابًا وإيابًا.
        </p>
      </Section>

      <Section id="tafsir" title="التفاسير">
        <Endpoint path="/tafsir" />
        <p className={p}>
          التفاسير التسعة التي في تطبيقاتنا: <C>{'[{ id, title, author, page }]'}</C>.
        </p>
        <Endpoint path="/tafsir/{id}/{surah}" />
        <p className={p}>
          سورة كاملة في تفسير واحد، مرتبة على آيات قالون. المصدر مرقّم بحفص، فكل مقطع يحمل <C>hafs</C>: أول آية
          وآخرها مما فُسِّر فيه في ترقيم حفص. وقد يتكرر المقطع في آيتين متجاورتين إذا جمعهما.
        </p>
        <Code>{`GET /tafsir/saadi/1
{ "tafsir": "saadi", "title": "تفسير السعدي", "author": "…", "surah": 1,
  "ayahs": [{ "ayah": 1, "passages": [{ "hafs": [1, 2], "text": "…" }] }] }`}</Code>
      </Section>

      <Section id="ayah" title="دراسة الآية">
        <Endpoint path="/ayah/{surah}/{ayah}" />
        <p className={p}>
          كل ما في الموسوعة القرآنية (quranpedia.net) عن آية من آياتنا، بإذن أصحابها. الأقسام الحاضرة وحدها تظهر في{' '}
          <C>study</C>، و<C>hafs</C> أرقام الآية في ترقيم حفص التي جُمعت منها.
        </p>
        <Fields
          rows={[
            ['meanings', '{ word, meaning, book }[]', 'معاني الكلمات.'],
            ['asbab', '{ text, book, author, from, to }[]', 'أسباب النزول.'],
            ['topics', 'string[]', 'الموضوعات.'],
            ['balagha', '{ text, source }[]', 'البلاغة.'],
            ['rulings', '{ text, by, book }[]', 'الأحكام.'],
            ['similar', '{ text, ayahs }[]', 'المتشابهات.'],
            ['grammar', '{ text, book, author }[]', 'الإعراب.'],
            ['abrogation', '{ text, book, author, died }[]', 'الناسخ والمنسوخ.'],
            ['reflections, topicNotes', '{ text, by }[]', 'وقفات تدبّرية وخواطر.'],
            ['fatwas', '{ title, question, answer, mufti, url }[]', 'فتاوى.'],
            ['questions', '{ set, question, answer }[]', 'سؤال وجواب.'],
          ]}
        />
        <Code>{`GET /ayah/2/255
{ "surah": 2, "ayah": 255, "hafs": [257],
  "study": { "topics": ["…"], "balagha": [{ "text": "…", "source": "…" }] },
  "source": "quranpedia.net", "credits": { … } }`}</Code>
        <p className={p}>
          اذكر «الموسوعة القرآنية quranpedia.net» بجوار ما تعرضه منها، مع أصحاب الكتب المذكورين في كل عنصر.
        </p>
      </Section>

      <Section id="library" title="المكتبة">
        <Endpoint path="/library" />
        <p className={p}>
          الأقسام والكتب: <C>{'{ categories: [{ id, title, subtitle }], books: [{ id, category, title, author, items, cover, page }] }'}</C>.
        </p>
        <Endpoint path="/library/{book}" />
        <p className={p}>
          كتاب واحد ومحتوياته: <C>{'{ id, category, title, author, source, sections: [{ section, chapter, title, headings }] }'}</C>.
        </p>
        <Endpoint path="/library/{book}/{section}" />
        <p className={p}>
          قسم واحد نصًّا: <C>{'{ book, section, of, chapter, title, blocks: [{ type, text, page?, level? }] }'}</C>. والنسخ
          المطبوعة (PDF) على صفحة كل كتاب في الموقع.
        </p>
      </Section>

      <Section id="mawsuah" title="التفسير الموضوعي">
        <Endpoint path="/mawsuah" />
        <p className={p}>
          أبواب موسوعة التفسير الموضوعي (مركز تفسير للدراسات القرآنية) وموضوعاتها، بإذن خطي من الناشر:{' '}
          <C>{'{ title, publisher, sections: [{ id, title, topics: [{ id, title, parts, page }] }] }'}</C>.
        </p>
        <Endpoint path="/mawsuah/{id}" />
        <p className={p}>
          موضوع كامل كما في تطبيقاتنا: <C>{'{ id, section, title, blocks, notes, page }'}</C>. كل كتلة لها نوع{' '}
          <C>k</C>: عنوان <C>h</C> (ومستواه <C>l</C>)، وفقرة <C>p</C>، واقتباس <C>q</C>، وشعر <C>v</C>، وإحالة{' '}
          <C>x</C>، وقائمة <C>l</C> (<C>items</C>)، وجدول <C>t</C> (<C>rows</C>). ونص الكتلة قطع (<C>r</C>): نص عادي،
          أو <C>{'["q", نص الآية]'}</C>، أو <C>{'["a", السورة, من, إلى, التسمية]'}</C> بترقيم حفص، أو{' '}
          <C>{'["f", رقم الحاشية]'}</C>.
        </p>
        <Code>{`GET /mawsuah/226
{ "id": 226, "section": "السنن الإلهية", "title": "الابتلاء",
  "blocks": [{ "k": "h", "l": 1, "r": ["مفهوم الابتلاء"] },
             { "k": "p", "r": ["قال تعالى: ", ["q", "…"], " ", ["a", 2, 155, 155, "[البقرة: ١٥٥]"]] }],
  "notes": [{ "n": 1, "r": ["مقاييس اللغة، ابن فارس ١/ ٢٩٢."] }] }`}</Code>
        <p className={p}>حوّل أرقام الاستشهادات إلى آياتنا بـ<C>/numbering/hafs</C>، واذكر الموسوعة وناشرها بجوار ما تعرضه منها.</p>
      </Section>

      <Section id="hadith" title="كتب الحديث">
        <Endpoint path="/hadith" />
        <p className={p}>
          الكتب: <C>{'[{ slug, title, author, hadiths, page }]'}</C>.
        </p>
        <Endpoint path="/hadith/{slug}?chapter={n}" />
        <p className={p}>
          أبواب الكتاب: <C>{'{ slug, title, source, chapters: [{ chapter, title, from, to, hadiths }] }'}</C>. ومع{' '}
          <C>chapter</C> تأتي أحاديث ذلك الباب في <C>hadiths</C>.
        </p>
        <Endpoint path="/hadith/{slug}/{number}" />
        <p className={p}>
          حديث واحد برقمه في الكتاب: <C>{'{ collection, number, chapter, title, text, narrator, grade, reference, page }'}</C>.
          و<C>title</C> الباب حيث يختلف عن الكتاب (في اللؤلؤ والمرجان)، والحقول الفارغة <C>null</C>.
        </p>
        <Code>{`GET /hadith/lulu_marjan/1
{ "collection": "lulu_marjan", "number": 1,
  "chapter": "تغليظ الكذب على رسول الله صلى الله عليه وسلم", "title": null,
  "text": "حديث عليّ قال: …", "reference": "أخرجه البخاري في: 3 كتاب العلم: 38 باب …" }`}</Code>
      </Section>

      <Section id="prayer" title="مواقيت الصلاة (مفتوحة)">
        <p className={p}>
          هذه العناوين مفتوحة: <b>دون مفتاح ولا حساب</b>، وبترخيص المشاع الإبداعي، نسب المصنَّف 4.0. للمدن الليبية جداولها الرسمية من
          الأوقاف، ولغيرها الحساب بطريقة كل بلد. التفاصيل والتنزيل في{' '}
          <Link href="/prayer-times" className="font-bold text-ink underline">
            أداة المدن الليبية
          </Link>{' '}
          و
          <Link href="/prayer-methods" className="font-bold text-ink underline">
            أداة طرق الحساب
          </Link>
          .
        </p>
        <Code>{`GET /prayer-times/libya                  المدن
GET /prayer-times/libya/today            اليوم في كل مدينة
GET /prayer-times/libya/{city}           اليوم في مدينة (?date= ?month= ?year)
GET /prayer-times/libya/download/libya-prayer-times.csv   (.json .sqlite)
GET /prayer-times/methods                كل طريقة بأرقامها، وطريقة كل بلد
GET /prayer-times/world/{country}        طريقة البلد ومواقيت عاصمته اليوم
GET /prayer-times/calc?lat=&lng=&tz=     أي مكان (&method= &country= &madhab=)
GET /qibla?lat=&lng=                     اتجاه القبلة والمسافة`}</Code>
      </Section>

      <Section id="errors" title="الأخطاء">
        <p className={p}>كل خطأ يجيب بهذا الشكل، مع رمز ثابت تبني عليه:</p>
        <Code>{`{ "error": { "code": "not_found",
             "message": "Nothing here: check the reciter and the surah.",
             "docs": "https://dhikr.ly/developers" } }`}</Code>
        <Fields
          head={['الحالة', 'الرمز', 'المعنى']}
          rows={[
            ['401', 'missing_key', 'لا مفتاح في رأس الطلب.'],
            ['401', 'invalid_key', 'المفتاح غير صحيح أو محذوف.'],
            ['404', 'not_found', 'لا تلاوة بهذا الاسم، أو لا سورة لها بهذا الرقم، أو لا توقيت لكلماتها بعد.'],
            ['502', 'upstream', 'مصدر البيانات لم يجب؛ أعد المحاولة بعد قليل.'],
          ]}
        />
      </Section>

      <Section id="guide-ayah" title="درس: تظليل الآية مع التلاوة">
        <p className={p}>
          شغّل ملف السورة، واطلب توقيت آياتها مرة واحدة، ثم ظلّل الآية التي يقع فيها وقت التشغيل.
        </p>
        <Code>{`// From your server (the key stays there), pass the timings to the page.
const { data: reciter } = await api('/reciters/abdulhamid_algriw');
const { data: timing } = await api('/timings/abdulhamid_algriw/1');

const audio = new Audio(reciter.surahs.find((s) => s.surah === 1).audio);
audio.addEventListener('timeupdate', () => {
  const ms = audio.currentTime * 1000;
  const current = timing.ayahs.find((a) => a.ayah > 0 && ms >= a.start && ms < a.end);
  highlight(current?.ayah); // your function: mark that ayah on the page
});
audio.play();`}</Code>
      </Section>

      <Section id="guide-words" title="درس: تظليل كلمة كلمة">
        <p className={p}>
          مثل الدرس السابق، لكن بتوقيت الكلمات. رتّب الكلمات بالوقت، وابحث عن الكلمة الحالية بالبحث الثنائي إن كانت
          السورة طويلة.
        </p>
        <Code>{`const { data } = await api('/word-timings/abdulhamid_algriw/2');
const words = data.words; // already in reciting order

function wordAt(ms) {
  let lo = 0, hi = words.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (ms < words[mid].start) hi = mid - 1;
    else if (ms >= words[mid].end) lo = mid + 1;
    else return words[mid]; // { ayah, word, start, end }
  }
  return null; // between words
}`}</Code>
      </Section>

      <Section id="guide-tafsir" title="درس: تفسير مرقّم بحفص لآية قالون">
        <p className={p}>
          عندك تفسير أو ترجمة مرقّمة بحفص، وتعرض آيات قالون. حوّل رقم الآية أولًا، ثم اجلب كل ما يقابلها.
        </p>
        <Code>{`const { data } = await api('/numbering/qalun/2/285');
// data.ayahs → [286]: show the tafsir of Hafs 2:286 beside Qalun 2:285.
const tafsir = data.ayahs.map((hafs) => myTafsir[\`2:\${hafs}\`]).join('\\n');`}</Code>
      </Section>

      <Section id="guide-download" title="درس: تنزيل تلاوة كاملة">
        <p className={p}>
          روابط ملفات كل سورة في <C>{'/reciters/{slug}'}</C>. نزّلها واحدًا واحدًا، ويمكنك التحقق من كل ملف
          بحجمه في <C>bytes</C>.
        </p>
        <Code>{`import os, requests

H = {"Authorization": f"Bearer {os.environ['DHIKR_KEY']}"}
reciter = requests.get("${BASE}/reciters/abdulhamid_algriw", headers=H).json()["data"]
os.makedirs(reciter["slug"], exist_ok=True)
for s in reciter["surahs"]:
    path = f"{reciter['slug']}/{s['surah']:03d}.mp3"
    with requests.get(s["audio"], stream=True) as r, open(path, "wb") as f:
        for chunk in r.iter_content(1 << 16):
            f.write(chunk)
    assert os.path.getsize(path) == s["bytes"], path`}</Code>
        <p className={p}>
          ومن صفحة كل قارئ في الموقع يمكن تنزيل الختمة كاملة ملفًا مضغوطًا أو ملفات منفصلة، بعد الدخول إلى الحساب.
        </p>
      </Section>

      <Section id="limits" title="الحدود والتخزين">
        <p className={p}>
          لا حصص ولا حدود لعدد الطلبات: الواجهة مجانية، وقد يكون لتطبيقك ملايين المستخدمين. لكن أكثر هذه البيانات لا
          يتغير، فخزّنه عندك: النص والترقيم ثابتان، والتوقيت يتغير نادرًا، وقائمة القرّاء تتغير حين يُضاف قارئ. اجلب
          القائمة مرة في اليوم، والباقي حين تحتاجه أول مرة.
        </p>
      </Section>

      <Section id="license" title="الترخيص والنسبة">
        <p className={p}>
          البيانات بترخيص{' '}
          <a
            href="https://creativecommons.org/licenses/by-nc/4.0/deed.ar"
            className="font-bold text-ink underline"
            target="_blank"
            rel="noreferrer"
          >
            المشاع الإبداعي، نسب المصنَّف، غير تجاري 4.0
          </a>
          : استعملها وانقلها وابنِ عليها في غير التجارة، مع ذكر «ذكر · dhikr.ly» بجوار ما تعرضه منها. وللاستعمال
          التجاري راسلنا. أصوات التلاوات لأصحابها، ونصوص التفاسير والكتب والموسوعة القرآنية لأصحابها ومصادرها
          المذكورة معها.
        </p>
      </Section>

      <Section id="logging" title="ما نسجّله">
        <p className={p}>
          نسجّل كل طلب مع حساب صاحب المفتاح: العنوان، والوقت، وحالة الجواب، وحجمه، ومدته، والبلد. لا نسجّل محتوى
          ما تطلبه ولا عنوان IP. نستعمل ذلك لنعرف ما يُستعمل ونحسّنه، وترى استعمالك في صفحة حسابك. التفاصيل في{' '}
          <Link href="/privacy" className="font-bold text-ink underline">
            سياسة الخصوصية
          </Link>
          .
        </p>
      </Section>

      <Section id="changelog" title="سجل التغييرات">
        <ul className="flex flex-col gap-2.5">
          {[
            ['2026-11-24', 'التفاسير (/tafsir)، ودراسة الآية (/ayah)، والمكتبة (/library)، والتفسير الموضوعي (/mawsuah)، وكتب الحديث (/hadith)، ومواقيت الصلاة المفتوحة دون مفتاح (/prayer-times).'],
            ['2026-11-23', 'نص القرآن برواية قالون (/text) ومحوّل الترقيم (/numbering).'],
            ['2026-11-23', 'الإصدار 1: القرّاء، وتوقيت الآيات والكلمات، بمفتاح شخصي.'],
          ].map(([date, what]) => (
            <li key={what} className="flex flex-wrap gap-x-3 rounded-[16px] border border-border bg-surface px-4 py-3">
              <span dir="ltr" className="font-mono text-[13px] text-ink-subtle">
                {date}
              </span>
              <span className="text-[15px] text-ink">{what}</span>
            </li>
          ))}
        </ul>
        <p className={p}>
          لا نغيّر ما في الإصدار 1 إلا بالإضافة: حقول جديدة أو عناوين جديدة. لا نحذف حقلًا ولا نغيّر معناه.
        </p>
      </Section>

      <Section id="faq" title="أسئلة شائعة">
        {[
          ['هل الواجهة مجانية؟', 'نعم، بلا حدود، لكل استعمال غير تجاري.'],
          [
            'لماذا تختلف أرقام الآيات عن المصحف الذي أعرفه؟',
            'لأن أغلب المصاحف الرقمية بحفص والعدّ الكوفي. نحن نتبع مصحف الجماهيرية برواية قالون والعدّ المدني. استعمل محوّل الترقيم للربط بينهما.',
          ],
          ['هل ستضيفون روايات أخرى؟', 'نبدأ بقالون عن نافع، وتتبعها روايات أخرى.'],
          [
            'هل أستطيع استعمال المفتاح داخل تطبيق جوال؟',
            'الأسلم ألا تفعل: من فكّ التطبيق رأى المفتاح. اجعل تطبيقك يسأل خادمك، وخادمك يسأل الواجهة.',
          ],
          ['وجدت خطأ في البيانات، ماذا أفعل؟', 'راسلنا من صفحة التواصل وسنصحّحه.'],
        ].map(([q, a]) => (
          <details key={q} className="group rounded-[18px] border border-border bg-surface p-4">
            <summary className="cursor-pointer list-none text-[16px] font-bold text-ink">{q}</summary>
            <p className={`${p} pt-2`}>{a}</p>
          </details>
        ))}
        <p className={p}>
          سؤال آخر؟{' '}
          <Link href="/contact" className="font-bold text-ink underline">
            راسلنا
          </Link>
          .
        </p>
      </Section>
    </DocumentationShell>
  );
}
