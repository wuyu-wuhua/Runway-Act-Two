'use client'

import Link from 'next/link'
import { useLanguage } from '@/lib/languageContext'

export default function Footer() {
  const { t } = useLanguage()
  
  return (
    <footer className="bg-black/90 backdrop-blur-sm text-white relative z-10 border-t border-gray-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center mb-4">
              <span className="text-2xl font-bold text-primary-400">Runway</span>
              <span className="text-2xl font-bold text-white ml-1">Act Two</span>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              {t('footerDescription')}
            </p>
          </div>

          {/* 快速链接 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('quickLinks')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                  {t('home')}
                </Link>
              </li>
              <li>
                <Link href="/#showcase" className="text-gray-400 hover:text-white transition-colors">
                  {t('showcase')}
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">
                  {t('pricing')}
                </Link>
              </li>
            </ul>
          </div>

          {/* 法律信息 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('legalInfo')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                  {t('aboutUs')}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                  {t('privacyPolicy')}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                  {t('termsOfService')}
                </Link>
              </li>
            </ul>
          </div>

          {/* 联系我们 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('contactUs')}</h3>
            <ul className="space-y-2">
              <li className="flex items-center text-gray-400 hover:text-white transition-colors">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>+023 6287 2229</span>
              </li>
              <li className="flex items-center text-gray-400 hover:text-white transition-colors">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>media@runwayacttwo.online</span>
              </li>
              <li>
                <Link href="/blog" className="flex items-center text-gray-400 hover:text-white transition-colors">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                  <span>{t('blog')}</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex justify-center items-center">
          <p className="text-gray-400 text-sm">
            {t('copyright')}
          </p>
        </div>
      </div>
    </footer>
  )
} 