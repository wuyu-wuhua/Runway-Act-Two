'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from './supabase'

export interface User {
  id: number
  username: string
  email: string
  is_paid_user: boolean
  price_name: string | null
  price_type: 'free' | 'monthly' | 'yearly'
  credits_balance: number
  created_at: string
  last_login_at: string | null
  status: 'active' | 'inactive' | 'banned'
  avatar_url?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  debugAuth: () => void
}



const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // 添加用户状态变化的调试日志
  const setUserWithLog = (newUser: User | null) => {
    console.log('用户状态变化:', newUser ? `用户: ${newUser.email}` : 'null')
    setUser(newUser)
  }

  // 监听Supabase认证状态变化
  useEffect(() => {
    // 获取初始会话
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        await fetchUserData(session.user)
      }
      setLoading(false)
    }

    getInitialSession()

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: any) => {
        console.log('认证状态变化事件:', event, session?.user?.email)
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('用户登录，开始获取用户数据...')
          await fetchUserData(session.user)
        } else if (event === 'SIGNED_OUT') {
          console.log('用户登出，清除用户状态...')
          setUserWithLog(null)
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('令牌刷新...')
          // 令牌刷新时不需要特殊处理
        } else {
          console.log('其他认证事件:', event)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserData = async (supabaseUser: SupabaseUser) => {
    try {
      console.log('开始获取用户数据...', { 
        email: supabaseUser.email,
        avatar_url: supabaseUser.user_metadata?.avatar_url,
        full_name: supabaseUser.user_metadata?.full_name
      })
      
      // 从Supabase用户信息中获取或创建用户数据
      // 注意：系统基于邮箱进行用户识别，用户名仅用于显示和避免数据库约束冲突
      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', supabaseUser.email) // 基于邮箱查询用户
        .single()

      console.log('查询现有用户结果:', { existingUser, userError })

      if (userError && userError.code !== 'PGRST116') {
        console.error('查询用户错误:', userError)
        return
      }

      if (existingUser) {
        console.log('找到现有用户，更新登录时间和头像...')
        // 更新现有用户（基于邮箱识别）
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update({
            last_login_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            avatar_url: supabaseUser.user_metadata?.avatar_url || existingUser.avatar_url
          })
          .eq('id', existingUser.id)
          .select()
          .single()

        console.log('更新用户结果:', { updatedUser, updateError })

        if (!updateError && updatedUser) {
          setUserWithLog({
            ...updatedUser,
            avatar_url: updatedUser.avatar_url || supabaseUser.user_metadata?.avatar_url
          })
          console.log('用户状态已更新，基于邮箱:', supabaseUser.email)
        } else {
          console.error('更新用户失败:', updateError)
        }
      } else {
        console.log('用户不存在，创建新用户...')
        
        // 生成唯一的用户名（仅用于避免数据库约束冲突）
        let baseUsername = supabaseUser.user_metadata?.full_name || supabaseUser.email!.split('@')[0]
        // 清理用户名，移除特殊字符
        baseUsername = baseUsername.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '').trim()
        if (!baseUsername) {
          baseUsername = 'user'
        }
        
        let username = baseUsername
        let usernameExists = true
        let attemptCount = 0
        const maxAttempts = 10
        
        console.log('开始生成唯一用户名，基础用户名:', baseUsername)
        
        // 检查用户名是否已存在，如果存在则添加随机后缀
        while (usernameExists && attemptCount < maxAttempts) {
          const { data: existingUsername, error: usernameCheckError } = await supabase
            .from('users')
            .select('username')
            .eq('username', username)
            .single()
          
          if (usernameCheckError && usernameCheckError.code === 'PGRST116') {
            // 用户名不存在，可以使用
            usernameExists = false
            console.log('用户名可用:', username)
          } else if (existingUsername) {
            // 用户名已存在，生成新的用户名
            const randomSuffix = Math.random().toString(36).substring(2, 6)
            username = `${baseUsername}_${randomSuffix}`
            attemptCount++
            console.log(`用户名已存在，尝试新用户名 (${attemptCount}/${maxAttempts}):`, username)
          } else {
            // 其他错误，直接使用原用户名
            usernameExists = false
            console.log('用户名检查出错，使用原用户名:', username)
          }
        }
        
        if (attemptCount >= maxAttempts) {
          console.error('无法生成唯一用户名，达到最大尝试次数')
          username = `${baseUsername}_${Date.now()}`
        }
        
        console.log('最终生成的用户名:', username)
        
        // 创建新用户（基于邮箱，用户名只是为了满足数据库约束）
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            email: supabaseUser.email!, // 主要标识符
            username: username, // 次要标识符，仅用于显示和避免约束冲突
            is_paid_user: false,
            price_type: 'free',
            credits_balance: 50, // 新用户赠送50积分
            status: 'active',
            avatar_url: supabaseUser.user_metadata?.avatar_url,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_login_at: new Date().toISOString()
          })
          .select()
          .single()

        console.log('创建用户结果:', { newUser, createError })

        if (!createError && newUser) {
          setUserWithLog({
            ...newUser,
            avatar_url: newUser.avatar_url || supabaseUser.user_metadata?.avatar_url
          })
          console.log('新用户创建成功，基于邮箱:', supabaseUser.email)
        } else {
          console.error('创建用户失败:', createError)
          
          // 如果是用户名重复错误，尝试使用时间戳作为用户名
          if (createError && createError.code === '23505' && createError.message.includes('username')) {
            console.log('检测到用户名重复错误，尝试使用时间戳用户名...')
            const timestampUsername = `${baseUsername}_${Date.now()}`
            
            const { data: retryUser, error: retryError } = await supabase
              .from('users')
              .insert({
                email: supabaseUser.email!, // 主要标识符
                username: timestampUsername, // 次要标识符
                is_paid_user: false,
                price_type: 'free',
                credits_balance: 50,
                status: 'active',
                avatar_url: supabaseUser.user_metadata?.avatar_url,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                last_login_at: new Date().toISOString()
              })
              .select()
              .single()
            
            if (!retryError && retryUser) {
              setUserWithLog({
                ...retryUser,
                avatar_url: retryUser.avatar_url || supabaseUser.user_metadata?.avatar_url
              })
              console.log('重试创建用户成功，基于邮箱:', supabaseUser.email)
            } else {
              console.error('重试创建用户也失败:', retryError)
            }
          }
        }
      }
    } catch (error) {
      console.error('获取用户数据失败:', error)
    }
  }

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) {
        throw error
      }
    } catch (error) {
      console.error('谷歌登录失败:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      console.log('开始退出登录流程...')
      
      // 1. 立即清除本地用户状态（优先执行）
      console.log('立即清除本地用户状态')
      setUserWithLog(null)
      
      // 2. 调用Supabase signOut
      console.log('正在调用Supabase signOut...')
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Supabase signOut返回错误:', error)
        // 即使Supabase signOut失败，我们也已经清除了本地状态
        throw error
      }
      console.log('Supabase signOut成功')
      
      // 3. 清除本地存储中的任何认证相关数据
      console.log('清除本地存储...')
      if (typeof window !== 'undefined') {
        // 清除localStorage中的认证相关数据
        const keysToRemove = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && (key.includes('supabase') || key.includes('auth') || key.includes('user'))) {
            keysToRemove.push(key)
          }
        }
        keysToRemove.forEach(key => {
          console.log(`清除localStorage键: ${key}`)
          localStorage.removeItem(key)
        })
        
        // 清除sessionStorage中的认证相关数据
        const sessionKeysToRemove = []
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i)
          if (key && (key.includes('supabase') || key.includes('auth') || key.includes('user'))) {
            sessionKeysToRemove.push(key)
          }
        }
        sessionKeysToRemove.forEach(key => {
          console.log(`清除sessionStorage键: ${key}`)
          sessionStorage.removeItem(key)
        })
      }
      
      console.log('退出登录完成')
      
    } catch (error) {
      console.error('登出失败:', error)
      // 即使出错，也要确保用户状态被清除
      setUserWithLog(null)
      throw error
    }
  }

  const refreshUser = async () => {
    try {
      const { data: { user: supabaseUser } } = await supabase.auth.getUser()
      if (supabaseUser) {
        await fetchUserData(supabaseUser)
      }
    } catch (error) {
      console.error('刷新用户信息失败:', error)
    }
  }

  const debugAuth = () => {
    console.log('=== 认证状态调试信息 ===')
    console.log('本地用户状态:', user)
    console.log('加载状态:', loading)
    
    // 检查Supabase会话
    supabase.auth.getSession().then(({ data, error }) => {
      console.log('Supabase会话:', data.session)
      console.log('Supabase会话错误:', error)
    })
    
    // 检查本地存储
    if (typeof window !== 'undefined') {
      console.log('localStorage中的认证相关键:')
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (key.includes('supabase') || key.includes('auth') || key.includes('user'))) {
          console.log(`  ${key}:`, localStorage.getItem(key))
        }
      }
      
      console.log('sessionStorage中的认证相关键:')
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)
        if (key && (key.includes('supabase') || key.includes('auth') || key.includes('user'))) {
          console.log(`  ${key}:`, sessionStorage.getItem(key))
        }
      }
    }
    console.log('=== 调试信息结束 ===')
  }

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout, refreshUser, debugAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 