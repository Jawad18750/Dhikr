import { IoGlobeOutline, IoLogoApple, IoLogoGooglePlaystore } from 'react-icons/io5';

/**
 * The project's apps, as a quiet row under the hero text on wider screens: the
 * icon, the name, and where to get it. Names are the apps' own; store ids as in
 * dhikr-web's apps list.
 */
const APPS = [
  {
    name: 'مصحف الجماهيرية',
    icon: '/apps/jamahiriya.webp',
    ios: 'https://apps.apple.com/app/id6770055492',
    android: 'https://play.google.com/store/apps/details?id=com.firstelite.jamahiriyaquran',
  },
  {
    name: 'أذان وأذكار',
    icon: '/apps/adhan.webp',
    ios: 'https://apps.apple.com/app/id6765949847',
    android: 'https://play.google.com/store/apps/details?id=com.firstelite.dhikr',
  },
  {
    name: 'مصاحف ليبيا',
    icon: '/apps/masahif.webp',
    site: 'https://masahif.abdeljawad.com',
  },
] as const;

const store =
  'flex h-7 w-7 items-center justify-center rounded-full text-on-hero/60 transition-colors hover:bg-on-hero/10 hover:text-on-hero';

export function HeroApps() {
  return (
    <ul className="mt-2 hidden flex-wrap gap-x-10 gap-y-5 border-t border-on-hero/10 pt-8 lg:flex">
      {APPS.map((app) => (
        <li key={app.name} className="flex items-center gap-3.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={app.icon}
            alt=""
            width={52}
            height={52}
            loading="lazy"
            className="h-[52px] w-[52px] rounded-[14px] shadow-[0_0_0_1px_rgb(var(--on-hero-rgb)/0.08)]"
          />
          <span className="flex flex-col gap-1">
            <span className="text-[15px] font-bold leading-tight">{app.name}</span>
            <span className="-ms-1.5 flex items-center">
              {'ios' in app ? (
                <>
                  <a href={app.ios} aria-label={`${app.name} App Store`} className={store}>
                    <IoLogoApple className="h-[15px] w-[15px]" aria-hidden="true" />
                  </a>
                  <a href={app.android} aria-label={`${app.name} Google Play`} className={store}>
                    <IoLogoGooglePlaystore className="h-[13px] w-[13px]" aria-hidden="true" />
                  </a>
                </>
              ) : (
                <a href={app.site} aria-label={app.name} className={store}>
                  <IoGlobeOutline className="h-[15px] w-[15px]" aria-hidden="true" />
                </a>
              )}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}
