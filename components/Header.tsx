'use client'

import { useState } from 'react'
import Link from 'next/link'
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

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
             <div className="bg-black/20 backdrop-blur-md border-b border-white/10 py-4 shadow-2xl">
        <div className="flex items-center justify-between w-full px-8">
          {/* Logo and Navigation - Centered */}
          <div className="flex items-center space-x-8 flex-1 justify-center">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                {/* 抽象图标 */}
                <div className="w-8 h-8 mr-3">
                  <svg className="w-full h-full text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                               <span className="text-xl font-semibold text-white">Runway Act Two</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-white hover:text-gray-300 px-3 py-2 text-sm font-medium transition-all duration-200">
                {t('home')}
              </Link>
              <Link href="/ai-effect-generator" className="text-white hover:text-gray-300 px-3 py-2 text-sm font-medium transition-all duration-200">
                {t('aiEffectGenerator')}
              </Link>
              <Link href="/pricing" className="text-white hover:text-gray-300 px-3 py-2 text-sm font-medium transition-all duration-200">
                {t('pricing')}
              </Link>
            </nav>
          </div>

          {/* Login Button, Translate Button and Mobile menu */}
          <div className="flex items-center space-x-4 flex-1 justify-center">
            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Login Button or User Avatar */}
            {!loading && (
              user ? (
                <UserAvatar />
              ) : (
                <button 
                  onClick={() => setIsLoginDialogOpen(true)}
                  className="hidden md:block bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 backdrop-blur-sm border border-white/20"
                >
                  {t('login')}
                </button>
              )
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-white hover:text-gray-300 focus:outline-none"
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
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
                     <div className="md:hidden mt-4 pt-4 border-t border-white/10">
                      <div className="space-y-2">
            <Link href="/" className="text-white hover:text-gray-300 block px-3 py-2 text-sm font-medium">
              {t('home')}
            </Link>
            <Link href="/ai-effect-generator" className="text-white hover:text-gray-300 block px-3 py-2 text-sm font-medium">
              {t('aiEffectGenerator')}
            </Link>
            <Link href="/pricing" className="text-white hover:text-gray-300 block px-3 py-2 text-sm font-medium">
              {t('pricing')}
            </Link>
     
                             <div className="pt-2 border-t border-white/10">
                <div className="flex items-center space-x-2 mb-2">
                  <button className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-all duration-200 backdrop-blur-sm border border-white/20">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                  <span className="text-white text-sm">{t('translate')}</span>
                </div>
                {!loading && (
                  user ? (
                    <div className="flex items-center space-x-2">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.username}
                          className="w-8 h-8 rounded-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            target.nextElementSibling?.classList.remove('hidden')
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
                      <span className="text-white text-sm">{user.username}</span>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setIsLoginDialogOpen(true)}
                      className="w-full bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 backdrop-blur-sm border border-white/20"
                    >
                      {t('login')}
                    </button>
                  )
                )}
              </div>
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