import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: '缺少用户ID' },
        { status: 400 }
      );
    }

    // 获取用户信息
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    if (!user.stripe_customer_id) {
      return NextResponse.json(
        { error: '用户没有Stripe客户ID' },
        { status: 400 }
      );
    }

    // 创建客户门户会话
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: `${request.headers.get('origin') || 'http://localhost:3000'}/dashboard`, // 返回仪表板
    });

    return NextResponse.json({
      url: session.url,
    });

  } catch (error) {
    console.error('创建客户门户会话失败:', error);
    return NextResponse.json(
      { error: '创建客户门户会话失败' },
      { status: 500 }
    );
  }
}
