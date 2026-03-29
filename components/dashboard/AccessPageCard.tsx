'use client';

import { useState } from 'react';
import { Share2, CreditCard as Edit, Code, Copy, CircleCheck as CheckCircle2, CircleAlert as AlertCircle, Circle as XCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AccessPage } from '@/lib/types';

interface AccessPageCardProps {
  page: AccessPage;
}

export function AccessPageCard({ page }: AccessPageCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(page.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalMembers = page.activeMembers + page.trialingMembers + page.cancelingMembers;

  return (
    <Card className="overflow-hidden bg-slate-900/40 border-slate-800/50 hover:border-slate-700/50 transition-colors">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-48 h-48 md:h-auto bg-slate-800/50 flex-shrink-0">
          {page.coverImage ? (
            <img
              src={page.coverImage}
              alt={page.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-600">
              <Code className="h-12 w-12" />
            </div>
          )}
        </div>

        <div className="flex-1 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold mb-1">{page.name}</h3>
              {page.description && (
                <p className="text-sm text-slate-400">{page.description}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-2xl font-semibold">${(page.price / 100).toFixed(2)}/{page.interval}</p>
              <p className="text-xs text-slate-500 mt-1">Published {new Date(page.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="flex items-center gap-6 mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-400" />
              <span className="text-sm text-slate-300">Active</span>
              <span className="font-medium">{page.activeMembers}</span>
            </div>
            {page.trialingMembers > 0 && (
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-400" />
                <span className="text-sm text-slate-300">Trialing</span>
                <span className="font-medium">{page.trialingMembers}</span>
              </div>
            )}
            {page.cancelingMembers > 0 && (
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-400" />
                <span className="text-sm text-slate-300">Canceling</span>
                <span className="font-medium">{page.cancelingMembers}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
            <code className="text-sm text-blue-400 flex-1 truncate">{page.url}</code>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="flex-shrink-0"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-1 text-green-400" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-slate-700 hover:bg-slate-800"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-slate-700 hover:bg-slate-800"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-slate-700 hover:bg-slate-800"
            >
              <Code className="h-4 w-4 mr-2" />
              Embed
            </Button>
            <div className="ml-auto">
              <Badge
                className={page.isActive
                  ? "bg-green-600/20 text-green-400 hover:bg-green-600/20 border-0"
                  : "bg-slate-600/20 text-slate-400 hover:bg-slate-600/20 border-0"
                }
              >
                {page.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
