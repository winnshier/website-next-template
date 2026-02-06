/** @type {import('next').NextConfig} */
const nextConfig = {
  // 启用standalone输出模式（Docker部署必需）
  output: 'standalone',

  // 图片优化配置
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.example.com',
        pathname: '/**',
      },
      // 可以添加更多CDN域名
    ],
    minimumCacheTTL: 31536000, // 1年
  },

  // 静态资源CDN前缀
  assetPrefix: process.env.NEXT_PUBLIC_CDN_URL || undefined,

  // 性能优化
  experimental: {
    optimizePackageImports: ['framer-motion', 'keen-slider'],
  },
};

module.exports = nextConfig;
