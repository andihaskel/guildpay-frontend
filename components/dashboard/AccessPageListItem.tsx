'use client';

import { Pencil, Share2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AccessPage } from '@/lib/types';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface AccessPageListItemProps {
  page: AccessPage;
}

export function AccessPageListItem({ page }: AccessPageListItemProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(page.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEdit = () => {
    router.push(`/dashboard/pages/edit?id=${page.id}`);
  };

  const handleShare = () => {
    setShareDialogOpen(true);
  };

  const coverImages: Record<string, string> = {
    '1': 'https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
    '2': 'https://images.pexels.com/photos/7862602/pexels-photo-7862602.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
    '3': 'https://images.pexels.com/photos/7862600/pexels-photo-7862600.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-slate-800/40 border border-slate-700/50 rounded-lg hover:border-slate-600/50 transition-colors">
      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-slate-700">
        <img
          src={coverImages[page.id] || coverImages['1']}
          alt={page.name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1 min-w-0 w-full sm:w-auto">
        <h3 className="font-semibold text-lg mb-1">{page.name}</h3>
        <div className="flex flex-wrap items-center gap-2 text-sm mb-2">
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
          <Copy className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">{page.url}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto sm:flex-shrink-0">
        <div className="text-left sm:text-right sm:mr-4 flex-1 sm:flex-initial">
          <div className="text-2xl font-bold">${(page.price / 100).toFixed(2)}</div>
          <div className="text-xs text-slate-400">/{page.interval}</div>
        </div>

        <div className="flex items-center gap-2 ml-auto sm:ml-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-slate-400 hover:text-white"
            onClick={handleEdit}
          >
            <Pencil className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-slate-400 hover:text-white"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle>Share access page</DialogTitle>
            <DialogDescription>
              Share this link with your community to allow them to purchase access to {page.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="flex items-center gap-2 p-3 bg-slate-800/50 border border-slate-700 rounded-lg">
              <code className="text-sm text-slate-300 flex-1 truncate">{page.url}</code>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="flex-shrink-0"
              >
                {copied ? 'Copied!' : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
