'use client';

import { ReactNode } from 'react';
import { useIntl } from 'react-intl';

import useDirection from '@/hooks/use-direction';
import { useTheme } from '@/hooks/use-theme';

/**
 * Runs before first paint: restores dark mode when the visitor chose it, so the
 * page never flashes light first. The site is light unless asked; there is one
 * palette (the ذكر look, `warm`).
 */
const themeScript = `(function(){try{
var s=localStorage.getItem('theme-preference'),t=null;
if(s){try{t=JSON.parse(s)}catch(e){t=s;}}
var d=t==='dark';
var el=document.documentElement;el.setAttribute('data-theme','warm');
var cl=el.classList;
if(d){cl.add('dark');cl.remove('light');}else{cl.add('light');cl.remove('dark');}
}catch(e){}})();`;

export default function HtmlWrapper({ children }: { children: ReactNode }) {
  const { locale } = useIntl();
  const { isRTL } = useDirection();
  // Keeps <html> in sync when the user changes palette or mode.
  useTheme();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      dir={isRTL ? 'rtl' : 'ltr'}
      data-theme="warm"
      className="h-[100vh]"
    >
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      {children}
    </html>
  );
}
