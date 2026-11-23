import { homeMetadata, HomeRoute } from '@/app/_seo/home';

export const generateMetadata = () => homeMetadata('es');

export default function Page() {
  return <HomeRoute locale="es" />;
}
