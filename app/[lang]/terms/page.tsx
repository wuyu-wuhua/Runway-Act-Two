'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useLanguage } from '@/lib/languageContext'

export default function TermsPage() {
  const { t } = useLanguage()
  
  return (
    <main className="min-h-screen relative bg-black">
      
      <Header />
      
      {/* 使用条款内容 */}
      <section className="pt-32 pb-20 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 drop-shadow-lg">
              {t('termsOfService')}
            </h1>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto drop-shadow-md">
              {t('termsSubtitle')}
            </p>
          </div>

          {/* 条款内容 */}
          <div className="space-y-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
              <h2 className="text-2xl font-bold text-white mb-4">{t('serviceDescription')}</h2>
              <p className="text-gray-200 leading-relaxed mb-4">
                {t('serviceDescriptionDesc')}
              </p>
              <ul className="text-gray-200 space-y-2 ml-6">
                <li>{t('aiGeneration')}</li>
                <li>{t('videoEditing')}</li>
                <li>{t('templates')}</li>
                <li>{t('support')}</li>
              </ul>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
              <h2 className="text-2xl font-bold text-white mb-4">{t('userResponsibilities')}</h2>
              <p className="text-gray-200 leading-relaxed mb-4">
                {t('userResponsibilitiesDesc')}
              </p>
              <ul className="text-gray-200 space-y-2 ml-6">
                <li>{t('provideAccurateInfo')}</li>
                <li>{t('protectAccount')}</li>
                <li>{t('complyLaws')}</li>
                <li>{t('noIllegalContent')}</li>
                <li>{t('noAbuse')}</li>
              </ul>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
              <h2 className="text-2xl font-bold text-white mb-4">{t('intellectualProperty')}</h2>
              <p className="text-gray-200 leading-relaxed mb-4">
                {t('intellectualPropertyDesc')}
              </p>
              <ul className="text-gray-200 space-y-2 ml-6">
                <li>{t('retainOwnership')}</li>
                <li>{t('platformOwnership')}</li>
                <li>{t('aiContentOwnership')}</li>
                <li>{t('noInfringement')}</li>
              </ul>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
              <h2 className="text-2xl font-bold text-white mb-4">{t('serviceLimitations')}</h2>
              <p className="text-gray-200 leading-relaxed mb-4">
                {t('serviceLimitationsDesc')}
              </p>
              <ul className="text-gray-200 space-y-2 ml-6">
                <li>{t('restrictAccounts')}</li>
                <li>{t('modifyService')}</li>
                <li>{t('adjustPricing')}</li>
                <li>{t('refuseService')}</li>
              </ul>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
              <h2 className="text-2xl font-bold text-white mb-4">{t('disclaimer')}</h2>
              <p className="text-gray-200 leading-relaxed mb-4">
                {t('disclaimerDesc')}
              </p>
              <ul className="text-gray-200 space-y-2 ml-6">
                <li>{t('serviceInterruption')}</li>
                <li>{t('userContentLoss')}</li>
                <li>{t('thirdPartyIssues')}</li>
                <li>{t('forceMajeure')}</li>
              </ul>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
              <h2 className="text-2xl font-bold text-white mb-4">{t('termsModification')}</h2>
              <p className="text-gray-200 leading-relaxed mb-4">
                {t('termsModificationDesc')}
              </p>
              <ul className="text-gray-200 space-y-2 ml-6">
                <li>{t('websiteNotice')}</li>
                <li>{t('emailNotice')}</li>
                <li>{t('appPush')}</li>
              </ul>
              <p className="text-gray-200 leading-relaxed mt-4">
                {t('continueUse')}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
              <h2 className="text-2xl font-bold text-white mb-4">{t('contactUs')}</h2>
              <p className="text-gray-200 leading-relaxed">
                {t('contactUsDesc')}
              </p>
              <div className="mt-4 text-gray-200">
                <p>{t('email')}</p>
                <p>{t('phone')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
} 