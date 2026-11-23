import Image from 'next/image';

import { OfflineCopy } from './offline-copy';
import OfflinePlayer from './offline-player';
import OfflineRetryButton from './retry-button';

export const metadata = {
  title: 'غير متصل | ذكر',
  alternates: { canonical: '/offline' },
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <div className="flex min-h-dvh w-full flex-col items-center justify-center bg-background px-4 text-center text-foreground">
      <Image
        src="/images/192x192.png"
        alt=""
        width={80}
        height={80}
        unoptimized
        className="mb-6 opacity-80"
      />

      <OfflineCopy />

      <OfflinePlayer />
      <OfflineRetryButton />
    </div>
  );
}
