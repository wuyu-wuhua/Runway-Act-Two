'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useLanguage } from '@/lib/languageContext'

export default function BlogPage() {
  const { t } = useLanguage()
  
  return (
    <main className="min-h-screen relative bg-black">
      
      <Header />
      
      {/* 博客内容 */}
      <section className="pt-32 pb-20 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 drop-shadow-lg">
              {t('blog')}
            </h1>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto drop-shadow-md">
              {t('blogSubtitle')}
            </p>
          </div>

          {/* 博客文章列表 */}
          <div className="space-y-16">
            {/* 文章1 */}
            <article className="pb-16 border-b border-white/10">
              <div className="flex items-center text-sm text-gray-400 mb-6">
                <span>2024年1月15日</span>
                <span className="mx-2">•</span>
                <span>{t('aiTechnology')}</span>
              </div>
              <h2 className="text-4xl font-bold text-white mb-8 hover:text-blue-400 transition-colors cursor-pointer">
                {t('aiFutureTrends')}
              </h2>
              <div className="prose prose-lg prose-invert max-w-none">
                <p className="text-gray-200 leading-relaxed mb-6 text-lg">
                  {t('aiFutureDesc1')}
                </p>
                <p className="text-gray-200 leading-relaxed mb-6">
                  {t('aiFutureDesc2')}
                </p>
                <p className="text-gray-200 leading-relaxed mb-6">
                  {t('aiFutureDesc3')}
                </p>
                <p className="text-gray-200 leading-relaxed mb-6">
                  {t('aiFutureDesc4')}
                </p>
              </div>
            </article>

            {/* 文章2 */}
            <article className="pb-16 border-b border-white/10">
              <div className="flex items-center text-sm text-gray-400 mb-6">
                <span>2024年1月10日</span>
                <span className="mx-2">•</span>
                <span>{t('tutorial')}</span>
              </div>
              <h2 className="text-4xl font-bold text-white mb-8 hover:text-green-400 transition-colors cursor-pointer">
                {t('createMovieEffects')}
              </h2>
              <div className="prose prose-lg prose-invert max-w-none">
                <p className="text-gray-200 leading-relaxed mb-6 text-lg">
                  {t('movieEffectsDesc1')}
                </p>
                <p className="text-gray-200 leading-relaxed mb-6">
                  {t('movieEffectsDesc2')}
                </p>
                <p className="text-gray-200 leading-relaxed mb-6">
                  {t('movieEffectsDesc3')}
                </p>
                <p className="text-gray-200 leading-relaxed mb-6">
                  {t('movieEffectsDesc4')}
                </p>
              </div>
            </article>

            {/* 文章3 */}
            <article className="pb-16">
              <div className="flex items-center text-sm text-gray-400 mb-6">
                <span>2024年1月5日</span>
                <span className="mx-2">•</span>
                <span>{t('caseStudy')}</span>
              </div>
              <h2 className="text-4xl font-bold text-white mb-8 hover:text-red-400 transition-colors cursor-pointer">
                {t('creatorShowcase')}
              </h2>
              <div className="prose prose-lg prose-invert max-w-none">
                <p className="text-gray-200 leading-relaxed mb-6 text-lg">
                  {t('creatorShowcaseDesc1')}
                </p>
                <p className="text-gray-200 leading-relaxed mb-6">
                  {t('creatorShowcaseDesc2')}
                </p>
                <p className="text-gray-200 leading-relaxed mb-6">
                  {t('creatorShowcaseDesc3')}
                </p>
                <p className="text-gray-200 leading-relaxed mb-6">
                  {t('creatorShowcaseDesc4')}
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
} 