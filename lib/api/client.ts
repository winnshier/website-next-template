import { cache } from 'react';

interface RequestConfig extends RequestInit {
  params?: Record<string, string>;
  timeout?: number;
}

class APIClient {
  private baseURL: string;
  private defaultHeaders: HeadersInit;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  private buildURL(endpoint: string, params?: Record<string, string>): string {
    const url = new URL(endpoint, this.baseURL);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    return url.toString();
  }

  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const { params, timeout = 10000, ...fetchConfig } = config;
    const url = this.buildURL(endpoint, params);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchConfig,
        headers: {
          ...this.defaultHeaders,
          ...fetchConfig.headers,
        },
        signal: controller.signal,
        // Next.js 缓存配置
        next: {
          revalidate: fetchConfig.next?.revalidate ?? 3600, // 默认1小时
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        throw error;
      }
      throw new Error('Unknown error occurred');
    }
  }

  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  async post<T>(endpoint: string, data: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

// 创建单例实例
export const apiClient = new APIClient(
  process.env.NEXT_PUBLIC_API_URL || 'https://api.example.com'
);

// 使用 React cache 包装，避免重复请求
export const cachedGet = cache(apiClient.get.bind(apiClient));
