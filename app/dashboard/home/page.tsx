'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Users, DollarSign, Loader as Loader2 } from 'lucide-react';
import { useProduct } from '@/contexts';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { OnboardingChecklist } from '@/components/dashboard/OnboardingChecklist';
import { AccessPageCard } from '@/components/dashboard/AccessPageCard';
import { AccessPage, OnboardingStatus } from '@/lib/types';

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
  const [metrics, setMetrics] = useState({
    totalMembers: 0,
    monthlyRevenue: 0,
  });

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
          name: 'VIP Access',
          description: 'Premium community access with exclusive perks',
          coverImage: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=400',
          price: 1000,
          interval: 'month',
          url: `https://guildpay.io/${currentProduct.name.toLowerCase().replace(/\s+/g, '-')}/vip`,
          isActive: true,
          activeMembers: 24,
          trialingMembers: 3,
          cancelingMembers: 1,
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          productId: currentProduct.id,
          name: 'Early Access',
          description: 'Get early access to new features and content',
          coverImage: 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=400',
          price: 500,
          interval: 'month',
          url: `https://guildpay.io/${currentProduct.name.toLowerCase().replace(/\s+/g, '-')}/early-access`,
          isActive: true,
          activeMembers: 42,
          trialingMembers: 5,
          cancelingMembers: 2,
          createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      setPages(mockPages);

      const totalMembers = mockPages.reduce((sum, page) => sum + page.activeMembers, 0);
      const totalRevenue = mockPages.reduce((sum, page) => sum + (page.price * page.activeMembers), 0);

      setMetrics({
        totalMembers,
        monthlyRevenue: totalRevenue,
      });

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
        <div>
          <h1 className="text-3xl font-semibold mb-1">
            Hi {currentProduct?.name || 'there'}
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your access pages and grow your community
          </p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Your access pages</h2>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : pages.length === 0 ? (
          <Card className="p-12 bg-slate-900/40 border-slate-800/50">
            <EmptyState
              icon={Users}
              title="Create your first access page"
              description="Set up a page where your community members can purchase access to exclusive content and perks"
              action={{
                label: '+ Create page',
                onClick: () => router.push('/dashboard/pages/create'),
              }}
            />
          </Card>
        ) : (
          <div className="space-y-4">
            {pages.map((page) => (
              <AccessPageCard key={page.id} page={page} />
            ))}
          </div>
        )}
      </div>

      {pages.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          <Card className="p-8 bg-slate-900/40 border-slate-800/50">
            <div className="flex items-start justify-between mb-6">
              <p className="text-sm text-slate-400 uppercase tracking-wide">Total Paying Members</p>
              <div className="p-2.5 rounded-lg bg-violet-600/20">
                <Users className="h-5 w-5 text-violet-400" />
              </div>
            </div>
            <p className="text-5xl font-semibold mb-3">
              {metrics.totalMembers.toLocaleString()}
            </p>
          </Card>

          <Card className="p-8 bg-slate-900/40 border-slate-800/50">
            <div className="flex items-start justify-between mb-6">
              <p className="text-sm text-slate-400 uppercase tracking-wide">Monthly Revenue</p>
              <div className="p-2.5 rounded-lg bg-green-600/20">
                <DollarSign className="h-5 w-5 text-green-400" />
              </div>
            </div>
            <p className="text-5xl font-semibold mb-3">
              ${(metrics.monthlyRevenue / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}
