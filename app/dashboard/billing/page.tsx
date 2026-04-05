'use client';

import { useState, useEffect } from 'react';
import { CreditCard, ShoppingBag, Users, Check, FileText, Loader as Loader2, Infinity as InfinityIcon, TriangleAlert as AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { api } from '@/lib/api';
import { BillingPlan, BillingPlanStatus } from '@/lib/types';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function BillingPage() {
  const [billingPlan, setBillingPlan] = useState<BillingPlanStatus | null>(null);
  const [plans, setPlans] = useState<BillingPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    try {
      setIsLoading(true);
      const [planData, plansData] = await Promise.all([
        api.getBillingPlan(),
        api.getBillingPlans()
      ]);

      const normalizedPlan = {
        ...planData,
        limits: planData.limits ?? {
          max_pages: -1,
          max_members: -1,
        },
        usage: planData.usage ?? {
          pages: 0,
          members: 0,
        }
      };

      setBillingPlan(normalizedPlan);
      setPlans(plansData);
    } catch (error) {
      console.error('Failed to load billing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatFeatureList = (plan: BillingPlan): string[] => {
    const features: string[] = [];

    if (plan.max_pages === -1) {
      features.push('Unlimited pages');
    } else {
      features.push(`${plan.max_pages} page${plan.max_pages === 1 ? '' : 's'}`);
    }

    if (plan.max_members === -1) {
      features.push('Unlimited members');
    } else {
      features.push(`${plan.max_members} members`);
    }

    if (plan.features && Array.isArray(plan.features)) {
      if (plan.features.includes('analytics')) {
        features.push('Analytics');
      }

      if (plan.features.includes('custom_support')) {
        features.push('24/7 support');
      }
    }

    return features;
  };

  const getPagesPercentage = () => {
    if (!billingPlan) return 0;
    if (billingPlan.limits.max_pages === -1) return 0;
    return (billingPlan.usage.pages / billingPlan.limits.max_pages) * 100;
  };

  const getMembersPercentage = () => {
    if (!billingPlan) return 0;
    if (billingPlan.limits.max_members === -1) return 0;
    return (billingPlan.usage.members / billingPlan.limits.max_members) * 100;
  };

  const getTrialDaysRemaining = () => {
    if (!billingPlan?.trial_end) return null;
    const now = new Date();
    const trialEnd = new Date(billingPlan.trial_end);
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const getStatusBadge = () => {
    if (!billingPlan) return { label: 'Active', color: 'bg-green-600 hover:bg-green-600' };

    if (billingPlan.status === 'trialing') {
      const daysRemaining = getTrialDaysRemaining();
      return {
        label: `Trial (${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'} left)`,
        color: 'bg-blue-600 hover:bg-blue-600'
      };
    }

    if (billingPlan.cancels_at_period_end) {
      return { label: 'Canceling', color: 'bg-yellow-600 hover:bg-yellow-600' };
    }

    switch (billingPlan.status) {
      case 'active':
        return { label: 'Active', color: 'bg-green-600 hover:bg-green-600' };
      case 'past_due':
        return { label: 'Past Due', color: 'bg-red-600 hover:bg-red-600' };
      case 'canceled':
        return { label: 'Canceled', color: 'bg-slate-600 hover:bg-slate-600' };
      default:
        return { label: billingPlan.status, color: 'bg-slate-600 hover:bg-slate-600' };
    }
  };

  const getCurrentPlanIndex = () => {
    if (!billingPlan?.plan) return -1;
    return plans.findIndex(p => p.slug.toLowerCase() === billingPlan.plan.toLowerCase());
  };

  const getActionType = (planSlug: string) => {
    const currentIndex = getCurrentPlanIndex();
    const targetIndex = plans.findIndex(p => p.slug === planSlug);

    if (currentIndex === -1 || targetIndex === -1) return 'upgrade';
    if (targetIndex > currentIndex) return 'upgrade';
    if (targetIndex < currentIndex) return 'downgrade';
    return 'current';
  };

  const isMaxPlan = () => {
    const currentIndex = getCurrentPlanIndex();
    return currentIndex === plans.length - 1;
  };

  const handleReactivate = async () => {
    try {
      setCheckoutLoading('reactivate');
      const currentPlan = billingPlan?.plan || '';
      const { checkout_url } = await api.createBillingCheckoutSession(currentPlan);

      if (checkout_url) {
        window.open(checkout_url, '_blank');
      } else {
        await loadBillingData();
        toast.success('Plan reactivated successfully');
      }
    } catch (error: any) {
      console.error('Failed to reactivate plan:', error);
      toast.error(error.message || 'Failed to reactivate plan');
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleUpgrade = async (planSlug: string) => {
    try {
      setCheckoutLoading(planSlug);
      const { checkout_url } = await api.createBillingCheckoutSession(planSlug);

      if (checkout_url) {
        window.open(checkout_url, '_blank');
      } else {
        await loadBillingData();
        toast.success('Plan updated successfully');
      }
    } catch (error: any) {
      console.error('Failed to create checkout session:', error);
      toast.error(error.message || 'Failed to start checkout');
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setCancelLoading(true);
      await api.cancelSubscription();
      const updatedPlan = await api.getBillingPlan();
      setBillingPlan(updatedPlan);
      toast.success('Subscription cancelled successfully');
    } catch (error: any) {
      console.error('Failed to cancel subscription:', error);
      toast.error(error.message || 'Failed to cancel subscription');
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Billing</h1>
        <p className="text-muted-foreground">
          Manage your subscription and billing information
        </p>
      </div>

      <Card className="p-6 bg-slate-900/40 border-slate-800/50">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold">{billingPlan?.plan?.toUpperCase() || 'FREE PLAN'}</h2>
                <Badge className={`${getStatusBadge().color} text-white`}>
                  {getStatusBadge().label}
                </Badge>
              </div>
              <p className="text-base text-muted-foreground mb-1">
                {billingPlan?.limits.max_pages === -1 ? 'Unlimited pages' : `Up to ${billingPlan?.limits.max_pages} page${billingPlan?.limits.max_pages === 1 ? '' : 's'}`} · {billingPlan?.limits.max_members === -1 ? 'Unlimited members' : `${billingPlan?.limits.max_members} members`}
              </p>
              {billingPlan?.cancels_at_period_end && billingPlan?.current_period_end && (
                <p className="text-sm text-yellow-500">
                  Plan active until {new Date(billingPlan.current_period_end).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}. Will revert to free plan afterwards.
                </p>
              )}
              {billingPlan?.status === 'trialing' && billingPlan?.trial_end && (
                <p className="text-sm text-blue-500">
                  Trial ends {new Date(billingPlan.trial_end).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              )}
              {!billingPlan?.cancels_at_period_end && billingPlan?.status !== 'trialing' && (
                <p className="text-sm text-muted-foreground">
                  Perfect for getting started with Discord monetization
                </p>
              )}
            </div>
            {billingPlan?.cancels_at_period_end ? (
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={handleReactivate}
                disabled={checkoutLoading !== null}
              >
                {checkoutLoading === 'reactivate' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Reactivate Plan'
                )}
              </Button>
            ) : !isMaxPlan() && (
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  const nextPlanIndex = getCurrentPlanIndex() + 1;
                  if (nextPlanIndex < plans.length) {
                    handleUpgrade(plans[nextPlanIndex].slug);
                  }
                }}
                disabled={checkoutLoading !== null || billingPlan?.status === 'canceled'}
              >
                {checkoutLoading !== null ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  `Upgrade to ${plans[getCurrentPlanIndex() + 1]?.name || 'Pro'}`
                )}
              </Button>
            )}
          </div>
        )}
      </Card>

      <div>
        <h2 className="text-xl font-semibold mb-4">Usage</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-6 bg-slate-900/40 border-slate-800/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>Pages</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold flex items-center gap-2">
                {billingPlan?.usage.pages || 0}
                <span className="text-muted-foreground">/</span>
                {billingPlan?.limits.max_pages === -1 ? (
                  <InfinityIcon className="h-6 w-6 text-muted-foreground" />
                ) : (
                  <span>{billingPlan?.limits.max_pages || 0}</span>
                )}
              </div>
              {billingPlan?.limits.max_pages !== -1 && (
                <>
                  <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        getPagesPercentage() >= 100
                          ? 'bg-red-500'
                          : getPagesPercentage() >= 80
                          ? 'bg-yellow-500'
                          : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min(getPagesPercentage(), 100)}%` }}
                    />
                  </div>
                  {getPagesPercentage() >= 100 && (
                    <p className="text-xs text-red-500">At limit</p>
                  )}
                </>
              )}
            </div>
          </Card>

          <Card className="p-6 bg-slate-900/40 border-slate-800/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>Members</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold flex items-center gap-2">
                {billingPlan?.usage.members || 0}
                <span className="text-muted-foreground">/</span>
                {billingPlan?.limits.max_members === -1 ? (
                  <InfinityIcon className="h-6 w-6 text-muted-foreground" />
                ) : (
                  <span>{billingPlan?.limits.max_members || 0}</span>
                )}
              </div>
              {billingPlan?.limits.max_members !== -1 && (
                <>
                  <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        getMembersPercentage() >= 100
                          ? 'bg-red-500'
                          : getMembersPercentage() >= 80
                          ? 'bg-yellow-500'
                          : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min(getMembersPercentage(), 100)}%` }}
                    />
                  </div>
                  {getMembersPercentage() >= 100 && (
                    <p className="text-xs text-red-500">At limit</p>
                  )}
                </>
              )}
            </div>
          </Card>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Plans</h2>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan, index) => {
              const isCurrentPlan = billingPlan?.plan?.toLowerCase() === plan.slug.toLowerCase();
              const isPopular = plan.slug === 'pro';
              const features = formatFeatureList(plan);
              const price = plan.unit_amount ? (plan.unit_amount / 100).toFixed(2) : '0';

              return (
                <Card
                  key={plan.slug}
                  className={`p-6 relative flex flex-col ${
                    isPopular
                      ? 'bg-blue-950/30 border-blue-600'
                      : 'bg-slate-900/40 border-slate-800/50'
                  }`}
                >
                  {isPopular && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 hover:bg-blue-600 text-white">
                      Most Popular
                    </Badge>
                  )}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-4xl font-bold">${price}</span>
                      {plan.recurring_interval && (
                        <span className="text-sm text-muted-foreground">
                          per {plan.recurring_interval}
                        </span>
                      )}
                    </div>
                    {plan.fee_bps > 0 && (
                      <p className="text-sm text-muted-foreground">
                        + {(plan.fee_bps / 100).toFixed(1)}% per transaction
                      </p>
                    )}
                  </div>
                  <div className="space-y-3 mb-6 flex-grow">
                    {features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    className={`w-full mt-auto ${
                      isCurrentPlan
                        ? 'bg-slate-800 hover:bg-slate-800 text-muted-foreground cursor-default'
                        : isPopular
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                    disabled={isCurrentPlan || checkoutLoading === plan.slug || billingPlan?.status === 'canceled'}
                    onClick={() => handleUpgrade(plan.slug)}
                  >
                    {checkoutLoading === plan.slug ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isCurrentPlan ? (
                      'Current Plan'
                    ) : (
                      `${getActionType(plan.slug) === 'upgrade' ? 'Upgrade' : 'Downgrade'} to ${plan.name}`
                    )}
                  </Button>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Billing History</h2>
        <Card className="overflow-hidden bg-slate-900/40 border-slate-800/50">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/30">
                <tr className="text-left text-sm text-muted-foreground">
                  <th className="py-4 px-6 font-medium">Invoice</th>
                  <th className="py-4 px-6 font-medium">Date</th>
                  <th className="py-4 px-6 font-medium">Amount</th>
                  <th className="py-4 px-6 font-medium">Status</th>
                  <th className="py-4 px-6 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={5} className="py-12">
                    <EmptyState
                      icon={FileText}
                      title="No billing history yet"
                      description="Invoices will appear here after your first payment"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {billingPlan?.plan && billingPlan.plan !== 'free' && !billingPlan.cancels_at_period_end && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Cancel Subscription</h2>
          <Card className="p-6 bg-slate-900/40 border-slate-800/50">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-yellow-500" />
              </div>
              <div className="flex-grow">
                <h3 className="text-lg font-semibold mb-2">Cancel your subscription</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Your subscription will remain active until the end of your current billing period. After that, your account will be downgraded to the free plan.
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      disabled={cancelLoading}
                    >
                      {cancelLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Cancel Subscription'
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Your subscription will be cancelled at the end of the current billing period. You will retain access to your current plan features until {billingPlan?.current_period_end ? new Date(billingPlan.current_period_end).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'the end of the period'}.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleCancelSubscription}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Cancel Subscription
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}