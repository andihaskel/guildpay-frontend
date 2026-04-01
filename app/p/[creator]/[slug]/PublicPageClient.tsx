'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader as Loader2, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface PageData {
  creator_slug: string;
  page_slug: string;
  offer_name: string;
  hero_image_url: string;
  cover_url: string;
  description: string;
  features: Array<{
    id: string;
    icon: string;
    title: string;
    description: string;
  }>;
  media_gallery_enabled: boolean;
  monthly_amount_minor: number;
  yearly_amount_minor: number;
  currency: string;
  accepts_signups: boolean;
  has_yearly: boolean;
  trial_days?: number;
}

type Step = 'details' | 'checkout';

export default function PublicPageClient() {
  const params = useParams();
  const router = useRouter();
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [step, setStep] = useState<Step>('details');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [stripePromise, setStripePromise] = useState<ReturnType<typeof loadStripe> | null>(null);

  const publicPath = `/p/${params.creator}/${params.slug}`;

  useEffect(() => {
    const loadPageData = async () => {
      if (!params.creator || !params.slug) {
        console.log('Missing params:', { creator: params.creator, slug: params.slug });
        return;
      }

      try {
        setIsLoading(true);
        console.log('Fetching page data from:', publicPath);
        const data = await api.getPublicPage(publicPath);
        console.log('Page data loaded:', data);
        setPageData(data);
        setError(null);
      } catch (err: any) {
        console.error('Failed to load page:', err);
        console.error('Error details:', {
          message: err.message,
          statusCode: err.statusCode,
          error: err.error
        });
        setError(err.message || 'Page not found');
      } finally {
        setIsLoading(false);
      }
    };

    loadPageData();
  }, [params.creator, params.slug, publicPath]);

  const handleGetAccess = async () => {
    if (!pageData) return;

    const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

    if (!stripePublishableKey) {
      toast.error('Stripe publishable key is missing. Please configure NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.');
      return;
    }

    if (!stripePublishableKey.startsWith('pk_test_') && !stripePublishableKey.startsWith('pk_live_')) {
      toast.error('Invalid Stripe publishable key format. Key should start with pk_test_ or pk_live_');
      return;
    }

    try {
      setIsCreatingSession(true);
      const { client_secret, stripe_account } = await api.createPublicCheckoutSession(
        publicPath,
        billingInterval
      );

      sessionStorage.setItem('stripe_account', stripe_account);

      setStripePromise(loadStripe(stripePublishableKey));
      setClientSecret(client_secret);
      setStep('checkout');
    } catch (err: any) {
      console.error('Failed to create checkout session:', err);
      toast.error(err.message || 'Failed to start checkout. Please try again.');
    } finally {
      setIsCreatingSession(false);
    }
  };

  const handleBackToDetails = () => {
    setStep('details');
    setClientSecret(null);
  };

  const handleBillingIntervalChange = (interval: 'monthly' | 'yearly') => {
    setBillingInterval(interval);
    if (step === 'checkout') {
      setStep('details');
      setClientSecret(null);
    }
  };

  const fetchClientSecret = useCallback(async () => {
    if (!clientSecret) return '';
    return clientSecret;
  }, [clientSecret]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (error || !pageData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
          <p className="text-slate-400 mb-6">The page you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  const currentPrice = billingInterval === 'monthly'
    ? pageData.monthly_amount_minor
    : pageData.yearly_amount_minor;

  const formattedPrice = (currentPrice / 100).toFixed(2);
  const currencySymbol = pageData.currency === 'usd' ? '$' : pageData.currency.toUpperCase();

  if (step === 'checkout' && clientSecret && stripePromise) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={handleBackToDetails}
            className="mb-6 text-slate-400 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to details
          </Button>

          <div className="max-w-4xl mx-auto">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold mb-2">{pageData.offer_name}</h1>
              {pageData.trial_days && pageData.trial_days > 0 ? (
                <div>
                  <p className="text-emerald-400 font-semibold mb-1">
                    🎉 {pageData.trial_days}-day free trial
                  </p>
                  <p className="text-slate-400 text-sm">
                    Then {currencySymbol}{formattedPrice}/{billingInterval === 'monthly' ? 'month' : 'year'}
                  </p>
                </div>
              ) : (
                <p className="text-slate-400">
                  {currencySymbol}{formattedPrice}/{billingInterval === 'monthly' ? 'month' : 'year'}
                </p>
              )}
            </div>

            <Card className="p-8 bg-slate-900/80 border-slate-800/50">
              <EmbeddedCheckoutProvider
                stripe={stripePromise}
                options={{ clientSecret }}
              >
                <EmbeddedCheckout />
              </EmbeddedCheckoutProvider>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div
        className="h-[400px] relative bg-cover bg-center"
        style={{
          backgroundImage: pageData.cover_url ? `url(${pageData.cover_url})` : 'none',
          backgroundColor: !pageData.cover_url ? '#1e293b' : undefined
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-950" />

        <div className="container mx-auto px-4 h-full flex items-end pb-12 relative z-10">
          <div className="flex items-end gap-6">
            {pageData.hero_image_url && (
              <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-slate-800 shadow-2xl flex-shrink-0">
                <img
                  src={pageData.hero_image_url}
                  alt={pageData.offer_name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div>
              <h1 className="text-5xl font-bold mb-2">{pageData.offer_name}</h1>
              <p className="text-lg text-slate-300">@{pageData.creator_slug}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {pageData.description && (
              <Card className="p-8 bg-slate-900/60 border-slate-800/50">
                <h2 className="text-2xl font-semibold mb-4">About</h2>
                <MarkdownRenderer
                  content={pageData.description}
                  className="text-slate-300"
                />
              </Card>
            )}

            {pageData.features && pageData.features.length > 0 && (
              <Card className="p-8 bg-slate-900/60 border-slate-800/50">
                <h2 className="text-2xl font-semibold mb-6">What's Included</h2>
                <div className="space-y-4">
                  {pageData.features.map((feature) => (
                    <div
                      key={feature.id}
                      className="flex gap-4 p-4 rounded-lg bg-slate-800/40 border border-slate-700/50 hover:border-slate-600/50 transition-colors"
                    >
                      <div className="text-3xl flex-shrink-0">{feature.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{feature.title}</h3>
                        <p className="text-sm text-slate-400">{feature.description}</p>
                      </div>
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-1" />
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          <div className="lg:col-span-1">
            <Card className="p-6 bg-slate-900/80 border-slate-800/50 sticky top-6">
              {pageData.trial_days && pageData.trial_days > 0 && (
                <div className="mb-4 -mt-2 -mx-2 px-4 py-2 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30 rounded-lg">
                  <p className="text-emerald-400 font-semibold text-sm text-center">
                    🎉 {pageData.trial_days}-day free trial included
                  </p>
                </div>
              )}
              <div className="mb-6">
                <div className="text-4xl font-bold mb-2">
                  {currencySymbol}{formattedPrice}
                  <span className="text-lg font-normal text-slate-400">
                    /{billingInterval === 'monthly' ? 'month' : 'year'}
                  </span>
                </div>
                {pageData.trial_days && pageData.trial_days > 0 && (
                  <p className="text-sm text-slate-400 mt-1">
                    Try free for {pageData.trial_days} days, then {currencySymbol}{formattedPrice}/{billingInterval === 'monthly' ? 'mo' : 'yr'}
                  </p>
                )}

                {pageData.has_yearly && (
                  <div className="flex gap-2 p-1 bg-slate-800/50 rounded-lg mt-4">
                    <button
                      onClick={() => handleBillingIntervalChange('monthly')}
                      className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                        billingInterval === 'monthly'
                          ? 'bg-purple-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Monthly
                    </button>
                    <button
                      onClick={() => handleBillingIntervalChange('yearly')}
                      className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                        billingInterval === 'yearly'
                          ? 'bg-purple-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Yearly
                    </button>
                  </div>
                )}
              </div>

              {pageData.accepts_signups ? (
                <Button
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white h-12 text-lg font-semibold"
                  size="lg"
                  onClick={handleGetAccess}
                  disabled={isCreatingSession}
                >
                  {isCreatingSession ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      Get Access
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              ) : (
                <div className="text-center p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                  <p className="text-slate-400">Signups are currently closed</p>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-slate-800">
                <div className="space-y-3 text-sm">
                  {pageData.trial_days && pageData.trial_days > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-400 font-medium">{pageData.trial_days}-day free trial</span>
                      <Check className="h-4 w-4 text-emerald-500" />
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Instant access</span>
                    <Check className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Cancel anytime</span>
                    <Check className="h-4 w-4 text-green-500" />
                  </div>
                  {billingInterval === 'yearly' && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Save with yearly billing</span>
                      <Check className="h-4 w-4 text-green-500" />
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
