'use client';

import { useMediaQuery } from '@/lib/hooks/useMediaQuery';
import { DesktopNav } from './navigation/DesktopNav';
import { MobileNav } from './navigation/MobileNav';
import { DesktopFooter } from './footer/DesktopFooter';
import { MobileFooter } from './footer/MobileFooter';

export function ResponsiveLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <>
      {isMobile ? <MobileNav /> : <DesktopNav />}
      <main className="min-h-screen">{children}</main>
      {isMobile ? <MobileFooter /> : <DesktopFooter />}
    </>
  );
}
