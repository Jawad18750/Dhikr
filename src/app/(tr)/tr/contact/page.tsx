import { contactMetadata, ContactRoute } from '@/app/_seo/contact';

export const generateMetadata = () => contactMetadata('tr');

export default function Page() {
  return <ContactRoute locale="tr" />;
}
