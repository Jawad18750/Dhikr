import { redirect } from 'next/navigation';

type Props = { params: Promise<{ rest: string[] }> };

/** An ayah's study page in another language's URL: the Arabic page it names. */
export default async function Page({ params }: Props) {
  const { rest } = await params;
  redirect(`/ayah/${rest.map((part) => encodeURIComponent(part)).join('/')}`);
}
