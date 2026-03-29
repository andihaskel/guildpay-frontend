'use client';

import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ChartBar as BarChart3 } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold mb-1">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Track your community growth and revenue
        </p>
      </div>

      <Card className="p-12 bg-slate-900/40 border-slate-800/50">
        <EmptyState
          icon={BarChart3}
          title="Analytics coming soon"
          description="Track your community metrics, revenue trends, and member engagement"
        />
      </Card>
    </div>
  );
}
