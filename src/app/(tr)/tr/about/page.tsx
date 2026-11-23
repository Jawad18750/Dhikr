import { aboutMetadata, AboutRoute } from '@/app/_seo/about';

export const generateMetadata = () => aboutMetadata('tr');

export default function Page() {
  return <AboutRoute locale="tr" />;
}
