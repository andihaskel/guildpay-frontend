'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader as Loader2, ArrowLeft, Lock } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { CommunityPublicPageView } from '@/components/community/CommunityPublicPageView';
import {
  buildLivePublicPageProps,
  buildPublicCommunityPageProps,
} from '@/components/community/public-page-adapters';
import { planHasMonthly, planHasYearly } from '@/components/community/plan-model';
import {
  isPublicCommunityResponse,
  publicCommunityPlanToCommunityPlan,
  type PublicCommunityResponse,
} from '@/components/community/public-community-types';
import { fmtAmount } from '@/components/community/setup-utils';
import { api } from '@/lib/api';
import { normalizeAssetUrl } from '@/lib/utils';
import { toast } from 'sonner';

interface LegacyPageData {
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

function normalizeCommunityResponse(raw: PublicCommunityResponse): PublicCommunityResponse {
  const page = raw.page
    ? {
        ...raw.page,
        coverImageUrl: normalizeAssetUrl(raw.page.coverImageUrl) ?? raw.page.coverImageUrl,
        mediaItems: raw.page.mediaItems?.map(item => ({
          ...item,
          url: normalizeAssetUrl(item.url) ?? item.url,
        })),
      }
    : undefined;

  return {
    ...raw,
    logo_url: normalizeAssetUrl(raw.logo_url) ?? raw.logo_url,
    page,
  };
}

function normalizeLegacyPage(raw: LegacyPageData): LegacyPageData {
  return {
    ...raw,
    hero_image_url: normalizeAssetUrl(raw.hero_image_url) || raw.hero_image_url,
    media_items: raw.media_items?.map(item => ({
      ...item,
      url: normalizeAssetUrl(item.url) || item.url,
    })),
  };
}

function checkoutPriceKindForPlan(planId: string, data: PublicCommunityResponse): 'monthly' | 'yearly' {
  const raw = data.plans.find(p => p.id === planId);
  if (!raw) return 'monthly';
  const mapped = publicCommunityPlanToCommunityPlan(raw);
  if (planHasMonthly(mapped)) return 'monthly';
  if (planHasYearly(mapped)) return 'yearly';
  return 'monthly';
}

export default function PublicPageClient() {
  const params = useParams();
  const router = useRouter();
  const [communityData, setCommunityData] = useState<PublicCommunityResponse | null>(null);
  const [legacyPageData, setLegacyPageData] = useState<LegacyPageData | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [step, setStep] = useState<Step>('details');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [stripePromise, setStripePromise] = useState<ReturnType<typeof loadStripe> | null>(null);

  const publicPath = `/p/${params.creator}/${params.slug}`;
  const isCommunityPage = communityData != null;

  useEffect(() => {
    const load = async () => {
      if (!params.creator || !params.slug) return;
      try {
        setIsLoading(true);
        const raw = await api.getPublicPage(publicPath);

        if (isPublicCommunityResponse(raw)) {
          const normalized = normalizeCommunityResponse(raw);
          setCommunityData(normalized);
          setLegacyPageData(null);
          const firstOpen =
            normalized.plans.find(p => p.accepts_signups)?.id ?? normalized.plans[0]?.id ?? null;
          setSelectedPlanId(firstOpen);
          setError(null);
          return;
        }

        const legacy = normalizeLegacyPage(raw as LegacyPageData);
        setLegacyPageData(legacy);
        setCommunityData(null);
        if (legacy.has_yearly && legacy.yearly_amount_minor > 0 && legacy.monthly_amount_minor <= 0) {
          setBillingInterval('yearly');
        }
        setError(null);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Page not found');
        setCommunityData(null);
        setLegacyPageData(null);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [params.creator, params.slug, publicPath]);

  const handleCommunityCheckout = useCallback(async () => {
    if (!communityData || !selectedPlanId) return;
    const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!stripePublishableKey) {
      toast.error('Stripe publishable key is missing.');
      return;
    }
    try {
      setIsCreatingSession(true);
      const priceKind = checkoutPriceKindForPlan(selectedPlanId, communityData);
      const { client_secret, stripe_account } = await api.createPublicCheckoutSession(
        publicPath,
        priceKind,
        selectedPlanId,
      );
      sessionStorage.setItem('stripe_account', stripe_account);
      setStripePromise(loadStripe(stripePublishableKey));
      setClientSecret(client_secret);
      setStep('checkout');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to start checkout.');
    } finally {
      setIsCreatingSession(false);
    }
  }, [communityData, publicPath, selectedPlanId]);

  const handleLegacyCheckout = useCallback(async () => {
    if (!legacyPageData) return;
    const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!stripePublishableKey) {
      toast.error('Stripe publishable key is missing.');
      return;
    }
    try {
      setIsCreatingSession(true);
      const { client_secret, stripe_account } = await api.createPublicCheckoutSession(
        publicPath,
        billingInterval,
      );
      sessionStorage.setItem('stripe_account', stripe_account);
      setStripePromise(loadStripe(stripePublishableKey));
      setClientSecret(client_secret);
      setStep('checkout');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to start checkout.');
    } finally {
      setIsCreatingSession(false);
    }
  }, [billingInterval, legacyPageData, publicPath]);

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

  const checkoutTitle = useMemo(() => {
    if (isCommunityPage && communityData && selectedPlanId) {
      return communityData.plans.find(p => p.id === selectedPlanId)?.offer_name ?? communityData.community_name;
    }
    return legacyPageData?.offer_name ?? 'Checkout';
  }, [communityData, isCommunityPage, legacyPageData, selectedPlanId]);

  const checkoutPriceLabel = useMemo(() => {
    if (isCommunityPage && communityData && selectedPlanId) {
      const raw = communityData.plans.find(p => p.id === selectedPlanId);
      if (!raw) return null;
      const kind = checkoutPriceKindForPlan(selectedPlanId, communityData);
      const amount =
        kind === 'monthly' ? raw.monthly_amount_minor : (raw.yearly_amount_minor ?? raw.monthly_amount_minor);
      return {
        amount,
        currency: raw.currency,
        interval: kind,
        trialDays: raw.trial_days && raw.trial_days > 0 ? raw.trial_days : null,
      };
    }
    if (!legacyPageData) return null;
    const amount =
      billingInterval === 'monthly'
        ? legacyPageData.monthly_amount_minor
        : legacyPageData.yearly_amount_minor;
    return {
      amount,
      currency: legacyPageData.currency,
      interval: billingInterval,
      trialDays: legacyPageData.trial_days && legacyPageData.trial_days > 0 ? legacyPageData.trial_days : null,
    };
  }, [billingInterval, communityData, isCommunityPage, legacyPageData, selectedPlanId]);

  const resolvedStyle = legacyPageData?.style ?? legacyPageData?.settings?.page_style ?? 'dark';
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

  if (error || (!communityData && !legacyPageData)) {
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

  const signupsClosed = isCommunityPage
    ? !communityData!.plans.some(p => p.accepts_signups)
    : !legacyPageData!.accepts_signups;

  if (signupsClosed) {
    const title = isCommunityPage ? communityData!.community_name : legacyPageData!.offer_name;
    return (
      <div style={{ minHeight: '100vh', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: font }}>
        <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(214,69,69,0.08)', border: '0.5px solid rgba(214,69,69,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Lock style={{ width: '22px', height: '22px', color: '#e06a6a' }} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 500, color: text, margin: '0 0 8px', letterSpacing: '-0.02em' }}>{title}</h1>
          <p style={{ fontSize: '14px', color: textSecondary, margin: '0 0 24px', lineHeight: 1.6 }}>Signups are currently closed. Check back later or contact the creator.</p>
          <button onClick={() => router.push('/')} style={{ padding: '8px 16px', borderRadius: '6px', background: isLight ? '#0a0a0a' : '#fff', color: isLight ? '#fff' : '#0a0a0a', fontSize: '13px', fontWeight: 500, border: '0', cursor: 'pointer' }}>Go home</button>
        </div>
      </div>
    );
  }

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
            <h1 style={{ fontSize: '22px', fontWeight: 500, color: text, margin: '0 0 6px', letterSpacing: '-0.02em' }}>{checkoutTitle}</h1>
            {checkoutPriceLabel?.trialDays ? (
              <p style={{ fontSize: '13px', color: successSoftText, margin: 0 }}>
                {checkoutPriceLabel.trialDays}-day free trial, then {fmtAmount(checkoutPriceLabel.amount, checkoutPriceLabel.currency)}/
                {checkoutPriceLabel.interval === 'monthly' ? 'mo' : 'yr'}
              </p>
            ) : checkoutPriceLabel ? (
              <p style={{ fontSize: '13px', color: textSecondary, margin: 0 }}>
                {fmtAmount(checkoutPriceLabel.amount, checkoutPriceLabel.currency)}/{checkoutPriceLabel.interval === 'monthly' ? 'month' : 'year'}
              </p>
            ) : null}
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

  if (isCommunityPage && communityData) {
    const pageViewProps = buildPublicCommunityPageProps(
      communityData,
      selectedPlanId,
      setSelectedPlanId,
      handleCommunityCheckout,
      isCreatingSession,
    );
    return <CommunityPublicPageView {...pageViewProps} />;
  }

  const pageViewProps = buildLivePublicPageProps(
    {
      ...legacyPageData!,
      description: legacyPageData!.description
        ? legacyPageData!.description.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[#*_>`~-]/g, '').trim()
        : undefined,
      discord_channels: legacyPageData!.discord_channels,
    },
    billingInterval,
    handleBillingIntervalChange,
    handleLegacyCheckout,
    isCreatingSession,
  );

  return <CommunityPublicPageView {...pageViewProps} />;
}
