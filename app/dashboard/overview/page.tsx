'use client';

import { useAuth } from '@/contexts';

export default function OverviewPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">
        Welcome back, {user?.discordUsername || user?.username || 'there'}!
      </h1>
      <p className="text-slate-400">
        This is your overview page. Select a feature from the sidebar to get started.
      </p>
    </div>
  );
}
