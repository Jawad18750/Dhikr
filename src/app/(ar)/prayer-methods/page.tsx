import Link from 'next/link';

import { CardMark } from '@/components/site/logo-mark';
import { PrayerWorldTool } from '@/components/site/prayer-world-tool';
import countries from '@/data/prayer-world.json';
import land from '@/data/world-land.json';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const revalidate = 3600;

export const metadata = buildPageMetadata({
  locale: 'ar',
  path: '/prayer-methods',
  title: 'طرق حساب مواقيت الصلاة في كل بلد | ذكر',
  description:
    'الطريقة المعتمدة لحساب مواقيت الصلاة في كل بلد من العالم، بزواياها وتعديلاتها، ومواقيت اليوم في عاصمته بكل طريقة، مع واجهة برمجية مجانية دون مفتاح.',
  omitLanguages: true,
});

const code = 'overflow-x-auto rounded-2xl bg-[#0f0f10] p-4 text-[13px] leading-[1.8] text-white/85';

/** The world's prayer-time conventions, as the Dhikr apps apply them: the tool and its API. */
export default function Page() {
  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-4 pb-16 pt-6 text-foreground sm:px-6 sm:pt-10">
      <section
        data-header-tone="dark"
        className="relative isolate flex flex-col gap-3 overflow-hidden rounded-[28px] bg-hero p-6 text-on-hero sm:rounded-[36px] sm:p-9"
      >
        <CardMark />
        <p className="text-[14px] font-bold text-hero-gold">أداة مفتوحة · مجانية دون تسجيل</p>
        <h1 className="font-display text-[32px] font-black leading-[1.25] sm:text-[46px]">طرق حساب المواقيت في العالم</h1>
        <p className="max-w-[720px] text-[17px] leading-[1.85] text-on-hero/75">
          لكل بلد طريقته المعتمدة في حساب الفجر والعشاء والعصر. هذه الطرق كما يطبّقها تطبيق «أذان وأذكار» في {countries.length} بلدًا: زاوية
          الفجر، والعشاء بالزاوية أو بالدقائق، ومذهب العصر، والتعديلات الثابتة. اختر بلدًا لترى مواقيت اليوم في عاصمته، وقارن الطرق كلها.
        </p>
      </section>

      <PrayerWorldTool countries={countries} land={land} />

      <section className="flex flex-col gap-4" id="developers">
        <h2 className="font-display text-[26px] font-black text-ink sm:text-[30px]">للمطوّرين</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <pre dir="ltr" className={code}>{`GET /api/v1/prayer-times/methods          # every method, in numbers
GET /api/v1/prayer-times/world/SA         # a country: its method, today at its capital
GET /api/v1/prayer-times/world/EG?date=2026-03-20
GET /api/v1/prayer-times/calc?lat=51.5&lng=-0.12&tz=Europe/London&method=MWL
#   method: a method id, or none for the country's (with &country=GB)
#   madhab: shafi | hanafi (Asr)`}</pre>
          <div className="flex flex-col gap-2 text-[15px] leading-[1.85] text-ink-muted">
            <p>دون حساب ولا مفتاح. الحساب بمكتبة adhan المفتوحة، بالإعدادات نفسها التي في تطبيقاتنا.</p>
            <p>
              ليبيا لا تُحسب: لها جداولها الرسمية في{' '}
              <Link href="/prayer-times" className="font-bold text-ink underline">
                أداة المدن الليبية
              </Link>
              .
            </p>
            <p className="text-[13px] text-ink-subtle">العواصم وإحداثياتها من GeoNames (CC BY 4.0)، والخريطة من Natural Earth.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
