import { privacyMetadata, PrivacyRoute } from '@/app/_seo/privacy';

export const generateMetadata = () => privacyMetadata('es');

export default function Page() {
  return <PrivacyRoute locale="es" />;
}
