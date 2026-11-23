import { contactMetadata, ContactRoute } from '@/app/_seo/contact';

export const generateMetadata = () => contactMetadata('bn');

export default function Page() {
  return <ContactRoute locale="bn" />;
}
