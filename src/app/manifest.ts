import { MetadataRoute } from 'next';

import { clientConfig, normalizeAppUrl } from '@/utils';

export default function manifest(): MetadataRoute.Manifest {
  const appUrl = normalizeAppUrl(clientConfig.APP_URL) ?? '';

  let appOrigin = appUrl;
  try {
    appOrigin = new URL(appUrl).origin;
  } catch {
    // Fall back to the normalized value; `scope_extensions` is best-effort.
  }

  return {
    id: '9a008c3173fcca3c4def71adedd5bd3f',
    theme_color: '#0b0b0c',
    background_color: '#ffffff',
    display: 'standalone',
    scope: '/',
    start_url: '/',
    name: 'ذكر',
    short_name: 'ذكر',
    description: 'مجموعة من تلاوات القرآن الكريم ومصادره الرقمية، للاستماع والقراءة والبحث.',

    dir: 'auto',
    lang: 'auto',
    orientation: 'portrait',
    launch_handler: {
      client_mode: 'auto',
    },
    handle_links: [
      {
        url: appUrl,
        action: 'navigate',
      },
    ],
    categories: ['education', 'books', 'religion'],
    prefer_related_applications: false,
    related_applications: [],

    web_apps: [
      {
        web_app_identity: `${appUrl}/`,
      },
    ],
    scope_extensions: [{ origin: appOrigin }],

    icons: [
      {
        src: '/images/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/images/icon-maskable-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/images/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/images/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],

    screenshots: [
      {
        src: '/screenshots/desktop.png',
        sizes: '1920x1080',
        type: 'image/png',
        // @ts-expect-error
        platform: 'wide',
        form_factor: 'wide',
        label: 'ذكر - Desktop',
      },
      {
        src: '/screenshots/mobile.png',
        sizes: '1000x2160',
        type: 'image/png',
        // @ts-expect-error
        platform: 'narrow',
        form_factor: 'narrow',
        label: 'ذكر - Mobile',
      },
    ],

    shortcuts: [
      {
        name: 'اتصل بنا',
        url: '/contact',
        description: 'اتصل بنا',
        icons: [
          {
            src: '/images/shortcuts/contact.png',
            sizes: '96x96',
            type: 'image/png',
          },
        ],
      },
      {
        name: 'عن الموقع',
        url: '/about',
        description: 'عن الموقع',
        icons: [
          {
            src: '/images/shortcuts/about.png',
            sizes: '96x96',
            type: 'image/png',
          },
        ],
      },
    ],
  };
}
