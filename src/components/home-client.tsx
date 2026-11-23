'use client';

import NetworkStatusIndicator from '@/components/network-status-indicator';
import { ReciterBrowser } from '@/components/site/reciter-browser';
import type { CatalogueReciter } from '@/lib/dhikr-catalogue';

/** The interactive part of the home page: search, filters and the reciters. */
export default function HomeClient({
  reciters,
}: {
  reciters: CatalogueReciter[];
}) {
  return (
    <div className="flex w-full flex-col gap-4">
      <NetworkStatusIndicator />
      <ReciterBrowser reciters={reciters} />
    </div>
  );
}
