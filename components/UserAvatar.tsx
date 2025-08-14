'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/authContext'
import { useLanguage } from '@/lib/languageContext'
import { ChevronDown, LogOut, CreditCard, Plus, User, Settings } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function UserAvatar() {
  const { user, logout } = useAuth()
  const { t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    try {
      console.log('开始退出登录...')
      await logout()
      console.log('退出登录成功')
      setIsOpen(false)
      // 用户状态已清除，页面会自动更新
    } catch (error) {
      console.error('退出登录失败:', error)
      alert(t('logoutFailed'))
    }
  }

  const getPriceTypeText = (type: string) => {
    switch (type) {
      case 'free': return t('freeUser')
      case 'monthly': return t('monthlyUser')
      case 'year': return t('yearlyUser')
      case 'yearly': return t('yearlyUser')
      default: return type
    }
  }

  const handleBuyCredits = () => {
    // 跳转到积分页面
    window.location.href = '/credits'
  }

  const handleViewProfile = () => {
    // 跳转到个人资料页面
    window.location.href = '/profile'
  }

  const handleManageSubscription = async () => {
    if (!user) return
    
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      })

      if (response.ok) {
        const { url } = await response.json()
        window.open(url, '_blank')
      } else {
        console.error('创建客户门户会话失败')
      }
    } catch (error) {
      console.error('管理订阅失败:', error)
    }
    
    setIsOpen(false)
  }

  if (!user) return null

  return (
    <div className="relative">
      {/* 头像按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-full transition-all duration-200 backdrop-blur-sm border border-white/20"
      >
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.username}
            className="w-8 h-8 rounded-full object-cover"
            onError={(e) => {
              console.log('头像加载失败:', user.avatar_url)
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              target.nextElementSibling?.classList.remove('hidden')
            }}
            onLoad={() => {
              console.log('头像加载成功:', user.avatar_url)
            }}
          />
        ) : null}
        <svg 
          className={`w-8 h-8 rounded-full ${user.avatar_url ? 'hidden' : ''}`}
          viewBox="0 0 40 40" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="20" cy="20" r="20" fill="#E5E7EB"/>
          <circle cx="20" cy="16" r="6" fill="#9CA3AF"/>
          <path d="M8 32C8 26.4772 12.4772 22 18 22H22C27.5228 22 32 26.4772 32 32V40H8V32Z" fill="#9CA3AF"/>
        </svg>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* 下拉菜单 */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          {/* 用户信息 */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.username}
                  className="w-12 h-12 rounded-full object-cover"
                  onError={(e) => {
                    console.log('下拉菜单头像加载失败:', user.avatar_url)
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    target.nextElementSibling?.classList.remove('hidden')
                  }}
                  onLoad={() => {
                    console.log('下拉菜单头像加载成功:', user.avatar_url)
                  }}
                />
              ) : null}
              <svg 
                className={`w-12 h-12 rounded-full ${user.avatar_url ? 'hidden' : ''}`}
                viewBox="0 0 40 40" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="20" cy="20" r="20" fill="#E5E7EB"/>
                <circle cx="20" cy="16" r="6" fill="#9CA3AF"/>
                <path d="M8 32C8 26.4772 12.4772 22 18 22H22C27.5228 22 32 26.4772 32 32V40H8V32Z" fill="#9CA3AF"/>
              </svg>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{user.username}</h3>
                <p className="text-sm text-gray-600">{user.email}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                    {getPriceTypeText(user.price_type)}
                  </span>
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                    {user.credits_balance} {t('credits')}
                  </span>
                </div>
              </div>
            </div>
          </div>

                    {/* 个人资料按钮 */}
          <div className="p-4 border-b border-gray-100">
            <button
              onClick={handleViewProfile}
              className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <User className="w-4 h-4" />
              <span>{t('profile')}</span>
            </button>
          </div>

          {/* 管理订阅按钮 - 只有订阅用户才显示 */}
          {user.price_type && user.price_type !== 'free' && (
            <div className="p-4 border-b border-gray-100">
              <button
                onClick={handleManageSubscription}
                className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>{t('manageSubscription')}</span>
              </button>
            </div>
          )}

          {/* 购买积分按钮 */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-900 flex items-center">
                <CreditCard className="w-4 h-4 mr-2" />
                {t('buyCredits')}
              </h4>
              <span className="text-xs text-gray-500">{t('currentBalance')}: {user.credits_balance}</span>
            </div>
            
            <Button
              onClick={handleBuyCredits}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              {t('purchase')}
            </Button>
          </div>

          {/* 操作按钮 */}
          <div className="p-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>{t('logout')}</span>
            </button>
          </div>
        </div>
      )}

      {/* 点击外部关闭 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
} 