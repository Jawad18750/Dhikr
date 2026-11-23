import { privacyMetadata, PrivacyRoute } from '@/app/_seo/privacy';

export const generateMetadata = () => privacyMetadata('fr');

export default function Page() {
  return <PrivacyRoute locale="fr" />;
}
