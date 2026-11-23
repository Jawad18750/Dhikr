import { redirect } from 'next/navigation';

/** The library is Arabic (its books are); this URL leads to it. */
export default function Page() {
  redirect('/library');
}
