import { useIntl } from 'react-intl';

import { isRtl } from '@/lib/seo/routes';

export default function useDirection() {
  const { locale } = useIntl();
  const isRTL = isRtl(locale);
  return { isRTL };
}
