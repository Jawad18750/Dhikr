import { redirect } from 'next/navigation';

/** The encyclopedia is Arabic; this URL leads to it. */
export default function Page() {
  redirect('/mawsuah');
}
