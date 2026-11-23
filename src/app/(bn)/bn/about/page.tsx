import { aboutMetadata, AboutRoute } from '@/app/_seo/about';

export const generateMetadata = () => aboutMetadata('bn');

export default function Page() {
  return <AboutRoute locale="bn" />;
}
