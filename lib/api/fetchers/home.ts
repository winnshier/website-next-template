import { cachedGet } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import { APIResponse, HomeData } from '../types';

export async function getHomeData(locale: string): Promise<HomeData> {
  try {
    const response = await cachedGet<APIResponse<HomeData>>(
      API_ENDPOINTS.HOME,
      {
        params: { locale },
        next: { revalidate: 3600 }, // 1小时重新验证
      }
    );

    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch home data');
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching home data:', error);

    // 降级到静态JSON
    const fallbackData = await import(`@/content/home.json`);
    return (fallbackData.default as any)[locale] || (fallbackData.default as any).en;
  }
}
