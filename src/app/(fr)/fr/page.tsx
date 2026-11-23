import { homeMetadata, HomeRoute } from '@/app/_seo/home';

export const generateMetadata = () => homeMetadata('fr');

export default function Page() {
  return <HomeRoute locale="fr" />;
}
