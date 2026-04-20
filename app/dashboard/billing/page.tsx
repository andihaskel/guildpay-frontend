'use client';

import { useState, useEffect } from 'react';
import { Check, FileText, Loader as Loader2, TriangleAlert as AlertTriangle, ExternalLink, Download } from 'lucide-react';
import { api } from '@/lib/api';
import { BillingPlan, BillingPlanStatus, Invoice } from '@/lib/types';
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
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [invoicesLoading, setInvoicesLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    loadBillingData();
    loadInvoices();
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

  const loadInvoices = async () => {
    try {
      setInvoicesLoading(true);
      const response = await api.getBillingInvoices();
      setInvoices(response.invoices);
    } catch (error) {
      console.error('Failed to load invoices:', error);
    } finally {
      setInvoicesLoading(false);
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
        color: 'bg-sky-600 hover:bg-sky-600'
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

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-600 hover:bg-green-600';
      case 'open':
        return 'bg-sky-600 hover:bg-sky-600';
      case 'draft':
        return 'bg-slate-600 hover:bg-slate-600';
      case 'void':
        return 'bg-slate-600 hover:bg-slate-600';
      case 'uncollectible':
        return 'bg-red-600 hover:bg-red-600';
      default:
        return 'bg-slate-600 hover:bg-slate-600';
    }
  };

  const sectionLabel = (text: string) => (
    <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 14px' }}>{text}</p>
  );

  const statusChip = () => {
    const s = getStatusBadge();
    const colorMap: Record<string, { bg: string; border: string; color: string }> = {
      'bg-green-600 hover:bg-green-600':  { bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.2)',  color: '#4ade80' },
      'bg-sky-600 hover:bg-sky-600':      { bg: 'var(--accent-soft-bg)', border: 'var(--accent-soft-border)', color: 'var(--accent-soft-text)' },
      'bg-yellow-600 hover:bg-yellow-600':{ bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', color: '#fbbf24' },
      'bg-red-600 hover:bg-red-600':      { bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.2)',  color: '#f87171' },
      'bg-slate-600 hover:bg-slate-600':  { bg: 'rgba(255,255,255,0.04)', border: 'var(--border)',       color: 'var(--text-muted)' },
    };
    const c = colorMap[s.color] || colorMap['bg-slate-600 hover:bg-slate-600'];
    return (
      <span style={{ fontSize: '11.5px', fontWeight: 500, padding: '3px 9px', borderRadius: '20px', background: c.bg, border: `0.5px solid ${c.border}`, color: c.color }}>
        {s.label}
      </span>
    );
  };

  const invoiceStatusChip = (status: string) => {
    const colorMap: Record<string, { bg: string; border: string; color: string }> = {
      paid: { bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)', color: '#4ade80' },
      open: { bg: 'var(--accent-soft-bg)', border: 'var(--accent-soft-border)', color: 'var(--accent-soft-text)' },
      void: { bg: 'rgba(255,255,255,0.04)', border: 'var(--border)', color: 'var(--text-muted)' },
      draft: { bg: 'rgba(255,255,255,0.04)', border: 'var(--border)', color: 'var(--text-muted)' },
      uncollectible: { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', color: '#f87171' },
    };
    const c = colorMap[status.toLowerCase()] || colorMap['void'];
    return (
      <span style={{ fontSize: '11px', fontWeight: 500, padding: '2px 7px', borderRadius: '20px', background: c.bg, border: `0.5px solid ${c.border}`, color: c.color }}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ fontSize: '20px', fontWeight: 500, color: 'var(--text)', margin: '0 0 4px', letterSpacing: '-0.015em' }}>
          Billing
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
          Manage your subscription and billing information
        </p>
      </div>

      <div style={{ background: 'var(--surface-1)', border: '0.5px solid var(--border)', borderRadius: '10px', padding: '20px 24px' }}>
        {isLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 0' }}>
            <Loader2 size={20} style={{ color: 'var(--text-muted)', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <span style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.02em' }}>
                  {billingPlan?.plan?.charAt(0).toUpperCase() + (billingPlan?.plan?.slice(1) || '') || 'Free'} Plan
                </span>
                {statusChip()}
              </div>
              {billingPlan?.cancels_at_period_end && billingPlan?.current_period_end && (
                <p style={{ fontSize: '13px', color: '#fbbf24', margin: 0 }}>
                  Active until {new Date(billingPlan.current_period_end).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}. Will revert to free plan afterwards.
                </p>
              )}
              {billingPlan?.status === 'trialing' && billingPlan?.trial_end && (
                <p style={{ fontSize: '13px', color: 'var(--accent-soft-text)', margin: 0 }}>
                  Trial ends {new Date(billingPlan.trial_end).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              )}
            </div>
            {billingPlan?.cancels_at_period_end ? (
              <button
                onClick={handleReactivate}
                disabled={checkoutLoading !== null}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  fontSize: '13px', fontWeight: 500, padding: '7px 16px', borderRadius: '6px',
                  background: 'rgba(34,197,94,0.1)', border: '0.5px solid rgba(34,197,94,0.25)',
                  color: '#4ade80', cursor: checkoutLoading !== null ? 'not-allowed' : 'pointer',
                  opacity: checkoutLoading !== null ? 0.6 : 1, transition: 'all 180ms ease',
                }}
              >
                {checkoutLoading === 'reactivate' ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : null}
                Reactivate Plan
              </button>
            ) : !isMaxPlan() && (
              <button
                onClick={() => { const ni = getCurrentPlanIndex() + 1; if (ni < plans.length) handleUpgrade(plans[ni].slug); }}
                disabled={checkoutLoading !== null || billingPlan?.cancels_at_period_end === true}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  fontSize: '13px', fontWeight: 500, padding: '7px 16px', borderRadius: '6px',
                  background: 'var(--text)', color: 'var(--bg)', border: 'none',
                  cursor: checkoutLoading !== null ? 'not-allowed' : 'pointer',
                  opacity: checkoutLoading !== null ? 0.6 : 1, transition: 'opacity 180ms ease',
                }}
              >
                {checkoutLoading !== null ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : null}
                Upgrade to {plans[getCurrentPlanIndex() + 1]?.name || 'Pro'}
              </button>
            )}
          </div>
        )}
      </div>

      <div>
        {sectionLabel('Plans')}
        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'var(--border-soft)', borderRadius: '10px', overflow: 'hidden' }}>
            {[1, 2, 3].map(i => <div key={i} style={{ background: 'var(--surface-1)', minHeight: '200px' }} />)}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'var(--border-soft)', borderRadius: '10px', overflow: 'hidden' }}>
            {plans.map((plan) => {
              const isCurrentPlan = billingPlan?.plan?.toLowerCase() === plan.slug.toLowerCase();
              const isPopular = plan.slug === 'pro';
              const features = formatFeatureList(plan);
              const price = plan.unit_amount ? (plan.unit_amount / 100).toFixed(2) : '0';
              return (
                <div
                  key={plan.slug}
                  style={{
                    background: isPopular ? 'rgba(88,101,242,0.04)' : 'var(--surface-1)',
                    padding: '24px', display: 'flex', flexDirection: 'column', position: 'relative',
                  }}
                >
                  {isPopular && (
                    <span style={{ fontSize: '11px', fontWeight: 500, padding: '2px 8px', borderRadius: '20px', background: 'var(--accent-soft-bg)', border: '0.5px solid var(--accent-soft-border)', color: 'var(--accent-soft-text)', marginBottom: '12px', alignSelf: 'flex-start' }}>
                      Most Popular
                    </span>
                  )}
                  <h3 style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', margin: '0 0 12px' }}>{plan.name}</h3>
                  <div style={{ marginBottom: '4px' }}>
                    <span style={{ fontSize: '28px', fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-mono)', letterSpacing: '-0.04em' }}>${price}</span>
                    {plan.recurring_interval && (
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '4px' }}>/ {plan.recurring_interval}</span>
                    )}
                  </div>
                  {plan.fee_bps > 0 && (
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 16px' }}>
                      + {(plan.fee_bps / 100).toFixed(1)}% per transaction
                    </p>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, margin: '16px 0' }}>
                    {features.map((feature, fi) => (
                      <div key={fi} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Check size={12} style={{ color: '#4ade80', flexShrink: 0 }} />
                        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{feature}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    disabled={isCurrentPlan || checkoutLoading === plan.slug || billingPlan?.cancels_at_period_end === true}
                    onClick={() => handleUpgrade(plan.slug)}
                    style={{
                      marginTop: 'auto', padding: '8px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 500,
                      cursor: isCurrentPlan ? 'default' : (checkoutLoading === plan.slug || billingPlan?.cancels_at_period_end ? 'not-allowed' : 'pointer'),
                      background: isCurrentPlan ? 'rgba(255,255,255,0.04)' : isPopular ? 'var(--text)' : 'var(--surface-2)',
                      color: isCurrentPlan ? 'var(--text-muted)' : isPopular ? 'var(--bg)' : 'var(--text)',
                      border: `0.5px solid ${isCurrentPlan ? 'var(--border)' : isPopular ? 'transparent' : 'var(--border-strong)'}`,
                      opacity: (checkoutLoading === plan.slug) ? 0.6 : 1, transition: 'opacity 180ms ease',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    }}
                  >
                    {checkoutLoading === plan.slug ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : null}
                    {isCurrentPlan ? 'Current Plan' : `${getActionType(plan.slug) === 'upgrade' ? 'Upgrade' : 'Downgrade'} to ${plan.name}`}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div>
        {sectionLabel('Billing History')}
        <div style={{ background: 'var(--surface-1)', border: '0.5px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
          {invoicesLoading ? (
            <div style={{ padding: '48px 24px', textAlign: 'center' }}>
              <Loader2 size={20} style={{ color: 'var(--text-muted)', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
            </div>
          ) : invoices.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <FileText size={16} style={{ color: 'var(--text-muted)' }} />
              </div>
              <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', margin: '0 0 6px' }}>No billing history yet</p>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>Invoices will appear here after your first payment</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '0.5px solid var(--border-soft)' }}>
                    {['Invoice', 'Date', 'Amount', 'Status', ''].map((h, i) => (
                      <th key={i} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} style={{ borderBottom: '0.5px solid var(--border-soft)', transition: 'background 120ms ease' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.015)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>{invoice.number}</span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{formatDate(invoice.created)}</span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>{formatCurrency(invoice.total, invoice.currency)}</span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>{invoiceStatusChip(invoice.status)}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => window.open(invoice.hosted_invoice_url, '_blank')}
                            style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 500, padding: '5px 10px', borderRadius: '5px', background: 'none', border: '0.5px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 180ms ease' }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--text)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                          >
                            <ExternalLink size={11} /> View
                          </button>
                          <button
                            onClick={() => window.open(invoice.invoice_pdf, '_blank')}
                            style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 500, padding: '5px 10px', borderRadius: '5px', background: 'none', border: '0.5px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 180ms ease' }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--text)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                          >
                            <Download size={11} /> PDF
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {billingPlan?.plan && billingPlan.plan !== 'free' && !billingPlan.cancels_at_period_end && (
        <div>
          {sectionLabel('Cancel Subscription')}
          <div style={{ background: 'rgba(239,68,68,0.04)', border: '0.5px solid rgba(239,68,68,0.15)', borderRadius: '10px', padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(239,68,68,0.08)', border: '0.5px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <AlertTriangle size={14} style={{ color: '#f87171' }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--text)', margin: '0 0 6px' }}>Cancel your subscription</p>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 16px', lineHeight: 1.5 }}>
                  Your subscription will remain active until the end of your current billing period. After that, your account will be downgraded to the free plan.
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      disabled={cancelLoading}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        fontSize: '13px', fontWeight: 500, padding: '7px 14px', borderRadius: '6px',
                        background: 'rgba(239,68,68,0.08)', border: '0.5px solid rgba(239,68,68,0.25)',
                        color: '#f87171', cursor: cancelLoading ? 'not-allowed' : 'pointer',
                        opacity: cancelLoading ? 0.6 : 1, transition: 'all 180ms ease',
                      }}
                    >
                      {cancelLoading ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : null}
                      Cancel Subscription
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent style={{ background: 'var(--surface-1)', border: '0.5px solid var(--border)' }}>
                    <AlertDialogHeader>
                      <AlertDialogTitle style={{ color: 'var(--text)' }}>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription style={{ color: 'var(--text-muted)' }}>
                        Your subscription will be cancelled at the end of the current billing period. You will retain access to your current plan features until {billingPlan?.current_period_end ? new Date(billingPlan.current_period_end).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'the end of the period'}.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                      <AlertDialogAction onClick={handleCancelSubscription} className="bg-red-600 hover:bg-red-700">
                        Cancel Subscription
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}