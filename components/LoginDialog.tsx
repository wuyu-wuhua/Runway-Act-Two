'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useLanguage } from '@/lib/languageContext'
import { useAuth } from '@/lib/authContext'

interface LoginDialogProps {
  isOpen: boolean
  onClose: () => void
}

export default function LoginDialog({ isOpen, onClose }: LoginDialogProps) {
  const { t } = useLanguage()
  const { signInWithGoogle } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    try {
      await signInWithGoogle()
      onClose()
    } catch (error) {
      console.error('登录失败:', error)
      alert(t('loginFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
         <Dialog open={isOpen} onOpenChange={onClose}>
       <DialogContent className="sm:max-w-md bg-white border border-gray-200 shadow-xl">
         <DialogHeader className="text-center !text-center">
           <DialogTitle className="text-2xl font-bold text-gray-900 text-center">
             {t('welcomeBack')}
           </DialogTitle>
           <DialogDescription className="text-gray-600 mt-2 text-center">
             {t('loginDescription')}
           </DialogDescription>
         </DialogHeader>
        
        <div className="flex flex-col space-y-4 mt-6 items-center">
                     <Button
             onClick={handleGoogleLogin}
             disabled={isLoading}
             className="w-full bg-gray-50 text-gray-900 hover:bg-gray-100 font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-3 border border-gray-300 text-center"
           >
                         {isLoading ? (
               <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
             ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
                         <span>
               {isLoading ? t('loggingIn') : t('loginWithGoogle')}
             </span>
          </Button>
          
                     <div className="text-center">
             <p className="text-xs text-gray-500">
               {t('loginAgreement')}{' '}
               <a href="/terms" className="text-blue-600 hover:text-blue-500 underline">
                 {t('termsOfService')}
               </a>
               {' '}{t('and')}{' '}
               <a href="/privacy" className="text-blue-600 hover:text-blue-500 underline">
                 {t('privacyPolicy')}
               </a>
             </p>
           </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 