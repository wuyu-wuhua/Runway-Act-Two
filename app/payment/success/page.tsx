'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CheckCircle, CreditCard, Calendar } from 'lucide-react';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);

  const sessionId = searchParams.get('session_id');
  const plan = searchParams.get('plan');
  const credits = searchParams.get('credits');

  useEffect(() => {
    const fetchPaymentInfo = async () => {
      if (!sessionId) {
        // 如果没有session_id，使用URL参数
        setPaymentInfo({
          plan: plan || '未知套餐',
          credits: parseInt(credits || '0'),
          amount: 0, // 从URL无法获取真实金额
          orderId: `ORDER_${Date.now()}`,
          paymentDate: new Date().toLocaleDateString('zh-CN'),
        });
        setLoading(false);
        return;
      }

      try {
        // 尝试从Stripe session获取支付信息
        const response = await fetch(`/api/stripe/get-session-info?session_id=${sessionId}`);
        if (response.ok) {
          const data = await response.json();
          setPaymentInfo({
            plan: data.plan_name || plan || '未知套餐',
            credits: data.credits || parseInt(credits || '0'),
            amount: data.amount || 0,
            orderId: data.order_no || `ORDER_${Date.now()}`,
            paymentDate: new Date().toLocaleDateString('zh-CN'),
            paymentStatus: data.payment_status || 'success',
          });
        } else {
          // 如果API调用失败，使用URL参数
          setPaymentInfo({
            plan: plan || '未知套餐',
            credits: parseInt(credits || '0'),
            amount: 0,
            orderId: `ORDER_${Date.now()}`,
            paymentDate: new Date().toLocaleDateString('zh-CN'),
          });
        }
      } catch (error) {
        console.error('获取支付信息失败:', error);
        // 使用URL参数作为备用
        setPaymentInfo({
          plan: plan || '未知套餐',
          credits: parseInt(credits || '0'),
          amount: 0,
          orderId: `ORDER_${Date.now()}`,
          paymentDate: new Date().toLocaleDateString('zh-CN'),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentInfo();
  }, [sessionId, plan, credits]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* 成功图标和标题 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">支付成功！</h1>
          <p className="text-gray-600">您的订单已成功处理，积分已添加到您的账户</p>
        </div>

        {/* 支付详情卡片 */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">支付详情</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CreditCard className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-gray-600">套餐名称</span>
              </div>
              <span className="font-semibold">{plan}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">获得积分</span>
              <span className="font-semibold text-blue-600">{credits} 积分</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">支付金额</span>
              <span className="font-semibold">${paymentInfo?.amount}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-gray-600">支付时间</span>
              </div>
              <span className="font-semibold">{paymentInfo?.paymentDate}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">订单号</span>
              <span className="font-mono text-sm text-gray-500">{paymentInfo?.orderId}</span>
            </div>
          </div>
        </Card>

        {/* 下一步操作 */}
        <div className="text-center space-y-4">
          <p className="text-gray-600">
            您的积分已立即生效，现在可以开始使用AI视频生成功能了！
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/ai-effect-generator">
              <Button className="w-full sm:w-auto">
                开始生成视频
              </Button>
            </Link>
            
            <Link href="/profile">
              <Button variant="outline" className="w-full sm:w-auto">
                查看账户信息
              </Button>
            </Link>
          </div>
        </div>

        {/* 温馨提示 */}
        <Card className="p-4 mt-8 bg-blue-50 border-blue-200">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">温馨提示</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>积分包购买后立即生效，无使用期限</li>
                  <li>订阅套餐每月/每年自动续费，可随时取消</li>
                  <li>如有问题，请联系客服支持</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 