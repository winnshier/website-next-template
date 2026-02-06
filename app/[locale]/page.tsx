import { Metadata } from 'next';
import Link from 'next/link';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  return {
    title: locale === 'zh' ? '首页' : 'Home',
    description: locale === 'zh'
      ? '欢迎来到我们的企业级官网，了解我们的产品和服务'
      : 'Welcome to our enterprise website, discover our products and services',
  };
}

export default function HomePage({ params: { locale } }: { params: { locale: string } }) {
  const isZh = locale === 'zh';

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            {isZh ? '构建未来的企业级解决方案' : 'Building Enterprise Solutions for the Future'}
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8">
            {isZh
              ? '专业、高效、可靠的技术服务，助力您的业务腾飞'
              : 'Professional, efficient, and reliable technology services to power your business'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/${locale}/products`}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              {isZh ? '查看产品' : 'View Products'}
            </Link>
            <Link
              href={`/${locale}/about`}
              className="px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              {isZh ? '了解更多' : 'Learn More'}
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {isZh ? '核心特性' : 'Core Features'}
            </h2>
            <p className="text-xl text-gray-600">
              {isZh ? '为您提供全方位的企业级服务' : 'Comprehensive enterprise services for your business'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '🚀',
                title: isZh ? '快速部署' : 'Fast Deployment',
                description: isZh
                  ? '一键部署，快速上线，节省您的时间成本'
                  : 'One-click deployment, quick launch, save your time',
              },
              {
                icon: '🔒',
                title: isZh ? '安全可靠' : 'Secure & Reliable',
                description: isZh
                  ? '企业级安全保障，数据加密传输'
                  : 'Enterprise-grade security, encrypted data transmission',
              },
              {
                icon: '📊',
                title: isZh ? '数据分析' : 'Data Analytics',
                description: isZh
                  ? '实时数据分析，助力业务决策'
                  : 'Real-time analytics to power business decisions',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-gray-50 rounded-xl hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '500+', label: isZh ? '客户' : 'Clients' },
              { value: '1000+', label: isZh ? '项目' : 'Projects' },
              { value: '50+', label: isZh ? '团队成员' : 'Team Members' },
              { value: '99%', label: isZh ? '满意度' : 'Satisfaction' },
            ].map((stat, index) => (
              <div key={index}>
                <div className="text-4xl md:text-5xl font-bold mb-2">{stat.value}</div>
                <div className="text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            {isZh ? '准备开始了吗？' : 'Ready to Get Started?'}
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            {isZh
              ? '立即联系我们，获取专业的解决方案'
              : 'Contact us now to get professional solutions'}
          </p>
          <Link
            href={`/${locale}/about`}
            className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            {isZh ? '联系我们' : 'Contact Us'}
          </Link>
        </div>
      </section>
    </div>
  );
}
