import { privacyMetadata, PrivacyRoute } from '@/app/_seo/privacy';

export const generateMetadata = () => privacyMetadata('id');

export default function Page() {
  return <PrivacyRoute locale="id" />;
}
