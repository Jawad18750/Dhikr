import { contactMetadata, ContactRoute } from '@/app/_seo/contact';

export const generateMetadata = () => contactMetadata('id');

export default function Page() {
  return <ContactRoute locale="id" />;
}
