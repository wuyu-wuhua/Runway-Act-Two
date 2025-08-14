// 数据库表类型定义

export interface User {
  id: number;
  username?: string;
  email?: string;
  is_paid_user: boolean;
  price_name?: string;
  price_type: 'free' | 'monthly' | 'yearly';
  credits_balance: number;
  created_at: string;
  last_login_at?: string;
  status: 'active' | 'inactive' | 'banned';
  // Stripe相关字段
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  subscription_status: string;
  subscription_current_period_start?: string;
  subscription_current_period_end?: string;
  subscription_cancel_at_period_end: boolean;
}

export interface SubscriptionPlan {
  id: number;
  price_name: string;
  price_type: 'monthly' | 'yearly';
  price_description?: string;
  price: number;
  currency: string;
  credits_amount: number;
  created_at: string;
  // Stripe相关字段
  stripe_price_id?: string;
  stripe_product_id?: string;
}

export interface PaymentRecord {
  id: number;
  user_id: number;
  subscription_id?: number;
  amount: number;
  currency: string;
  payment_status: 'pending' | 'success' | 'failed' | 'refunded';
  payment_method?: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
  // Stripe相关字段
  stripe_payment_intent_id?: string;
  stripe_invoice_id?: string;
  stripe_subscription_id?: string;
}

export interface UserUsage {
  id: number;
  user_id: number;
  generations_used: number;
  duration_used: number;
  credits_consumed: number;
  video_duration?: number;
  resolution?: string;
  price_name?: string;
  price_type: 'free' | 'monthly' | 'yearly';
  created_at: string;
}

export interface StripeWebhookEvent {
  id: number;
  stripe_event_id: string;
  event_type: string;
  event_data: any;
  processed: boolean;
  processed_at?: string;
  created_at: string;
}

// 分组后的套餐信息
export interface GroupedSubscriptionPlans {
  monthly: SubscriptionPlan[];
  yearly: SubscriptionPlan[];
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 支付相关类型
export interface PaymentIntentResponse {
  clientSecret: string;
  subscriptionId?: string;
}

export interface CreatePaymentIntentRequest {
  priceId: string;
  userId: number;
  email: string;
} 