import { homeMetadata, HomeRoute } from '@/app/_seo/home';

export const generateMetadata = () => homeMetadata('fa');

export default function Page() {
  return <HomeRoute locale="fa" />;
}
