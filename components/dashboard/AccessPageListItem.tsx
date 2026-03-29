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

  return (
    <div className="flex items-center gap-4 p-4 bg-slate-800/40 border border-slate-700/50 rounded-lg hover:border-slate-600/50 transition-colors">
      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center flex-shrink-0">
        <span className="text-2xl">🎮</span>
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-lg mb-1">{page.name}</h3>
        <div className="flex items-center gap-4 text-sm">
          <div>
            <span className="text-green-400">Active: {page.activeMembers}</span>
          </div>
          <div>
            <span className="text-blue-400">Trialing: {page.trialingMembers}</span>
          </div>
          <div>
            <span className="text-orange-400">Canceling: {page.cancelingMembers}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
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
          size="icon"
          className="h-9 w-9 bg-purple-600 hover:bg-purple-700 text-white"
          onClick={handleCopy}
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
