import { aboutMetadata, AboutRoute } from '@/app/_seo/about';

export const generateMetadata = () => aboutMetadata('ru');

export default function Page() {
  return <AboutRoute locale="ru" />;
}
