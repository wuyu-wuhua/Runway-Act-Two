'use client'

import { useState } from 'react'

export default function EnvCheckPage() {
  const [envInfo, setEnvInfo] = useState<string>('')

  const checkEnvironment = () => {
    const envVars = {
      'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL || '未设置',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '已设置' : '未设置',
    }
    
    const info = `环境变量检查结果:\n\n${JSON.stringify(envVars, null, 2)}\n\n`
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setEnvInfo(info + '❌ 缺少必要的环境变量！\n\n请在 .env.local 文件中设置：\nNEXT_PUBLIC_SUPABASE_URL=your_supabase_url\nNEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key')
    } else {
      setEnvInfo(info + '✅ 环境变量配置正确！')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">环境变量检查</h1>
        
        <div className="space-y-4">
          <button
            onClick={checkEnvironment}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            检查环境变量
          </button>

          {envInfo && (
            <div className="mt-4 p-4 bg-gray-100 rounded-lg">
              <pre className="text-xs text-gray-700 whitespace-pre-wrap">{envInfo}</pre>
            </div>
          )}

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">设置说明：</h3>
            <ol className="text-sm text-yellow-700 space-y-1">
              <li>1. 在项目根目录创建 <code>.env.local</code> 文件</li>
              <li>2. 添加以下内容：</li>
              <li>3. <code>NEXT_PUBLIC_SUPABASE_URL=your_supabase_url</code></li>
              <li>4. <code>NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key</code></li>
              <li>5. 重启开发服务器</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
} 