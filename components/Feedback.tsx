"use client";

import { useState } from 'react';
import { useLanguage } from '@/lib/languageContext';

export default function Feedback() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();

  const handleEmailClick = () => {
    // 跳转到谷歌邮箱，预填充收件人地址
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${t('feedbackEmail')}&su=${t('feedbackEmailSubject')}&body=${t('feedbackEmailBody')}`;
    window.open(gmailUrl, '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* 气泡 */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 mb-2 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 w-64 border border-gray-200 dark:border-gray-600">
            <h3 className="text-black dark:text-white font-semibold mb-2">{t('feedback')}</h3>
            <button
              onClick={handleEmailClick}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline text-sm transition-colors"
            >
              {t('feedbackEmail')}
            </button>
            {/* 气泡箭头 */}
            <div className="absolute top-full right-6 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white dark:border-t-gray-800"></div>
          </div>
        </div>
      )}

      {/* 信封按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-full flex items-center justify-center transition-colors shadow-lg"
        aria-label={t('feedback')}
      >
        <svg 
          className="w-6 h-6 text-blue-600" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
          />
        </svg>
      </button>
    </div>
  );
} 