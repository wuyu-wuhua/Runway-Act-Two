'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useLanguage } from '@/lib/languageContext'
import { useAuth } from '@/lib/authContext'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import PaymentButton from '@/components/PaymentButton'
import LoginDialog from '@/components/LoginDialog'
import { SubscriptionPlan } from '@/types/database'

export default function PricingPage() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const [isYearly, setIsYearly] = useState(true)
  const [plans, setPlans] = useState<{
    monthly: SubscriptionPlan[];
    yearly: SubscriptionPlan[];
  }>({ monthly: [], yearly: [] })
  const [loading, setLoading] = useState(true)
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false)

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/subscription-plans')
      const data = await response.json()
      if (data.success) {
        setPlans(data.plans)
      }
    } catch (error) {
      console.error('获取套餐信息失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const currentPlans = isYearly ? plans.yearly : plans.monthly

  if (loading) {
    return (
      <main className="min-h-screen relative bg-slate-900">
        <Header />
        <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-pulse">
              <div className="h-12 bg-gray-700 rounded mb-6"></div>
              <div className="h-6 bg-gray-700 rounded mb-8"></div>
              <div className="h-4 bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen relative bg-slate-900">
      <Header />
      {/* Hero Section */}
      <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            {t('pricingPage')}
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            {t('pricingSubtitle')}
          </p>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto">
            {t('pricingDesc')}
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-7xl mx-auto">
          {/* Toggle Button */}
          <div className="flex justify-center mb-12">
            <div className="bg-white/10 border border-white/20 rounded-lg p-1 flex items-center">
              <button
                onClick={() => setIsYearly(false)}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  !isYearly
                    ? 'bg-purple-600 text-white shadow-lg' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {t('monthlySubscription')}
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  isYearly
                    ? 'bg-purple-600 text-white shadow-lg' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {t('yearlySubscription')}
              </button>
            </div>
          </div>

          <div className="grid gap-6 max-w-3xl mx-auto grid-cols-1 md:grid-cols-2">
            {currentPlans.map((plan, index) => {
              const isPopular = plan.price_name.includes('年订阅1')
              const period = plan.price_type === 'monthly' ? t('starterPeriod') : t('yearlyPeriod')
              const discount = plan.price_type === 'yearly' ? t('discount30') : undefined
              
              // 根据计划类型和名称获取对应的翻译内容
              let planTitle, planPrice, planDesc, planFeatures
              
              if (plan.price_type === 'monthly') {
                if (plan.price_name.includes('月套餐（基础版）')) {
                  planTitle = t('starterPlan')
                  planPrice = t('starterPrice')
                  planDesc = t('starterDesc')
                  planFeatures = t('starterFeatures').split(',')
                } else if (plan.price_name.includes('月套餐（专业版）')) {
                  planTitle = t('professionalPlan')
                  planPrice = t('professionalPrice')
                  planDesc = t('professionalDesc')
                  planFeatures = t('professionalFeatures').split(',')
                } else {
                  planTitle = t('starterPlan')
                  planPrice = t('starterPrice')
                  planDesc = t('starterDesc')
                  planFeatures = t('starterFeatures').split(',')
                }
              } else if (plan.price_type === 'yearly') {
                if (plan.price_name.includes('年套餐（基础版）')) {
                  planTitle = t('enterprisePlan')
                  planPrice = t('enterprisePrice')
                  planDesc = t('enterpriseDesc')
                  planFeatures = t('enterpriseFeatures').split(',')
                } else if (plan.price_name.includes('年套餐（专业版）')) {
                  planTitle = t('yearlyPlan')
                  planPrice = t('yearlyPrice')
                  planDesc = t('yearlyDesc')
                  planFeatures = t('yearlyFeatures').split(',')
                } else {
                  planTitle = t('enterprisePlan')
                  planPrice = t('enterprisePrice')
                  planDesc = t('enterpriseDesc')
                  planFeatures = t('enterpriseFeatures').split(',')
                }
              } else {
                planTitle = t('starterPlan')
                planPrice = t('starterPrice')
                planDesc = t('starterDesc')
                planFeatures = t('starterFeatures').split(',')
              }

              return (
                <div key={plan.id} className="relative">
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg">
                        {t('mostPopular')}
                      </span>
                    </div>
                  )}
                  <Card className={`h-full transition-all duration-300 hover:scale-105 ${isPopular ? 'ring-2 ring-purple-500 bg-white/10 border border-purple-500/30' : 'bg-white/8 border border-white/10 hover:border-white/20'}`}>
                    <div className="p-8">
                      {/* 计划标题和价格 */}
                      <div className="text-center mb-8">
                        <h3 className="text-xl font-bold text-white mb-4">
                          {planTitle}
                        </h3>
                        <div className="flex items-center justify-center gap-2 mb-3">
                          <span className="text-3xl font-bold text-white">
                            {planPrice}
                          </span>
                          <span className="text-gray-400 text-base">
                            {period}
                          </span>
                        </div>
                        {discount && (
                          <span className="text-green-500 text-sm font-medium bg-green-500/10 px-3 py-1 rounded-full">
                            {discount}
                          </span>
                        )}
                      </div>
                      
                      {/* 计划描述 */}
                      <p className="text-gray-300 text-center mb-8 text-sm">
                        {planDesc}
                      </p>
                      
                      {/* 功能列表 */}
                      <div className="space-y-4 mb-8">
                        {planFeatures.map((feature: string, featureIndex: number) => (
                          <div key={featureIndex} className="flex items-start">
                            <svg className="w-5 h-5 text-green-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-gray-300 text-base">
                              {feature.trim()}
                            </span>
                          </div>
                        ))}
                      </div>
                      
                      {/* 订阅按钮 */}
                      {user ? (
                        <PaymentButton
                          planId={plan.id}
                          planName={plan.price_name}
                          planType={plan.price_type}
                          price={plan.price}
                          credits={plan.credits_amount}
                          stripePriceId={plan.stripe_price_id}
                          className={`w-full transition-all duration-300 ${
                            isPopular 
                              ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl' 
                              : 'bg-gray-700 hover:bg-gray-600 text-white'
                          }`}
                        />
                      ) : (
                        <Button
                          onClick={() => setIsLoginDialogOpen(true)}
                          disabled
                          className={`w-full transition-all duration-300 opacity-50 cursor-not-allowed ${
                            isPopular 
                              ? 'bg-purple-600 text-white shadow-lg' 
                              : 'bg-gray-700 text-white'
                          }`}
                        >
                          {t('loginFirst')}
                        </Button>
                      )}
                    </div>
                  </Card>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <Footer />

      {/* 登录对话框 */}
      <LoginDialog 
        isOpen={isLoginDialogOpen} 
        onClose={() => setIsLoginDialogOpen(false)} 
      />
    </main>
  )
} 