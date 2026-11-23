import '../../globals.css';

import type { Metadata } from 'next';

import { RootShell } from '@/components/root-shell';
import { rootMetadata } from '@/lib/seo/root-metadata';
import { rootViewport } from '@/lib/seo/root-viewport';

export const metadata: Metadata = rootMetadata('bn');
export const viewport = rootViewport;

export default function Layout_bn({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <RootShell locale="bn">{children}</RootShell>;
}
