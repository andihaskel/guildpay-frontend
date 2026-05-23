'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader as Loader2, ArrowLeft, Lock } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { CommunityPublicPageView } from '@/components/community/CommunityPublicPageView';
import { buildLivePublicPageProps } from '@/components/community/public-page-adapters';
import { fmtAmount } from '@/components/community/setup-utils';
import { api } from '@/lib/api';
import { normalizeAssetUrl } from '@/lib/utils';
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
  media_items?: Array<{
    id: string;
    type: 'image' | 'video';
    url?: string;
    caption?: string;
    duration?: string;
    wide?: boolean;
    tall?: boolean;
  }>;
  discord_channels_enabled?: boolean;
  discord_channels?: Array<{
    id: string;
    name: string;
    type: number;
  }>;
  monthly_amount_minor: number;
  yearly_amount_minor: number;
  currency: string;
  accepts_signups: boolean;
  has_yearly: boolean;
  trial_days?: number;
  style?: 'dark' | 'light';
  settings?: {
    page_style?: 'dark' | 'light';
    [key: string]: unknown;
  };
}

type Step = 'details' | 'checkout';

const font = 'Inter, ui-sans-serif, system-ui, -apple-system, sans-serif';

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
    const load = async () => {
      if (!params.creator || !params.slug) return;
      try {
        setIsLoading(true);
        const raw = (await api.getPublicPage(publicPath)) as PageData;
        if (raw.hero_image_url) {
          raw.hero_image_url = normalizeAssetUrl(raw.hero_image_url) || raw.hero_image_url;
        }
        if (raw.media_items) {
          raw.media_items = raw.media_items.map(item => ({
            ...item,
            url: normalizeAssetUrl(item.url) || item.url,
          }));
        }
        setPageData(raw);
        if (raw.has_yearly && raw.yearly_amount_minor > 0 && raw.monthly_amount_minor <= 0) {
          setBillingInterval('yearly');
        }
        setError(null);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Page not found');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [params.creator, params.slug, publicPath]);

  const handleGetAccess = useCallback(async () => {
    if (!pageData) return;
    const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!stripePublishableKey) {
      toast.error('Stripe publishable key is missing.');
      return;
    }
    if (!stripePublishableKey.startsWith('pk_test_') && !stripePublishableKey.startsWith('pk_live_')) {
      toast.error('Invalid Stripe publishable key format.');
      return;
    }
    try {
      setIsCreatingSession(true);
      const { client_secret, stripe_account } = await api.createPublicCheckoutSession(publicPath, billingInterval);
      sessionStorage.setItem('stripe_account', stripe_account);
      setStripePromise(loadStripe(stripePublishableKey));
      setClientSecret(client_secret);
      setStep('checkout');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to start checkout.');
    } finally {
      setIsCreatingSession(false);
    }
  }, [billingInterval, pageData, publicPath]);

  const handleBackToDetails = () => {
    setStep('details');
    setClientSecret(null);
  };

  const handleBillingIntervalChange = useCallback((interval: 'monthly' | 'yearly') => {
    setBillingInterval(interval);
    setStep(prev => {
      if (prev === 'checkout') {
        setClientSecret(null);
        return 'details';
      }
      return prev;
    });
  }, []);

  const resolvedStyle = pageData?.style ?? pageData?.settings?.page_style ?? 'dark';
  const isLight = resolvedStyle === 'light';
  const bg = isLight ? '#fafafa' : '#0a0a0a';
  const text = isLight ? '#0a0a0a' : '#f0f0f0';
  const textSecondary = isLight ? '#555' : '#888';
  const borderSoft = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.06)';
  const border = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)';
  const surface1 = isLight ? '#ffffff' : '#111111';
  const successSoftText = '#4ab585';

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font }}>
        <Loader2 className="animate-spin" style={{ width: '28px', height: '28px', color: '#5865f2' }} />
      </div>
    );
  }

  if (error || !pageData) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: font }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(214,69,69,0.1)', border: '0.5px solid rgba(214,69,69,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Lock style={{ width: '20px', height: '20px', color: '#e06a6a' }} />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 500, color: '#f0f0f0', margin: '0 0 8px', letterSpacing: '-0.02em' }}>Page not found</h1>
          <p style={{ fontSize: '14px', color: '#888', margin: '0 0 24px' }}>The page you are looking for does not exist or has been removed.</p>
          <button onClick={() => router.push('/')} style={{ padding: '8px 16px', borderRadius: '6px', background: '#fff', color: '#0a0a0a', fontSize: '13px', fontWeight: 500, border: '0', cursor: 'pointer' }}>Go home</button>
        </div>
      </div>
    );
  }

  if (!pageData.accepts_signups) {
    return (
      <div style={{ minHeight: '100vh', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: font }}>
        <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(214,69,69,0.08)', border: '0.5px solid rgba(214,69,69,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Lock style={{ width: '22px', height: '22px', color: '#e06a6a' }} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 500, color: text, margin: '0 0 8px', letterSpacing: '-0.02em' }}>{pageData.offer_name}</h1>
          <p style={{ fontSize: '14px', color: textSecondary, margin: '0 0 24px', lineHeight: 1.6 }}>Signups are currently closed. Check back later or contact the creator.</p>
          <button onClick={() => router.push('/')} style={{ padding: '8px 16px', borderRadius: '6px', background: isLight ? '#0a0a0a' : '#fff', color: isLight ? '#fff' : '#0a0a0a', fontSize: '13px', fontWeight: 500, border: '0', cursor: 'pointer' }}>Go home</button>
        </div>
      </div>
    );
  }

  const trialDays = pageData.trial_days && pageData.trial_days > 0 ? pageData.trial_days : null;
  const currentPrice =
    billingInterval === 'monthly' ? pageData.monthly_amount_minor : pageData.yearly_amount_minor;

  if (step === 'checkout' && clientSecret && stripePromise) {
    return (
      <div style={{ minHeight: '100vh', background: bg, fontFamily: font }}>
        <header style={{ height: '48px', borderBottom: `0.5px solid ${borderSoft}`, display: 'flex', alignItems: 'center', padding: '0 24px', position: 'sticky', top: 0, zIndex: 20, background: isLight ? 'rgba(250,250,250,0.85)' : 'rgba(10,10,10,0.85)', backdropFilter: 'saturate(140%) blur(10px)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: textSecondary, fontWeight: 500 }}>
            Secured by AccessGate
          </span>
        </header>

        <div style={{ maxWidth: '720px', margin: '0 auto', padding: '32px 24px 80px' }}>
          <button onClick={handleBackToDetails} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500, color: textSecondary, background: 'none', border: '0', cursor: 'pointer', marginBottom: '28px', padding: 0 }}>
            <ArrowLeft style={{ width: '14px', height: '14px' }} />
            Back to details
          </button>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 500, color: text, margin: '0 0 6px', letterSpacing: '-0.02em' }}>{pageData.offer_name}</h1>
            {trialDays ? (
              <p style={{ fontSize: '13px', color: successSoftText, margin: 0 }}>
                {trialDays}-day free trial, then {fmtAmount(currentPrice, pageData.currency)}/
                {billingInterval === 'monthly' ? 'mo' : 'yr'}
              </p>
            ) : (
              <p style={{ fontSize: '13px', color: textSecondary, margin: 0 }}>
                {fmtAmount(currentPrice, pageData.currency)}/{billingInterval === 'monthly' ? 'month' : 'year'}
              </p>
            )}
          </div>
          <div style={{ background: surface1, border: `0.5px solid ${border}`, borderRadius: '14px', overflow: 'hidden', padding: '24px' }}>
            <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </div>
        </div>
      </div>
    );
  }

  const pageViewProps = buildLivePublicPageProps(
    {
      ...pageData,
      description: pageData.description
        ? pageData.description.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[#*_>`~-]/g, '').trim()
        : undefined,
      discord_channels: pageData.discord_channels,
    },
    billingInterval,
    handleBillingIntervalChange,
    handleGetAccess,
    isCreatingSession,
  );

  return <CommunityPublicPageView {...pageViewProps} />;
}
