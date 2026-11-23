import { redirect } from 'next/navigation';

/** The surahs are one Arabic page; this URL leads to it. */
export default function Page() {
  redirect('/surahs');
}
