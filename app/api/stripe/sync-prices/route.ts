import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // 验证管理员权限（这里可以添加JWT验证）
    const { adminToken } = await request.json();
    
    if (adminToken !== process.env.ADMIN_SECRET) {
      return NextResponse.json(
        { error: '无权限访问' },
        { status: 403 }
      );
    }

    const updates = [];

    // 同步月订阅1
    const monthly1300PriceId = process.env.STRIPE_PRICE_ID_MONTHLY_1300;
    if (monthly1300PriceId) {
      const { error } = await supabase
        .from('subscription_plans')
        .update({ stripe_price_id: monthly1300PriceId })
        .eq('price_name', 'month 1')
        .eq('price_type', 'monthly');
      
      if (!error) updates.push('month 1价格ID已同步');
    }

    // 同步月订阅2
    const monthly4000PriceId = process.env.STRIPE_PRICE_ID_MONTHLY_4000;
    if (monthly4000PriceId) {
      const { error } = await supabase
        .from('subscription_plans')
        .update({ stripe_price_id: monthly4000PriceId })
        .eq('price_name', 'month 2')
        .eq('price_type', 'monthly');
      
      if (!error) updates.push('month 2价格ID已同步');
    }

    // 同步年订阅1
    const yearly20000PriceId = process.env.STRIPE_PRICE_ID_YEARLY_20000;
    if (yearly20000PriceId) {
      const { error } = await supabase
        .from('subscription_plans')
        .update({ stripe_price_id: yearly20000PriceId })
        .eq('price_name', 'year 1')
        .eq('price_type', 'yearly');
      
      if (!error) updates.push('year 1价格ID已同步');
    }

    // 同步年订阅2
    const yearly50000PriceId = process.env.STRIPE_PRICE_ID_YEARLY_50000;
    if (yearly50000PriceId) {
      const { error } = await supabase
        .from('subscription_plans')
        .update({ stripe_price_id: yearly50000PriceId })
        .eq('price_name', 'year 2')
        .eq('price_type', 'yearly');
      
      if (!error) updates.push('year 2价格ID已同步');
    }

    // 同步积分包1
    const credits1000PriceId = process.env.STRIPE_PRICE_ID_ONETIME_1000;
    if (credits1000PriceId) {
      const { error } = await supabase
        .from('subscription_plans')
        .update({ stripe_price_id: credits1000PriceId })
        .eq('price_name', '积分包1')
        .eq('price_type', 'credits');
      
      if (!error) updates.push('积分包1价格ID已同步');
    }

    // 同步积分包2
    const credits2000PriceId = process.env.STRIPE_PRICE_ID_ONETIME_2000;
    if (credits2000PriceId) {
      const { error } = await supabase
        .from('subscription_plans')
        .update({ stripe_price_id: credits2000PriceId })
        .eq('price_name', '积分包2')
        .eq('price_type', 'credits');
      
      if (!error) updates.push('积分包2价格ID已同步');
    }

    // 同步积分包3
    const credits3600PriceId = process.env.STRIPE_PRICE_ID_ONETIME_3600;
    if (credits3600PriceId) {
      const { error } = await supabase
        .from('subscription_plans')
        .update({ stripe_price_id: credits3600PriceId })
        .eq('price_name', '积分包3')
        .eq('price_type', 'credits');
      
      if (!error) updates.push('积分包3价格ID已同步');
    }

    return NextResponse.json({
      success: true,
      message: '价格ID同步完成',
      updates
    });

  } catch (error) {
    console.error('同步价格ID失败:', error);
    return NextResponse.json(
      { error: '同步价格ID失败' },
      { status: 500 }
    );
  }
} 