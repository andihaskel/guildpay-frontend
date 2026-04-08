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
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading your plan...</p>
            </div>
          ) : plan ? (
            <div className="space-y-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 mb-4">
                <Sparkles className="h-10 w-10 text-primary" />
              </div>

              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-3">
                  Welcome to {getPlanDisplayName(plan.plan)}!
                </h1>
                <p className="text-lg text-muted-foreground max-w-md mx-auto">
                  Your subscription is now active. Get ready to unlock powerful features and grow your community.
                </p>
              </div>

              {plan.status === 'trialing' && plan.trial_end && (
                <div className="p-4 rounded-lg bg-primary/8 border border-primary/20">
                  <p className="text-sm text-primary">
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
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8"
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
