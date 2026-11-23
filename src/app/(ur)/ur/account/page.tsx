import { AccountPage } from '@/components/pages/account-page';
import { MESSAGES } from '@/locales';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: `${MESSAGES['ur']['account.metaTitle']} | Dhikr`,
  description: MESSAGES['ur']['account.metaDescription'],
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ next?: string; sent?: string; error?: string }> };

/** The account, in this language. */
export default async function Page({ searchParams }: Props) {
  return <AccountPage locale="ur" query={await searchParams} />;
}
