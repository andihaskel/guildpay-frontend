'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Check, Lock, Loader as Loader2 } from 'lucide-react';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import { useProduct } from '@/contexts';
import { api } from '@/lib/api';
import { CreatePageRequest } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function PreviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentProduct } = useProduct();
  const { toast } = useToast();
  const pageId = searchParams.get('id');
  const dataParam = searchParams.get('data');
  const [isPublishing, setIsPublishing] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    if (dataParam) {
      try {
        setFormData(JSON.parse(dataParam));
      } catch { }
    }
  }, [dataParam]);

  const handlePublish = async () => {
    if (!currentProduct?.id || !formData) {
      toast({ title: 'Error', description: 'Missing product or form data', variant: 'destructive' });
      return;
    }
    try {
      setIsPublishing(true);
      const slugCheck = await api.checkSlug(currentProduct.id, formData.offerUrl, pageId || undefined);
      if (!slugCheck.available) {
        toast({ title: 'URL taken', description: `"${formData.offerUrl}" is already taken. Go back and choose a different one.`, variant: 'destructive' });
        setIsPublishing(false);
        return;
      }

      const parsePrice = (p: string) => Math.round(parseFloat(p) * 100);
      const parseTrialDays = (t: string) => {
        if (t === 'None') return undefined;
        const m = t.match(/\d+/);
        return m ? parseInt(m[0]) : undefined;
      };

      const payload: CreatePageRequest = {
        slug: formData.offerUrl,
        offer_name: formData.offerName,
        hero_image_url: formData.offerImage || undefined,
        description: formData.description,
        features: formData.businessFeatures,
        media_gallery_enabled: formData.mediaGalleryEnabled,
        media_items: formData.mediaGalleryEnabled ? formData.mediaItems : undefined,
        discord_role_id: formData.roleToAssign,
        discord_welcome_channel_id: formData.welcomeChannel && formData.welcomeChannel !== 'welcome' ? formData.welcomeChannel : undefined,
        accepts_signups: formData.isActive,
        monthly_amount_minor: parsePrice(formData.price),
        yearly_amount_minor: formData.yearlyOption === 'yes' ? parsePrice(formData.yearlyPrice) : undefined,
        currency: formData.currency.toLowerCase(),
        trial_days: parseTrialDays(formData.freeTrialPeriod),
        style: formData.pageStyle || 'dark',
        settings: {
          coupons_enabled: formData.couponsEnabled,
          crypto_enabled: formData.cryptoEnabled,
          require_name_on_card: formData.requireNameOnCard,
          terms_and_conditions: formData.termsAndConditions,
          page_style: formData.pageStyle || 'dark',
        },
      };

      if (pageId) {
        await api.updatePage(currentProduct.id, pageId, payload);
        toast({ title: 'Updated', description: 'Page updated successfully' });
      } else {
        await api.createPage(currentProduct.id, payload);
        toast({ title: 'Published', description: 'Page created successfully' });
      }
      router.push('/dashboard/pages');
    } catch (error: any) {
      toast({ title: 'Could not save page', description: error?.message || 'Failed to publish page. Please try again.', variant: 'destructive' });
    } finally {
      setIsPublishing(false);
    }
  };

  if (!formData) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
      </div>
    );
  }

  const isLight = formData.pageStyle === 'light';
  const price = parseFloat(formData.price) || 0;
  const yearlyPrice = parseFloat(formData.yearlyPrice) || 0;
  const currSymbol = formData.currency === 'EUR' ? '€' : formData.currency === 'GBP' ? '£' : '$';
  const hasYearly = formData.yearlyOption === 'yes' && formData.interval !== 'Yearly';
  const trialDays = formData.freeTrialPeriod !== 'None' ? formData.freeTrialPeriod.replace(' days', '') : null;

  const displayPrice = selectedPlan === 'yearly' && hasYearly ? yearlyPrice : price;
  const displayPeriod = selectedPlan === 'yearly' && hasYearly ? 'year' : 'month';

  const theme = {
    bg: isLight ? '#fafafa' : '#0a0a0a',
    surface: isLight ? '#ffffff' : '#111111',
    surfaceAlt: isLight ? '#f5f5f5' : '#161616',
    border: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)',
    borderSoft: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
    text: isLight ? '#0a0a0a' : '#f0f0f0',
    subText: isLight ? '#555' : '#888',
    mutedText: isLight ? '#888' : '#555',
    divider: isLight ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.06)',
  };

  return (
    <div style={{ minHeight: '100vh', background: theme.bg, fontFamily: 'Inter, ui-sans-serif, sans-serif' }}>
      <div className="sticky top-0 z-50 h-[52px] flex items-center justify-between px-6 border-b" style={{ background: isLight ? 'rgba(250,250,250,0.92)' : 'rgba(10,10,10,0.92)', backdropFilter: 'blur(10px)', borderColor: theme.border }}>
        <button
          onClick={() => router.push('/dashboard/pages/edit' + (pageId ? `?id=${pageId}` : ''))}
          className="inline-flex items-center gap-2 text-[13px] font-medium transition-colors group"
          style={{ color: theme.subText }}
          onMouseEnter={e => (e.currentTarget.style.color = theme.text)}
          onMouseLeave={e => (e.currentTarget.style.color = theme.subText)}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to editor
        </button>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-medium border" style={{ background: 'rgba(88,101,242,0.08)', borderColor: 'rgba(88,101,242,0.2)', color: '#8b92f8' }}>
          Preview mode
        </span>

        <button
          onClick={handlePublish}
          disabled={isPublishing}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md text-[13px] font-medium transition-opacity disabled:opacity-50"
          style={{ background: '#fff', color: '#0a0a0a', border: '0.5px solid #fff' }}
        >
          {isPublishing ? (
            <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Publishing...</>
          ) : (
            pageId ? 'Save changes' : 'Publish page'
          )}
        </button>
      </div>

      <div className="max-w-[1100px] mx-auto px-6 py-12 grid lg:grid-cols-[1fr_400px] gap-10">
        <div className="space-y-6">
          <div className="flex items-center gap-4 mb-2">
            {formData.offerImage && (
              <div style={{ width: '72px', height: '72px', borderRadius: '16px', border: `0.5px solid ${theme.border}`, overflow: 'hidden', flexShrink: 0 }}>
                <img src={formData.offerImage} alt={formData.offerName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            <div>
              {formData.businessName && (
                <p style={{ fontSize: '11px', fontWeight: 500, color: theme.mutedText, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '4px' }}>
                  {formData.businessName}
                </p>
              )}
              <h1 style={{ fontSize: '28px', fontWeight: 500, letterSpacing: '-0.025em', color: theme.text, margin: 0 }}>
                {formData.offerName || 'Untitled Page'}
              </h1>
            </div>
          </div>

          {formData.businessFeatures?.length > 0 && (
            <div style={{ background: theme.surface, border: `0.5px solid ${theme.border}`, borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: `0.5px solid ${theme.borderSoft}` }}>
                <h2 style={{ fontSize: '14px', fontWeight: 500, color: theme.text, margin: 0 }}>What's included</h2>
              </div>
              <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {formData.businessFeatures.map((f: any, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(88,101,242,0.10)', border: '0.5px solid rgba(88,101,242,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>
                      {f.icon}
                    </div>
                    <div>
                      <p style={{ fontSize: '13.5px', fontWeight: 500, color: theme.text, margin: '0 0 3px' }}>{f.title}</p>
                      {f.description && <p style={{ fontSize: '12.5px', color: theme.subText, margin: 0, lineHeight: 1.5 }}>{f.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {formData.description && (
            <div style={{ background: theme.surface, border: `0.5px solid ${theme.border}`, borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: `0.5px solid ${theme.borderSoft}` }}>
                <h2 style={{ fontSize: '14px', fontWeight: 500, color: theme.text, margin: 0 }}>About</h2>
              </div>
              <div style={{ padding: '20px' }}>
                <MarkdownRenderer content={formData.description} className={isLight ? 'text-gray-700' : 'text-slate-300'} />
              </div>
            </div>
          )}

          {formData.mediaGalleryEnabled && formData.mediaItems?.length > 0 && (
            <div style={{ background: theme.surface, border: `0.5px solid ${theme.border}`, borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: `0.5px solid ${theme.borderSoft}` }}>
                <h2 style={{ fontSize: '14px', fontWeight: 500, color: theme.text, margin: 0 }}>Gallery</h2>
              </div>
              <div style={{ padding: '12px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                {formData.mediaItems.map((item: any, i: number) => (
                  <div key={i} style={{ aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', background: theme.surfaceAlt, position: 'relative' }}>
                    {item.type === 'image' ? (
                      <img src={item.url} alt={item.caption || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <video src={item.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
                    )}
                    <span style={{ position: 'absolute', bottom: '4px', left: '4px', padding: '1px 5px', borderRadius: '3px', fontSize: '9px', fontWeight: 500, background: 'rgba(0,0,0,0.6)', color: '#fff', textTransform: 'uppercase' }}>{item.type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {formData.discordChannelsEnabled && (
            <div style={{ background: theme.surface, border: `0.5px solid ${theme.border}`, borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: `0.5px solid ${theme.borderSoft}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#5865f2', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M19.5 4.4a16.5 16.5 0 0 0-4-1.3l-.2.4a15 15 0 0 1 3.7 1.2 14 14 0 0 0-14 0 15 15 0 0 1 3.7-1.2l-.2-.4a16.5 16.5 0 0 0-4 1.3C1.7 9 .9 13.4 1.3 17.8c1.6 1.2 3.2 1.9 4.8 2.4.4-.5.7-1.1 1-1.7a10 10 0 0 1-1.6-.8l.4-.3a10 10 0 0 0 12.2 0l.4.3a10 10 0 0 1-1.6.8c.3.6.6 1.2 1 1.7 1.6-.5 3.2-1.2 4.8-2.4.5-5-1-9.4-3.2-13.4zM8.5 15.2c-1 0-1.8-1-1.8-2.1 0-1.2.8-2.2 1.8-2.2s1.8 1 1.8 2.2c0 1.2-.8 2.1-1.8 2.1zm7 0c-1 0-1.8-1-1.8-2.1 0-1.2.8-2.2 1.8-2.2s1.8 1 1.8 2.2c0 1.2-.8 2.1-1.8 2.1z"/></svg>
                </span>
                <div>
                  <h2 style={{ fontSize: '14px', fontWeight: 500, color: theme.text, margin: 0 }}>What's inside the server</h2>
                  <p style={{ fontSize: '12px', color: theme.mutedText, margin: '2px 0 0' }}>Channels you'll unlock with this role.</p>
                </div>
              </div>
              <div style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {['welcome', 'general', 'announcements', 'members-only'].map((ch, i) => (
                  <div key={ch} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 10px', borderRadius: '6px', fontSize: '13px', fontWeight: 500, color: i === 0 ? theme.text : theme.mutedText, background: i === 0 ? 'rgba(88,101,242,0.08)' : 'transparent' }}>
                    <span style={{ color: theme.mutedText, fontSize: '14px', width: '14px', textAlign: 'center' }}>#</span>
                    {ch}
                    {i > 0 && <Lock style={{ width: '11px', height: '11px', marginLeft: 'auto', opacity: 0.5 }} />}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ background: theme.surface, border: `0.5px solid ${theme.border}`, borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: `0.5px solid ${theme.borderSoft}` }}>
              <h2 style={{ fontSize: '14px', fontWeight: 500, color: theme.text, margin: 0 }}>Frequently Asked Questions</h2>
            </div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { q: 'How does billing work?', a: `You'll be charged ${selectedPlan === 'monthly' ? 'monthly' : 'annually'} and can cancel anytime. No hidden fees.` },
                { q: 'Can I change my plan later?', a: 'Yes! You can upgrade, downgrade, or cancel your subscription at any time.' },
                { q: 'What payment methods do you accept?', a: 'We accept all major credit cards, debit cards, and digital wallets through Stripe.' },
              ].map(({ q, a }) => (
                <div key={q}>
                  <p style={{ fontSize: '13.5px', fontWeight: 500, color: theme.text, margin: '0 0 4px' }}>{q}</p>
                  <p style={{ fontSize: '12.5px', color: theme.subText, margin: 0, lineHeight: 1.5 }}>{a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div style={{ position: 'sticky', top: '76px' }}>
            <div style={{ background: theme.surface, border: `0.5px solid ${theme.border}`, borderRadius: '10px', overflow: 'hidden', padding: '20px' }}>
              {trialDays && (
                <div style={{ margin: '-20px -20px 16px', padding: '10px 20px', background: 'rgba(47,157,107,0.08)', borderBottom: '0.5px solid rgba(47,157,107,0.2)', textAlign: 'center' }}>
                  <p style={{ fontSize: '12.5px', fontWeight: 500, color: '#4ab585', margin: 0 }}>
                    {trialDays}-day free trial included
                  </p>
                </div>
              )}

              {hasYearly && (
                <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', background: theme.surfaceAlt, border: `0.5px solid ${theme.border}`, borderRadius: '8px', padding: '3px' }}>
                  {(['monthly', 'yearly'] as const).map(plan => (
                    <button
                      key={plan}
                      onClick={() => setSelectedPlan(plan)}
                      style={{
                        flex: 1, padding: '7px 12px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 500,
                        border: '0',
                        background: selectedPlan === plan ? (isLight ? '#fff' : '#1a1a1a') : 'transparent',
                        color: selectedPlan === plan ? theme.text : theme.subText,
                        cursor: 'pointer', transition: 'all 180ms ease',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                      }}
                    >
                      {plan.charAt(0).toUpperCase() + plan.slice(1)}
                      {plan === 'yearly' && (
                        <span style={{ padding: '1px 6px', borderRadius: '999px', background: 'rgba(47,157,107,0.12)', color: '#4ab585', fontSize: '10px', fontWeight: 600 }}>
                          Save
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '36px', fontWeight: 500, letterSpacing: '-0.025em', color: theme.text, lineHeight: 1 }}>
                  {currSymbol}{displayPrice.toFixed(2)}
                  <span style={{ fontSize: '16px', fontWeight: 400, color: theme.subText }}>/{displayPeriod}</span>
                </div>
                {trialDays && (
                  <p style={{ fontSize: '12px', color: theme.subText, marginTop: '6px' }}>
                    {trialDays} days free, then {currSymbol}{displayPrice.toFixed(2)}/{displayPeriod === 'month' ? 'mo' : 'yr'}
                  </p>
                )}
              </div>

              <div style={{ padding: '16px', background: 'rgba(88,101,242,0.04)', border: '1px dashed rgba(88,101,242,0.2)', borderRadius: '8px', textAlign: 'center', marginBottom: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(88,101,242,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                  <Lock style={{ width: '18px', height: '18px', color: '#8b92f8' }} />
                </div>
                <p style={{ fontSize: '13px', fontWeight: 500, color: theme.text, margin: '0 0 4px' }}>Stripe payment form</p>
                <p style={{ fontSize: '12px', color: theme.subText, margin: 0 }}>Secure checkout powered by Stripe</p>
              </div>

              <button
                style={{
                  width: '100%', padding: '10px', borderRadius: '6px', background: '#5865f2', border: '0.5px solid #5865f2',
                  color: '#fff', fontSize: '13.5px', fontWeight: 500, marginBottom: '16px', cursor: 'pointer'
                }}
              >
                {trialDays ? `Start ${trialDays}-day free trial` : `Join for ${currSymbol}${displayPrice.toFixed(2)}/${displayPeriod === 'month' ? 'mo' : 'yr'}`}
              </button>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                {[
                  trialDays ? `${trialDays}-day free trial` : null,
                  'Instant Discord access',
                  'Cancel anytime',
                  'Secure payment via Stripe',
                ].filter(Boolean).map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px' }}>
                    <Check style={{ width: '13px', height: '13px', color: '#4ab585', flexShrink: 0 }} />
                    <span style={{ color: theme.subText }}>{item}</span>
                  </div>
                ))}
              </div>

              <div style={{ paddingTop: '14px', borderTop: `0.5px solid ${theme.border}` }}>
                <p style={{ fontSize: '11px', color: theme.mutedText, textAlign: 'center', lineHeight: 1.5, margin: 0 }}>
                  By subscribing, you agree to our Terms of Service. Your subscription renews automatically until cancelled.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
