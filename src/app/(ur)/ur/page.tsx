import { homeMetadata, HomeRoute } from '@/app/_seo/home';

export const generateMetadata = () => homeMetadata('ur');

export default function Page() {
  return <HomeRoute locale="ur" />;
}
