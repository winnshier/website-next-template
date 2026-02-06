import { cachedGet } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import { APIResponse, AboutData } from '../types';

export async function getAboutData(locale: string): Promise<AboutData> {
  try {
    const response = await cachedGet<APIResponse<AboutData>>(
      API_ENDPOINTS.ABOUT,
      {
        params: { locale },
        next: { revalidate: 7200 }, // 2小时
      }
    );

    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch about data');
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching about data:', error);

    // 降级到静态JSON
    const fallbackData = await import(`@/content/about.json`);
    return (fallbackData.default as any)[locale] || (fallbackData.default as any).en;
  }
}
