import { redirect } from 'next/navigation';

/** The tool is in Arabic; this URL leads to it. */
export default function Page() {
  redirect('/prayer-methods');
}
