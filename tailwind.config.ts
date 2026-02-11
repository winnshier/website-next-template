import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        // 移动端优先，使用 max-width
        'mobile': {'max': '767px'},

        // 标准断点（行业标准）
        'sm': '640px',    // 小屏手机横屏
        'md': '768px',    // 平板竖屏（主要断点）
        'lg': '1024px',   // 平板横屏/小屏笔记本
        'xl': '1280px',   // 桌面显示器
        '2xl': '1536px',  // 大屏显示器

        // 语义化断点
        'tablet': '768px',   // 平板及以上
        'desktop': '1024px', // 桌面及以上
        'wide': '1920px',    // 宽屏（锁定最大尺寸）
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        'sans-sc': ['var(--font-noto-sans-sc)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // 使用 rem 单位，会根据动态根字体自动缩放
        // 移动端(375px): 14px base -> 1rem = 14px
        // PC端(1920px): 16px base -> 1rem = 16px
        'xs': ['0.75rem', { lineHeight: '1rem' }],      // 10.5px / 12px
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],  // 12.25px / 14px
        'base': ['1rem', { lineHeight: '1.5rem' }],     // 14px / 16px
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],  // 15.75px / 18px
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],   // 17.5px / 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],      // 21px / 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 26.25px / 30px
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 31.5px / 36px
        '5xl': ['3rem', { lineHeight: '1' }],           // 42px / 48px
        '6xl': ['3.75rem', { lineHeight: '1' }],        // 52.5px / 60px
        '7xl': ['4.5rem', { lineHeight: '1' }],         // 63px / 72px
        '8xl': ['6rem', { lineHeight: '1' }],           // 84px / 96px
        '9xl': ['8rem', { lineHeight: '1' }],           // 112px / 128px
      },
      spacing: {
        // 使用 rem 单位，会根据动态根字体自动缩放
        // 保持 Tailwind 默认的间距比例
      },
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
    },
  },
  plugins: [],
}
export default config
