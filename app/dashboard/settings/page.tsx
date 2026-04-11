'use client';

import { useState, useEffect } from 'react';
import { Check, RefreshCw, ExternalLink, Trash2, TriangleAlert as AlertTriangle, Loader as Loader2, Zap, Link as LinkIcon } from 'lucide-react';
import { useProduct } from '@/contexts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProductOverview } from '@/lib/types';
import { api } from '@/lib/api';

export default function SettingsPage() {
  const { currentProduct } = useProduct();
  const [isLoading, setIsLoading] = useState(true);
  const [overview, setOverview] = useState<ProductOverview | null>(null);

  useEffect(() => {
    if (currentProduct?.id) {
      loadOverview();
    }
  }, [currentProduct?.id]);

  const loadOverview = async () => {
    if (!currentProduct?.id) return;
    try {
      setIsLoading(true);
      const data = await api.getProductOverview(currentProduct.id);
      setOverview(data);
    } catch (error) {
      console.error('Failed to load overview:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const stripeConnected = overview?.onboarding.stripe_connected ?? false;

  const permissions = [
    { name: 'Manage Roles' },
    { name: 'Send Messages' },
    { name: 'Read Messages' },
    { name: 'Manage Members' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Settings</h1>
        <p className="text-sm text-slate-400">Manage your product configuration and integrations</p>
      </div>

      <Card className="p-6 bg-slate-800/40 border-slate-700/50">
        <h2 className="text-base font-semibold mb-5 text-slate-200">Product Information</h2>
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-slate-700/60 flex items-center justify-center flex-shrink-0">
            <svg className="w-8 h-8 text-slate-300" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-slate-100 mb-0.5">
              {currentProduct?.guildName || currentProduct?.name || 'Discord Server'}
            </h3>
            <p className="text-sm text-slate-500 font-mono mb-3">
              {overview?.discord_guild_id || currentProduct?.discord_guild_id}
            </p>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-medium text-emerald-400">Active</span>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-slate-800/40 border-slate-700/50">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-slate-200">Discord Integration</h2>
          <svg className="w-6 h-6 text-slate-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
          </svg>
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg bg-emerald-950/30 border border-emerald-800/30 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600/20 border border-emerald-600/30 flex items-center justify-center">
              <Check className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-200">Bot installed & active</p>
              <p className="text-xs text-slate-500 mt-0.5">All required permissions are granted</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-medium text-emerald-400">Online</span>
          </div>
        </div>

        <div className="mb-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Required permissions</p>
          <div className="grid grid-cols-2 gap-y-2.5 gap-x-4">
            {permissions.map((permission, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                <span className="text-slate-400">{permission.name}</span>
              </div>
            ))}
          </div>
        </div>

        <Button variant="outline" className="w-full border-slate-700 text-slate-300 hover:bg-slate-700/50 hover:text-slate-100">
          <RefreshCw className="w-4 h-4 mr-2" />
          Reauthorize Discord
        </Button>
      </Card>

      <Card className="p-6 bg-slate-800/40 border-slate-700/50">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-slate-200">Stripe Integration</h2>
          <svg className="w-12 h-5" viewBox="0 0 60 25" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 0 1-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.26-.06 1.48zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58h4.25c0-1.85-1.07-2.58-2.08-2.58zM40.95 20.3c-1.44 0-2.32-.6-2.9-1.04l-.02 4.63-4.12.87V5.57h3.76l.08 1.02a4.7 4.7 0 0 1 3.23-1.29c2.9 0 5.62 2.6 5.62 7.4 0 5.23-2.7 7.6-5.65 7.6zM40 8.95c-.95 0-1.54.34-1.97.81l.02 6.12c.4.44.98.78 1.95.78 1.52 0 2.54-1.65 2.54-3.87 0-2.15-1.04-3.84-2.54-3.84zM28.24 5.57h4.13v14.44h-4.13V5.57zm0-4.7L32.37 0v3.36l-4.13.88V.88zm-4.32 9.35v9.79H19.8V5.57h3.7l.12 1.22c1-1.77 3.07-1.41 3.62-1.22v3.79c-.52-.17-2.29-.43-3.32.86zm-8.55 4.72c0 2.43 2.6 1.68 3.12 1.46v3.36c-.55.3-1.54.54-2.89.54a4.15 4.15 0 0 1-4.27-4.24l.01-13.17 4.02-.86v3.54h3.14V9.1h-3.13v5.85zm-4.91.7c0 2.97-2.31 4.66-5.73 4.66a11.2 11.2 0 0 1-4.46-.93v-3.93c1.38.75 3.1 1.31 4.46 1.31.92 0 1.53-.24 1.53-1C6.26 13.77 0 14.51 0 9.95 0 7.04 2.28 5.3 5.62 5.3c1.36 0 2.72.2 4.09.75v3.88a9.23 9.23 0 0 0-4.1-1.06c-.86 0-1.44.25-1.44.93 0 1.85 6.29.97 6.29 5.88z" fill="#94a3b8"/>
          </svg>
        </div>

        {stripeConnected ? (
          <>
            <div className="flex items-center justify-between p-4 rounded-lg bg-emerald-950/30 border border-emerald-800/30 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-600/20 border border-emerald-600/30 flex items-center justify-center">
                  <Check className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-200">Account connected</p>
                  <p className="text-xs text-slate-500 mt-0.5">Payments are enabled on your pages</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-medium text-emerald-400">Connected</span>
              </div>
            </div>

            <div className="flex gap-3">
              {overview?.stripe_dashboard_url && (
                <a href={overview.stripe_dashboard_url} target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button variant="outline" className="w-full border-slate-700 text-slate-300 hover:bg-slate-700/50 hover:text-slate-100">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Manage in Stripe
                  </Button>
                </a>
              )}
              {overview?.stripe_connect_url && (
                <a href={overview.stripe_connect_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-700/50 hover:text-slate-100">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reconnect
                  </Button>
                </a>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between p-4 rounded-lg bg-amber-950/20 border border-amber-700/30 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-200">Not connected</p>
                  <p className="text-xs text-slate-500 mt-0.5">Connect Stripe to enable payments on your pages</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-xs font-medium text-amber-400">Required</span>
              </div>
            </div>

            {overview?.stripe_connect_url && (
              <a href={overview.stripe_connect_url} target="_blank" rel="noopener noreferrer" className="block">
                <Button className="w-full bg-sky-600 hover:bg-sky-500 text-white">
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Connect Stripe Account
                </Button>
              </a>
            )}
          </>
        )}
      </Card>

      <Card className="p-6 bg-red-950/10 border-red-900/30">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <h2 className="text-base font-semibold text-red-400">Danger Zone</h2>
        </div>

        <div className="p-4 rounded-lg bg-red-950/20 border border-red-900/30">
          <h3 className="text-sm font-semibold text-slate-200 mb-1.5">Delete Product</h3>
          <p className="text-sm text-slate-500 mb-4">
            Permanently removes all monetized roles and member associations. This action cannot be undone.
          </p>
          <Button variant="outline" className="border-red-900/50 text-red-400 hover:bg-red-950/40 hover:border-red-800/60 hover:text-red-300">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Product
          </Button>
        </div>
      </Card>
    </div>
  );
}
