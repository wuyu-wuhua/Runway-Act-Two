import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 支持的语言列表
const languages = ['zh', 'en', 'hi', 'es', 'ur', 'id', 'ar', 'de', 'ru', 'mx', 'uk']
const defaultLanguage = 'en'

// 检查路径是否以语言代码开头
function isLanguagePath(pathname: string): boolean {
  return languages.some(lang => {
    const langPath = `/${lang}`
    return pathname === langPath || pathname.startsWith(`${langPath}/`)
  })
}

// 从路径中提取语言代码
function getLanguageFromPath(pathname: string): string | null {
  const segments = pathname.split('/')
  const firstSegment = segments[1]
  return languages.includes(firstSegment) ? firstSegment : null
}

// 从Accept-Language头部检测语言
function getLanguageFromHeader(request: NextRequest): string {
  const acceptLanguage = request.headers.get('accept-language')
  if (!acceptLanguage) return defaultLanguage

  // 解析Accept-Language头部
  const browserLanguages = acceptLanguage
    .split(',')
    .map(lang => {
      const [code, qValue] = lang.trim().split(';q=')
      return {
        code: code.split('-')[0], // 只取主要语言代码
        quality: qValue ? parseFloat(qValue) : 1.0
      }
    })
    .sort((a, b) => b.quality - a.quality)

  // 检查是否支持检测到的语言
  for (const browserLang of browserLanguages) {
    if (languages.includes(browserLang.code)) {
      return browserLang.code
    }
  }

  return defaultLanguage
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 跳过静态文件和API路由
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/manifest') ||
    pathname.startsWith('/robots')
  ) {
    return NextResponse.next()
  }

  // 如果路径已经包含语言代码，直接通过
  if (isLanguagePath(pathname)) {
    return NextResponse.next()
  }

  // 如果是根路径，重定向到检测到的语言
  if (pathname === '/') {
    const detectedLanguage = getLanguageFromHeader(request)
    const url = request.nextUrl.clone()
    url.pathname = `/${detectedLanguage}`
    return NextResponse.redirect(url, 302)
  }

  // 对于其他路径，重定向到带语言代码的版本
  const detectedLanguage = getLanguageFromHeader(request)
  const url = request.nextUrl.clone()
  url.pathname = `/${detectedLanguage}${pathname}`
  return NextResponse.redirect(url, 302)
}

export const config = {
  matcher: [
    /*
     * 匹配所有路径，除了：
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.json (manifest file)
     * - robots.txt (robots file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|robots.txt).*)',
  ],
}
