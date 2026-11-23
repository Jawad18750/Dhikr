import { redirect } from 'next/navigation';

type Props = { params: Promise<{ rest: string[] }> };

/** A hadith page in another language's URL: the Arabic page it names. */
export default async function Page({ params }: Props) {
  const { rest } = await params;
  redirect(`/hadith/${rest.map((part) => encodeURIComponent(part)).join('/')}`);
}
