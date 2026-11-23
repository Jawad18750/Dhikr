import { AccountPage } from '@/components/pages/account-page';
import { MESSAGES } from '@/locales';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: `${MESSAGES['en']['account.metaTitle']} | Dhikr`,
  description: MESSAGES['en']['account.metaDescription'],
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ next?: string; sent?: string; error?: string }> };

/** The account, in this language. */
export default async function Page({ searchParams }: Props) {
  return <AccountPage locale="en" query={await searchParams} />;
}
