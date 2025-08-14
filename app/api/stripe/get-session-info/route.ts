import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: '缺少session_id参数' },
        { status: 400 }
      );
    }

    // 获取Stripe session信息
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent', 'subscription', 'line_items'],
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session不存在' },
        { status: 404 }
      );
    }

    // 从数据库获取支付记录
    let paymentRecord = null;
    if (session.payment_intent) {
      const { data: records } = await supabase
        .from('payment_records')
        .select('*')
        .eq('stripe_payment_intent_id', (session.payment_intent as any).id)
        .single();
      paymentRecord = records;
    } else if (session.subscription) {
      const { data: records } = await supabase
        .from('payment_records')
        .select('*')
        .eq('stripe_subscription_id', (session.subscription as any).id)
        .single();
      paymentRecord = records;
    }

    // 构建响应数据
    const responseData = {
      session_id: session.id,
      payment_status: session.payment_status,
      plan_name: session.metadata?.plan_name || '未知套餐',
      plan_type: session.metadata?.plan_type || 'unknown',
      credits: session.metadata?.credits || '0',
      amount: paymentRecord?.amount || 0,
      currency: paymentRecord?.currency || 'USD',
      order_no: paymentRecord?.order_no || `ORDER_${Date.now()}`,
      created_at: session.created,
      customer_email: session.customer_details?.email,
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('获取session信息失败:', error);
    return NextResponse.json(
      { error: '获取session信息失败' },
      { status: 500 }
    );
  }
}
