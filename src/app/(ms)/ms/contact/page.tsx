import { contactMetadata, ContactRoute } from '@/app/_seo/contact';

export const generateMetadata = () => contactMetadata('ms');

export default function Page() {
  return <ContactRoute locale="ms" />;
}
