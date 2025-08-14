import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: '缺少用户ID' },
        { status: 400 }
      );
    }

    // 直接查询用户表获取订阅信息
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        id,
        is_paid_user,
        price_name,
        price_type,
        credits_balance,
        subscription_status,
        subscription_current_period_start,
        subscription_current_period_end,
        subscription_cancel_at_period_end,
        stripe_subscription_id
      `)
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('获取用户信息失败:', userError);
      return NextResponse.json(
        { error: '获取用户信息失败' },
        { status: 500 }
      );
    }

    // 直接查询支付记录表
    const { data: paymentRecords, error: paymentError } = await supabase
      .from('payment_records')
      .select(`
        id,
        amount,
        currency,
        payment_status,
        paid_at,
        created_at
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (paymentError) {
      console.error('获取支付记录失败:', paymentError);
      return NextResponse.json(
        { error: '获取支付记录失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      subscription: userData,
      paymentRecords: paymentRecords || []
    });

  } catch (error) {
    console.error('获取用户信息失败:', error);
    return NextResponse.json(
      { error: '获取用户信息失败' },
      { status: 500 }
    );
  }
} 