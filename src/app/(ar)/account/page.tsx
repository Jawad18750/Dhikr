import { AccountPage } from '@/components/pages/account-page';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const dynamic = 'force-dynamic';

export const metadata = {
  ...buildPageMetadata({
    locale: 'ar',
    path: '/account',
    title: 'حسابك | ذكر',
    description: 'الدخول إلى ذكر لمفاتيح الواجهة البرمجية وتنزيل الختمات كاملة.',
    omitLanguages: true,
  }),
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ next?: string; sent?: string; error?: string }> };

/** The account in Arabic; the other languages render the same page in theirs. */
export default async function Page({ searchParams }: Props) {
  return <AccountPage locale="ar" query={await searchParams} />;
}
