import { cachedGet } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import { APIResponse, ProductsData, Product } from '../types';

export async function getProducts(locale: string): Promise<Product[]> {
  try {
    const response = await cachedGet<APIResponse<ProductsData>>(
      API_ENDPOINTS.PRODUCTS,
      {
        params: { locale },
        next: { revalidate: 1800 }, // 30分钟
      }
    );

    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch products');
    }

    return response.data.products;
  } catch (error) {
    console.error('Error fetching products:', error);

    // 降级到静态JSON
    const fallbackData = await import(`@/content/products.json`);
    return (fallbackData.default as any)[locale] || (fallbackData.default as any).en;
  }
}

export async function getProductById(
  id: string,
  locale: string
): Promise<Product | null> {
  try {
    const response = await cachedGet<APIResponse<Product>>(
      API_ENDPOINTS.PRODUCT_DETAIL(id),
      {
        params: { locale },
        next: { revalidate: 3600 },
      }
    );

    if (!response.success) {
      return null;
    }

    return response.data;
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    return null;
  }
}
