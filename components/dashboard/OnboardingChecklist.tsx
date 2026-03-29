'use client';

import { useState } from 'react';
import { CircleCheck as CheckCircle2, Circle, X, Rocket, Link as LinkIcon, Share2 } from 'lucide-react';
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
      title: 'Connect your Discord server',
      description: 'Link your Discord server to start managing access',
      icon: Rocket,
      completed: status.discordConnected,
      action: {
        label: 'Connect Discord',
        onClick: () => window.location.href = '/install-bot',
      },
    },
    {
      id: 'page',
      title: 'Create your first access page',
      description: 'Set up a page where users can purchase access',
      icon: LinkIcon,
      completed: status.firstPageCreated,
      action: {
        label: 'Create Page',
        onClick: () => window.location.href = '/dashboard/pages/create',
      },
    },
    {
      id: 'share',
      title: 'Share your link',
      description: 'Start getting members by sharing your access page',
      icon: Share2,
      completed: status.linkShared,
      action: {
        label: 'View Page',
        onClick: () => window.location.href = '/dashboard/pages',
      },
    },
  ];

  return (
    <Card className="p-6 bg-slate-900/40 border-slate-800/50 mb-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold mb-1">You are almost there, complete these steps to activate your account.</h3>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`p-5 rounded-lg border transition-colors ${
              step.completed
                ? 'bg-green-600/10 border-green-600/30'
                : 'bg-slate-800/30 border-slate-700/50'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2 rounded-lg ${
                step.completed ? 'bg-green-600/20' : 'bg-slate-700/50'
              }`}>
                <step.icon className={`h-5 w-5 ${
                  step.completed ? 'text-green-400' : 'text-slate-400'
                }`} />
              </div>
              {step.completed ? (
                <CheckCircle2 className="h-5 w-5 text-green-400" />
              ) : (
                <Circle className="h-5 w-5 text-slate-600" />
              )}
            </div>

            <h4 className="font-medium mb-1">{step.title}</h4>
            <p className="text-sm text-slate-400 mb-4">{step.description}</p>

            {step.completed ? (
              <Button
                size="sm"
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                disabled
              >
                Done
              </Button>
            ) : (
              <Button
                size="sm"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={step.action.onClick}
              >
                {step.action.label}
              </Button>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
