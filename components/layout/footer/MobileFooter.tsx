'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function MobileFooter() {
  const pathname = usePathname();
  const locale = pathname.split('/')[1];
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="px-4 py-8">
        {/* Company Info */}
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-2">Company Name</h3>
          <p className="text-gray-400 text-sm">
            {locale === 'zh'
              ? '构建未来的企业级解决方案'
              : 'Building enterprise solutions for the future'}
          </p>
        </div>

        {/* Quick Links */}
        <div className="mb-6">
          <h4 className="text-base font-semibold mb-3">
            {locale === 'zh' ? '快速链接' : 'Quick Links'}
          </h4>
          <ul className="space-y-2">
            <li>
              <Link href={`/${locale}`} className="text-gray-400 text-sm hover:text-white">
                {locale === 'zh' ? '首页' : 'Home'}
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/products`} className="text-gray-400 text-sm hover:text-white">
                {locale === 'zh' ? '产品' : 'Products'}
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/about`} className="text-gray-400 text-sm hover:text-white">
                {locale === 'zh' ? '关于我们' : 'About Us'}
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div className="mb-6">
          <h4 className="text-base font-semibold mb-3">
            {locale === 'zh' ? '联系我们' : 'Contact'}
          </h4>
          <ul className="space-y-1 text-gray-400 text-sm">
            <li>Email: contact@example.com</li>
            <li>Phone: +1 (555) 123-4567</li>
          </ul>
        </div>

        {/* Copyright */}
        <div className="pt-6 border-t border-gray-800 text-center text-gray-400 text-xs">
          <p>© {currentYear} Company Name. {locale === 'zh' ? '保留所有权利。' : 'All rights reserved.'}</p>
        </div>
      </div>
    </footer>
  );
}
