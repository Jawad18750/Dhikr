import { redirect } from 'next/navigation';

type Props = { params: Promise<{ rest: string[] }> };

/** A tafsir page in another language's URL: the Arabic page it names. */
export default async function Page({ params }: Props) {
  const { rest } = await params;
  redirect(`/tafsir/${rest.map((part) => encodeURIComponent(part)).join('/')}`);
}
