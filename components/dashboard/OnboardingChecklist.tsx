'use client';

import { X, FileText, CreditCard, Award } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OnboardingStatus } from '@/lib/types';

interface OnboardingChecklistProps {
  status: OnboardingStatus;
  onDismiss: () => void;
}

export function OnboardingChecklist({ status, onDismiss }: OnboardingChecklistProps) {
  const isComplete = status.discordConnected && status.firstPageCreated && status.linkShared;

  if (isComplete) {
    return null;
  }

  const steps = [
    {
      id: 'discord',
      number: 1,
      title: 'Connect your Discord server',
      description: 'Link your Discord server to start managing access',
      completed: status.discordConnected,
      action: status.discordConnected ? null : {
        label: 'Connect Discord',
        onClick: () => window.location.href = '/install-bot',
      },
    },
    {
      id: 'page',
      number: 2,
      title: 'Create your first access page',
      description: 'Create a signup page to allow your users to join your community',
      completed: status.firstPageCreated,
      action: status.firstPageCreated ? null : {
        label: 'Create page',
        onClick: () => window.location.href = '/dashboard/pages/create',
      },
    },
    {
      id: 'share',
      number: 3,
      title: 'Share your link',
      description: 'Start getting members by sharing your access page',
      completed: status.linkShared,
      action: status.linkShared ? null : {
        label: 'Share',
        onClick: () => window.location.href = '/dashboard/pages',
      },
    },
  ];

  return (
    <Card className="p-6 bg-gradient-to-br from-purple-900/20 to-purple-800/10 border-purple-700/30 mb-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold mb-1">Get started with GuildPay</h3>
          <p className="text-sm text-slate-400">Complete these steps to start earning</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-slate-400 hover:text-white -mt-1 -mr-1"
          onClick={onDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
              step.completed
                ? 'bg-slate-900/40 border-slate-700/50'
                : 'bg-slate-800/40 border-slate-700/50 hover:border-slate-600/50'
            }`}
          >
            <div className="flex items-center gap-4 flex-1">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step.completed
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-700 text-slate-300'
              }`}>
                {step.completed ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className="text-sm font-medium">{step.number}</span>
                )}
              </div>

              <div className="flex-1">
                <h4 className="font-medium mb-0.5">{step.title}</h4>
                <p className="text-sm text-slate-400">{step.description}</p>
              </div>
            </div>

            <div className="ml-4">
              {step.completed ? (
                <span className="text-sm text-green-400 font-medium">Done</span>
              ) : step.action ? (
                <Button
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={step.action.onClick}
                >
                  {step.action.label}
                </Button>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
