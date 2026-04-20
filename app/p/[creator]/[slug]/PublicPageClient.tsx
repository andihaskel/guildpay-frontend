'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader as Loader2, Check, ArrowLeft, Lock, Shield } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
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
  style?: 'dark' | 'light';
  settings?: {
    page_style?: 'dark' | 'light';
    [key: string]: any;
  };
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
      if (!params.creator || !params.slug) return;
      try {
        setIsLoading(true);
        const data = await api.getPublicPage(publicPath);
        setPageData(data);
        setError(null);
      } catch (err: any) {
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
    } catch (err: any) {
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

  const resolvedStyle = pageData?.style ?? pageData?.settings?.page_style ?? 'dark';
  const isLight = resolvedStyle === 'light';

  const t = {
    bg: isLight ? '#fafafa' : '#0a0a0a',
    surface: isLight ? '#ffffff' : '#111111',
    surfaceAlt: isLight ? '#f5f5f5' : '#161616',
    border: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)',
    borderSoft: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
    text: isLight ? '#0a0a0a' : '#f0f0f0',
    subText: isLight ? '#555555' : '#888888',
    mutedText: isLight ? '#888888' : '#555555',
    divider: isLight ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.06)',
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#5865f2' }} />
      </div>
    );
  }

  if (error || !pageData) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'Inter, ui-sans-serif, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(214,69,69,0.1)', border: '0.5px solid rgba(214,69,69,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Lock style={{ width: '20px', height: '20px', color: '#e06a6a' }} />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 500, color: '#f0f0f0', margin: '0 0 8px', letterSpacing: '-0.02em' }}>Page not found</h1>
          <p style={{ fontSize: '14px', color: '#888', margin: '0 0 24px' }}>The page you're looking for doesn't exist or has been removed.</p>
          <button onClick={() => router.push('/')} style={{ padding: '8px 16px', borderRadius: '6px', background: '#fff', color: '#0a0a0a', fontSize: '13px', fontWeight: 500, border: '0', cursor: 'pointer' }}>
            Go home
          </button>
        </div>
      </div>
    );
  }

  if (!pageData.accepts_signups) {
    return (
      <div style={{ minHeight: '100vh', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'Inter, ui-sans-serif, sans-serif' }}>
        <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(214,69,69,0.08)', border: '0.5px solid rgba(214,69,69,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Lock style={{ width: '22px', height: '22px', color: '#e06a6a' }} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 500, color: t.text, margin: '0 0 8px', letterSpacing: '-0.02em' }}>{pageData.offer_name}</h1>
          <p style={{ fontSize: '14px', color: t.subText, margin: '0 0 24px', lineHeight: 1.6 }}>
            Signups are currently closed. Check back later or contact the creator.
          </p>
          <button onClick={() => router.push('/')} style={{ padding: '8px 16px', borderRadius: '6px', background: isLight ? '#0a0a0a' : '#fff', color: isLight ? '#fff' : '#0a0a0a', fontSize: '13px', fontWeight: 500, border: '0', cursor: 'pointer' }}>
            Go home
          </button>
        </div>
      </div>
    );
  }

  const currentPrice = billingInterval === 'monthly' ? pageData.monthly_amount_minor : pageData.yearly_amount_minor;
  const formattedPrice = (currentPrice / 100).toFixed(2);
  const currencySymbol = pageData.currency === 'usd' ? '$' : pageData.currency === 'eur' ? '€' : pageData.currency === 'gbp' ? '£' : pageData.currency.toUpperCase();
  const trialDays = pageData.trial_days && pageData.trial_days > 0 ? pageData.trial_days : null;

  if (step === 'checkout' && clientSecret && stripePromise) {
    return (
      <div style={{ minHeight: '100vh', background: t.bg, fontFamily: 'Inter, ui-sans-serif, sans-serif' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', padding: '32px 24px 80px' }}>
          <button
            onClick={handleBackToDetails}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500, color: t.subText, background: 'none', border: '0', cursor: 'pointer', marginBottom: '28px', padding: 0 }}
          >
            <ArrowLeft style={{ width: '14px', height: '14px' }} />
            Back to details
          </button>

          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 500, color: t.text, margin: '0 0 6px', letterSpacing: '-0.02em' }}>{pageData.offer_name}</h1>
            {trialDays ? (
              <p style={{ fontSize: '13px', color: '#4ab585' }}>{trialDays}-day free trial, then {currencySymbol}{formattedPrice}/{billingInterval === 'monthly' ? 'mo' : 'yr'}</p>
            ) : (
              <p style={{ fontSize: '13px', color: t.subText }}>{currencySymbol}{formattedPrice}/{billingInterval === 'monthly' ? 'month' : 'year'}</p>
            )}
          </div>

          <div style={{ background: t.surface, border: `0.5px solid ${t.border}`, borderRadius: '10px', overflow: 'hidden', padding: '24px' }}>
            <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: t.bg, fontFamily: 'Inter, ui-sans-serif, sans-serif', fontSize: '14px', color: t.text }}>
      <div style={{ borderBottom: `0.5px solid ${t.border}`, padding: '0 24px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 20, background: isLight ? 'rgba(250,250,250,0.9)' : 'rgba(10,10,10,0.9)', backdropFilter: 'blur(10px)' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', fontSize: '12px', fontWeight: 500, color: t.subText }}>
          <span style={{ width: '16px', height: '16px', borderRadius: '4px', background: 'rgba(88,101,242,0.12)', border: '0.5px solid rgba(88,101,242,0.25)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#8b92f8', fontSize: '10px', fontWeight: 700 }}>A</span>
          Secured by AccessGate
        </span>
        {trialDays && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 9px', borderRadius: '999px', background: 'rgba(88,101,242,0.10)', border: '0.5px solid rgba(88,101,242,0.22)', color: '#8b92f8', fontSize: '10.5px', fontWeight: 500 }}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'currentColor' }} />
            {trialDays}-day free trial
          </span>
        )}
      </div>

      <div style={{ maxWidth: '1060px', margin: '0 auto', padding: '40px 24px 80px', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 360px', gap: '32px', alignItems: 'start' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
            {pageData.hero_image_url && (
              <div style={{ width: '72px', height: '72px', borderRadius: '16px', border: `0.5px solid ${t.border}`, overflow: 'hidden', flexShrink: 0 }}>
                <img src={pageData.hero_image_url} alt={pageData.offer_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            <div>
              <p style={{ fontSize: '11px', fontWeight: 500, color: t.mutedText, letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 4px' }}>
                @{pageData.creator_slug}
              </p>
              <h1 style={{ fontSize: '28px', fontWeight: 500, letterSpacing: '-0.025em', color: t.text, margin: 0, lineHeight: 1.1 }}>
                {pageData.offer_name}
              </h1>
            </div>
          </div>

          {pageData.features && pageData.features.length > 0 && (
            <div style={{ background: t.surface, border: `0.5px solid ${t.border}`, borderRadius: '10px', overflow: 'hidden', marginBottom: '16px' }}>
              <div style={{ padding: '16px 20px', borderBottom: `0.5px solid ${t.borderSoft}` }}>
                <h2 style={{ fontSize: '14px', fontWeight: 500, color: t.text, margin: 0 }}>What's included</h2>
              </div>
              <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {pageData.features.map(feature => (
                  <div key={feature.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(88,101,242,0.10)', border: '0.5px solid rgba(88,101,242,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>
                      {feature.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '13.5px', fontWeight: 500, color: t.text, margin: '0 0 3px' }}>{feature.title}</p>
                      {feature.description && <p style={{ fontSize: '12.5px', color: t.subText, margin: 0, lineHeight: 1.5 }}>{feature.description}</p>}
                    </div>
                    <Check style={{ width: '14px', height: '14px', color: '#4ab585', flexShrink: 0, marginTop: '2px' }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {pageData.description && (
            <div style={{ background: t.surface, border: `0.5px solid ${t.border}`, borderRadius: '10px', overflow: 'hidden', marginBottom: '16px' }}>
              <div style={{ padding: '16px 20px', borderBottom: `0.5px solid ${t.borderSoft}` }}>
                <h2 style={{ fontSize: '14px', fontWeight: 500, color: t.text, margin: 0 }}>About</h2>
              </div>
              <div style={{ padding: '20px' }}>
                <MarkdownRenderer content={pageData.description} className={isLight ? 'text-gray-700' : 'text-slate-300'} />
              </div>
            </div>
          )}
        </div>

        <div style={{ position: 'sticky', top: '68px' }}>
          <div style={{ background: t.surface, border: `0.5px solid ${t.border}`, borderRadius: '10px', overflow: 'hidden' }}>
            {trialDays && (
              <div style={{ padding: '10px 20px', background: 'rgba(47,157,107,0.08)', borderBottom: '0.5px solid rgba(47,157,107,0.18)', textAlign: 'center' }}>
                <p style={{ fontSize: '12.5px', fontWeight: 500, color: '#4ab585', margin: 0 }}>
                  {trialDays}-day free trial included
                </p>
              </div>
            )}

            <div style={{ padding: '20px' }}>
              {pageData.has_yearly && (
                <div style={{ display: 'flex', gap: '3px', marginBottom: '16px', background: t.surfaceAlt, border: `0.5px solid ${t.border}`, borderRadius: '8px', padding: '3px' }}>
                  {(['monthly', 'yearly'] as const).map(plan => (
                    <button
                      key={plan}
                      onClick={() => handleBillingIntervalChange(plan)}
                      style={{
                        flex: 1, padding: '7px 10px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 500,
                        border: '0', cursor: 'pointer', transition: 'all 180ms ease',
                        background: billingInterval === plan ? (isLight ? '#fff' : '#1a1a1a') : 'transparent',
                        color: billingInterval === plan ? t.text : t.subText,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                      }}
                    >
                      {plan.charAt(0).toUpperCase() + plan.slice(1)}
                      {plan === 'yearly' && billingInterval !== 'yearly' && (
                        <span style={{ padding: '1px 5px', borderRadius: '999px', background: 'rgba(47,157,107,0.12)', color: '#4ab585', fontSize: '10px', fontWeight: 600 }}>Save</span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '34px', fontWeight: 500, letterSpacing: '-0.025em', color: t.text, lineHeight: 1 }}>
                  {currencySymbol}{formattedPrice}
                  <span style={{ fontSize: '16px', fontWeight: 400, color: t.subText }}>/{billingInterval === 'monthly' ? 'month' : 'year'}</span>
                </div>
                {trialDays && (
                  <p style={{ fontSize: '12px', color: t.subText, marginTop: '5px' }}>
                    {trialDays} days free, then {currencySymbol}{formattedPrice}/{billingInterval === 'monthly' ? 'mo' : 'yr'}
                  </p>
                )}
              </div>

              <button
                onClick={handleGetAccess}
                disabled={isCreatingSession}
                style={{
                  width: '100%', padding: '11px', borderRadius: '8px',
                  background: '#5865f2', border: '0.5px solid #5865f2',
                  color: '#fff', fontSize: '13.5px', fontWeight: 500,
                  cursor: isCreatingSession ? 'not-allowed' : 'pointer',
                  opacity: isCreatingSession ? 0.7 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  marginBottom: '16px', transition: 'opacity 180ms ease',
                }}
              >
                {isCreatingSession ? (
                  <><Loader2 style={{ width: '14px', height: '14px' }} className="animate-spin" /> Processing...</>
                ) : (
                  trialDays ? `Start ${trialDays}-day free trial` : `Join for ${currencySymbol}${formattedPrice}/${billingInterval === 'monthly' ? 'mo' : 'yr'}`
                )}
              </button>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', paddingBottom: '16px', marginBottom: '16px', borderBottom: `0.5px solid ${t.divider}` }}>
                {[
                  trialDays ? `${trialDays}-day free trial` : null,
                  'Instant Discord access',
                  'Cancel anytime',
                  'Secure payment via Stripe',
                ].filter(Boolean).map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px' }}>
                    <Check style={{ width: '13px', height: '13px', color: '#4ab585', flexShrink: 0 }} />
                    <span style={{ color: t.subText }}>{item}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Shield style={{ width: '12px', height: '12px', color: t.mutedText }} />
                <p style={{ fontSize: '11px', color: t.mutedText, margin: 0 }}>
                  Secured by Stripe
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .public-page-grid { grid-template-columns: 1fr !important; }
          .public-page-sidebar { position: static !important; top: auto !important; }
        }
      `}</style>
    </div>
  );
}
