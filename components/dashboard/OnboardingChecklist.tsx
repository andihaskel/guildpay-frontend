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
      icon: FileText,
      title: 'Publish your first page',
      description: 'Create a signup page to allow your users to join your community',
      completed: status.discordConnected,
      isPrimary: !status.discordConnected,
      action: status.discordConnected ? null : {
        label: 'Connect',
        onClick: () => window.location.href = '/install-bot',
      },
    },
    {
      id: 'page',
      icon: FileText,
      title: 'Link your stripe account',
      description: 'Start accepting payments by connecting your Stripe account',
      completed: status.firstPageCreated,
      isPrimary: status.discordConnected && !status.firstPageCreated,
      action: status.firstPageCreated ? null : {
        label: 'Link Stripe',
        onClick: () => window.location.href = '/dashboard/pages/create',
      },
    },
    {
      id: 'share',
      icon: CreditCard,
      title: 'Start your 14 day free trial',
      description: 'Enjoy all the benefits of our premium tier free for 14 days',
      completed: status.linkShared,
      isPrimary: status.discordConnected && status.firstPageCreated && !status.linkShared,
      action: status.linkShared ? null : {
        label: 'Start now',
        onClick: () => window.location.href = '/dashboard/pages',
      },
    },
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Get started</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <Card
              key={step.id}
              className={`p-6 bg-slate-800/40 border-slate-700/50 relative ${
                step.completed ? 'opacity-60' : ''
              }`}
            >
              {step.completed && (
                <div className="absolute top-4 right-4">
                  <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}

              <div className="mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                  step.isPrimary ? 'bg-purple-600/20' : 'bg-slate-700/40'
                }`}>
                  <Icon className={`h-6 w-6 ${
                    step.isPrimary ? 'text-purple-400' : 'text-slate-400'
                  }`} />
                </div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-slate-400">{step.description}</p>
              </div>

              {step.action && (
                <Button
                  className={`w-full ${
                    step.isPrimary
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                  }`}
                  onClick={step.action.onClick}
                >
                  {step.action.label}
                </Button>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
