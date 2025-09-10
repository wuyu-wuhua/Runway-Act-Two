'use client'

import { useAuth } from '@/lib/authContext'
import { useLanguage } from '@/lib/languageContext'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CreditCard, Plus, CheckCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import LoginDialog from '@/components/LoginDialog'
import { loadStripe } from '@stripe/stripe-js'

export default function CreditsPage() {
  const { user, loading } = useAuth()
  const { t } = useLanguage()
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // 积分包配置
  const [creditPackages, setCreditPackages] = useState([
    { id: 1, credits: 1000, price: 39.9, popular: false, stripePriceId: '' },
    { id: 2, credits: 2000, price: 69.9, popular: true, stripePriceId: '' },
    { id: 3, credits: 3600, price: 99.9, popular: false, stripePriceId: '' }
  ])

  // 从数据库获取积分包信息
  useEffect(() => {
    const fetchCreditPackages = async () => {
      try {
        const response = await fetch('/api/subscription-plans')
        if (response.ok) {
          const data = await response.json()
          // 过滤出积分包类型
          const creditsPlans = data.allPlans.filter((plan: any) => plan.price_type === 'credits')
          const packages = creditsPlans.map((plan: any) => ({
            id: plan.id,
            credits: plan.credits_amount,
            price: plan.price,
            popular: plan.price_name === '积分包2', // 2000积分的设为推荐
            stripePriceId: plan.stripe_price_id
          }))
          setCreditPackages(packages)
        }
      } catch (error) {
        console.error('获取积分包信息失败:', error)
      }
    }

    if (user) {
      fetchCreditPackages()
    }
  }, [user])

  const handleBuyCredits = async (packageId: number) => {
    if (!user) {
      setIsLoginDialogOpen(true)
      return
    }

    try {
      // 根据 packageId 获取积分包信息
      const packageInfo = creditPackages.find(pkg => pkg.id === packageId)
      if (!packageInfo) {
        console.error('积分包信息不存在')
        return
      }

      // 检查是否有 Stripe 价格 ID
      if (!packageInfo.stripePriceId) {
        console.error('积分包缺少 Stripe 价格 ID')
        return
      }

      // 调用 Stripe Checkout API 创建支付会话
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: packageInfo.stripePriceId,
          userId: user.id,
          email: user.email,
          planName: `${packageInfo.credits}积分包`,
          planType: 'credits',
          credits: packageInfo.credits,
        }),
      })

      if (!response.ok) {
        throw new Error('创建支付会话失败')
      }

      const { sessionId } = await response.json()

      console.log('准备跳转到 Stripe Checkout, sessionId:', sessionId)
      
      // 跳转到 Stripe Checkout
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
      if (stripe) {
        console.log('Stripe 加载成功，开始跳转...')
        const { error } = await stripe.redirectToCheckout({ sessionId })
        if (error) {
          console.error('跳转失败:', error)
        } else {
          console.log('跳转成功，等待页面跳转...')
        }
      } else {
        console.error('Stripe 加载失败')
      }
    } catch (error) {
      console.error('购买失败:', error)
      // 这里可以添加错误提示
    }
  }

  // 如果正在加载认证状态，显示加载状态
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">{t('loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <div className="pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* 页面标题 */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">{t('buyCredits')}</h1>
            <p className="text-xl text-gray-300">
              {user ? (
                <>
                  {t('profileCurrentCredits')}：<span className="text-green-400 font-bold">{user?.credits_balance ?? 0}</span>
                </>
              ) : (
                t('loginToViewCredits')
              )}
            </p>
          </div>

          {/* 积分包列表 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {creditPackages.map((pkg) => (
              <div key={pkg.id} className="relative">
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      {t('recommended')}
                    </span>
                  </div>
                )}
                <Card className={`h-full p-8 transition-all duration-300 hover:scale-105 ${pkg.popular ? 'ring-2 ring-purple-500 bg-white/10 border border-purple-500/30' : 'bg-white/8 border border-white/10 hover:border-white/20'}`}>
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-white mb-3">
                      {pkg.credits} {t('credits')}
                    </h3>
                    <div className="mb-6">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-4xl font-bold text-white">
                          ${pkg.price}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-300 mb-8">{t('oneTimePurchase')}</p>
                  </div>
                  <Button
                    onClick={() => handleBuyCredits(pkg.id)}
                    className={`w-full transition-all duration-300 ${pkg.popular ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl' : 'bg-white/10 hover:bg-white/20 border border-white/20 text-white hover:border-white/30'}`}
                  >
                    {user ? t('purchase') : t('loginFirst')}
                  </Button>
                </Card>
              </div>
            ))}
          </div>

          {/* 删除购买历史部分 */}
        </div>
      </div>
      <Footer />
      
      {/* 登录对话框 */}
      <LoginDialog 
        isOpen={isLoginDialogOpen} 
        onClose={() => setIsLoginDialogOpen(false)} 
      />
    </div>
  )
}