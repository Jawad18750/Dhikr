import { privacyMetadata, PrivacyRoute } from '@/app/_seo/privacy';

export const generateMetadata = () => privacyMetadata('tr');

export default function Page() {
  return <PrivacyRoute locale="tr" />;
}
