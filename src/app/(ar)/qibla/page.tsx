import { CardMark } from '@/components/site/logo-mark';
import { type QiblaPlace, QiblaTool } from '@/components/site/qibla-tool';
import world from '@/data/prayer-world.json';
import land from '@/data/world-land.json';
import { libyaCities } from '@/lib/prayer-libya';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata = buildPageMetadata({
  locale: 'ar',
  path: '/qibla',
  title: 'اتجاه القبلة من أي مكان | ذكر',
  description: 'اتجاه القبلة والمسافة إلى الكعبة من أي مدينة ليبية أو أي بلد أو من موقعك، مع بوصلة حيّة على الهاتف وواجهة برمجية مجانية دون مفتاح.',
  omitLanguages: true,
});

const code = 'overflow-x-auto rounded-2xl bg-[#0f0f10] p-4 text-[13px] leading-[1.8] text-white/85';

/** The qibla from anywhere: the tool and its API. */
export default function Page() {
  const places: QiblaPlace[] = [
    ...libyaCities().map((c) => ({ key: `ly-${c.slug}`, name: c.name_ar, sub: 'ليبيا', lat: c.lat, lng: c.lng })),
    ...world.filter((c) => c.cc !== 'LY').map((c) => ({ key: c.cc, name: c.name_ar, sub: c.capital, lat: c.lat, lng: c.lng })),
  ];
  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-4 pb-16 pt-6 text-foreground sm:px-6 sm:pt-10">
      <section data-header-tone="dark" className="relative isolate flex flex-col gap-3 overflow-hidden rounded-[28px] bg-hero p-6 text-on-hero sm:rounded-[36px] sm:p-9">
        <CardMark />
        <p className="text-[14px] font-bold text-hero-gold">أداة مفتوحة · مجانية دون تسجيل</p>
        <h1 className="font-display text-[32px] font-black leading-[1.25] sm:text-[46px]">اتجاه القبلة</h1>
        <p className="max-w-[720px] text-[17px] leading-[1.85] text-on-hero/75">
          اتجاه الكعبة من أي مدينة ليبية أو أي بلد أو من موقعك، بالدرجات من الشمال الحقيقي، والمسافة إليها، وأقصر طريق على سطح الأرض. وعلى
          الهاتف تدور البوصلة معك حتى تواجه القبلة.
        </p>
      </section>

      <QiblaTool places={places} land={land} />

      <section className="flex flex-col gap-4" id="developers">
        <h2 className="font-display text-[26px] font-black text-ink sm:text-[30px]">للمطوّرين</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <pre dir="ltr" className={code}>{`GET /api/v1/qibla?lat=32.8813&lng=13.1925

{ "data": { "place": { "lat": 32.8813, "lng": 13.1925 },
            "kaaba": { "lat": 21.422487, "lng": 39.826206 },
            "bearing": 109.16, "distance_km": 2915.4 },
  "license": "CC BY 4.0", "site": "https://dhikr.ly/qibla" }`}</pre>
          <div className="flex flex-col gap-2 text-[15px] leading-[1.85] text-ink-muted">
            <p>دون حساب ولا مفتاح. الاتجاه بالدرجات من الشمال الحقيقي باتجاه عقارب الساعة، على الدائرة العظمى كما في تطبيقاتنا.</p>
            <p>البوصلة المغناطيسية تشير إلى الشمال المغناطيسي: أضف إليه انحراف مكانك إن أردت الدقة.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
