import { supabase } from './supabase';

// 积分计算常量
export const CREDITS_PER_SECOND = 10; // 每秒消耗10积分
export const WELCOME_CREDITS = 50; // 新用户欢迎积分
export const MAX_VIDEO_DURATION = 30; // 最大视频时长（秒）

// 计算视频生成所需的积分
export function calculateCreditsNeeded(durationSeconds: number): number {
  return durationSeconds * CREDITS_PER_SECOND;
}

// 计算积分可兑换的视频时长
export function calculateAvailableDuration(credits: number): number {
  return Math.floor(credits / CREDITS_PER_SECOND);
}

// 检查用户是否有足够的积分
export function hasEnoughCredits(userCredits: number, durationSeconds: number): boolean {
  const requiredCredits = calculateCreditsNeeded(durationSeconds);
  return userCredits >= requiredCredits;
}

// 检查视频时长是否有效
export function isValidVideoDuration(durationSeconds: number): boolean {
  return durationSeconds > 0 && durationSeconds <= MAX_VIDEO_DURATION;
}

// 为用户添加积分
export async function addUserCredits(userId: number, creditsToAdd: number): Promise<boolean> {
  try {
    // 先获取当前积分余额
    const { data: user } = await supabase
      .from('users')
      .select('credits_balance')
      .eq('id', userId)
      .single();

    if (!user) {
      console.error('用户不存在');
      return false;
    }

    const { error } = await supabase
      .from('users')
      .update({
        credits_balance: user.credits_balance + creditsToAdd
      })
      .eq('id', userId);

    if (error) {
      console.error('添加积分失败:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('添加积分失败:', error);
    return false;
  }
}

// 为用户扣除积分
export async function deductUserCredits(userId: number, creditsToDeduct: number): Promise<boolean> {
  try {
    // 先获取当前积分余额
    const { data: user } = await supabase
      .from('users')
      .select('credits_balance')
      .eq('id', userId)
      .single();

    if (!user) {
      console.error('用户不存在');
      return false;
    }

    // 检查余额是否足够
    if (user.credits_balance < creditsToDeduct) {
      console.error('积分余额不足');
      return false;
    }

    const { error } = await supabase
      .from('users')
      .update({
        credits_balance: user.credits_balance - creditsToDeduct
      })
      .eq('id', userId);

    if (error) {
      console.error('扣除积分失败:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('扣除积分失败:', error);
    return false;
  }
}

// 记录用户使用情况
export async function recordUserUsage(
  userId: number,
  durationSeconds: number,
  creditsConsumed: number,
  videoDuration?: number,
  resolution?: string
): Promise<boolean> {
  try {
    console.log('开始记录用户使用情况:', { userId, durationSeconds, creditsConsumed, videoDuration, resolution });
    
    // 获取用户当前套餐信息
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('price_name, price_type')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('获取用户套餐信息失败:', userError);
      return false;
    }

    console.log('用户套餐信息:', user);

    // 准备插入数据
    const insertData = {
      user_id: userId,
      generations_used: 1,
      duration_used: durationSeconds,
      credits_consumed: creditsConsumed,
      video_duration: videoDuration || null,
      resolution: resolution || null,
      price_name: user?.price_name || null,
      // 确保 price_type 符合数据库约束
      price_type: (user?.price_type && ['free', 'monthly', 'yearly'].includes(user.price_type)) 
        ? user.price_type 
        : 'free',
    };

    console.log('准备插入的数据:', insertData);

    const { error } = await supabase
      .from('user_usage')
      .insert(insertData);

    if (error) {
      console.error('记录使用情况失败:', error);
      console.error('错误详情:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return false;
    }

    console.log('记录使用情况成功');
    return true;
  } catch (error) {
    console.error('记录使用情况过程中出错:', error);
    return false;
  }
}

// 处理视频生成请求
export async function processVideoGeneration(
  userId: number,
  durationSeconds: number,
  videoDuration?: number,
  resolution?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // 验证时长
    if (!isValidVideoDuration(durationSeconds)) {
      return {
        success: false,
        error: `视频时长必须在1-${MAX_VIDEO_DURATION}秒之间`
      };
    }

    // 获取用户信息
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('credits_balance')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return {
        success: false,
        error: '用户不存在'
      };
    }

    // 计算所需积分
    const requiredCredits = calculateCreditsNeeded(durationSeconds);

    // 检查积分是否足够
    if (!hasEnoughCredits(user.credits_balance, durationSeconds)) {
      return {
        success: false,
        error: `积分不足，需要${requiredCredits}积分，当前余额${user.credits_balance}积分`
      };
    }

    // 扣除积分
    const deductSuccess = await deductUserCredits(userId, requiredCredits);
    if (!deductSuccess) {
      return {
        success: false,
        error: '扣除积分失败'
      };
    }

    // 记录使用情况
    const recordSuccess = await recordUserUsage(
      userId,
      durationSeconds,
      requiredCredits,
      videoDuration,
      resolution
    );

    if (!recordSuccess) {
      // 如果记录失败，回滚积分
      await addUserCredits(userId, requiredCredits);
      return {
        success: false,
        error: '记录使用情况失败'
      };
    }

    return { success: true };

  } catch (error) {
    console.error('处理视频生成失败:', error);
    return {
      success: false,
      error: '处理视频生成失败'
    };
  }
}

// 获取用户使用统计
export async function getUserUsageStats(userId: number) {
  try {
    const { data, error } = await supabase
      .from('user_usage')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('获取使用统计失败:', error);
      return null;
    }

    const totalGenerations = data.reduce((sum, usage) => sum + (usage.generations_used || 1), 0);
    const totalDuration = data.reduce((sum, usage) => sum + usage.duration_used, 0);
    const totalCreditsConsumed = data.reduce((sum, usage) => sum + usage.credits_consumed, 0);

    return {
      totalGenerations,
      totalDuration,
      totalCreditsConsumed,
      usageHistory: data
    };
  } catch (error) {
    console.error('获取使用统计失败:', error);
    return null;
  }
} 