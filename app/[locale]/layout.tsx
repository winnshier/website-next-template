import { Inter, Noto_Sans_SC } from 'next/font/google';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { EnvironmentBadge } from '@/components/shared/EnvironmentBadge';
import type { Metadata } from 'next';
import '../globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const notoSansSC = Noto_Sans_SC({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-noto-sans-sc',
  weight: ['400', '500', '700'],
});

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'),
    title: {
      default: locale === 'zh' ? '公司名称 - 企业级解决方案' : 'Company Name - Enterprise Solutions',
      template: `%s | ${locale === 'zh' ? '公司名称' : 'Company Name'}`,
    },
    description: locale === 'zh'
      ? '提供专业的企业级解决方案，助力您的业务发展'
      : 'Professional enterprise solutions to power your business growth',
  };
}

export async function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'zh' },
  ];
}

export default function RootLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return (
    <html lang={locale} className={`${inter.variable} ${notoSansSC.variable}`}>
      <body className={locale === 'zh' ? 'font-sans-sc' : 'font-sans'}>
        <ResponsiveLayout>{children}</ResponsiveLayout>
        <EnvironmentBadge />
      </body>
    </html>
  );
}
