import { homeMetadata, HomeRoute } from '@/app/_seo/home';

export const generateMetadata = () => homeMetadata('bn');

export default function Page() {
  return <HomeRoute locale="bn" />;
}
