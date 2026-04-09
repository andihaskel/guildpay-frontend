'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader as Loader2, Sparkles, LayoutDashboard, CreditCard } from 'lucide-react';
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
    if (plan) triggerConfetti();
  }, [plan]);

  const loadPlan = async () => {
    try {
      setIsLoading(true);
      const planData = await api.getBillingPlan();
      setPlan(planData);
    } catch {
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
    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      const particleCount = 50 * (timeLeft / duration);
      // @ts-ignore
      if (typeof confetti !== 'undefined') {
        // @ts-ignore
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
        // @ts-ignore
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
      }
    }, 250);
  };

  const getPlanDisplayName = (planName: string) =>
    planName.charAt(0).toUpperCase() + planName.slice(1);

  return (
    <>
      <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.2/dist/confetti.browser.min.js"></script>
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <div className="grain" aria-hidden="true" />
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/6 rounded-full blur-[140px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-primary/4 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 w-full max-w-lg">
          <div className="bg-card border border-border rounded-2xl p-10 text-center">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-10">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading your plan...</p>
              </div>
            ) : plan ? (
              <div className="space-y-7">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/15">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>

                <div>
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
                    Welcome to {getPlanDisplayName(plan.plan)}!
                  </h1>
                  <p className="text-muted-foreground max-w-xs mx-auto">
                    Your subscription is now active. Get ready to unlock powerful features and grow your community.
                  </p>
                </div>

                {plan.status === 'trialing' && plan.trial_end && (
                  <div className="px-4 py-3 rounded-xl bg-primary/8 border border-primary/20">
                    <p className="text-sm text-primary">
                      Trial ends on {new Date(plan.trial_end).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <Button
                    size="lg"
                    className="gap-2 font-semibold hover:scale-[1.02] active:scale-[0.98] transition-transform"
                    onClick={() => router.push('/dashboard/home')}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Go to Dashboard
                  </Button>
                  <Button
                    size="lg"
                    variant="ghost"
                    className="gap-2 text-muted-foreground hover:text-foreground"
                    onClick={() => router.push('/dashboard/billing')}
                  >
                    <CreditCard className="h-4 w-4" />
                    View Billing
                  </Button>
                </div>
              </div>
            ) : (
              <div className="py-10">
                <p className="text-muted-foreground mb-6">Unable to load plan information</p>
                <Button onClick={() => router.push('/dashboard/billing')}>
                  Go to Billing
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
