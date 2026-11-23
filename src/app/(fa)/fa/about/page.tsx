import { aboutMetadata, AboutRoute } from '@/app/_seo/about';

export const generateMetadata = () => aboutMetadata('fa');

export default function Page() {
  return <AboutRoute locale="fa" />;
}
