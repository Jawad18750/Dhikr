import { aboutMetadata, AboutRoute } from '@/app/_seo/about';

export const generateMetadata = () => aboutMetadata('fr');

export default function Page() {
  return <AboutRoute locale="fr" />;
}
