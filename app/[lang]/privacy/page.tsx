'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useLanguage } from '@/lib/languageContext'

export default function PrivacyPage() {
  const { t } = useLanguage()
  
  return (
    <main className="min-h-screen relative bg-black">
      
      <Header />
      
      {/* 隐私政策内容 */}
      <section className="pt-32 pb-20 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 drop-shadow-lg">
              {t('privacyPolicy')}
            </h1>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto drop-shadow-md">
              {t('privacyPolicySubtitle')}
            </p>
          </div>

          {/* 政策内容 */}
          <div className="space-y-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
              <h2 className="text-2xl font-bold text-white mb-4">{t('informationCollection')}</h2>
              <p className="text-gray-200 leading-relaxed mb-4">
                {t('informationCollectionDesc')}
              </p>
              <ul className="text-gray-200 space-y-2 ml-6">
                <li>{t('accountInfo')}</li>
                <li>{t('usageData')}</li>
                <li>{t('technicalInfo')}</li>
                <li>{t('communicationRecords')}</li>
              </ul>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
              <h2 className="text-2xl font-bold text-white mb-4">{t('informationUsage')}</h2>
              <p className="text-gray-200 leading-relaxed mb-4">
                {t('informationUsageDesc')}
              </p>
              <ul className="text-gray-200 space-y-2 ml-6">
                <li>{t('provideAndImprove')}</li>
                <li>{t('processRequests')}</li>
                <li>{t('sendNotifications')}</li>
                <li>{t('provideSupport')}</li>
                <li>{t('preventFraud')}</li>
              </ul>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
              <h2 className="text-2xl font-bold text-white mb-4">{t('informationProtection')}</h2>
              <p className="text-gray-200 leading-relaxed mb-4">
                {t('informationProtectionDesc')}
              </p>
              <ul className="text-gray-200 space-y-2 ml-6">
                <li>{t('dataEncryption')}</li>
                <li>{t('accessControl')}</li>
                <li>{t('securityAudit')}</li>
                <li>{t('privacyTraining')}</li>
              </ul>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
              <h2 className="text-2xl font-bold text-white mb-4">{t('informationSharing')}</h2>
              <p className="text-gray-200 leading-relaxed mb-4">
                {t('informationSharingDesc')}
              </p>
              <ul className="text-gray-200 space-y-2 ml-6">
                <li>{t('explicitConsent')}</li>
                <li>{t('legalRequirement')}</li>
                <li>{t('protectRights')}</li>
                <li>{t('trustedPartners')}</li>
              </ul>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
              <h2 className="text-2xl font-bold text-white mb-4">{t('yourRights')}</h2>
              <p className="text-gray-200 leading-relaxed mb-4">
                {t('yourRightsDesc')}
              </p>
              <ul className="text-gray-200 space-y-2 ml-6">
                <li>{t('accessInfo')}</li>
                <li>{t('correctInfo')}</li>
                <li>{t('deleteAccount')}</li>
                <li>{t('limitProcessing')}</li>
                <li>{t('dataPortability')}</li>
              </ul>
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