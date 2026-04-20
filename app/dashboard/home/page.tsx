'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, FileText, Zap, ExternalLink } from 'lucide-react';
import { useProduct } from '@/contexts';
import { OnboardingChecklist } from '@/components/dashboard/OnboardingChecklist';
import { AccessPageListItem } from '@/components/dashboard/AccessPageListItem';
import { AccessPage, OnboardingStatus, ProductOverview } from '@/lib/types';
import { api } from '@/lib/api';

export default function HomePage() {
  const router = useRouter();
  const { currentProduct } = useProduct();
  const [isLoading, setIsLoading] = useState(true);
  const [pages, setPages] = useState<AccessPage[]>([]);
  const [payingMembers, setPayingMembers] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus | null>(null);
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);
  const [overview, setOverview] = useState<ProductOverview | null>(null);

  useEffect(() => {
    if (currentProduct?.id) {
      loadData();
    }
  }, [currentProduct?.id]);

  const loadData = async () => {
    if (!currentProduct?.id) return;
    try {
      setIsLoading(true);
      const [overviewData, pagesData] = await Promise.all([
        api.getProductOverview(currentProduct.id),
        api.getPages(currentProduct.id, 'popular'),
      ]);
      setOverview(overviewData);
      setPages(pagesData);
      setPayingMembers(overviewData.paying_members);
      setMonthlyRevenue(overviewData.monthly_revenue);
      setOnboardingStatus({
        has_page: overviewData.onboarding.has_page,
        stripe_connected: overviewData.onboarding.stripe_connected,
        has_guildpay_subscription: overviewData.onboarding.has_guildpay_subscription ?? overviewData.onboarding.has_accessgate_subscription ?? false,
      });
      const dismissed = localStorage.getItem(`onboarding_dismissed_${currentProduct.id}`);
      setOnboardingDismissed(dismissed === 'true');
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismissOnboarding = () => {
    if (!currentProduct?.id) return;
    setOnboardingDismissed(true);
    localStorage.setItem(`onboarding_dismissed_${currentProduct.id}`, 'true');
  };

  const showStripeCta = !isLoading && overview && !overview.onboarding.stripe_connected;

  return (
    <div>
      <h1 style={{ fontSize: '20px', fontWeight: 500, color: 'var(--text)', margin: '0 0 28px', letterSpacing: '-0.015em' }}>
        {currentProduct?.name || 'Dashboard'}
      </h1>

      {showStripeCta && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
          padding: '14px 16px', borderRadius: '10px', marginBottom: '28px',
          background: 'rgba(245,158,11,0.06)', border: '0.5px solid rgba(245,158,11,0.2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'rgba(245,158,11,0.1)', border: '0.5px solid rgba(245,158,11,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Zap size={14} style={{ color: '#fbbf24' }} />
            </div>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 500, color: '#fbbf24', margin: '0 0 2px' }}>
                Connect Stripe to start receiving payments
              </p>
              <p style={{ fontSize: '12px', color: 'rgba(251,191,36,0.6)', margin: 0 }}>
                Your pages won't accept new members until Stripe is configured.
              </p>
            </div>
          </div>
          <a href={overview!.stripe_connect_url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <button style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '12.5px', fontWeight: 500, padding: '7px 14px', borderRadius: '6px',
              background: 'rgba(245,158,11,0.15)', border: '0.5px solid rgba(245,158,11,0.35)',
              color: '#fbbf24', cursor: 'pointer', transition: 'background 180ms ease',
            }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(245,158,11,0.25)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(245,158,11,0.15)')}
            >
              <ExternalLink size={12} />
              Connect Stripe
            </button>
          </a>
        </div>
      )}

      {!onboardingDismissed && (
        <OnboardingChecklist
          status={onboardingStatus}
          onDismiss={handleDismissOnboarding}
          isLoading={isLoading}
        />
      )}

      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', margin: 0 }}>
              Access Pages
            </p>
            {!isLoading && pages.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>{payingMembers}</span>
                  {' '}paying members
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>·</span>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>
                    ${(monthlyRevenue / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  {' '}/mo
                </span>
              </div>
            )}
          </div>
          {!isLoading && pages.length > 0 && (
            <button
              onClick={() => router.push('/dashboard/pages/edit')}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                fontSize: '12.5px', fontWeight: 500, padding: '6px 12px', borderRadius: '6px',
                background: 'var(--surface-2)', border: '0.5px solid var(--border-strong)',
                color: 'var(--text)', cursor: 'pointer', transition: 'background 180ms ease, border-color 180ms ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
            >
              <Plus size={13} />
              Create page
            </button>
          )}
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[1, 2].map(i => (
              <div key={i} style={{
                height: '76px', borderRadius: '10px',
                background: 'var(--surface-1)', border: '0.5px solid var(--border)',
              }} />
            ))}
          </div>
        ) : pages.length === 0 ? (
          <div style={{
            padding: '48px 24px', textAlign: 'center',
            background: 'var(--surface-1)', border: '0.5px solid var(--border)',
            borderRadius: '10px',
          }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '8px',
              background: 'var(--accent-soft-bg)', border: '0.5px solid var(--accent-soft-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 14px',
            }}>
              <FileText size={16} style={{ color: 'var(--accent-soft-text)' }} />
            </div>
            <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', margin: '0 0 6px' }}>
              Create your first access page
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 20px', maxWidth: '340px', marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.5 }}>
              Set up a page where your community members can purchase access to exclusive content and perks
            </p>
            <button
              onClick={() => router.push('/dashboard/pages/edit')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                fontSize: '13px', fontWeight: 500, padding: '8px 16px', borderRadius: '6px',
                background: 'var(--text)', color: 'var(--bg)', cursor: 'pointer',
                border: 'none', transition: 'opacity 180ms ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              <Plus size={13} />
              Create page
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {pages.map((page) => (
              <AccessPageListItem key={page.id} page={page} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
