export interface APIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

// 首页数据类型
export interface HomeHeroData {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  backgroundImage: string;
  backgroundVideo?: string;
}

export interface HomeFeature {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface HomeData {
  hero: HomeHeroData;
  features: HomeFeature[];
  stats: {
    label: string;
    value: string;
  }[];
}

// 产品数据类型
export interface Product {
  id: string;
  title: string;
  description: string;
  image: string;
  features: string[];
  order: number;
}

export interface ProductsData {
  products: Product[];
  total: number;
}

// 关于我们数据类型
export interface TeamMember {
  id: string;
  name: string;
  position: string;
  avatar: string;
  bio?: string;
}

export interface TimelineEvent {
  id: string;
  year: string;
  title: string;
  description: string;
}

export interface AboutData {
  company: {
    name: string;
    description: string;
    mission: string;
    vision: string;
  };
  team: TeamMember[];
  timeline: TimelineEvent[];
  contact: {
    email: string;
    phone: string;
    address: string;
  };
}
