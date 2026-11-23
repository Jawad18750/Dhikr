import { aboutMetadata, AboutRoute } from '@/app/_seo/about';

export const generateMetadata = () => aboutMetadata('ur');

export default function Page() {
  return <AboutRoute locale="ur" />;
}
