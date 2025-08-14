import Stripe from 'stripe';
import { loadStripe } from '@stripe/stripe-js';

// 服务器端Stripe实例
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

// 客户端Stripe实例
export const getStripe = () => {
  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
}; 