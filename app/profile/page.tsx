'use client'

import { useAuth } from '@/lib/authContext'
import { useLanguage } from '@/lib/languageContext'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { User, Mail, Calendar, CreditCard, Crown } from 'lucide-react'
import SubscriptionInfo from '@/components/SubscriptionInfo'
import LoginDialog from '@/components/LoginDialog' // Added import for LoginDialog
import { useState } from 'react' // Added import for useState

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const { t } = useLanguage()
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false)

  const getPriceTypeText = (type: string) => {
    switch (type) {
      case 'free': return t('freeUser')
      case 'monthly': return t('monthlyUser')
      case 'year': return t('yearlyUser')
      case 'yearly': return t('yearlyUser')
      default: return type
    }
  }

  const getPriceTypeIcon = (type: string) => {
    switch (type) {
      case 'free': return <User className="w-5 h-5" />
      case 'monthly': return <Crown className="w-5 h-5" />
      case 'year': return <Crown className="w-5 h-5" />
      case 'yearly': return <Crown className="w-5 h-5" />
      default: return <User className="w-5 h-5" />
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
            <h1 className="text-4xl font-bold text-white mb-4">{t('profile')}</h1>
            <p className="text-xl text-gray-300">{t('profileDesc')}</p>
          </div>

          {user ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* 左侧：用户基本信息 */}
              <div className="lg:col-span-1">
                <Card className="p-6 bg-gray-900/80 backdrop-blur-lg border border-gray-700 rounded-2xl">
                  <div className="text-center">
                    {/* 头像 */}
                    <div className="mb-6">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.username}
                          className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-purple-500"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full mx-auto bg-gray-700 flex items-center justify-center border-4 border-purple-500">
                          <User className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* 用户名 */}
                    <h2 className="text-2xl font-bold text-white mb-2">{user.username}</h2>
                    
                    {/* 邮箱 */}
                    <div className="flex items-center justify-center space-x-2 text-gray-300 mb-4">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">{user.email}</span>
                    </div>

                    {/* 用户类型 */}
                    <div className="flex items-center justify-center space-x-2 mb-4">
                      {getPriceTypeIcon(user.price_type)}
                      <span className="text-sm text-purple-400 font-medium">
                        {getPriceTypeText(user.price_type)}
                      </span>
                    </div>

                    {/* 积分余额 */}
                    <div className="bg-gray-800 rounded-lg p-4 mb-6">
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        <CreditCard className="w-5 h-5 text-green-400" />
                        <span className="text-white font-semibold">{t('profileCurrentCredits')}</span>
                      </div>
                      <div className="text-3xl font-bold text-green-400">
                        {user.credits_balance}
                      </div>
                      <p className="text-sm text-gray-400">{t('profileAvailableCredits')}</p>
                    </div>

                    {/* 操作按钮 */}
                    <div className="space-y-3">
                      <Button
                        onClick={() => window.location.href = '/credits'}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        {t('buyCredits')}
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>

              {/* 右侧：详细信息 */}
              <div className="lg:col-span-2 space-y-6">
                {/* 账户信息 */}
                <Card className="p-6 bg-gray-900/80 backdrop-blur-lg border border-gray-700 rounded-2xl">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    {t('profileAccountInfo')}
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-gray-700">
                      <span className="text-gray-300">{t('profileUsername')}</span>
                      <span className="text-white font-medium">{user.username}</span>
                    </div>
                    
                    <div className="flex items-center justify-between py-3 border-b border-gray-700">
                      <span className="text-gray-300">{t('profileEmail')}</span>
                      <span className="text-white font-medium">{user.email}</span>
                    </div>
                    
                    <div className="flex items-center justify-between py-3 border-b border-gray-700">
                      <span className="text-gray-300">{t('profileAccountType')}</span>
                      <span className="text-purple-400 font-medium">
                        {getPriceTypeText(user.price_type)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between py-3 border-b border-gray-700">
                      <span className="text-gray-300">{t('profileAccountStatus')}</span>
                      <span className="text-green-400 font-medium capitalize">{user.status}</span>
                    </div>
                    
                    <div className="flex items-center justify-between py-3">
                      <span className="text-gray-300">{t('profileRegistrationDate')}</span>
                      <span className="text-white font-medium">
                        {new Date(user.created_at).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                  </div>
                </Card>

                {/* 使用统计 */}
                <Card className="p-6 bg-gray-900/80 backdrop-blur-lg border border-gray-700 rounded-2xl">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    {t('usageStats')}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-800 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                        <span className="text-gray-300 text-sm">{t('profileCurrentCredits')}</span>
                      </div>
                      <div className="text-2xl font-bold text-white">{user.credits_balance}</div>
                    </div>
                    
                    <div className="bg-gray-800 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                        <span className="text-gray-300 text-sm">{t('profileUsedCredits')}</span>
                      </div>
                      <div className="text-2xl font-bold text-white">0</div>
                    </div>
                    
                    <div className="bg-gray-800 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                        <span className="text-gray-300 text-sm">{t('profileGenerationCount')}</span>
                      </div>
                      <div className="text-2xl font-bold text-white">0</div>
                    </div>
                    
                    <div className="bg-gray-800 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                        <span className="text-gray-300 text-sm">{t('profileLastLogin')}</span>
                      </div>
                      <div className="text-sm font-medium text-white">
                        {user.last_login_at ? new Date(user.last_login_at).toLocaleDateString('zh-CN') : '从未登录'}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* 订阅信息 */}
                <div className="bg-gray-900/80 backdrop-blur-lg border border-gray-700 rounded-2xl">
                  <SubscriptionInfo />
                </div>
              </div>
            </div>
          ) : (
            /* 未登录用户看到的简化版本 */
            <div className="text-center">
              <div className="text-6xl mb-6">👤</div>
              <h2 className="text-2xl font-bold text-white mb-4">{t('profile')}</h2>
              <p className="text-gray-300 text-lg mb-8">{t('loginToViewProfile')}</p>
              <Button
                onClick={() => setIsLoginDialogOpen(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg text-lg font-medium"
              >
                {t('login')}
              </Button>
            </div>
          )}
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