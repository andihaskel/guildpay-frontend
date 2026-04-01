'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Share2, Pencil, Copy, Shield, Crown, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AccessPage } from '@/lib/types';

interface AccessPageCardProps {
  page: AccessPage;
  gradientClass: string;
}

export function AccessPageCard({ page, gradientClass }: AccessPageCardProps) {
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

  const handleShare = () => {
    setShareDialogOpen(true);
  };

  const getIcon = () => {
    const name = page.offer_name.toLowerCase();
    if (name.includes('vip') || name.includes('premium')) return Shield;
    if (name.includes('pro') || name.includes('creator')) return Crown;
    return Zap;
  };

  const Icon = getIcon();

  const isActive = page.active ?? true;

  return (
    <Card className={`overflow-hidden bg-slate-900/60 border-slate-800/50 hover:border-slate-700/50 transition-all hover:shadow-lg ${!isActive ? 'opacity-60' : ''}`}>
      <div className={`h-40 ${gradientClass} relative flex items-center justify-center`}>
        {page.hero_image_url ? (
          <img src={page.hero_image_url} alt={page.offer_name} className="w-full h-full object-cover" />
        ) : (
          <Icon className="h-16 w-16 text-white/30" />
        )}
      </div>

      <div className="p-6">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-semibold">{page.offer_name}</h3>
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className={`text-xs font-medium ${isActive ? 'text-green-400' : 'text-red-400'}`}>
                {isActive ? 'Active' : 'Disabled'}
              </span>
            </div>
          </div>
          <p className="text-3xl font-bold mb-3">
            ${(page.monthly_amount_minor / 100).toFixed(2)}
            <span className="text-base font-normal text-slate-400">/month</span>
          </p>
        </div>

        <div className="flex items-center gap-4 mb-4 text-sm">
          <div>
            <span className="text-slate-400">Active: </span>
            <span className="font-semibold">{page.member_counts.active}</span>
          </div>
          <div>
            <span className="text-slate-400">Trialing: </span>
            <span className="font-semibold">{page.member_counts.trialing}</span>
          </div>
          <div>
            <span className="text-slate-400">Canceling: </span>
            <span className="font-semibold">{page.member_counts.canceling}</span>
          </div>
        </div>

        <div
          className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-slate-800/60 border border-slate-700/50 cursor-pointer hover:bg-slate-800 hover:border-slate-600/50 transition-all active:scale-95"
          onClick={handleCopy}
          title="Click to copy link"
        >
          <Copy className={`h-4 w-4 flex-shrink-0 transition-colors ${copied ? 'text-green-400' : 'text-slate-400'}`} />
          <code className="text-xs text-slate-300 flex-1 truncate">{pageUrl}</code>
          {copied && (
            <span className="text-xs text-green-400 font-medium animate-in fade-in slide-in-from-right-2 duration-300">
              Copied!
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
            onClick={handleShare}
            disabled={!isActive}
          >
            <Share2 className="h-4 w-4 mr-1" />
            Share
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-slate-700 hover:bg-slate-800"
            onClick={() => router.push(`/dashboard/pages/edit?id=${page.id}`)}
          >
            <Pencil className="h-4 w-4 mr-1" />
            Edit
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
    </Card>
  );
}
