import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Feedback from '@/components/Feedback'

import { LanguageProvider } from '@/lib/languageContext'
import { AuthProvider } from '@/lib/authContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Runway Act Two - AI Video Effects Generator',
  description: 'Create stunning AI - powered video effects with our advanced generator. Transform your videos with cutting-edge technology and AI innovation.',
  authors: [{ name: 'Runway Act Two' }],
  creator: 'Runway Act Two',
  publisher: 'Runway Act Two',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://runwayacttwo.online'),
  alternates: {
    canonical: '/',
  },
      openGraph: {
      title: 'Runway Act Two - AI Video Effects Generator',
      description: 'Create stunning AI - powered video effects with our advanced generator. Transform your videos with cutting-edge technology and AI innovation.',
      url: 'https://runwayacttwo.online',
      siteName: 'Runway Act Two',
      images: [
        {
          url: '/111111.png',
          width: 1200,
          height: 630,
          alt: 'Runway Act Two - AI Video Effects Generator',
        },
      ],
      locale: 'zh_CN',
      type: 'website',
    },
  twitter: {
    card: 'summary_large_image',
    title: 'Runway Act Two - AI Video Effects Generator',
    description: 'Create stunning AI - powered video effects with our advanced generator. Transform your videos with cutting-edge technology and AI innovation.',
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon-simple.svg" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#8b5cf6" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className}>
        <LanguageProvider>
          <AuthProvider>
            <div className="min-h-screen bg-gray-50">
              {children}
              <Feedback />
            </div>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  )
} 