import '../../globals.css';

import type { Metadata } from 'next';

import { RootShell } from '@/components/root-shell';
import { rootMetadata } from '@/lib/seo/root-metadata';
import { rootViewport } from '@/lib/seo/root-viewport';

export const metadata: Metadata = rootMetadata('fr');
export const viewport = rootViewport;

export default function Layout_fr({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <RootShell locale="fr">{children}</RootShell>;
}
