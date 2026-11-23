import { aboutMetadata, AboutRoute } from '@/app/_seo/about';

export const generateMetadata = () => aboutMetadata('ms');

export default function Page() {
  return <AboutRoute locale="ms" />;
}
