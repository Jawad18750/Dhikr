import { redirect } from 'next/navigation';

/** The account is one Arabic page; this URL leads to it. */
export default function Page() {
  redirect('/account');
}
