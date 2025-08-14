import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';
import { headers } from 'next/headers';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// 简化的缓存机制 - 只存储关键信息
const subscriptionCache = new Map<string, { userId: string; planType: string }>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: '缺少Stripe签名' }, { status: 400 });
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook签名验证失败:', err);
      return NextResponse.json({ error: 'Webhook签名验证失败' }, { status: 400 });
    }

    // 记录Webhook事件
    await supabase.from('stripe_webhook_events').insert({
      stripe_event_id: event.id,
      event_type: event.type,
      event_data: event.data,
    });

    // 处理事件
    await handleWebhookEvent(event);

    // 标记为已处理
    await supabase
      .from('stripe_webhook_events')
      .update({ processed: true, processed_at: new Date().toISOString() })
      .eq('stripe_event_id', event.id);

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook处理失败:', error);
    return NextResponse.json({ error: 'Webhook处理失败' }, { status: 500 });
  }
}

// 统一的事件处理函数
async function handleWebhookEvent(event: any) {
  const { type, data } = event;
  
  switch (type) {
    case 'checkout.session.completed':
      await handleCheckoutSessionCompleted(data.object);
      break;
      
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      await handleSubscriptionChange(data.object);
      break;
      
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(data.object);
      break;
      
    case 'invoice.payment_succeeded':
      await handleInvoicePaymentSucceeded(data.object);
      break;
      
    case 'invoice.payment_failed':
      await handleInvoicePaymentFailed(data.object);
      break;
      
    case 'payment_intent.succeeded':
      await handlePaymentIntentSucceeded(data.object);
      break;
      
    default:
      console.log(`未处理的事件类型: ${type}`);
  }
}

// 处理结账会话完成 - 核心逻辑
async function handleCheckoutSessionCompleted(session: any) {
  console.log('结账会话已完成:', session.id);
  
  const { user_id, plan_name, plan_type, credits } = session.metadata || {};
  
  if (!user_id || !plan_name || !plan_type || !credits) {
    console.log('❌ 会话元数据不完整，跳过处理');
    return;
  }

  try {
    if (session.mode === 'subscription' && session.subscription) {
      // 订阅模式处理
      await handleSubscriptionCheckout(session, user_id, plan_name, plan_type, credits);
    } else if (session.mode === 'payment' && session.payment_intent) {
      // 一次性支付模式处理（积分包）
      await handleOneTimePaymentCheckout(session, user_id, plan_name, plan_type, credits);
    } else {
      console.log('❌ 未知的会话模式:', session.mode);
    }
  } catch (error) {
    console.error('处理结账会话时发生错误:', error);
  }
}

// 处理订阅结账
async function handleSubscriptionCheckout(session: any, user_id: string, plan_name: string, plan_type: string, credits: string) {
  console.log('处理订阅结账:', session.subscription);
  
  // 1. 获取完整订阅信息
  const subscription = await stripe.subscriptions.retrieve(session.subscription);
  console.log('获取到的完整订阅信息:', {
    id: subscription.id,
    status: subscription.status,
    current_period_start: (subscription as any).current_period_start,
    current_period_end: (subscription as any).current_period_end,
    metadata: subscription.metadata
  });
  
  // 2. 获取最新的套餐信息（优先使用Stripe的数据）
  const planInfo = subscription.items?.data[0]?.plan;
  const priceInfo = subscription.items?.data[0]?.price;
  
  // 使用Stripe的套餐信息，如果session.metadata不完整的话
  const finalPlanName = planInfo?.metadata?.plan_name || planInfo?.metadata?.name || plan_name;
  const finalPlanType = planInfo?.metadata?.plan_type || priceInfo?.recurring?.interval || plan_type;
  const finalCredits = planInfo?.metadata?.credits || credits;
  
  console.log('套餐信息对比:', {
    session_metadata: { plan_name, plan_type, credits },
    stripe_plan: { 
      plan_name: planInfo?.metadata?.plan_name,
      plan_type: planInfo?.metadata?.plan_type,
      credits: planInfo?.metadata?.credits,
      amount: priceInfo?.unit_amount,
      interval: priceInfo?.recurring?.interval
    },
    final_choice: { finalPlanName, finalPlanType, finalCredits }
  });
  
  // 3. 获取时间信息
  const startTime = getSubscriptionTime(subscription, 'start');
  const endTime = getSubscriptionTime(subscription, 'end');
  
  console.log('最终时间信息:', {
    start: startTime,
    end: endTime,
    plan_type: finalPlanType
  });
  
  // 4. 更新用户信息
  await updateUserSubscription(user_id, {
    stripe_subscription_id: subscription.id,
    subscription_status: 'active',
    price_name: finalPlanName,
    price_type: finalPlanType,
    is_paid_user: true,
    credits_balance: parseInt(finalCredits),
    subscription_current_period_start: startTime,
    subscription_current_period_end: endTime,
  });

  // 5. 创建支付记录
  await createPaymentRecord({
    user_id: parseInt(user_id),
    amount: await getRealPaymentAmount(subscription.id), // 获取真实支付金额
    stripe_subscription_id: subscription.id,
    payment_type: 'subscription',
  });

  // 6. 缓存订阅信息（简化版）
  subscriptionCache.set(subscription.id, { userId: user_id, planType: finalPlanType });

  console.log('✅ 订阅处理完成');
}

// 处理一次性支付结账（积分包）
async function handleOneTimePaymentCheckout(session: any, user_id: string, plan_name: string, plan_type: string, credits: string) {
  console.log('处理一次性支付结账（积分包）:', session.payment_intent);
  
  try {
    // 获取支付意图信息
    const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);
    
    // 获取真实支付金额（以分为单位，转换为美元）
    const realAmount = (paymentIntent.amount || 0) / 100;
    
    console.log('积分包购买信息:', {
      user_id,
      plan_name,
      plan_type,
      credits,
      amount: realAmount,
      payment_intent_id: paymentIntent.id
    });
    
    // 1. 更新用户积分（累加到现有积分）
    const { data: currentUser } = await supabase
      .from('users')
      .select('credits_balance')
      .eq('id', parseInt(user_id))
      .single();
    
    const currentCredits = currentUser?.credits_balance || 0;
    const newCredits = currentCredits + parseInt(credits);
    
    await updateUserSubscription(user_id, {
      credits_balance: newCredits,
      // 积分包购买不影响订阅状态
    });
    
    // 2. 创建支付记录
    await createPaymentRecord({
      user_id: parseInt(user_id),
      amount: realAmount,
      stripe_payment_intent_id: paymentIntent.id,
      payment_type: 'one_time',
    });
    
    console.log('✅ 积分包购买处理完成，用户积分已更新:', {
      old_credits: currentCredits,
      new_credits: newCredits,
      added_credits: credits
    });
    
  } catch (error) {
    console.error('处理积分包购买时发生错误:', error);
  }
}

// 处理订阅变更（创建/更新）
async function handleSubscriptionChange(subscription: any) {
  console.log('处理订阅变更:', subscription.id);
  
  // 尝试从缓存获取用户ID
  let userId: string | null = subscriptionCache.get(subscription.id)?.userId || null;
  
  if (!userId) {
    console.log('缓存中没有用户ID，尝试从数据库查询...');
    // 从数据库查询
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, stripe_subscription_id')
      .eq('stripe_subscription_id', subscription.id)
      .single();
    
    if (userError) {
      console.error('查询用户失败:', userError);
      return;
    }
    
    if (user) {
      userId = user.id.toString();
      console.log('✅ 从数据库找到用户:', {
        user_id: userId,
        email: user.email,
        stripe_subscription_id: user.stripe_subscription_id
      });
      
      // 更新缓存
      subscriptionCache.set(subscription.id, { 
        userId: userId!, 
        planType: subscription.items?.data[0]?.price?.recurring?.interval || 'monthly' 
      });
    } else {
      console.log('❌ 数据库中没有找到匹配的用户');
    }
  } else {
    console.log('✅ 从缓存获取到用户ID:', userId);
  }

  if (!userId) {
    console.log('❌ 无法获取用户ID，跳过处理');
    return;
  }

  try {
    // 获取时间信息
    const startTime = getSubscriptionTime(subscription, 'start');
    const endTime = getSubscriptionTime(subscription, 'end');
    
    // 获取套餐信息
    const planInfo = subscription.items?.data[0]?.plan;
    const priceInfo = subscription.items?.data[0]?.price;
    
    console.log('订阅变更详细信息:', {
      subscription_id: subscription.id,
      start: startTime,
      end: endTime,
      plan_metadata: planInfo?.metadata,
      price_metadata: priceInfo?.metadata,
      amount: priceInfo?.unit_amount,
      interval: priceInfo?.recurring?.interval
    });
    
    // 准备更新数据
    const updateData: any = {
      subscription_status: subscription.status,
      subscription_current_period_start: startTime,
      subscription_current_period_end: endTime,
      subscription_cancel_at_period_end: subscription.cancel_at_period_end,
    };
    
    // 如果套餐信息发生变化，也更新套餐信息
    if (planInfo?.metadata) {
      updateData.price_name = planInfo.metadata.plan_name || planInfo.metadata.name;
      updateData.price_type = planInfo.metadata.plan_type || priceInfo?.recurring?.interval;
      updateData.credits_balance = parseInt(planInfo.metadata.credits || '0');
    }
    
    console.log('准备更新用户数据:', {
      user_id: userId,
      update_data: updateData
    });
    
    await updateUserSubscription(userId, updateData);
    
    console.log('✅ 订阅信息已更新到数据库');
  } catch (error) {
    console.error('更新订阅信息失败:', error);
  }
}

// 处理订阅删除
async function handleSubscriptionDeleted(subscription: any) {
  console.log('处理订阅删除:', subscription.id);
  
  const userId = subscriptionCache.get(subscription.id)?.userId;
  
  if (!userId) {
    console.log('❌ 无法获取用户ID，跳过处理');
    return;
  }

  try {
    await updateUserSubscription(userId, {
      is_paid_user: false,
      price_name: null,
      price_type: 'free',
      subscription_status: 'canceled',
      subscription_cancel_at_period_end: false,
      credits_balance: 50, // 重置为免费积分
    });
    
    // 清理缓存
    subscriptionCache.delete(subscription.id);
    
    console.log('✅ 订阅已取消，用户重置为免费状态');
  } catch (error) {
    console.error('取消订阅失败:', error);
  }
}

// 处理发票支付成功
async function handleInvoicePaymentSucceeded(invoice: any) {
  if (!invoice.subscription) return;
  
  console.log('处理发票支付成功:', invoice.id);
  
  // 更新支付记录状态
  try {
    await supabase
      .from('payment_records')
      .update({ payment_status: 'success', paid_at: new Date().toISOString() })
      .eq('stripe_subscription_id', invoice.subscription);
    
    console.log('✅ 支付记录状态已更新');
  } catch (error) {
    console.error('更新支付记录失败:', error);
  }
}

// 处理发票支付失败
async function handleInvoicePaymentFailed(invoice: any) {
  if (!invoice.subscription) return;
  
  console.log('处理发票支付失败:', invoice.id);
  
  try {
    await supabase
      .from('payment_records')
      .update({ payment_status: 'failed' })
      .eq('stripe_subscription_id', invoice.subscription);
    
    console.log('✅ 支付记录状态已更新为失败');
  } catch (error) {
    console.error('更新支付记录失败:', error);
  }
}

// 处理支付意图成功
async function handlePaymentIntentSucceeded(paymentIntent: any) {
  console.log('处理支付意图成功:', paymentIntent.id);
  
  // 尝试从支付意图元数据获取用户信息
  let userId = null;
  let planName = null;
  let planType = null;
  let credits = null;
  
  // 方式1: 从支付意图元数据获取
  if (paymentIntent.metadata && paymentIntent.metadata.user_id) {
    userId = paymentIntent.metadata.user_id;
    planName = paymentIntent.metadata.plan_name;
    planType = paymentIntent.metadata.plan_type;
    credits = paymentIntent.metadata.credits;
    console.log('✅ 方式1成功: 从支付意图元数据获取');
  }
  
  // 方式2: 从缓存中查找（针对订阅）
  if (!userId) {
    console.log('支付意图元数据中没有user_id，尝试从缓存中查找...');
    const cacheEntries = Array.from(subscriptionCache.entries());
    for (const [subscriptionId, cachedData] of cacheEntries) {
      if (cachedData.userId) {
        userId = cachedData.userId;
        // 从数据库获取用户信息
        const { data: user } = await supabase
          .from('users')
          .select('credits_balance')
          .eq('id', parseInt(userId))
          .single();
        
        if (user) {
          credits = user.credits_balance.toString();
        }
        console.log('✅ 方式2成功: 从缓存中获取（订阅）');
        break;
      }
    }
  }
  
  if (!userId) {
    console.log('❌ 无法获取用户ID，跳过处理');
    return;
  }

  try {
    // 获取真实支付金额（以分为单位，转换为美元）
    const realAmount = (paymentIntent.amount || 0) / 100;
    
    if (planType === 'credits') {
      // 积分包购买：累加积分
      const { data: currentUser } = await supabase
        .from('users')
        .select('credits_balance')
        .eq('id', parseInt(userId))
        .single();
      
      const currentCredits = currentUser?.credits_balance || 0;
      const newCredits = currentCredits + parseInt(credits || '0');
      
      await updateUserSubscription(userId, {
        credits_balance: newCredits,
      });
      
      console.log('✅ 积分包购买积分更新:', {
        old_credits: currentCredits,
        new_credits: newCredits,
        added_credits: credits
      });
    } else {
      // 其他类型：直接设置积分
      await updateUserSubscription(userId, {
        credits_balance: parseInt(credits || '0'),
      });
    }

    // 创建或更新支付记录
    await createPaymentRecord({
      user_id: parseInt(userId),
      amount: realAmount, // 使用真实支付金额
      stripe_payment_intent_id: paymentIntent.id,
      payment_type: planType === 'credits' ? 'one_time' : 'subscription',
    });

    console.log('✅ 支付意图处理完成');
  } catch (error) {
    console.error('处理支付意图时发生错误:', error);
  }
}

// 辅助函数：更新用户订阅信息
async function updateUserSubscription(userId: string, updates: any) {
  console.log('开始更新用户订阅信息:', {
    user_id: userId,
    updates: updates
  });
  
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', parseInt(userId))
    .select();
  
  if (error) {
    console.error('数据库更新失败:', error);
    throw error;
  }
  
  console.log('✅ 数据库更新成功:', {
    user_id: userId,
    updated_rows: data?.length || 0,
    result: data
  });
}

// 辅助函数：创建支付记录
async function createPaymentRecord(record: any) {
  const { error } = await supabase
    .from('payment_records')
    .insert({
      ...record,
      currency: 'USD',
      payment_status: 'success',
      paid_at: new Date().toISOString(),
      order_no: `ORDER_${Date.now()}`,
    });
  
  if (error) throw error;
}

// 辅助函数：获取订阅时间
function getSubscriptionTime(subscription: any, type: 'start' | 'end'): string | null {
  console.log('获取订阅时间:', { type, subscription: JSON.stringify(subscription, null, 2) });
  
  // 方式1: 直接从订阅对象获取
  let timestamp = subscription[`current_period_${type}`];
  
  // 方式2: 从items.data[0]中获取（这是正确的位置！）
  if (!timestamp && subscription.items && subscription.items.data && subscription.items.data[0]) {
    const firstItem = subscription.items.data[0];
    timestamp = firstItem[`current_period_${type}`];
    if (timestamp) {
      console.log(`✅ 方式2成功: 从items.data[0]获取${type}时间:`, timestamp);
    }
  }
  
  // 方式3: 从subscription对象本身获取（处理嵌套情况）
  if (!timestamp && subscription.subscription) {
    timestamp = subscription.subscription[`current_period_${type}`];
    if (timestamp) {
      console.log(`✅ 方式3成功: 从subscription.subscription获取${type}时间:`, timestamp);
    }
  }
  
  if (timestamp) {
    const date = new Date(timestamp * 1000);
    console.log(`✅ 成功获取${type}时间:`, date.toISOString());
    return date.toISOString();
  }
  
  console.log(`❌ 无法获取${type}时间，返回null`);
  return null;
}

// 辅助函数：获取套餐价格
async function getPlanPrice(planName: string): Promise<number> {
  try {
    const { data } = await supabase
      .from('subscription_plans')
      .select('price')
      .eq('price_name', planName)
      .single();
    
    return data?.price || 39.90;
  } catch {
    return 39.90; // 默认价格
  }
}

// 辅助函数：获取真实支付金额
async function getRealPaymentAmount(subscriptionId: string): Promise<number> {
  try {
    // 获取订阅信息
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    // 获取最新的发票
    if (subscription.latest_invoice) {
      const invoice = await stripe.invoices.retrieve(subscription.latest_invoice as string);
      // 转换为美元金额（Stripe以分为单位）
      return (invoice.amount_paid || 0) / 100;
    }
    
    // 如果没有发票，尝试从订阅的items获取价格
    if (subscription.items?.data?.[0]?.price?.unit_amount) {
      return (subscription.items.data[0].price.unit_amount || 0) / 100;
    }
    
    return 0;
  } catch (error) {
    console.error('获取真实支付金额失败:', error);
    return 0;
  }
}