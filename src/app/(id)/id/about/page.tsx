import { aboutMetadata, AboutRoute } from '@/app/_seo/about';

export const generateMetadata = () => aboutMetadata('id');

export default function Page() {
  return <AboutRoute locale="id" />;
}
