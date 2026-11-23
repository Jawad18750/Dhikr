import { IoGlobeOutline, IoLogoApple, IoLogoGooglePlaystore } from 'react-icons/io5';

type Copy = Record<string, string>;

/**
 * The project's apps, under the hero text on wider screens: a short labelled list,
 * each with its icon, its name in the page's language and where to get it. Store ids
 * as in dhikr-web's apps list.
 */
const APPS = [
  {
    key: 'jamahiriya',
    icon: '/apps/jamahiriya.webp',
    ios: 'https://apps.apple.com/app/id6770055492',
    android: 'https://play.google.com/store/apps/details?id=com.firstelite.jamahiriyaquran',
  },
  {
    key: 'adhan',
    icon: '/apps/adhan.webp',
    ios: 'https://apps.apple.com/app/id6765949847',
    android: 'https://play.google.com/store/apps/details?id=com.firstelite.dhikr',
  },
  {
    key: 'masahif',
    icon: '/apps/masahif.webp',
    site: 'https://masahif.abdeljawad.com',
  },
] as const;

const pill =
  'flex h-8 items-center gap-1.5 rounded-full border border-on-hero/15 px-3 text-[13px] font-medium text-on-hero/75 transition-colors hover:border-on-hero/40 hover:text-on-hero';

export function HeroApps({ t }: { t: Copy }) {
  return (
    <div className="mt-2 hidden w-full max-w-[520px] border-t border-on-hero/10 pt-7 lg:block">
      <p className="mb-4 text-[13px] font-medium text-on-hero/45 ltr:uppercase ltr:tracking-[0.08em]">
        {t['apps.title']}
      </p>
      <ul className="flex flex-col gap-3.5">
        {APPS.map((app) => {
          const name = t[`apps.${app.key}`];
          return (
            <li key={app.key} className="flex items-center gap-3.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={app.icon}
                alt=""
                width={44}
                height={44}
                loading="lazy"
                className="h-11 w-11 shrink-0 rounded-[12px] shadow-[0_0_0_1px_rgb(var(--on-hero-rgb)/0.08)]"
              />
              <span className="min-w-0 flex-1 truncate text-[16px] font-bold">{name}</span>
              <span className="flex shrink-0 items-center gap-2">
                {'ios' in app ? (
                  <>
                    <a href={app.ios} aria-label={`${name}: App Store`} className={pill}>
                      <IoLogoApple className="h-[15px] w-[15px]" aria-hidden="true" />
                      App Store
                    </a>
                    <a href={app.android} aria-label={`${name}: Google Play`} className={pill}>
                      <IoLogoGooglePlaystore className="h-[13px] w-[13px]" aria-hidden="true" />
                      Google Play
                    </a>
                  </>
                ) : (
                  <a href={app.site} aria-label={name} className={pill}>
                    <IoGlobeOutline className="h-[15px] w-[15px]" aria-hidden="true" />
                    {t['apps.web']}
                  </a>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
