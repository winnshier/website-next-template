export const API_ENDPOINTS = {
  // 首页
  HOME: '/api/home',
  HOME_HERO: '/api/home/hero',
  HOME_FEATURES: '/api/home/features',

  // 产品
  PRODUCTS: '/api/products',
  PRODUCT_DETAIL: (id: string) => `/api/products/${id}`,

  // 关于我们
  ABOUT: '/api/about',
  ABOUT_TEAM: '/api/about/team',
  ABOUT_TIMELINE: '/api/about/timeline',

  // 通用
  SETTINGS: '/api/settings',
} as const;
