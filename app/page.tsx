'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Hero from '@/components/Hero'
import { useLanguage } from '@/lib/languageContext'

export default function Home() {
  const { t } = useLanguage()
  return (
    <main className="min-h-screen relative bg-black">
      
      <Header />
      <Hero />

      {/* 案例展示区域 */}
      <section id="showcase" className="py-32 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 drop-shadow-lg">
              {t('pageTitle')}
            </h2>
            <p className="text-sm text-gray-400 mb-4 drop-shadow-md">
              {t('exploreCreativity')}
            </p>
            <p className="text-lg text-gray-200 max-w-3xl mx-auto drop-shadow-md">
              {t('showcaseDescription')}
            </p>
            <p className="text-sm text-gray-400 max-w-3xl mx-auto drop-shadow-md">
              {t('showcaseDescription')}
            </p>
          </div>

          {/* 案例展示 - 使用真实视频 */}
          <div className="space-y-32">

            {/* 案例2 - Motion master - 横屏布局 */}
            <div className="text-center">
              <div className="flex flex-col lg:flex-row items-center justify-center gap-12">
                <div className="flex-1 max-w-lg">
                  <div className="aspect-video bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl overflow-hidden mb-4 shadow-2xl">
                    <video 
                      className="w-full h-full object-cover"
                      autoPlay 
                      loop 
                      muted 
                      playsInline
                    >
                      <source src="/Video4.mp4" type="video/mp4" />
                    </video>
                  </div>
                  <p className="text-white/70 text-base font-medium">{t('motionTrajectoryControl')}</p>
                </div>
                <div className="flex-1 max-w-lg">
                  <div className="aspect-video bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-xl overflow-hidden mb-4 shadow-2xl">
                    <video 
                      className="w-full h-full object-cover"
                      autoPlay 
                      loop 
                      muted 
                      playsInline
                    >
                      <source src="/Video5.mp4" type="video/mp4" />
                    </video>
                  </div>
                  <p className="text-white/70 text-base font-medium">{t('dynamicEffectEnhancement')}</p>
                </div>
              </div>
            </div>

            {/* 案例3 - Character controls - 左右交叉布局 */}
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-2">{t('characterMotionControl')}</h3>
              <p className="text-gray-200 mb-12 max-w-2xl mx-auto text-lg">
                {t('characterMotionControlDesc')}
              </p>
              
              {/* 第一组：输入视频 + 说明 */}
              <div className="flex flex-col lg:flex-row items-center gap-12 mb-16 max-w-6xl mx-auto">
                <div className="flex-1 lg:order-1">
                  <div className="aspect-[9/16] bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl overflow-hidden shadow-2xl w-full max-w-sm mx-auto">
                    <video 
                      className="w-full h-full object-cover"
                      autoPlay 
                      loop 
                      muted 
                      playsInline
                    >
                      <source src="/Video6.mp4" type="video/mp4" />
                    </video>
                  </div>
                </div>
                <div className="flex-1 lg:order-2 text-left">
                  <h4 className="text-xl font-semibold text-white mb-4">{t('motionCaptureInput')}</h4>
                  <p className="text-gray-200 text-base leading-relaxed">
                    {t('motionCaptureInputDesc')}
                  </p>
                </div>
              </div>

              {/* 第二组：说明 + 角色参考 */}
              <div className="flex flex-col lg:flex-row items-center gap-12 mb-16 max-w-6xl mx-auto">
                <div className="flex-1 lg:order-2">
                  <div className="aspect-[9/16] bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-xl overflow-hidden shadow-2xl w-full max-w-sm mx-auto">
                    <video 
                      className="w-full h-full object-cover"
                      autoPlay 
                      loop 
                      muted 
                      playsInline
                    >
                      <source src="/Video7.mp4" type="video/mp4" />
                    </video>
                  </div>
                </div>
                <div className="flex-1 lg:order-1 text-left">
                  <h4 className="text-xl font-semibold text-white mb-4">{t('characterMotionMapping')}</h4>
                  <p className="text-gray-200 text-base leading-relaxed">
                    {t('characterMotionMappingDesc')}
                  </p>
                </div>
              </div>

              {/* 第三组：输出视频 + 说明 */}
              <div className="flex flex-col lg:flex-row items-center gap-12 mb-16 max-w-6xl mx-auto">
                <div className="flex-1 lg:order-1">
                  <div className="aspect-[9/16] bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-xl overflow-hidden shadow-2xl w-full max-w-sm mx-auto">
                    <video 
                      className="w-full h-full object-cover"
                      autoPlay 
                      loop 
                      muted 
                      playsInline
                    >
                      <source src="/Video8.mp4" type="video/mp4" />
                    </video>
                  </div>
                </div>
                <div className="flex-1 lg:order-2 text-left">
                  <h4 className="text-xl font-semibold text-white mb-4">{t('characterAnimationOutput')}</h4>
                  <p className="text-gray-200 text-base leading-relaxed">
                    {t('characterAnimationOutputDesc')}
                  </p>
                </div>
              </div>

              {/* 第四组：专业光效处理 + 说明 */}
              <div className="flex flex-col lg:flex-row items-center gap-12 max-w-6xl mx-auto">
                <div className="flex-1 lg:order-2">
                  <div className="aspect-[9/16] bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl overflow-hidden shadow-2xl w-full max-w-sm mx-auto">
                    <video 
                      className="w-full h-full object-cover"
                      autoPlay 
                      loop 
                      muted 
                      playsInline
                    >
                      <source src="/Video11.mp4" type="video/mp4" />
                    </video>
                  </div>
                </div>
                <div className="flex-1 lg:order-1 text-left">
                  <h4 className="text-xl font-semibold text-white mb-4">{t('professionalLightingEffects')}</h4>
                  <p className="text-gray-200 text-base leading-relaxed">
                    {t('professionalLightingEffectsDesc')}
                  </p>
                </div>
              </div>

              <p className="text-gray-200 text-base mt-12 max-w-4xl mx-auto">
                {t('realTimeMotionCapture')}
              </p>
            </div>

            {/* 案例4 - 竖屏风格迁移展示 */}
            <div className="flex flex-col lg:flex-row gap-16 max-w-7xl mx-auto">
              {/* 左侧文字内容 */}
              <div className="flex-1 lg:max-w-md">
                <h3 className="text-3xl font-bold text-white mb-2">{t('specialEffectsShowcase')}</h3>
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-white mb-4">• {t('professionalDesignConcept')}</h4>
                  <p className="text-gray-200 text-base leading-relaxed">
                    {t('specialEffectsShowcaseDesc')}
                  </p>
                </div>
                
                {/* 特色功能框 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                    <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-2">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    </div>
                    <p className="text-white text-sm font-medium">{t('carefulDesign')}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                    <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center mx-auto mb-2">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                    <p className="text-white text-sm font-medium">{t('artisticQuality')}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                    <div className="w-8 h-8 bg-red-400 rounded-full flex items-center justify-center mx-auto mb-2">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                      </svg>
                    </div>
                    <p className="text-white text-sm font-medium">{t('highSpeedExperience')}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                    <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center mx-auto mb-2">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838l-2.727 1.17 1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                      </svg>
                    </div>
                    <p className="text-white text-sm font-medium">{t('educationalValue')}</p>
                  </div>
                </div>
              </div>

              {/* 右侧视频网格 */}
              <div className="flex-1">
                <div className="grid grid-cols-2 gap-6">
                  {/* 角色背景替换 */}
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg">
                    <div className="aspect-[9/16] bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
                      <video 
                        className="w-full h-full object-cover"
                        autoPlay 
                        loop 
                        muted 
                        playsInline
                      >
                        <source src="/Video9.mp4" type="video/mp4" />
                      </video>
                    </div>
                    <div className="p-4">
                      <h4 className="text-white font-semibold mb-2">{t('characterBackgroundReplacement')}</h4>
                      <p className="text-gray-300 text-sm">
                        {t('characterBackgroundReplacementDesc')}
                      </p>
                    </div>
                  </div>

                  {/* 角色场景转换 */}
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg">
                    <div className="aspect-[9/16] bg-gradient-to-br from-pink-500/20 to-red-500/20">
                      <video 
                        className="w-full h-full object-cover"
                        autoPlay 
                        loop 
                        muted 
                        playsInline
                      >
                        <source src="/Video10.mp4" type="video/mp4" />
                      </video>
                    </div>
                    <div className="p-4">
                      <h4 className="text-white font-semibold mb-2">{t('characterSceneTransition')}</h4>
                      <p className="text-gray-300 text-sm">
                        {t('characterSceneTransitionDesc')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 案例5 - 正方形风格迁移展示 */}
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-2">{t('squareSpecialEffects')}</h3>
              <p className="text-gray-200 mb-12 max-w-2xl mx-auto text-lg">
                {t('squareSpecialEffectsDesc')}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                <div className="flex flex-col items-center">
                  <div className="aspect-square bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-xl overflow-hidden mb-4 shadow-2xl w-full max-w-sm">
                    <video 
                      className="w-full h-full object-cover"
                      autoPlay 
                      loop 
                      muted 
                      playsInline
                    >
                      <source src="/Video12.mp4" type="video/mp4" />
                    </video>
                  </div>
                  <p className="text-white/70 text-base font-medium">{t('environmentTransformation')}</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="aspect-square bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-xl overflow-hidden mb-4 shadow-2xl w-full max-w-sm">
                    <video 
                      className="w-full h-full object-cover"
                      autoPlay 
                      loop 
                      muted 
                      playsInline
                    >
                      <source src="/Video13.mp4" type="video/mp4" />
                    </video>
                  </div>
                  <p className="text-white/70 text-base font-medium">{t('styleTransformation')}</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="aspect-square bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl overflow-hidden mb-4 shadow-2xl w-full max-w-sm">
                    <video 
                      className="w-full h-full object-cover"
                      autoPlay 
                      loop 
                      muted 
                      playsInline
                    >
                      <source src="/Video14.mp4" type="video/mp4" />
                    </video>
                  </div>
                  <p className="text-white/70 text-base font-medium">{t('creativeComposition')}</p>
                </div>
              </div>
              <p className="text-gray-200 text-base mt-8 max-w-4xl mx-auto">
                {t('squareEffectsSummary')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 功能特色区域 */}
      <section className="py-32 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 drop-shadow-lg">
              {t('builtForArtists')}
            </h2>
            <p className="text-lg text-gray-200 max-w-3xl mx-auto drop-shadow-md">
              {t('builtForArtistsDesc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="bg-white/20 backdrop-blur-sm w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4 drop-shadow-md">{t('rapidPrototyping')}</h3>
              <p className="text-gray-200 drop-shadow-sm text-base">{t('rapidPrototypingDesc')}</p>
            </div>
            
            <div className="text-center">
              <div className="bg-white/20 backdrop-blur-sm w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4 drop-shadow-md">{t('unlimitedCreativity')}</h3>
              <p className="text-gray-200 drop-shadow-sm text-base">{t('unlimitedCreativityDesc')}</p>
            </div>
            
            <div className="text-center">
              <div className="bg-white/20 backdrop-blur-sm w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4 drop-shadow-md">{t('professionalWorkflowIntegration')}</h3>
              <p className="text-gray-200 drop-shadow-sm text-base">{t('professionalWorkflowIntegrationDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
} 