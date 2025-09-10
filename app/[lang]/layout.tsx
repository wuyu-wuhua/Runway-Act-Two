import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../globals.css'
import Feedback from '@/components/Feedback'

import { LanguageProvider } from '@/lib/languageContext'
import { AuthProvider } from '@/lib/authContext'
import { CookieConsentProvider } from '@/lib/cookie-consent/CookieConsentProvider'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import MicrosoftClarity from '@/components/MicrosoftClarity'
import AdManager from '@/components/AdManager'
import { getTranslation } from '@/lib/translations'
import { notFound } from 'next/navigation'

const inter = Inter({ subsets: ['latin'] })

// 支持的语言列表
const languages = ['zh', 'en', 'hi', 'es', 'ur', 'id', 'ar', 'de', 'ru', 'mx', 'uk']

export async function generateStaticParams() {
  return languages.map((lang) => ({
    lang: lang,
  }))
}

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const { lang } = params
  
  if (!languages.includes(lang)) {
    notFound()
  }

  const t = (key: string) => getTranslation(lang as 'zh' | 'en' | 'hi' | 'es' | 'ur' | 'id' | 'ar' | 'de' | 'ru' | 'mx' | 'uk', key as any)
  
  return {
    title: t('pageTitle'),
    description: t('showcaseDescription'),
    authors: [{ name: 'Runway Act Two' }],
    creator: 'Runway Act Two',
    publisher: 'Runway Act Two',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL('https://act2ai.com'),
    alternates: {
      canonical: `/${lang}`,
      languages: {
        'zh-CN': '/zh',
        'en-US': '/en',
      },
    },
    openGraph: {
      title: t('pageTitle'),
      description: t('showcaseDescription'),
      url: `https://act2ai.com/${lang}`,
      siteName: 'Runway Act Two',
      images: [
        {
          url: '/111111.png',
          width: 1200,
          height: 630,
          alt: t('pageTitle'),
        },
      ],
      locale: lang === 'zh' ? 'zh_CN' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('pageTitle'),
      description: t('showcaseDescription'),
      images: ['/111111.png'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

export default function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { lang: string }
}) {
  const { lang } = params
  
  if (!languages.includes(lang)) {
    notFound()
  }

  return (
    <html lang={lang === 'zh' ? 'zh-CN' : 'en-US'}>
      <head>
        <meta name="google-site-verification" content="I2bQ6-s-sMIhfytU_srriX5lHpLl2yej3r43sdvvRIU" />
        <link rel="icon" type="image/svg+xml" href="/favicon-simple.svg" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#8b5cf6" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className}>
        <LanguageProvider initialLanguage={lang as 'zh' | 'en' | 'hi' | 'es' | 'ur' | 'id' | 'ar' | 'de' | 'ru' | 'mx' | 'uk'}>
          <AuthProvider>
            {children}
            <Feedback />
            <CookieConsentProvider />
            <GoogleAnalytics />
            <MicrosoftClarity />
            <AdManager />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
