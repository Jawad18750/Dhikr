import { redirect } from 'next/navigation';

/** The developer documentation is one Arabic page; this URL leads to it. */
export default function Page() {
  redirect('/developers');
}
