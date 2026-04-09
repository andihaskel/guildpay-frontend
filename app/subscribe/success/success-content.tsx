'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CircleCheck as CheckCircle, Loader as Loader2, ArrowRight, CircleAlert as AlertCircle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://guildpay-production.up.railway.app';
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

const DISCORD_SVG = (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

export default function SubscribeSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      setStatus('error');
      setErrorMessage('No session ID found in URL');
      return;
    }
    const stripeAccount = searchParams.get('stripe_account') || sessionStorage.getItem('stripe_account');
    if (!stripeAccount) {
      setStatus('error');
      setErrorMessage('Stripe account information not found');
      return;
    }
    fetchCheckoutStatus(sessionId, stripeAccount);
  }, [searchParams]);

  const createMemberSession = async (sessionId: string, stripeAccount: string) => {
    try {
      await fetch(`${API_URL}/member/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ session_id: sessionId, stripe_account: stripeAccount }),
      });
    } catch {
    }
  };

  const fetchCheckoutStatus = async (sessionId: string, stripeAccount: string, attempt = 1) => {
    try {
      const url = `${API_URL}/subscribe/checkout-session-status?session_id=${encodeURIComponent(sessionId)}&stripe_account=${encodeURIComponent(stripeAccount)}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch checkout status: ${response.statusText}`);
      const data = await response.json();
      if (data.customer_id) {
        setCustomerId(data.customer_id);
        await createMemberSession(sessionId, stripeAccount);
        setStatus('success');
        sessionStorage.removeItem('stripe_account');
      } else if (attempt < MAX_RETRIES) {
        setRetryCount(attempt);
        setTimeout(() => fetchCheckoutStatus(sessionId, stripeAccount, attempt + 1), RETRY_DELAY);
      } else {
        setStatus('error');
        setErrorMessage('Unable to retrieve customer information after multiple attempts');
      }
    } catch (error: any) {
      if (attempt < MAX_RETRIES) {
        setRetryCount(attempt);
        setTimeout(() => fetchCheckoutStatus(sessionId, stripeAccount, attempt + 1), RETRY_DELAY);
      } else {
        setStatus('error');
        setErrorMessage(error.message || 'An error occurred while processing your subscription');
      }
    }
  };

  const handleConnectDiscord = () => {
    if (!customerId) return;
    const discordUrl = `${API_URL}/subscriber/discord/connect?stripe_customer_id=${encodeURIComponent(customerId)}`;
    window.location.href = discordUrl;
  };

  const GlowWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <div className="grain" aria-hidden="true" />
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-primary/5 rounded-full blur-[140px]" />
      </div>
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-card border border-border rounded-2xl p-8 text-center">
          {children}
        </div>
      </div>
    </div>
  );

  if (status === 'loading') {
    return (
      <GlowWrapper>
        <div className="flex flex-col items-center gap-4 py-4">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <h2 className="text-2xl font-bold tracking-tight">Processing Your Payment</h2>
          <p className="text-muted-foreground text-sm">
            Please wait while we confirm your subscription
            {retryCount > 0 && ` (Attempt ${retryCount + 1}/${MAX_RETRIES})`}
          </p>
        </div>
      </GlowWrapper>
    );
  }

  if (status === 'error') {
    return (
      <GlowWrapper>
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="h-7 w-7 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Something Went Wrong</h2>
          <p className="text-muted-foreground text-sm">{errorMessage}</p>
          <Button
            onClick={() => router.push('/dashboard/home')}
            variant="ghost"
            className="mt-2 text-muted-foreground hover:text-foreground"
          >
            Go to Dashboard
          </Button>
        </div>
      </GlowWrapper>
    );
  }

  return (
    <GlowWrapper>
      <div className="flex flex-col items-center gap-6 py-2">
        <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center">
          <CheckCircle className="h-9 w-9 text-green-500" />
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Payment Successful!</h1>
          <p className="text-muted-foreground text-sm">
            Your subscription has been activated successfully.
          </p>
        </div>

        <div className="w-full bg-background/60 border border-border rounded-xl p-5 space-y-4 text-left">
          <div>
            <h3 className="font-semibold mb-1">Next Step: Connect Discord</h3>
            <p className="text-sm text-muted-foreground">
              Link your Discord account to access your exclusive roles and content.
            </p>
          </div>
          <Button
            onClick={handleConnectDiscord}
            className="w-full gap-2.5 font-semibold hover:scale-[1.01] active:scale-[0.99] transition-transform"
            size="lg"
          >
            {DISCORD_SVG}
            Connect Discord Account
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>

        <Button
          onClick={() => router.push('/dashboard/home')}
          variant="ghost"
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          Skip for now
        </Button>
      </div>
    </GlowWrapper>
  );
}
