import { privacyMetadata, PrivacyRoute } from '@/app/_seo/privacy';

export const generateMetadata = () => privacyMetadata('ms');

export default function Page() {
  return <PrivacyRoute locale="ms" />;
}
