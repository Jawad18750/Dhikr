import { homeMetadata, HomeRoute } from '@/app/_seo/home';

export const generateMetadata = () => homeMetadata('id');

export default function Page() {
  return <HomeRoute locale="id" />;
}
