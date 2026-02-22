'use client';

import { useState } from 'react';
import { CreditCard, ShoppingBag, Users, Check, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';

interface UsageStats {
  products: { current: number; limit: number };
  roles: { current: number; limit: number };
  members: { current: number; limit: string };
}

interface Plan {
  name: string;
  price: number;
  period?: string;
  features: string[];
  isPopular?: boolean;
  isCurrent?: boolean;
  buttonText: string;
  buttonVariant: 'default' | 'outline' | 'secondary';
}

export default function BillingPage() {
  const [currentPlan] = useState('FREE PLAN');
  const [planStatus] = useState('Active');

  const usage: UsageStats = {
    products: { current: 1, limit: 1 },
    roles: { current: 2, limit: 2 },
    members: { current: 247, limit: 'unlimited' }
  };

  const plans: Plan[] = [
    {
      name: 'Free',
      price: 0,
      features: ['1 product', '2 roles', 'GuildPay branding'],
      isCurrent: true,
      buttonText: 'Current Plan',
      buttonVariant: 'outline'
    },
    {
      name: 'Pro',
      price: 15,
      period: 'per month',
      features: [
        '3 products',
        '20 roles',
        'No branding',
        'Basic analytics',
        'Priority support'
      ],
      isPopular: true,
      buttonText: 'Upgrade to Pro',
      buttonVariant: 'default'
    },
    {
      name: 'Scale',
      price: 39,
      period: 'per month',
      features: [
        'Unlimited products',
        'Unlimited roles',
        'Advanced analytics',
        'Team access',
        'API access',
        'White-label checkout'
      ],
      buttonText: 'Upgrade to Scale',
      buttonVariant: 'secondary'
    }
  ];

  const getProductsPercentage = () => {
    return (usage.products.current / usage.products.limit) * 100;
  };

  const getRolesPercentage = () => {
    return (usage.roles.current / usage.roles.limit) * 100;
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
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold">{currentPlan}</h2>
              <Badge className="bg-green-600 hover:bg-green-600 text-white">
                {planStatus}
              </Badge>
            </div>
            <p className="text-base text-muted-foreground mb-1">
              Up to 1 product · 2 monetized roles
            </p>
            <p className="text-sm text-muted-foreground">
              Perfect for getting started with Discord monetization
            </p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            Upgrade to Pro
          </Button>
        </div>
      </Card>

      <div>
        <h2 className="text-xl font-semibold mb-4">Usage</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 bg-slate-900/40 border-slate-800/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShoppingBag className="h-4 w-4" />
                <span>Products</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                {usage.products.current}/{usage.products.limit}
              </div>
              <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-yellow-500 transition-all"
                  style={{ width: `${getProductsPercentage()}%` }}
                />
              </div>
              <p className="text-xs text-yellow-500">At limit</p>
            </div>
          </Card>

          <Card className="p-6 bg-slate-900/40 border-slate-800/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CreditCard className="h-4 w-4" />
                <span>Roles</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                {usage.roles.current}/{usage.roles.limit}
              </div>
              <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-yellow-500 transition-all"
                  style={{ width: `${getRolesPercentage()}%` }}
                />
              </div>
              <p className="text-xs text-yellow-500">At limit</p>
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
              <div className="text-2xl font-bold">{usage.members.current}</div>
              <p className="text-xs text-muted-foreground">Active members</p>
            </div>
          </Card>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`p-6 relative ${
                plan.isPopular
                  ? 'bg-blue-950/30 border-blue-600'
                  : 'bg-slate-900/40 border-slate-800/50'
              }`}
            >
              {plan.isPopular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 hover:bg-blue-600 text-white">
                  Most Popular
                </Badge>
              )}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  {plan.period && (
                    <span className="text-sm text-muted-foreground">
                      {plan.period}
                    </span>
                  )}
                </div>
              </div>
              <div className="space-y-3 mb-6">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              <Button
                className={`w-full ${
                  plan.isCurrent
                    ? 'bg-slate-800 hover:bg-slate-800 text-muted-foreground cursor-default'
                    : plan.isPopular
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
                disabled={plan.isCurrent}
              >
                {plan.buttonText}
              </Button>
            </Card>
          ))}
        </div>
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
    </div>
  );
}
