'use client';

import { useState } from 'react';
import { Share2, CreditCard as Edit, Code, Copy, Shield, Crown, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AccessPage } from '@/lib/types';

interface AccessPageCardProps {
  page: AccessPage;
  gradientClass: string;
}

export function AccessPageCard({ page, gradientClass }: AccessPageCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(page.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getIcon = () => {
    const name = page.name.toLowerCase();
    if (name.includes('vip') || name.includes('premium')) return Shield;
    if (name.includes('pro') || name.includes('creator')) return Crown;
    return Zap;
  };

  const Icon = getIcon();

  return (
    <Card className="overflow-hidden bg-slate-900/60 border-slate-800/50 hover:border-slate-700/50 transition-all hover:shadow-lg">
      <div className={`h-40 ${gradientClass} relative flex items-center justify-center`}>
        <Icon className="h-16 w-16 text-white/30" />
      </div>

      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-semibold mb-2">{page.name}</h3>
          <p className="text-3xl font-bold mb-3">
            ${(page.price / 100).toFixed(2)}
            <span className="text-base font-normal text-slate-400">/{page.interval}</span>
          </p>
        </div>

        <div className="flex items-center gap-4 mb-4 text-sm">
          <div>
            <span className="text-slate-400">Active: </span>
            <span className="font-semibold">{page.activeMembers}</span>
          </div>
          <div>
            <span className="text-slate-400">Trialing: </span>
            <span className="font-semibold">{page.trialingMembers}</span>
          </div>
          <div>
            <span className="text-slate-400">Canceling: </span>
            <span className="font-semibold">{page.cancelingMembers}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-slate-800/60 border border-slate-700/50">
          <Copy className="h-4 w-4 text-slate-400 flex-shrink-0" />
          <code className="text-xs text-slate-300 flex-1 truncate">{page.url}</code>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
            onClick={handleCopy}
          >
            <Share2 className="h-4 w-4 mr-1" />
            Share
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-slate-700 hover:bg-slate-800"
          >
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-slate-700 hover:bg-slate-800"
          >
            <Code className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
