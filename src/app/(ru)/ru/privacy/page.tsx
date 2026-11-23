import { privacyMetadata, PrivacyRoute } from '@/app/_seo/privacy';

export const generateMetadata = () => privacyMetadata('ru');

export default function Page() {
  return <PrivacyRoute locale="ru" />;
}
