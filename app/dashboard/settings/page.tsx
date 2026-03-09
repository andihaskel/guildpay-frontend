'use client';

import { Check, RefreshCw, ExternalLink, Trash2, AlertTriangle } from 'lucide-react';
import { useProduct } from '@/contexts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function SettingsPage() {
  const { currentProduct } = useProduct();

  const permissions = [
    { name: 'Manage Roles', granted: true },
    { name: 'Send Messages', granted: true },
    { name: 'Read Messages', granted: true },
    { name: 'Manage Members', granted: true },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your product configuration
        </p>
      </div>

      <Card className="p-6 bg-slate-900/40 border-slate-800/50">
        <h2 className="text-xl font-semibold mb-4">Product Information</h2>
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-9 h-9 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-1">
              {currentProduct?.guildName || 'Gaming Community'}
            </h3>
            <p className="text-sm text-muted-foreground mb-1">
              Guild ID: {currentProduct?.discord_guild_id || '847392018394728'}
            </p>
            <p className="text-sm text-muted-foreground mb-3">
              Created: March 15, 2024
            </p>
            <Badge className="bg-green-600 hover:bg-green-600 text-white">
              Active
            </Badge>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-slate-900/40 border-slate-800/50">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Discord Integration</h2>
          <svg className="w-8 h-8 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
          </svg>
        </div>

        <div className="p-4 rounded-lg bg-green-950/30 border border-green-800/30 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold">Bot Status</p>
                <p className="text-sm text-muted-foreground">Bot is installed and active</p>
              </div>
            </div>
            <span className="text-sm text-green-500 flex items-center gap-2">
              <Check className="w-4 h-4" />
              Installed
            </span>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-base font-semibold mb-4">Required Permissions</h3>
          <div className="grid grid-cols-2 gap-4">
            {permissions.map((permission, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-muted-foreground">{permission.name}</span>
              </div>
            ))}
          </div>
        </div>

        <Button className="w-full bg-blue-600 hover:bg-blue-700">
          <RefreshCw className="w-4 h-4 mr-2" />
          Reauthorize Discord
        </Button>
      </Card>

      <Card className="p-6 bg-slate-900/40 border-slate-800/50">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Stripe Integration</h2>
          <svg className="w-14 h-6" viewBox="0 0 60 25" fill="none">
            <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 0 1-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.26-.06 1.48zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58h4.25c0-1.85-1.07-2.58-2.08-2.58zM40.95 20.3c-1.44 0-2.32-.6-2.9-1.04l-.02 4.63-4.12.87V5.57h3.76l.08 1.02a4.7 4.7 0 0 1 3.23-1.29c2.9 0 5.62 2.6 5.62 7.4 0 5.23-2.7 7.6-5.65 7.6zM40 8.95c-.95 0-1.54.34-1.97.81l.02 6.12c.4.44.98.78 1.95.78 1.52 0 2.54-1.65 2.54-3.87 0-2.15-1.04-3.84-2.54-3.84zM28.24 5.57h4.13v14.44h-4.13V5.57zm0-4.7L32.37 0v3.36l-4.13.88V.88zm-4.32 9.35v9.79H19.8V5.57h3.7l.12 1.22c1-1.77 3.07-1.41 3.62-1.22v3.79c-.52-.17-2.29-.43-3.32.86zm-8.55 4.72c0 2.43 2.6 1.68 3.12 1.46v3.36c-.55.3-1.54.54-2.89.54a4.15 4.15 0 0 1-4.27-4.24l.01-13.17 4.02-.86v3.54h3.14V9.1h-3.13v5.85zm-4.91.7c0 2.97-2.31 4.66-5.73 4.66a11.2 11.2 0 0 1-4.46-.93v-3.93c1.38.75 3.1 1.31 4.46 1.31.92 0 1.53-.24 1.53-1C6.26 13.77 0 14.51 0 9.95 0 7.04 2.28 5.3 5.62 5.3c1.36 0 2.72.2 4.09.75v3.88a9.23 9.23 0 0 0-4.1-1.06c-.86 0-1.44.25-1.44.93 0 1.85 6.29.97 6.29 5.88z" fill="#6772e5"/>
          </svg>
        </div>

        <div className="p-4 rounded-lg bg-green-950/30 border border-green-800/30 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold">Account Status</p>
                <p className="text-sm text-muted-foreground">Connected & Verified</p>
              </div>
            </div>
            <span className="text-sm text-green-500 flex items-center gap-2">
              <Check className="w-4 h-4" />
              Connected
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Account ID</p>
            <p className="text-sm font-mono">acct_1Nx...7Y8Z</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Payout Status</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm font-medium">Active</span>
            </div>
          </div>
        </div>

        <Button className="w-full bg-purple-600 hover:bg-purple-700">
          <ExternalLink className="w-4 h-4 mr-2" />
          Manage in Stripe
        </Button>
      </Card>

      <Card className="p-6 bg-red-950/20 border-red-800/30">
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
          <div>
            <h2 className="text-xl font-semibold text-red-500">Danger Zone</h2>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-red-950/30 border border-red-800/30">
          <h3 className="font-semibold mb-2">Delete Product</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Deleting this product will remove all monetized roles and member associations. This action cannot be undone.
          </p>
          <Button className="bg-red-600 hover:bg-red-700">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Product
          </Button>
        </div>
      </Card>
    </div>
  );
}
