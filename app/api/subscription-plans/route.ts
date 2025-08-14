import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { data: plans, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .order('price_type', { ascending: true })
      .order('price', { ascending: true });

    if (error) {
      console.error('获取套餐信息失败:', error);
      return NextResponse.json(
        { error: '获取套餐信息失败' },
        { status: 500 }
      );
    }

    // 按类型分组套餐
    const groupedPlans = {
      monthly: plans.filter(plan => plan.price_type === 'monthly'),
      yearly: plans.filter(plan => plan.price_type === 'yearly'),
    };

    return NextResponse.json({
      success: true,
      plans: groupedPlans,
      allPlans: plans
    });

  } catch (error) {
    console.error('获取套餐信息失败:', error);
    return NextResponse.json(
      { error: '获取套餐信息失败' },
      { status: 500 }
    );
  }
} 