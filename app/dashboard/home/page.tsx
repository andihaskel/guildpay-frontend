'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, FileText, Loader as Loader2 } from 'lucide-react';
import { useProduct } from '@/contexts';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { OnboardingChecklist } from '@/components/dashboard/OnboardingChecklist';
import { AccessPageListItem } from '@/components/dashboard/AccessPageListItem';
import { AccessPage, OnboardingStatus } from '@/lib/types';
import { api } from '@/lib/api';

export default function HomePage() {
  const router = useRouter();
  const { currentProduct } = useProduct();
  const [isLoading, setIsLoading] = useState(true);
  const [pages, setPages] = useState<AccessPage[]>([]);
  const [payingMembers, setPayingMembers] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus>({
    has_page: false,
    stripe_connected: false,
    has_guildpay_subscription: false,
  });
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);

  useEffect(() => {
    if (currentProduct?.id) {
      loadData();
    }
  }, [currentProduct?.id]);

  const loadData = async () => {
    if (!currentProduct?.id) return;

    try {
      setIsLoading(true);

      const [overview, pagesData] = await Promise.all([
        api.getProductOverview(currentProduct.id),
        api.getPages(currentProduct.id, 'popular'),
      ]);

      setPages(pagesData);
      setPayingMembers(overview.paying_members);
      setMonthlyRevenue(overview.monthly_revenue);

      setOnboardingStatus({
        has_page: overview.onboarding.has_page,
        stripe_connected: overview.onboarding.stripe_connected,
        has_guildpay_subscription: overview.onboarding.has_guildpay_subscription,
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

  const isOnboardingComplete =
    onboardingStatus.has_page &&
    onboardingStatus.stripe_connected &&
    onboardingStatus.has_guildpay_subscription;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">
        {currentProduct?.name || 'Gaming Community'}
      </h1>

      {!onboardingDismissed && !isOnboardingComplete && (
        <OnboardingChecklist
          status={onboardingStatus}
          onDismiss={handleDismissOnboarding}
        />
      )}

      <div>
        {!isLoading && pages.length > 0 && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Your access pages</h2>
            <Button
              variant="outline"
              className="border-slate-700 hover:bg-slate-800"
              onClick={() => router.push('/dashboard/pages/edit')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create page
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : pages.length === 0 ? (
          <Card className="p-12 bg-slate-900/40 border-slate-800/50">
            <EmptyState
              icon={FileText}
              title="Create your first access page"
              description="Set up a page where your community members can purchase access to exclusive content and perks"
              action={{
                label: '+ Create page',
                onClick: () => router.push('/dashboard/pages/edit'),
              }}
            />
          </Card>
        ) : (
          <>
            <div className="flex items-center gap-6 mb-4 text-sm">
              <span>
                <span className="font-semibold text-lg">{payingMembers}</span> <span className="text-slate-400">paying members</span>
              </span>
              <span className="text-slate-600">•</span>
              <span>
                <span className="font-semibold text-lg">${(monthlyRevenue / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> <span className="text-slate-400">/mo</span>
              </span>
            </div>

            <div className="space-y-3">
              {pages.map((page) => (
                <AccessPageListItem key={page.id} page={page} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
