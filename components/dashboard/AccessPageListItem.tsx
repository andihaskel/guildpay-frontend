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

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const pageUrl = page.public_path ? `${baseUrl}${page.public_path}` : `${baseUrl}/p/${page.slug}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(pageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEdit = () => {
    router.push(`/dashboard/pages/edit?id=${page.id}`);
  };

  const handleShare = () => {
    setShareDialogOpen(true);
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-slate-800/40 border border-slate-700/50 rounded-lg hover:border-slate-600/50 transition-colors">
      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-slate-700">
        {page.hero_image_url ? (
          <img
            src={page.hero_image_url}
            alt={page.offer_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800" />
        )}
      </div>

      <div className="flex-1 min-w-0 w-full sm:w-auto">
        <h3 className="font-semibold text-lg mb-1">{page.offer_name}</h3>
        <div className="flex flex-wrap items-center gap-2 text-sm mb-2">
          <div className="px-2 py-0.5 rounded bg-green-950/50 border border-green-900/50">
            <span className="text-green-400">Active: {page.member_counts.active}</span>
          </div>
          <div className="px-2 py-0.5 rounded bg-blue-950/50 border border-blue-900/50">
            <span className="text-blue-400">Trialing: {page.member_counts.trialing}</span>
          </div>
          <div className="px-2 py-0.5 rounded bg-orange-950/50 border border-orange-900/50">
            <span className="text-orange-400">Canceling: {page.member_counts.canceling}</span>
          </div>
        </div>
        <div
          className="flex items-center gap-2 text-xs cursor-pointer hover:text-slate-300 transition-all active:scale-95 p-1 -ml-1 rounded group"
          onClick={handleCopy}
          title="Click to copy link"
        >
          <Copy className={`h-3 w-3 flex-shrink-0 transition-colors ${copied ? 'text-green-400' : 'text-slate-400 group-hover:text-slate-300'}`} />
          <span className={`truncate transition-colors ${copied ? 'text-green-400' : 'text-slate-400'}`}>{pageUrl}</span>
          {copied && (
            <span className="text-xs text-green-400 font-medium animate-in fade-in slide-in-from-right-2 duration-300 ml-1">
              Copied!
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto sm:flex-shrink-0">
        <div className="text-left sm:text-right sm:mr-4 flex-1 sm:flex-initial">
          <div className="text-2xl font-bold">${(page.monthly_amount_minor / 100).toFixed(2)}</div>
          <div className="text-xs text-slate-400">/month</div>
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
              Share this link with your community to allow them to purchase access to {page.offer_name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="flex items-center gap-2 p-3 bg-slate-800/50 border border-slate-700 rounded-lg">
              <code className="text-sm text-slate-300 flex-1 truncate">{pageUrl}</code>
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
