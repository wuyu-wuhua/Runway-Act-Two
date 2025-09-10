import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://act2ai.com'
  const languages = ['zh', 'en', 'hi', 'es', 'ur', 'id', 'ar', 'de']
  const pages = [
    '',
    '/about',
    '/ai-effect-generator',
    '/blog',
    '/pricing',
    '/credits',
    '/privacy',
    '/terms',
  ]
  
  const sitemap: MetadataRoute.Sitemap = []
  
  // 为每种语言生成URL
  languages.forEach(lang => {
    pages.forEach(page => {
      sitemap.push({
        url: `${baseUrl}/${lang}${page}`,
        lastModified: new Date(),
        changeFrequency: page === '' ? 'weekly' : 
                        page === '/ai-effect-generator' ? 'weekly' :
                        page === '/blog' ? 'weekly' :
                        page === '/pricing' ? 'monthly' :
                        page === '/credits' ? 'monthly' :
                        'yearly',
        priority: page === '' ? 1 :
                 page === '/ai-effect-generator' ? 0.9 :
                 page === '/pricing' ? 0.8 :
                 page === '/about' ? 0.8 :
                 page === '/blog' ? 0.7 :
                 page === '/credits' ? 0.6 :
                 0.3
      })
    })
  })
  
  return sitemap
}
