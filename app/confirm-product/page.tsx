'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LOGO_SVG = (
  <svg className="w-4 h-4 text-primary-foreground" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

const NEXT_STEPS = [
  { label: 'Add paid roles', description: 'Create exclusive roles with special permissions' },
  { label: 'Set subscription prices', description: 'Define monthly or yearly pricing tiers' },
  { label: 'Manage members', description: 'Track subscriptions and revenue in real-time' },
];

export default function ConfirmProductPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isCreating, setIsCreating] = useState(false);

  const serverName = searchParams.get('name') || 'Selected Server';
  const serverId = searchParams.get('id') || '';
  const memberCount = searchParams.get('members') || '0';
  const onlineCount = Math.floor(parseInt(memberCount) * 0.42).toString();

  const handleBack = () => router.push('/select-server');
  const handleCreateProduct = async () => router.push('/dashboard/overview');

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="grain" aria-hidden="true" />
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-primary/5 rounded-full blur-[140px]" />
      </div>

      <header className="relative z-10 h-16 border-b border-border/30 bg-background/70 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
              {LOGO_SVG}
            </div>
            <span className="font-semibold text-base tracking-tight">GuildPay</span>
          </Link>
          <span className="text-sm text-muted-foreground">Step 3 of 3</span>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center py-16 px-6">
        <div className="w-full max-w-2xl">
          <div className="flex items-center justify-center mb-12">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
                <Check className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="w-16 h-px bg-primary" />
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
                <Check className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="w-16 h-px bg-border" />
              <div className="w-9 h-9 rounded-full bg-muted border border-border flex items-center justify-center text-sm font-semibold text-muted-foreground">
                3
              </div>
            </div>
          </div>

          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
              Confirm Your Product
            </h1>
            <p className="text-muted-foreground text-lg">
              You&apos;re about to start monetizing this Discord server.
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 mb-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                <svg className="w-9 h-9 text-primary-foreground" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <h2 className="text-lg font-semibold mb-0.5">{serverName}</h2>
                    <p className="text-xs text-muted-foreground font-mono">ID: {serverId || '123456789123456'}</p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-500/10 border border-green-500/20 flex-shrink-0">
                    <Check className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-green-500 font-medium">Bot Installed</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Members</p>
                    <p className="text-xl font-semibold">{parseInt(memberCount).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Online</p>
                    <p className="text-xl font-semibold">{parseInt(onlineCount).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Rocket className="h-4 w-4 text-primary" />
              </div>
              <h3 className="font-semibold">What Happens Next</h3>
            </div>
            <div className="space-y-4">
              {NEXT_STEPS.map((step, i) => (
                <div key={step.label} className="flex gap-3.5">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-0.5">{step.label}</h4>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              size="lg"
              onClick={handleBack}
              disabled={isCreating}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              size="lg"
              onClick={handleCreateProduct}
              disabled={isCreating}
              className="gap-2 font-semibold hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              {isCreating ? 'Creating...' : 'Create Product'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
