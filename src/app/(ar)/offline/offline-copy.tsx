'use client';

import { useIntl } from 'react-intl';

/** The offline page's words, in the document's language. */
export function OfflineCopy() {
  const { formatMessage } = useIntl();
  return (
    <>
      <h1 className="mb-2 text-2xl font-bold">{formatMessage({ id: 'offline.heading' })}</h1>
      <p className="mb-6 max-w-sm text-sm text-gray-400 dark:text-gray-500">
        {formatMessage({ id: 'offline.body' })}
      </p>
    </>
  );
}
