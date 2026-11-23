import { privacyMetadata, PrivacyRoute } from '@/app/_seo/privacy';

export const generateMetadata = () => privacyMetadata('fa');

export default function Page() {
  return <PrivacyRoute locale="fa" />;
}
