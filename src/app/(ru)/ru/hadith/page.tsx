import { redirect } from 'next/navigation';

/** The hadith collections are Arabic; this URL leads to them. */
export default function Page() {
  redirect('/hadith');
}
