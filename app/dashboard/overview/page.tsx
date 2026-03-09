'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DollarSign, Users, MoveHorizontal as MoreHorizontal, Loader as Loader2 } from 'lucide-react';
import { useProduct } from '@/contexts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { api } from '@/lib/api';
import { Role } from '@/lib/types';

export default function OverviewPage() {
  const router = useRouter();
  const { currentProduct } = useProduct();
  const [overview, setOverview] = useState<{
    payingMembers: number;
    monthlyRevenue: number;
  } | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentProduct?.id) {
      loadData();
    }
  }, [currentProduct?.id]);

  const loadData = async () => {
    if (!currentProduct?.id) return;

    try {
      setIsLoading(true);
      const [overviewData, rolesData] = await Promise.all([
        api.getProductOverview(currentProduct.id),
        api.getRoles(currentProduct.id),
      ]);

      setOverview(overviewData || { payingMembers: 0, monthlyRevenue: 0 });
      setRoles((rolesData || []).filter(role => role.isActive).slice(0, 5));
    } catch (error) {
      console.error('Failed to load overview data:', error);
      setOverview({ payingMembers: 0, monthlyRevenue: 0 });
      setRoles([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold mb-1">{currentProduct?.name || 'Gaming Community'}</h1>
          <p className="text-sm text-muted-foreground">Overview</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-green-600 hover:bg-green-600 text-white flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-white" />
            Bot Online
          </Badge>
          <Button className="bg-violet-600 hover:bg-violet-700" onClick={() => router.push('/dashboard/roles')}>
            + Add Role
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-8 bg-slate-900/40 border-slate-800/50">
            <div className="h-32 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          </Card>
          <Card className="p-8 bg-slate-900/40 border-slate-800/50">
            <div className="h-32 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-8 bg-slate-900/40 border-slate-800/50">
            <div className="flex items-start justify-between mb-6">
              <p className="text-sm text-slate-400 uppercase tracking-wide">Paying Members</p>
              <div className="p-2.5 rounded-lg bg-violet-600/20">
                <Users className="h-5 w-5 text-violet-400" />
              </div>
            </div>
            <p className="text-5xl font-semibold mb-3">
              {(overview?.payingMembers ?? 0).toLocaleString()}
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
              ${(overview?.monthlyRevenue ?? 0).toLocaleString()}
            </p>
          </Card>
        </div>
      )}

      <Card className="overflow-hidden bg-slate-900/40 border-slate-800/50">
        <div className="p-6 border-b border-slate-800/50">
          <h2 className="text-xl font-semibold">Monetized Roles</h2>
        </div>
        {isLoading ? (
          <div className="py-12 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : roles.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={Users}
              title="No monetized roles yet"
              description="Create your first role to start monetizing your Discord server"
              action={{
                label: '+ Create Role',
                onClick: () => router.push('/dashboard/roles')
              }}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/30">
                <tr className="text-left text-xs text-slate-400 uppercase tracking-wide">
                  <th className="py-4 px-6 font-medium">Role</th>
                  <th className="py-4 px-6 font-medium">Price</th>
                  <th className="py-4 px-6 font-medium">Members</th>
                  <th className="py-4 px-6 font-medium">Revenue</th>
                  <th className="py-4 px-6 font-medium">Status</th>
                  <th className="py-4 px-6 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((role) => {
                  const price = role.price || 0;
                  const memberCount = role.memberCount || 0;
                  const revenue = (price / 100) * memberCount;

                  return (
                    <tr key={role.id} className="border-b border-slate-800/50 last:border-0 hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{role.name || 'Unnamed Role'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span>${(price / 100).toFixed(2)}/{role.interval || 'month'}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-medium">{memberCount}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-medium">
                          ${revenue.toFixed(2)}/mo
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <Badge className="bg-green-600/20 text-green-400 hover:bg-green-600/20 border-0">
                          Active
                        </Badge>
                      </td>
                      <td className="py-4 px-6">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white">
                          <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
