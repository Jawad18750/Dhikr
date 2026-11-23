import { homeMetadata, HomeRoute } from '@/app/_seo/home';

export const generateMetadata = () => homeMetadata('ms');

export default function Page() {
  return <HomeRoute locale="ms" />;
}
