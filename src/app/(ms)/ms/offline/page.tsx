import OfflinePage from '@/app/(ar)/offline/page';
import { MESSAGES } from '@/locales';

/**
 * The service worker's fallback page. Same reason as settings: its own route so
 * the document and its copy are the right language before hydration.
 */
export const metadata = {
  title: `${MESSAGES['ms']['offline.title']} | Dhikr`,
  alternates: { canonical: '/ms/offline' },
  robots: { index: false, follow: false },
};

export default function Page() {
  return <OfflinePage />;
}
