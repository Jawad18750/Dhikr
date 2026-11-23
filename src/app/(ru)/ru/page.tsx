import { homeMetadata, HomeRoute } from '@/app/_seo/home';

export const generateMetadata = () => homeMetadata('ru');

export default function Page() {
  return <HomeRoute locale="ru" />;
}
