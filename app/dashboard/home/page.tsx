'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, FileText, Loader as Loader2 } from 'lucide-react';
import { useProduct } from '@/contexts';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { OnboardingChecklist } from '@/components/dashboard/OnboardingChecklist';
import { AccessPageCard } from '@/components/dashboard/AccessPageCard';
import { AccessPage, OnboardingStatus } from '@/lib/types';

const gradients = [
  'bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700',
  'bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600',
  'bg-gradient-to-br from-orange-500 via-orange-600 to-red-600',
];

export default function HomePage() {
  const router = useRouter();
  const { currentProduct } = useProduct();
  const [isLoading, setIsLoading] = useState(true);
  const [pages, setPages] = useState<AccessPage[]>([]);
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus>({
    discordConnected: false,
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
        discordConnected: currentProduct.bot_installed,
        firstPageCreated: mockPages.length > 0,
        linkShared: mockPages.some(p => p.activeMembers > 0),
      });

      const dismissed = localStorage.getItem('onboarding_dismissed');
      setOnboardingDismissed(dismissed === 'true');
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          {currentProduct?.name || 'Gaming Community'}
        </h1>
        <Button
          className="bg-purple-600 hover:bg-purple-700 text-white"
          onClick={() => router.push('/dashboard/pages/create')}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create page
        </Button>
      </div>

      {!onboardingDismissed && !isOnboardingComplete && (
        <OnboardingChecklist
          status={onboardingStatus}
          onDismiss={handleDismissOnboarding}
        />
      )}

      <div>
        <h2 className="text-xl font-semibold mb-6">Your access pages</h2>

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pages.map((page, index) => (
              <AccessPageCard
                key={page.id}
                page={page}
                gradientClass={gradients[index % gradients.length]}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
