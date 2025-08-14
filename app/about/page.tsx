'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useLanguage } from '@/lib/languageContext'

export default function AboutPage() {
  const { t } = useLanguage()
  
  return (
    <main className="min-h-screen relative bg-black">
      
      <Header />
      
      {/* 关于我们内容 */}
      <section className="pt-32 pb-20 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 drop-shadow-lg">
              {t('aboutUs')}
            </h1>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto drop-shadow-md">
              {t('aboutUsSubtitle')}
            </p>
          </div>

          {/* 公司介绍 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">{t('ourMission')}</h2>
            <p className="text-gray-200 leading-relaxed mb-6">
              {t('missionDesc1')}
            </p>
            <p className="text-gray-200 leading-relaxed">
              {t('missionDesc2')}
            </p>
          </div>

          {/* 核心价值 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{t('innovationDriven')}</h3>
              <p className="text-gray-200 text-sm">
                {t('innovationDrivenDesc')}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{t('userFirst')}</h3>
              <p className="text-gray-200 text-sm">
                {t('userFirstDesc')}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{t('communityBuilding')}</h3>
              <p className="text-gray-200 text-sm">
                {t('communityBuildingDesc')}
              </p>
            </div>
          </div>

          {/* 团队介绍 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">{t('ourTeam')}</h2>
            <p className="text-gray-200 leading-relaxed mb-6">
              {t('teamDesc1')}
            </p>
            <p className="text-gray-200 leading-relaxed">
              {t('teamDesc2')}
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
} 