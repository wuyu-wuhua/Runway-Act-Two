import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';

interface CreateCheckoutSessionBody {
  priceId: string;
  userId: number;
  email: string;
  planName?: string;
  planType?: string;
  credits?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateCheckoutSessionBody;
    const { priceId, userId, email, planName, planType, credits } = body;

    if (!priceId || !userId || !email) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    const origin = request.headers.get('origin') ?? process.env.NEXT_PUBLIC_APP_URL ?? '';
    if (!origin) {
      return NextResponse.json({ error: '缺少站点URL' }, { status: 400 });
    }

    // 获取或创建 Stripe Customer
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    let stripeCustomerId: string | null = user?.stripe_customer_id ?? null;

    // 如果存在 customer ID，先验证是否有效
    if (stripeCustomerId) {
      try {
        await stripe.customers.retrieve(stripeCustomerId);
      } catch (error) {
        console.log(`Customer ${stripeCustomerId} 不存在，将创建新的`);
        stripeCustomerId = null;
        // 清除无效的 customer ID
        await supabase
          .from('users')
          .update({ stripe_customer_id: null })
          .eq('id', userId);
      }
    }

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: { user_id: String(userId) },
      });
      stripeCustomerId = customer.id;

      await supabase
        .from('users')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', userId);
    }

    // 从数据库检查价格类型（订阅 or 一次性）
    const { data: plan } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('stripe_price_id', priceId)
      .single();

    // 默认按订阅处理，若为一次性积分则走 payment
    const isCredits = plan?.price_type === 'credits';

    const session = await stripe.checkout.sessions.create({
      mode: isCredits ? 'payment' : 'subscription',
      customer: stripeCustomerId ?? undefined,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing?canceled=1`,
      allow_promotion_codes: true,
      metadata: {
        user_id: String(userId),
        email,
        plan_name: planName ?? plan?.price_name ?? '',
        plan_type: planType ?? plan?.price_type ?? '',
        credits: String(credits ?? plan?.credits_amount ?? ''),
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('创建Checkout Session失败:', error);
    return NextResponse.json({ error: '创建Checkout Session失败' }, { status: 500 });
  }
}



