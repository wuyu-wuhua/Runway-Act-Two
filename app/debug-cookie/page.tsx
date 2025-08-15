'use client';

import { CookieConsentDebug } from '@/lib/cookie-consent';

export default function DebugCookiePage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Cookie 管理系统调试页面</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">功能说明</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900">🍪 Cookie 同意弹窗</h3>
              <p className="text-gray-600 text-sm">
                首次访问时会自动显示Cookie同意弹窗，包含"全部接受"、"全部拒绝"和"自定义偏好"三个选项。
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900">🛡️ 智能阻止</h3>
              <p className="text-gray-600 text-sm">
                当用户选择"全部拒绝"时，系统会自动阻止所有非必要的追踪脚本，包括分析工具、营销像素等。
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900">📱 底部横幅</h3>
              <p className="text-gray-600 text-sm">
                用户同意后，页面底部会显示Cookie设置横幅，提供快速访问设置的入口。
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900">🔍 测试控制面板</h3>
              <p className="text-gray-600 text-sm">
                页面右上角有测试控制面板，可以强制显示弹窗、撤回同意、查看设置等。
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">测试步骤</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>清除浏览器数据（localStorage + Cookies）</li>
            <li>刷新页面，应该看到Cookie同意弹窗</li>
            <li>测试各种选择按钮的功能</li>
            <li>使用右上角的测试控制面板</li>
            <li>检查浏览器控制台的日志输出</li>
          </ol>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">控制台命令</h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm">
            <div>// 查看当前Cookie偏好设置</div>
            <div>console.log('当前偏好:', window.cookieBlocker?.getCurrentPreferences?.())</div>
            <div></div>
            <div>// 查看阻止统计</div>
            <div>console.log('阻止统计:', window.cookieBlocker?.getBlockingStats?.())</div>
            <div></div>
            <div>// 检查localStorage中的同意记录</div>
            <div>console.log('同意记录:', localStorage.getItem('cookie-consent'))</div>
          </div>
        </div>
      </div>
      
      {/* Cookie管理系统组件 */}
      <CookieConsentDebug />
    </div>
  );
}
