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

export default function HomePage() {
  const router = useRouter();
  const { currentProduct } = useProduct();
  const [isLoading, setIsLoading] = useState(true);
  const [pages, setPages] = useState<AccessPage[]>([]);
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus>({
    discordConnected: true,
    firstPageCreated: false,
    linkShared: false,
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

      const mockPages: AccessPage[] = [
        {
          id: '1',
          productId: currentProduct.id,
          name: 'VIP Member',
          description: 'Premium community access with exclusive perks',
          price: 999,
          interval: 'month',
          url: `guildpay.com/vip-member`,
          isActive: true,
          activeMembers: 247,
          trialingMembers: 12,
          cancelingMembers: 3,
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          productId: currentProduct.id,
          name: 'Pro Creator',
          description: 'Get early access to new features and content',
          price: 1999,
          interval: 'month',
          url: `guildpay.com/pro-creator`,
          isActive: true,
          activeMembers: 156,
          trialingMembers: 8,
          cancelingMembers: 2,
          createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '3',
          productId: currentProduct.id,
          name: 'Premium Access',
          description: 'Full access to all premium features',
          price: 499,
          interval: 'month',
          url: `guildpay.com/premium-access`,
          isActive: true,
          activeMembers: 89,
          trialingMembers: 12,
          cancelingMembers: 1,
          createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      setPages(mockPages);

      setOnboardingStatus({
        discordConnected: true,
        firstPageCreated: false,
        linkShared: false,
      });

      const dismissed = localStorage.getItem('onboarding_dismissed');
      setOnboardingDismissed(false);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismissOnboarding = () => {
    setOnboardingDismissed(true);
    localStorage.setItem('onboarding_dismissed', 'true');
  };

  const isOnboardingComplete =
    onboardingStatus.discordConnected &&
    onboardingStatus.firstPageCreated &&
    onboardingStatus.linkShared;

  const totalMembers = pages.reduce((sum, page) => sum + page.activeMembers, 0);
  const totalRevenue = pages.reduce((sum, page) => sum + (page.price * page.activeMembers) / 100, 0);

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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Your access pages</h2>
          <Button
            variant="outline"
            className="border-slate-700 hover:bg-slate-800"
            onClick={() => router.push('/dashboard/pages/create')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create page
          </Button>
        </div>

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
                onClick: () => router.push('/dashboard/pages/create'),
              }}
            />
          </Card>
        ) : (
          <>
            <div className="flex items-center gap-6 mb-4 text-sm">
              <span>
                <span className="font-semibold text-lg">{totalMembers}</span> <span className="text-slate-400">paying members</span>
              </span>
              <span className="text-slate-600">•</span>
              <span>
                <span className="font-semibold text-lg">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> <span className="text-slate-400">/mo</span>
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
