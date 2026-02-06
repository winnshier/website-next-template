import { Metadata } from 'next';
import { getProducts } from '@/lib/api/fetchers/products';
import { ProductSlider } from '@/components/products/ProductSlider';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  return {
    title: locale === 'zh' ? '产品' : 'Products',
    description: locale === 'zh'
      ? '探索我们的企业级产品和解决方案'
      : 'Explore our enterprise products and solutions',
  };
}

export default async function ProductsPage({ params: { locale } }: { params: { locale: string } }) {
  const products = await getProducts(locale);

  return (
    <div className="pt-16">
      <ProductSlider products={products} locale={locale} />
    </div>
  );
}

// ISR: 每30分钟重新生成
export const revalidate = 1800;
