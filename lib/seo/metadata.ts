import { Metadata } from 'next';

export const metadataBase = new URL(
  process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'
);

export function generatePageMetadata(params: {
  title: string;
  description: string;
  locale: string;
  path: string;
}): Metadata {
  const { title, description, locale, path } = params;
  const url = `/${locale}${path}`;

  return {
    metadataBase,
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: 'Company Name',
      locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: url,
      languages: {
        'en': `/en${path}`,
        'zh': `/zh${path}`,
        'x-default': `/en${path}`,
      },
    },
  };
}
