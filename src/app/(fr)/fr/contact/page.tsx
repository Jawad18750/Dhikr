import { contactMetadata, ContactRoute } from '@/app/_seo/contact';

export const generateMetadata = () => contactMetadata('fr');

export default function Page() {
  return <ContactRoute locale="fr" />;
}
