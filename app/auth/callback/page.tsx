'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // 获取URL中的参数
        const urlParams = new URLSearchParams(window.location.search)
        const error = urlParams.get('error')
        const errorDescription = urlParams.get('error_description')

        if (error) {
          console.error('认证错误:', error, errorDescription)
          router.push('/?error=auth_failed')
          return
        }

        // 检查Supabase会话
        const { data, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('获取会话错误:', sessionError)
          router.push('/?error=session_failed')
          return
        }

        if (data.session) {
          // 登录成功，重定向到首页
          router.push('/')
        } else {
          // 没有会话，重定向到首页
          router.push('/')
        }
      } catch (error) {
        console.error('处理认证回调时发生错误:', error)
        router.push('/?error=auth_failed')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">正在处理登录...</p>
      </div>
    </div>
  )
} 