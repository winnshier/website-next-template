import { Metadata } from 'next';
import { getAboutData } from '@/lib/api/fetchers/about';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  return {
    title: locale === 'zh' ? '关于我们' : 'About Us',
    description: locale === 'zh'
      ? '了解我们的公司、团队和发展历程'
      : 'Learn about our company, team, and journey',
  };
}

export default async function AboutPage({ params: { locale } }: { params: { locale: string } }) {
  const aboutData = await getAboutData(locale);
  const isZh = locale === 'zh';

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {isZh ? '关于我们' : 'About Us'}
          </h1>
          <p className="text-xl text-gray-600">
            {aboutData.company.description}
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {isZh ? '我们的使命' : 'Our Mission'}
              </h2>
              <p className="text-lg text-gray-600">
                {aboutData.company.mission}
              </p>
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {isZh ? '我们的愿景' : 'Our Vision'}
              </h2>
              <p className="text-lg text-gray-600">
                {aboutData.company.vision}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {isZh ? '我们的团队' : 'Our Team'}
            </h2>
            <p className="text-xl text-gray-600">
              {isZh ? '认识我们的核心团队成员' : 'Meet our core team members'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {aboutData.team.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl text-white">
                  👤
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {member.name}
                </h3>
                <p className="text-blue-600 mb-3">{member.position}</p>
                <p className="text-gray-600 text-sm">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {isZh ? '发展历程' : 'Our Journey'}
            </h2>
            <p className="text-xl text-gray-600">
              {isZh ? '见证我们的成长之路' : 'Witness our growth story'}
            </p>
          </div>

          <div className="space-y-8">
            {aboutData.timeline.map((event, index) => (
              <div key={event.id} className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  {index < aboutData.timeline.length - 1 && (
                    <div className="w-0.5 h-full bg-blue-200 mt-2"></div>
                  )}
                </div>
                <div className="flex-1 pb-8">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="text-blue-600 font-semibold mb-2">
                      {event.year}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {event.title}
                    </h3>
                    <p className="text-gray-600">{event.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">
            {isZh ? '联系我们' : 'Contact Us'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl mb-3">📧</div>
              <h3 className="font-semibold mb-2">{isZh ? '邮箱' : 'Email'}</h3>
              <p className="text-gray-300">{aboutData.contact.email}</p>
            </div>
            <div>
              <div className="text-4xl mb-3">📞</div>
              <h3 className="font-semibold mb-2">{isZh ? '电话' : 'Phone'}</h3>
              <p className="text-gray-300">{aboutData.contact.phone}</p>
            </div>
            <div>
              <div className="text-4xl mb-3">📍</div>
              <h3 className="font-semibold mb-2">{isZh ? '地址' : 'Address'}</h3>
              <p className="text-gray-300">{aboutData.contact.address}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ISR: 每2小时重新生成
export const revalidate = 7200;
