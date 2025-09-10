'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import LanguageSwitcher from './LanguageSwitcher'
import { useLanguage } from '@/lib/languageContext'
import { useAuth } from '@/lib/authContext'
import LoginDialog from './LoginDialog'
import UserAvatar from './UserAvatar'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false)
  const { t } = useLanguage()
  const { user, loading } = useAuth()
  const pathname = usePathname()
  
  // 从当前路径中提取语言代码
  const getLanguageFromPath = (path: string) => {
    const segments = path.split('/')
    return segments[1] || 'zh'
  }
  
  const currentLang = getLanguageFromPath(pathname)
  
  // 创建多语言链接的辅助函数
  const createLocalizedLink = (path: string) => {
    return `/${currentLang}${path}`
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="bg-black/20 backdrop-blur-md border-b border-white/10 py-3 md:py-4 shadow-2xl">
        <div className="flex items-center justify-between w-full px-4 md:px-8">
          {/* Logo - Mobile optimized */}
          <div className="flex-shrink-0">
            <Link href={createLocalizedLink('')} className="flex items-center">
              {/* 抽象图标 */}
              <div className="w-6 h-6 md:w-8 md:h-8 mr-2 md:mr-3">
                <svg className="w-full h-full text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="text-lg md:text-xl font-semibold text-white">Runway Act Two</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6 lg:space-x-8">
            <Link href={createLocalizedLink('')} className="text-white hover:text-gray-300 px-3 py-2 text-sm font-medium transition-all duration-200">
              {t('home')}
            </Link>
            <Link href={createLocalizedLink('/ai-effect-generator')} className="text-white hover:text-gray-300 px-3 py-2 text-sm font-medium transition-all duration-200">
              {t('aiEffectGenerator')}
            </Link>
            <Link href={createLocalizedLink('/pricing')} className="text-white hover:text-gray-300 px-3 py-2 text-sm font-medium transition-all duration-200">
              {t('pricing')}
            </Link>
          </nav>

          {/* Right side controls */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Login Button or User Avatar - Hidden on mobile */}
            {!loading && (
              user ? (
                <div className="hidden md:block">
                  <UserAvatar />
                </div>
              ) : (
                <button 
                  onClick={() => setIsLoginDialogOpen(true)}
                  className="hidden md:block bg-white/10 hover:bg-white/20 text-white px-4 lg:px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 backdrop-blur-sm border border-white/20"
                >
                  {t('login')}
                </button>
              )
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-white hover:text-gray-300 focus:outline-none p-1"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-white/10">
            <div className="space-y-1">
              <Link 
                href={createLocalizedLink('')} 
                className="text-white hover:text-gray-300 block px-4 py-3 text-base font-medium rounded-lg hover:bg-white/5 transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('home')}
              </Link>
              <Link 
                href={createLocalizedLink('/ai-effect-generator')} 
                className="text-white hover:text-gray-300 block px-4 py-3 text-base font-medium rounded-lg hover:bg-white/5 transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('aiEffectGenerator')}
              </Link>
              <Link 
                href={createLocalizedLink('/pricing')} 
                className="text-white hover:text-gray-300 block px-4 py-3 text-base font-medium rounded-lg hover:bg-white/5 transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('pricing')}
              </Link>
            </div>
            
            {/* Mobile user section */}
            <div className="pt-4 mt-4 border-t border-white/10">
              {!loading && (
                user ? (
                  <div className="flex items-center space-x-3 px-4 py-3">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.username}
                        className="w-10 h-10 rounded-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          target.nextElementSibling?.classList.remove('hidden')
                        }}
                      />
                    ) : null}
                    <svg 
                      className={`w-10 h-10 rounded-full ${user.avatar_url ? 'hidden' : ''}`}
                      viewBox="0 0 40 40" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="20" cy="20" r="20" fill="#E5E7EB"/>
                      <circle cx="20" cy="16" r="6" fill="#9CA3AF"/>
                      <path d="M8 32C8 26.4772 12.4772 22 18 22H22C27.5228 22 32 26.4772 32 32V40H8V32Z" fill="#9CA3AF"/>
                    </svg>
                    <span className="text-white text-base font-medium">{user.username}</span>
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      setIsLoginDialogOpen(true)
                      setIsMenuOpen(false)
                    }}
                    className="w-full bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 backdrop-blur-sm border border-white/20 mx-4"
                  >
                    {t('login')}
                  </button>
                )
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Login Dialog */}
      <LoginDialog 
        isOpen={isLoginDialogOpen} 
        onClose={() => setIsLoginDialogOpen(false)} 
      />
    </header>
  )
} 