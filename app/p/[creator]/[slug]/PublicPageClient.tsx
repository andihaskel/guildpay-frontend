'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader as Loader2, Check, ArrowLeft, Lock, Shield, Users, Calendar } from 'lucide-react';
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
    const load = async () => {
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
    load();
  }, [params.creator, params.slug, publicPath]);

  const handleGetAccess = async () => {
    if (!pageData) return;
    const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!stripePublishableKey) { toast.error('Stripe publishable key is missing.'); return; }
    if (!stripePublishableKey.startsWith('pk_test_') && !stripePublishableKey.startsWith('pk_live_')) { toast.error('Invalid Stripe publishable key format.'); return; }
    try {
      setIsCreatingSession(true);
      const { client_secret, stripe_account } = await api.createPublicCheckoutSession(publicPath, billingInterval);
      sessionStorage.setItem('stripe_account', stripe_account);
      setStripePromise(loadStripe(stripePublishableKey));
      setClientSecret(client_secret);
      setStep('checkout');
    } catch (err: any) {
      toast.error(err.message || 'Failed to start checkout.');
    } finally {
      setIsCreatingSession(false);
    }
  };

  const handleBackToDetails = () => { setStep('details'); setClientSecret(null); };

  const handleBillingIntervalChange = (interval: 'monthly' | 'yearly') => {
    setBillingInterval(interval);
    if (step === 'checkout') { setStep('details'); setClientSecret(null); }
  };

  const fetchClientSecret = useCallback(async () => {
    if (!clientSecret) return '';
    return clientSecret;
  }, [clientSecret]);

  const resolvedStyle = pageData?.style ?? pageData?.settings?.page_style ?? 'dark';
  const isLight = resolvedStyle === 'light';

  const c = {
    bg: isLight ? '#fafafa' : '#0a0a0a',
    bgAlt: isLight ? '#f5f5f5' : '#0d0d0d',
    surface1: isLight ? '#ffffff' : '#111111',
    surface2: isLight ? '#f7f7f7' : '#161616',
    surface3: isLight ? '#f0f0f0' : '#1a1a1a',
    border: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)',
    borderSoft: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.06)',
    borderStrong: isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.12)',
    text: isLight ? '#0a0a0a' : '#f0f0f0',
    textSecondary: isLight ? '#555' : '#888',
    textMuted: isLight ? '#888' : '#555',
    textFaint: isLight ? '#bbb' : '#2a2a2a',
    accentSoftBg: 'rgba(88,101,242,0.12)',
    accentSoftBorder: 'rgba(88,101,242,0.25)',
    accentSoftText: '#8b92f8',
    successSoftBg: 'rgba(47,157,107,0.10)',
    successSoftBorder: 'rgba(47,157,107,0.22)',
    successSoftText: '#4ab585',
  };

  const font = 'Inter, ui-sans-serif, system-ui, -apple-system, sans-serif';

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font }}>
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
      <div style={{ minHeight: '100vh', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: font }}>
        <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(214,69,69,0.08)', border: '0.5px solid rgba(214,69,69,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Lock style={{ width: '22px', height: '22px', color: '#e06a6a' }} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 500, color: c.text, margin: '0 0 8px', letterSpacing: '-0.02em' }}>{pageData.offer_name}</h1>
          <p style={{ fontSize: '14px', color: c.textSecondary, margin: '0 0 24px', lineHeight: 1.6 }}>Signups are currently closed. Check back later or contact the creator.</p>
          <button onClick={() => router.push('/')} style={{ padding: '8px 16px', borderRadius: '6px', background: isLight ? '#0a0a0a' : '#fff', color: isLight ? '#fff' : '#0a0a0a', fontSize: '13px', fontWeight: 500, border: '0', cursor: 'pointer' }}>Go home</button>
        </div>
      </div>
    );
  }

  const currentPrice = billingInterval === 'monthly' ? pageData.monthly_amount_minor : pageData.yearly_amount_minor;
  const formattedPrice = (currentPrice / 100).toFixed(2);
  const displayPrice = Math.floor(currentPrice / 100);
  const hasCents = currentPrice % 100 !== 0;
  const currSym = pageData.currency === 'usd' ? '$' : pageData.currency === 'eur' ? '€' : pageData.currency === 'gbp' ? '£' : pageData.currency.toUpperCase();
  const trialDays = pageData.trial_days && pageData.trial_days > 0 ? pageData.trial_days : null;
  const initials = pageData.offer_name.trim().split(/\s+/).slice(0, 2).map(w => w[0] || '').join('').toUpperCase() || 'A';

  if (step === 'checkout' && clientSecret && stripePromise) {
    return (
      <div style={{ minHeight: '100vh', background: c.bg, fontFamily: font }}>
        <header style={{ height: '48px', borderBottom: `0.5px solid ${c.borderSoft}`, display: 'flex', alignItems: 'center', padding: '0 24px', position: 'sticky', top: 0, zIndex: 20, background: isLight ? 'rgba(250,250,250,0.85)' : 'rgba(10,10,10,0.85)', backdropFilter: 'saturate(140%) blur(10px)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: c.textSecondary, fontWeight: 500 }}>
            <span style={{ width: '18px', height: '18px', borderRadius: '4px', background: c.accentSoftBg, border: `0.5px solid ${c.accentSoftBorder}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: c.accentSoftText, fontWeight: 600, fontSize: '10.5px' }}>A</span>
            Secured by AccessGate
          </span>
        </header>

        <div style={{ maxWidth: '720px', margin: '0 auto', padding: '32px 24px 80px' }}>
          <button onClick={handleBackToDetails} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500, color: c.textSecondary, background: 'none', border: '0', cursor: 'pointer', marginBottom: '28px', padding: 0 }}>
            <ArrowLeft style={{ width: '14px', height: '14px' }} />
            Back to details
          </button>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 500, color: c.text, margin: '0 0 6px', letterSpacing: '-0.02em' }}>{pageData.offer_name}</h1>
            {trialDays ? (
              <p style={{ fontSize: '13px', color: c.successSoftText, margin: 0 }}>{trialDays}-day free trial, then {currSym}{formattedPrice}/{billingInterval === 'monthly' ? 'mo' : 'yr'}</p>
            ) : (
              <p style={{ fontSize: '13px', color: c.textSecondary, margin: 0 }}>{currSym}{formattedPrice}/{billingInterval === 'monthly' ? 'month' : 'year'}</p>
            )}
          </div>
          <div style={{ background: c.surface1, border: `0.5px solid ${c.border}`, borderRadius: '14px', overflow: 'hidden', padding: '24px' }}>
            <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: c.bg, fontFamily: font, color: c.text, fontSize: '15px', lineHeight: 1.6 }}>

      {/* Top chrome */}
      <header style={{ height: '48px', borderBottom: `0.5px solid ${c.borderSoft}`, display: 'flex', alignItems: 'center', padding: '0 24px', position: 'sticky', top: 0, zIndex: 20, background: isLight ? 'rgba(250,250,250,0.85)' : 'rgba(10,10,10,0.85)', backdropFilter: 'saturate(140%) blur(10px)' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: c.textSecondary, fontWeight: 500, letterSpacing: '-0.005em' }}>
          <span style={{ width: '18px', height: '18px', borderRadius: '4px', background: c.accentSoftBg, border: `0.5px solid ${c.accentSoftBorder}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: c.accentSoftText, fontWeight: 600, fontSize: '10.5px' }}>A</span>
          Secured by AccessGate
        </span>
      </header>

      {/* Hero */}
      <section style={{ padding: '56px 0 40px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-80px', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '340px', background: 'radial-gradient(closest-side, rgba(88,101,242,0.18), transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 32px' }}>
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '18px' }}>
            <div style={{ width: '76px', height: '76px', borderRadius: '18px', background: 'linear-gradient(135deg, #5865f2, #7983f5)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 600, fontSize: '26px', letterSpacing: '-0.02em', border: `0.5px solid ${c.border}`, boxShadow: '0 12px 32px rgba(0,0,0,0.4)', overflow: 'hidden' }}>
              {pageData.hero_image_url ? (
                <img src={pageData.hero_image_url} alt={pageData.offer_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : initials}
            </div>
            <p style={{ fontSize: '12px', fontWeight: 500, color: c.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>@{pageData.creator_slug}</p>
            <h1 style={{ fontSize: '44px', fontWeight: 500, letterSpacing: '-0.03em', margin: 0, lineHeight: 1.08, color: c.text }}>{pageData.offer_name}</h1>

            {/* Trust row */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '20px', padding: '10px 18px', background: c.surface1, border: `0.5px solid ${c.border}`, borderRadius: '999px', marginTop: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: c.textSecondary }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: c.successSoftText, boxShadow: `0 0 8px ${c.successSoftText}` }} />
                <span>Active community</span>
              </span>
              <span style={{ width: '1px', height: '14px', background: c.border }} />
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: c.textSecondary }}>
                <Users style={{ width: '13px', height: '13px', color: c.textMuted }} />
                <span>Discord members</span>
              </span>
              {trialDays && (
                <>
                  <span style={{ width: '1px', height: '14px', background: c.border }} />
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: c.textSecondary }}>
                    <Calendar style={{ width: '13px', height: '13px', color: c.textMuted }} />
                    <span><strong style={{ color: c.text, fontWeight: 500 }}>{trialDays}-day</strong> free trial</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Content grid */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 32px' }}>
        <div className="public-content-grid" style={{ padding: '40px 0 64px', display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px', alignItems: 'flex-start' }}>

          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Features card */}
            {pageData.features && pageData.features.length > 0 && (
              <div style={{ background: c.surface1, border: `0.5px solid ${c.border}`, borderRadius: '14px', overflow: 'hidden' }}>
                <div style={{ padding: '18px 22px', borderBottom: `0.5px solid ${c.borderSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h2 style={{ fontSize: '13px', fontWeight: 500, margin: 0, color: c.text, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    What&apos;s <span style={{ color: c.accentSoftText }}>included</span>
                  </h2>
                  <span style={{ fontSize: '11.5px', color: c.textMuted, fontVariantNumeric: 'tabular-nums' }}>{pageData.features.length} benefit{pageData.features.length !== 1 ? 's' : ''}</span>
                </div>
                <div style={{ padding: '8px' }}>
                  {pageData.features.map((feature, idx) => (
                    <div
                      key={feature.id}
                      style={{ display: 'grid', gridTemplateColumns: '40px 1fr auto', gap: '14px', padding: '14px', borderRadius: '10px', alignItems: 'flex-start', borderTop: idx > 0 ? `0.5px solid ${c.borderSoft}` : 'none' }}
                    >
                      <span style={{ width: '36px', height: '36px', borderRadius: '9px', background: c.accentSoftBg, border: `0.5px solid ${c.accentSoftBorder}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>
                        {feature.icon}
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: '14.5px', fontWeight: 500, color: c.text, margin: '0 0 3px', letterSpacing: '-0.01em' }}>{feature.title}</p>
                        {feature.description && <p style={{ fontSize: '13.5px', color: c.textSecondary, margin: 0, lineHeight: 1.5 }}>{feature.description}</p>}
                      </div>
                      <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: c.successSoftBg, border: `0.5px solid ${c.successSoftBorder}`, color: c.successSoftText, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                        <Check style={{ width: '11px', height: '11px' }} />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description card */}
            {pageData.description && (
              <div style={{ background: c.surface1, border: `0.5px solid ${c.border}`, borderRadius: '14px', overflow: 'hidden' }}>
                <div style={{ padding: '18px 22px', borderBottom: `0.5px solid ${c.borderSoft}` }}>
                  <h2 style={{ fontSize: '13px', fontWeight: 500, margin: 0, color: c.text, letterSpacing: '0.08em', textTransform: 'uppercase' }}>About</h2>
                </div>
                <div style={{ padding: '20px 22px' }}>
                  <MarkdownRenderer content={pageData.description} className={isLight ? 'text-gray-700' : 'text-slate-300'} />
                </div>
              </div>
            )}

            {/* Discord preview card */}
            <div style={{ background: c.surface1, border: `0.5px solid ${c.border}`, borderRadius: '14px', padding: '20px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <span style={{ width: '36px', height: '36px', borderRadius: '9px', background: '#5865f2', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M19.5 4.4a16.5 16.5 0 0 0-4-1.3l-.2.4a15 15 0 0 1 3.7 1.2 14 14 0 0 0-14 0 15 15 0 0 1 3.7-1.2l-.2-.4a16.5 16.5 0 0 0-4 1.3C1.7 9 .9 13.4 1.3 17.8c1.6 1.2 3.2 1.9 4.8 2.4.4-.5.7-1.1 1-1.7a10 10 0 0 1-1.6-.8l.4-.3a10 10 0 0 0 12.2 0l.4.3a10 10 0 0 1-1.6.8c.3.6.6 1.2 1 1.7 1.6-.5 3.2-1.2 4.8-2.4.5-5-1-9.4-3.2-13.4zM8.5 15.2c-1 0-1.8-1-1.8-2.1 0-1.2.8-2.2 1.8-2.2s1.8 1 1.8 2.2c0 1.2-.8 2.1-1.8 2.1zm7 0c-1 0-1.8-1-1.8-2.1 0-1.2.8-2.2 1.8-2.2s1.8 1 1.8 2.2c0 1.2-.8 2.1-1.8 2.1z"/></svg>
                </span>
                <div>
                  <h3 style={{ fontSize: '14.5px', fontWeight: 500, margin: 0, letterSpacing: '-0.01em', color: c.text }}>What&apos;s inside the server</h3>
                  <p style={{ fontSize: '12.5px', color: c.textMuted, margin: '2px 0 0' }}>A peek at the channels you&apos;ll unlock.</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {['welcome', 'introductions', 'general', 'announcements', 'members-only'].map((ch, i) => (
                  <div
                    key={ch}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '10px',
                      padding: '8px 10px', borderRadius: '6px',
                      fontSize: '13.5px', fontWeight: 500, letterSpacing: '-0.005em',
                      color: i === 0 ? c.text : c.textMuted,
                      background: i === 0 ? c.accentSoftBg : 'transparent',
                    }}
                  >
                    <span style={{ color: c.textMuted, fontSize: '15px', fontWeight: 400, width: '16px', textAlign: 'center' }}>#</span>
                    {ch}
                    {i > 0 && (
                      <Lock style={{ width: '12px', height: '12px', marginLeft: 'auto', opacity: 0.6 }} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column: pricing sticky */}
          <div className="public-pricing-col" style={{ position: 'sticky', top: '72px' }}>
            <div style={{ background: c.surface1, border: `0.5px solid ${c.border}`, borderRadius: '14px', padding: '22px', display: 'flex', flexDirection: 'column', gap: '18px' }}>

              {/* Billing toggle */}
              {pageData.has_yearly && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '3px', background: c.bgAlt, border: `0.5px solid ${c.border}`, borderRadius: '8px' }}>
                  {(['monthly', 'yearly'] as const).map(plan => (
                    <button
                      key={plan}
                      onClick={() => handleBillingIntervalChange(plan)}
                      style={{
                        padding: '7px 10px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 500,
                        color: billingInterval === plan ? c.text : c.textSecondary,
                        background: billingInterval === plan ? c.surface3 : 'transparent',
                        border: '0', cursor: 'pointer',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        letterSpacing: '-0.005em', transition: 'color 180ms ease, background 180ms ease',
                      }}
                    >
                      {plan.charAt(0).toUpperCase() + plan.slice(1)}
                      {plan === 'yearly' && (
                        <span style={{ fontSize: '9.5px', fontWeight: 500, color: c.successSoftText, background: c.successSoftBg, border: `0.5px solid ${c.successSoftBorder}`, padding: '1px 6px', borderRadius: '999px', letterSpacing: '0.02em' }}>SAVE</span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Price display */}
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{ fontSize: '40px', fontWeight: 500, letterSpacing: '-0.03em', color: c.text, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                    {currSym}{hasCents ? formattedPrice : displayPrice}
                  </span>
                  <span style={{ fontSize: '14px', color: c.textSecondary }}>/ {billingInterval === 'monthly' ? 'month' : 'year'}</span>
                </div>
                <p style={{ fontSize: '12.5px', color: c.textMuted, margin: '4px 0 0' }}>
                  {trialDays ? (
                    <><strong style={{ color: c.successSoftText, fontWeight: 500 }}>{trialDays} days free</strong>, then {currSym}{formattedPrice}/{billingInterval === 'monthly' ? 'mo' : 'yr'}</>
                  ) : (
                    <>Billed {billingInterval} &middot; cancel anytime</>
                  )}
                </p>
              </div>

              {/* CTA button */}
              <button
                onClick={handleGetAccess}
                disabled={isCreatingSession}
                style={{
                  width: '100%', padding: '12px', background: '#5865f2', color: '#fff',
                  border: '0.5px solid #5865f2', borderRadius: '8px', fontSize: '14px', fontWeight: 500,
                  letterSpacing: '-0.005em', cursor: isCreatingSession ? 'not-allowed' : 'pointer',
                  opacity: isCreatingSession ? 0.7 : 1, transition: 'background 180ms ease',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}
              >
                {isCreatingSession ? (
                  <><Loader2 className="animate-spin" style={{ width: '14px', height: '14px' }} /> Processing...</>
                ) : (
                  trialDays
                    ? `Start ${trialDays}-day free trial`
                    : `Join for ${currSym}${hasCents ? formattedPrice : displayPrice} / ${billingInterval === 'monthly' ? 'mo' : 'yr'}`
                )}
              </button>

              {/* Perks list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  'Instant Discord access',
                  'Cancel anytime',
                  'Secure payment via Stripe',
                  ...(trialDays ? [`${trialDays}-day satisfaction guarantee`] : []),
                ].map(perk => (
                  <div key={perk} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: c.text }}>
                    <Check style={{ width: '14px', height: '14px', color: c.successSoftText, flexShrink: 0 }} />
                    {perk}
                  </div>
                ))}
              </div>

              {/* Secure note */}
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '11.5px', color: c.textMuted, paddingTop: '6px', borderTop: `0.5px dashed ${c.border}` }}>
                <Shield style={{ width: '12px', height: '12px', opacity: 0.7 }} />
                Secured by Stripe &middot; Powered by AccessGate
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* FAQ strip */}
      <section style={{ padding: '24px 0 64px', borderTop: `0.5px solid ${c.borderSoft}` }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 32px' }}>
          <span style={{ fontSize: '11px', color: c.textMuted, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Common questions</span>
          <div className="public-faq-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, marginTop: '20px', background: c.borderSoft, border: `0.5px solid ${c.borderSoft}`, borderRadius: '12px', overflow: 'hidden' }}>
            {[
              { q: 'How does access work?', a: 'After checkout, you\'ll get an invite link and be auto-assigned your role in Discord within seconds.' },
              { q: 'Can I cancel anytime?', a: 'Yes. Cancel from your dashboard and keep access until the end of your billing period.' },
              { q: 'Is my payment secure?', a: 'All payments are processed by Stripe. We never see or store your card details.' },
            ].map(({ q, a }) => (
              <div key={q} style={{ background: c.surface1, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <p style={{ fontSize: '13.5px', fontWeight: 500, color: c.text, margin: 0, letterSpacing: '-0.005em' }}>{q}</p>
                <p style={{ fontSize: '13px', color: c.textSecondary, margin: 0, lineHeight: 1.55 }}>{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: `0.5px solid ${c.borderSoft}`, maxWidth: '1100px', margin: '0 auto', padding: '22px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', fontSize: '12px', color: c.textMuted }}>
        <span>&copy; {new Date().getFullYear()} {pageData.offer_name} &middot; Powered by AccessGate</span>
        <span style={{ display: 'inline-flex', gap: '18px' }}>
          <a href="#" style={{ color: c.textSecondary }}>Terms</a>
          <a href="#" style={{ color: c.textSecondary }}>Privacy</a>
        </span>
      </footer>

      <style>{`
        @media (max-width: 900px) {
          .public-content-grid { grid-template-columns: 1fr !important; gap: 20px !important; padding: 24px 0 48px !important; }
          .public-pricing-col { position: static !important; }
          .public-faq-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 700px) {
          section > div[style*="padding: 0 32px"] { padding: 0 20px !important; }
        }
      `}</style>
    </div>
  );
}
