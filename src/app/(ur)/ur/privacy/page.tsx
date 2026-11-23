import { privacyMetadata, PrivacyRoute } from '@/app/_seo/privacy';

export const generateMetadata = () => privacyMetadata('ur');

export default function Page() {
  return <PrivacyRoute locale="ur" />;
}
