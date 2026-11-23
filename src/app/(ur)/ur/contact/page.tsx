import { contactMetadata, ContactRoute } from '@/app/_seo/contact';

export const generateMetadata = () => contactMetadata('ur');

export default function Page() {
  return <ContactRoute locale="ur" />;
}
