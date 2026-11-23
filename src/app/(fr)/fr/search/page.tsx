import { redirect } from 'next/navigation';

type Props = { searchParams: Promise<{ q?: string }> };

/** Search reads Arabic texts; another language's URL leads to it, query and all. */
export default async function Page({ searchParams }: Props) {
  const { q } = await searchParams;
  redirect(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
}
