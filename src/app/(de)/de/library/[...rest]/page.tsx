import { redirect } from 'next/navigation';

type Props = { params: Promise<{ rest: string[] }> };

/** A book or a section in another language's URL: the Arabic page it names. */
export default async function Page({ params }: Props) {
  const { rest } = await params;
  redirect(`/library/${rest.map((part) => encodeURIComponent(part)).join('/')}`);
}
