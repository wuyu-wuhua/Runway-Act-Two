import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '安全策略 - Runway Act Two',
  description: '了解我们的安全措施和隐私保护政策',
}

export default function SecurityPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">安全策略</h1>
          
          <div className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">网站安全</h2>
              <p className="text-gray-600 mb-4">
                我们致力于保护用户的安全和隐私。本网站采用最新的安全技术和最佳实践来确保用户数据的安全。
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>HTTPS 加密传输</li>
                <li>内容安全策略 (CSP)</li>
                <li>XSS 和 CSRF 防护</li>
                <li>安全的 API 端点</li>
                <li>定期安全审计</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">隐私保护</h2>
              <p className="text-gray-600 mb-4">
                我们严格遵守数据保护法规，不会收集、存储或分享用户的个人信息，除非获得明确授权。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">安全报告</h2>
              <p className="text-gray-600 mb-4">
                如果您发现任何安全漏洞或可疑活动，请立即联系我们：
              </p>
              <p className="text-blue-600">
                <a href="mailto:security@act2ai.com" className="hover:underline">
                  security@act2ai.com
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">更新日志</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>最新更新：</strong> 2024年12月 - 增强安全头部配置，添加内容安全策略
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
