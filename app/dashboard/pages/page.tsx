'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Loader as Loader2, FileText, Grid3x3, List } from 'lucide-react';
import { useProduct } from '@/contexts';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { AccessPageCard } from '@/components/dashboard/AccessPageCard';
import { AccessPageListItem } from '@/components/dashboard/AccessPageListItem';
import { AccessPage } from '@/lib/types';

type ViewMode = 'grid' | 'list';

export default function PagesPage() {
  const router = useRouter();
  const { currentProduct } = useProduct();
  const [isLoading, setIsLoading] = useState(true);
  const [pages, setPages] = useState<AccessPage[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  useEffect(() => {
    if (currentProduct?.id) {
      loadPages();
    }
  }, [currentProduct?.id]);

  const loadPages = async () => {
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
    } catch (error) {
      console.error('Failed to load pages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold mb-1">Access Pages</h1>
          <p className="text-sm text-muted-foreground">
            Manage your community access pages
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-slate-700 rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 w-8 p-0 ${viewMode === 'grid' ? 'bg-slate-800' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 w-8 p-0 ${viewMode === 'list' ? 'bg-slate-800' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => router.push('/dashboard/pages/edit')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create page
          </Button>
        </div>
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
              onClick: () => router.push('/dashboard/pages/edit'),
            }}
          />
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pages.map((page, index) => (
            <AccessPageCard
              key={page.id}
              page={page}
              gradientClass={['bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700', 'bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600', 'bg-gradient-to-br from-orange-500 via-orange-600 to-red-600'][index % 3]}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {pages.map((page) => (
            <AccessPageListItem key={page.id} page={page} />
          ))}
        </div>
      )}
    </div>
  );
}
