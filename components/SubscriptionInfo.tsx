'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { useLanguage } from '@/lib/languageContext';
import { Card } from '@/components/ui/Card';

interface SubscriptionData {
  user_id: number;
  is_paid_user: boolean;
  price_name: string | null;
  price_type: string;
  credits_balance: number;
  subscription_status: string;
  subscription_current_period_start: string | null;
  subscription_current_period_end: string | null;
  subscription_cancel_at_period_end: boolean;
  stripe_subscription_id?: string;
}

export default function SubscriptionInfo() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSubscriptionInfo();
    }
  }, [user]);

  const fetchSubscriptionInfo = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/user/subscription?userId=${user.id}`);
      const data = await response.json();

      if (response.ok) {
        if (data.subscription) {
          setSubscriptionData(data.subscription);
        }
      } else {
        console.error('获取订阅信息失败:', data.error);
      }
    } catch (error) {
      console.error('获取订阅信息失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return t('unknown');
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'active': t('active'),
      'inactive': t('inactive'),
      'canceled': t('canceled'),
      'past_due': t('past_due'),
      'unpaid': t('unpaid'),
      'trialing': t('trialing')
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      'active': 'text-green-600',
      'inactive': 'text-gray-600',
      'canceled': 'text-red-600',
      'past_due': 'text-yellow-600',
      'unpaid': 'text-red-600',
      'trialing': 'text-blue-600'
    };
    return colorMap[status] || 'text-gray-600';
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 订阅信息卡片 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{t('subscription_info')}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">{t('credits_balance')}</p>
            <p className="text-2xl font-bold text-blue-600">
              {subscriptionData?.credits_balance || user?.credits_balance || 0}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-600">{t('subscription_status')}</p>
            <p className={`text-lg font-semibold ${getStatusColor(subscriptionData?.subscription_status || 'inactive')}`}>
              {getStatusText(subscriptionData?.subscription_status || 'inactive')}
            </p>
          </div>
          
          {(subscriptionData?.is_paid_user || user?.is_paid_user) && (
            <>
              <div>
                <p className="text-sm text-gray-600">{t('current_package')}</p>
                <p className="text-lg font-semibold">
                  {subscriptionData?.price_name || user?.price_name || t('unknown_package')}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">{t('package_type')}</p>
                <p className="text-lg font-semibold">
                  {(subscriptionData?.price_type || user?.price_type) === 'monthly' ? t('monthly_payment') : 
                   (subscriptionData?.price_type || user?.price_type) === 'year' ? t('yearly_payment') : 
                   (subscriptionData?.price_type || user?.price_type) === 'yearly' ? t('yearly_payment') : t('free_user')}
                </p>
              </div>
              
              {subscriptionData?.subscription_current_period_end && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600">{t('subscription_expiration_date')}</p>
                  <p className="text-lg font-semibold">
                    {formatDate(subscriptionData.subscription_current_period_end)}
                    {subscriptionData.subscription_cancel_at_period_end && (
                      <span className="text-red-600 text-sm ml-2">{t('will_cancel_at_expiration')}</span>
                    )}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </Card>
    </div>
  );
} 