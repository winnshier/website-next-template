'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LocaleSwitcher } from '@/components/locale/LocaleSwitcher';

export function DesktopNav() {
  const pathname = usePathname();
  const locale = pathname.split('/')[1];

  const navItems = [
    { href: `/${locale}`, label: locale === 'zh' ? '首页' : 'Home' },
    { href: `/${locale}/products`, label: locale === 'zh' ? '产品' : 'Products' },
    { href: `/${locale}/about`, label: locale === 'zh' ? '关于我们' : 'About Us' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={`/${locale}`} className="text-2xl font-bold text-gray-900">
            Logo
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  pathname === item.href
                    ? 'text-blue-600'
                    : 'text-gray-700'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <LocaleSwitcher />
          </div>
        </div>
      </div>
    </nav>
  );
}
