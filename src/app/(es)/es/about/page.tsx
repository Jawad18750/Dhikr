import { aboutMetadata, AboutRoute } from '@/app/_seo/about';

export const generateMetadata = () => aboutMetadata('es');

export default function Page() {
  return <AboutRoute locale="es" />;
}
