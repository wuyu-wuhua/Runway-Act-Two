'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/authContext';
import { useLanguage } from '@/lib/languageContext';

interface PaymentButtonProps {
  planId: number;
  planName: string;
  planType: 'monthly' | 'yearly';
  price: number;
  credits: number;
  stripePriceId?: string;
  className?: string;
}

export default function PaymentButton({
  planId,
  planName,
  planType,
  price,
  credits,
  stripePriceId,
  className
}: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { t } = useLanguage();

  const handlePayment = async () => {
    if (!user) {
      alert(t('loginFirst'));
      return;
    }

    if (!stripePriceId) {
      alert('该套餐暂未配置支付，请联系管理员');
      return;
    }

    setLoading(true);

    try {
      // 创建 Stripe Checkout Session 并跳转到托管收银台
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: stripePriceId,
          userId: user.id,
          email: user.email,
          planName,
          planType,
          credits,
        }),
      });

      const { sessionId, error: apiError } = await response.json();
      if (apiError || !sessionId) throw new Error(apiError || '创建Checkout会话失败');

      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
      if (!stripe) throw new Error('Stripe加载失败');

      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) throw error;

    } catch (error) {
      console.error('支付处理失败:', error);
      alert('支付处理失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const getButtonText = () => {
    if (loading) return t('processing');
    
    return t('subscribe');
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={loading || !stripePriceId}
      className={className}
    >
      {getButtonText()}
    </Button>
  );
} 