'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DollarSign, Users, MoreHorizontal } from 'lucide-react';
import { useProduct } from '@/contexts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface MonetizedRole {
  id: string;
  icon: string;
  name: string;
  price: string;
  members: number;
  revenue: string;
  status: 'active' | 'disabled';
}

export default function OverviewPage() {
  const router = useRouter();
  const { currentProduct } = useProduct();

  const monetizedRoles: MonetizedRole[] = [
    {
      id: '1',
      icon: '👑',
      name: 'VIP Member',
      price: '$9.99/month',
      members: 247,
      revenue: '$2,467/mo',
      status: 'active',
    },
    {
      id: '2',
      icon: '⭐',
      name: 'Elite Access',
      price: '$19.99/month',
      members: 156,
      revenue: '$3,118/mo',
      status: 'active',
    },
    {
      id: '3',
      icon: '💚',
      name: 'Supporter',
      price: '$4.99/month',
      members: 89,
      revenue: '$444/mo',
      status: 'active',
    },
  ];

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-8 bg-slate-900/40 border-slate-800/50">
          <div className="flex items-start justify-between mb-6">
            <p className="text-sm text-slate-400 uppercase tracking-wide">Paying Members</p>
            <div className="p-2.5 rounded-lg bg-violet-600/20">
              <Users className="h-5 w-5 text-violet-400" />
            </div>
          </div>
          <p className="text-5xl font-semibold mb-3">1,247</p>
          <p className="text-sm text-green-500">+89 this week</p>
        </Card>

        <Card className="p-8 bg-slate-900/40 border-slate-800/50">
          <div className="flex items-start justify-between mb-6">
            <p className="text-sm text-slate-400 uppercase tracking-wide">Monthly Revenue</p>
            <div className="p-2.5 rounded-lg bg-green-600/20">
              <DollarSign className="h-5 w-5 text-green-400" />
            </div>
          </div>
          <p className="text-5xl font-semibold mb-3">$8,456</p>
          <p className="text-sm text-green-500">+12.5% vs last month</p>
        </Card>
      </div>

      <Card className="overflow-hidden bg-slate-900/40 border-slate-800/50">
        <div className="p-6 border-b border-slate-800/50">
          <h2 className="text-xl font-semibold">Monetized Roles</h2>
        </div>
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
              {monetizedRoles.map((role) => (
                <tr key={role.id} className="border-b border-slate-800/50 last:border-0 hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 flex items-center justify-center text-xl">
                        {role.icon}
                      </div>
                      <span className="font-medium">{role.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span>{role.price}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-medium">{role.members}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-medium">{role.revenue}</span>
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
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
