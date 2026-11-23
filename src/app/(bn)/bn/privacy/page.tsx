import { privacyMetadata, PrivacyRoute } from '@/app/_seo/privacy';

export const generateMetadata = () => privacyMetadata('bn');

export default function Page() {
  return <PrivacyRoute locale="bn" />;
}
