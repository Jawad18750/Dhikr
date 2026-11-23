import { redirect } from 'next/navigation';

type Props = { params: Promise<{ id: string }> };

/**
 * Surah pages are Arabic documents. This URL is a canonicalised twin, so it sends the
 * visitor to the document the canonical names.
 */
export default async function Page({ params }: Props) {
  const { id } = await params;
  redirect(`/surah/${id}`);
}
