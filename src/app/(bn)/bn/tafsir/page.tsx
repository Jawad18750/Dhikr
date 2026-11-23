import { redirect } from 'next/navigation';

/** The tafsirs are Arabic; this URL leads to it. */
export default function Page() {
  redirect('/tafsir');
}
