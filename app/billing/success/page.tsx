'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader as Loader2, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';
import { BillingPlanStatus } from '@/lib/types';

export default function BillingSuccessPage() {
  const router = useRouter();
  const [plan, setPlan] = useState<BillingPlanStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPlan();
  }, []);

  useEffect(() => {
    if (plan) {
      triggerConfetti();
    }
  }, [plan]);

  const loadPlan = async () => {
    try {
      setIsLoading(true);
      const planData = await api.getBillingPlan();
      setPlan(planData);
    } catch (error) {
      console.error('Failed to load plan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      // @ts-ignore
      if (typeof confetti !== 'undefined') {
        // @ts-ignore
        confetti(Object.assign({}, defaults, {
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        }));
        // @ts-ignore
        confetti(Object.assign({}, defaults, {
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        }));
      }
    }, 250);
  };

  const getPlanDisplayName = (planName: string) => {
    return planName.charAt(0).toUpperCase() + planName.slice(1);
  };

  return (
    <>
      <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.2/dist/confetti.browser.min.js"></script>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
        <Card className="w-full max-w-2xl p-12 bg-slate-900/60 border-slate-800/50 backdrop-blur-sm text-center">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
              <p className="text-muted-foreground">Loading your plan...</p>
            </div>
          ) : plan ? (
            <div className="space-y-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-4">
                <Sparkles className="h-10 w-10 text-white" />
              </div>

              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Welcome to {getPlanDisplayName(plan.plan)}!
                </h1>
                <p className="text-lg text-muted-foreground max-w-md mx-auto">
                  Your subscription is now active. Get ready to unlock powerful features and grow your community.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6">
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <div className="text-3xl font-bold text-blue-400 mb-1">
                    {plan.limits.max_pages === -1 ? '∞' : plan.limits.max_pages}
                  </div>
                  <div className="text-sm text-muted-foreground">Pages</div>
                </div>
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <div className="text-3xl font-bold text-purple-400 mb-1">
                    {plan.limits.max_members === -1 ? '∞' : plan.limits.max_members}
                  </div>
                  <div className="text-sm text-muted-foreground">Members</div>
                </div>
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <div className="text-3xl font-bold text-pink-400 mb-1">
                    {plan.features?.length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Features</div>
                </div>
              </div>

              {plan.status === 'trialing' && plan.trial_end && (
                <div className="p-4 rounded-lg bg-blue-950/30 border border-blue-800/50">
                  <p className="text-sm text-blue-300">
                    Your trial ends on {new Date(plan.trial_end).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8"
                  onClick={() => router.push('/dashboard/home')}
                >
                  Go to Dashboard
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-slate-700 hover:bg-slate-800"
                  onClick={() => router.push('/dashboard/billing')}
                >
                  View Billing
                </Button>
              </div>
            </div>
          ) : (
            <div className="py-12">
              <p className="text-muted-foreground mb-6">Unable to load plan information</p>
              <Button onClick={() => router.push('/dashboard/billing')}>
                Go to Billing
              </Button>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
