import { contactMetadata, ContactRoute } from '@/app/_seo/contact';

export const generateMetadata = () => contactMetadata('ru');

export default function Page() {
  return <ContactRoute locale="ru" />;
}
