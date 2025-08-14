import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { priceId, userId, email } = await request.json();

    if (!priceId || !userId || !email) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 从数据库获取套餐信息
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('stripe_price_id', priceId)
      .single();

    if (planError || !plan) {
      return NextResponse.json(
        { error: '无效的价格ID' },
        { status: 400 }
      );
    }

    // 获取用户信息
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    let stripeCustomerId = user.stripe_customer_id;

    // 如果用户没有Stripe客户ID，创建一个
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: email,
        metadata: {
          user_id: userId.toString(),
        },
      });

      stripeCustomerId = customer.id;

      // 更新用户的Stripe客户ID
      await supabase
        .from('users')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', userId);
    }

    let paymentIntent;
    let subscription;

    if (plan.price_type === 'credits') {
      // 一次性积分包支付
      paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(plan.price * 100), // 转换为分
        currency: 'usd',
        customer: stripeCustomerId,
        metadata: {
          user_id: userId.toString(),
          plan_name: plan.price_name,
          plan_type: plan.price_type,
          credits: plan.credits_amount.toString(),
          price_id: priceId,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });
    } else {
      // 订阅支付
      subscription = await stripe.subscriptions.create({
        customer: stripeCustomerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          user_id: userId.toString(),
          plan_name: plan.price_name,
          plan_type: plan.price_type,
          credits: plan.credits_amount.toString(),
        },
      });

      // 正确处理payment_intent
      const latestInvoice = subscription.latest_invoice as any;
      if (latestInvoice?.payment_intent) {
        paymentIntent = latestInvoice.payment_intent;
      }
    }

    // 创建支付记录
    const paymentRecordData: any = {
      user_id: userId,
      subscription_id: plan.id,
      amount: plan.price,
      currency: 'USD',
      payment_status: 'pending',
      payment_type: plan.price_type === 'credits' ? 'one_time' : 'subscription', // 添加支付类型
    };

    // 如果是订阅，添加订阅相关字段
    if (subscription) {
      paymentRecordData.stripe_subscription_id = subscription.id;
      // 对于订阅，从发票获取payment_intent_id
      const latestInvoice = subscription.latest_invoice as any;
      if (latestInvoice?.payment_intent) {
        paymentRecordData.stripe_payment_intent_id = latestInvoice.payment_intent.id;
      }
    } else if (paymentIntent) {
      // 一次性支付
      paymentRecordData.stripe_payment_intent_id = paymentIntent.id;
    }

    console.log('创建支付记录:', paymentRecordData);

    try {
      const { data: paymentRecord, error: insertError } = await supabase
        .from('payment_records')
        .insert(paymentRecordData)
        .select()
        .single();

      if (insertError) {
        console.error('创建支付记录失败:', insertError);
        return NextResponse.json(
          { error: '创建支付记录失败' },
          { status: 500 }
        );
      }

      console.log('支付记录创建成功:', paymentRecord.id);
    } catch (error) {
      console.error('创建支付记录时发生错误:', error);
      return NextResponse.json(
        { error: '创建支付记录失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      clientSecret: paymentIntent?.client_secret,
      subscriptionId: subscription?.id || null,
    });

  } catch (error) {
    console.error('创建支付意图失败:', error);
    return NextResponse.json(
      { error: '创建支付意图失败' },
      { status: 500 }
    );
  }
} 