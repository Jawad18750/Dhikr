'use client';

import { useIntl } from 'react-intl';

export default function OfflineRetryButton() {
  const { formatMessage } = useIntl();
  return (
    <button
      onClick={() => globalThis.location.reload()}
      type="button"
      className="mt-2 rounded-full bg-ink px-6 py-2.5 text-sm font-bold text-background transition-opacity hover:opacity-90"
    >
      {formatMessage({ id: 'offline.retry' })}
    </button>
  );
}
