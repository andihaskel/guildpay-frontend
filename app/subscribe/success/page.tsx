'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CircleCheck as CheckCircle, Loader as Loader2, ArrowRight, CircleAlert as AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

export default function SubscribeSuccessPage() {
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

    const stripeAccount = sessionStorage.getItem('stripe_account');

    if (!stripeAccount) {
      setStatus('error');
      setErrorMessage('Stripe account information not found');
      return;
    }

    fetchCheckoutStatus(sessionId, stripeAccount);
  }, [searchParams]);

  const fetchCheckoutStatus = async (sessionId: string, stripeAccount: string, attempt = 1) => {
    try {
      const url = `${API_URL}/subscribe/checkout-session-status?session_id=${encodeURIComponent(sessionId)}&stripe_account=${encodeURIComponent(stripeAccount)}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch checkout status: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.customer_id) {
        setCustomerId(data.customer_id);
        setStatus('success');
        sessionStorage.removeItem('stripe_account');
      } else if (attempt < MAX_RETRIES) {
        setRetryCount(attempt);
        setTimeout(() => {
          fetchCheckoutStatus(sessionId, stripeAccount, attempt + 1);
        }, RETRY_DELAY);
      } else {
        setStatus('error');
        setErrorMessage('Unable to retrieve customer information after multiple attempts');
      }
    } catch (error: any) {
      console.error('Error fetching checkout status:', error);

      if (attempt < MAX_RETRIES) {
        setRetryCount(attempt);
        setTimeout(() => {
          fetchCheckoutStatus(sessionId, stripeAccount, attempt + 1);
        }, RETRY_DELAY);
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

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 bg-slate-900/80 border-slate-800/50 text-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-16 w-16 text-purple-500 animate-spin" />
            <h2 className="text-2xl font-bold">Processing Your Payment</h2>
            <p className="text-slate-400">
              Please wait while we confirm your subscription...
              {retryCount > 0 && ` (Attempt ${retryCount + 1}/${MAX_RETRIES})`}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 bg-slate-900/80 border-slate-800/50 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold">Something Went Wrong</h2>
            <p className="text-slate-400">{errorMessage}</p>
            <Button
              onClick={() => router.push('/dashboard/home')}
              variant="outline"
              className="mt-4"
            >
              Go to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 bg-slate-900/80 border-slate-800/50 text-center">
        <div className="flex flex-col items-center gap-6">
          <div className="h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>

          <div>
            <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-slate-400">
              Your subscription has been activated successfully.
            </p>
          </div>

          <div className="w-full bg-slate-800/50 rounded-lg p-6 space-y-4">
            <h3 className="font-semibold text-lg">Next Step: Connect Discord</h3>
            <p className="text-sm text-slate-400">
              Link your Discord account to access your exclusive roles and content.
            </p>

            <Button
              onClick={handleConnectDiscord}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white h-12 text-lg font-semibold"
              size="lg"
            >
              Connect Discord Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          <Button
            onClick={() => router.push('/dashboard/home')}
            variant="ghost"
            className="text-slate-400 hover:text-white"
          >
            Skip for now
          </Button>
        </div>
      </Card>
    </div>
  );
}
