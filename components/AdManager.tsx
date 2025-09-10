'use client'

import { useEffect } from 'react'

export default function AdManager() {
  useEffect(() => {
    const AD_URL =
      'https://www.revenuecpmgate.com/yzuizae9sm?key=a7403601768472b92c4dacd82ba62572'

     let triggered = false
     const pageLoadTime = Date.now()

     function isInteractiveTarget(el: EventTarget | null) {
       if (!el || !(el as Element).closest) return false
       return !!(el as Element).closest('button, a, input, select, textarea, [role="button"], [contenteditable=""], [data-no-popunder]')
     }

    function openPopunderSafely(url: string) {
      try {
        // 直接打开广告URL，使用弹窗特性
        const features = [
          'scrollbars=yes',
          'resizable=yes',
          'toolbar=no',
          'menubar=no',
          'location=no',
          'status=no',
          `width=800`,
          `height=600`,
          `left=${Math.max(0, Math.round((screen.width - 800) / 2))}`,
          `top=${Math.max(0, Math.round((screen.height - 600) / 2))}`,
        ].join(',')

        const win = window.open(url, '_blank', features)

        // 检查弹窗是否被浏览器阻止
        if (!win || win.closed || typeof win.closed === 'undefined') {
          console.log('弹窗被浏览器阻止或创建失败')
          return
        }

        // 让弹窗失焦，保持主页面焦点
        setTimeout(() => {
          try {
            win.blur()
            window.focus()
          } catch {}
        }, 100)

        // 监听弹窗关闭
        const checkClosed = setInterval(() => {
          if (win.closed) {
            clearInterval(checkClosed)
          }
        }, 1000)

      } catch (e) {
        console.log('弹窗创建失败:', e)
      }
    }

     function onClick(ev: MouseEvent) {
       if (triggered) return

       // 页面加载 3s 后才允许触发
       if (Date.now() - pageLoadTime < 3000) return

       // 避免在按钮、链接、输入框等关键交互上触发
       if (isInteractiveTarget(ev.target)) return

       // 第一次有效点击就触发广告
       triggered = true
       // 延迟 1s，避免打断当前操作
       setTimeout(() => openPopunderSafely(AD_URL), 1000)
     }

     // 仅监听 click；passive 提高性能；使用 once: true 确保只触发一次
     document.addEventListener('click', onClick, { passive: true, once: true })

    return () => {
      document.removeEventListener('click', onClick)
    }
  }, [])

  return null
}
