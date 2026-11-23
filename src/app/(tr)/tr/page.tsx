import { homeMetadata, HomeRoute } from '@/app/_seo/home';

export const generateMetadata = () => homeMetadata('tr');

export default function Page() {
  return <HomeRoute locale="tr" />;
}
