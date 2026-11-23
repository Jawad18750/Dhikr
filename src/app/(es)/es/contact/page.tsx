import { contactMetadata, ContactRoute } from '@/app/_seo/contact';

export const generateMetadata = () => contactMetadata('es');

export default function Page() {
  return <ContactRoute locale="es" />;
}
