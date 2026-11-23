import { contactMetadata, ContactRoute } from '@/app/_seo/contact';

export const generateMetadata = () => contactMetadata('fa');

export default function Page() {
  return <ContactRoute locale="fa" />;
}
