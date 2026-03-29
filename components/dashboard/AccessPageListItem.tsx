'use client';

import { Eye, Pencil, Share2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AccessPage } from '@/lib/types';
import { useState } from 'react';

interface AccessPageListItemProps {
  page: AccessPage;
}

export function AccessPageListItem({ page }: AccessPageListItemProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(page.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const coverImages: Record<string, string> = {
    '1': 'https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
    '2': 'https://images.pexels.com/photos/7862602/pexels-photo-7862602.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
    '3': 'https://images.pexels.com/photos/7862600/pexels-photo-7862600.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-slate-800/40 border border-slate-700/50 rounded-lg hover:border-slate-600/50 transition-colors">
      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-slate-700">
        <img
          src={coverImages[page.id] || coverImages['1']}
          alt={page.name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-lg mb-1">{page.name}</h3>
        <div className="flex items-center gap-3 text-sm mb-2">
          <div className="px-2 py-0.5 rounded bg-green-950/50 border border-green-900/50">
            <span className="text-green-400">Active: {page.activeMembers}</span>
          </div>
          <div className="px-2 py-0.5 rounded bg-blue-950/50 border border-blue-900/50">
            <span className="text-blue-400">Trialing: {page.trialingMembers}</span>
          </div>
          <div className="px-2 py-0.5 rounded bg-orange-950/50 border border-orange-900/50">
            <span className="text-orange-400">Canceling: {page.cancelingMembers}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Copy className="h-3 w-3" />
          <span className="truncate">{page.url}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="text-right mr-4">
          <div className="text-2xl font-bold">${(page.price / 100).toFixed(2)}</div>
          <div className="text-xs text-slate-400">/{page.interval}</div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-slate-400 hover:text-white"
        >
          <Eye className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-slate-400 hover:text-white"
        >
          <Pencil className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-slate-400 hover:text-white"
          onClick={handleCopy}
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
