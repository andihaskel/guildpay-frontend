'use client';

import { useMemo, useState } from 'react';
import { CommunityChannel, CommunityPlan } from '@/lib/types';
import { fmtAmount } from '@/components/community/setup-utils';
import { SetupPreviewModel } from '@/components/community/setup-preview-types';

function CheckIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function DiscordIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19.5 4.4a16.5 16.5 0 0 0-4-1.3l-.2.4a15 15 0 0 1 3.7 1.2 14 14 0 0 0-14 0 15 15 0 0 1 3.7-1.2l-.2-.4a16.5 16.5 0 0 0-4 1.3C1.7 9 .9 13.4 1.3 17.8c1.6 1.2 3.2 1.9 4.8 2.4z" />
    </svg>
  );
}

const DEFAULT_FEATURES = [
  { icon: '💬', title: 'Access to group chats', desc: 'Join private conversations with other members.' },
  { icon: '⚡', title: 'Real-time updates', desc: 'Stay connected with instant messages and updates.' },
  { icon: '🔒', title: 'Community-only content', desc: 'Resources and discussions for members only.' },
];

function planChannels(plan: CommunityPlan, channels: CommunityChannel[]) {
  const ids = new Set(plan.channel_ids ?? []);
  return channels.filter(c => ids.has(c.id));
}

function resolvePlan(plans: CommunityPlan[], selectedPlanId: string | null) {
  if (selectedPlanId && plans.some(p => p.id === selectedPlanId)) {
    return plans.find(p => p.id === selectedPlanId)!;
  }
  return plans[0] ?? null;
}

function planPrice(plan: CommunityPlan, billing: 'monthly' | 'yearly') {
  const hasYearly = (plan.yearly_amount_minor ?? 0) > 0;
  const hasMonthly = (plan.monthly_amount_minor ?? 0) > 0;

  if (billing === 'yearly' && hasYearly) {
    return {
      amount: plan.yearly_amount_minor!,
      period: '/ year',
      sub: 'Billed annually · cancel anytime',
      ctaSuffix: '/ yr',
    };
  }

  if (hasMonthly) {
    return {
      amount: plan.monthly_amount_minor,
      period: '/ month',
      sub: 'Billed monthly · cancel anytime',
      ctaSuffix: '/ mo',
    };
  }

  if (hasYearly) {
    return {
      amount: plan.yearly_amount_minor!,
      period: '/ year',
      sub: 'Billed annually · cancel anytime',
      ctaSuffix: '/ yr',
    };
  }

  return { amount: 0, period: '', sub: '', ctaSuffix: '' };
}

function sellingPointsToFeatures(points: string[]) {
  if (points.length === 0) return DEFAULT_FEATURES;
  return points.map((pt, i) => ({
    icon: ['📈', '🎟️', '✨'][i % 3],
    title: pt.split(' — ')[0] || pt,
    desc: pt.includes(' — ') ? pt.split(' — ').slice(1).join(' — ') : '',
  }));
}

export function CommunitySetupPreview({ model }: { model: SetupPreviewModel }) {
  const { page, plans, channels, selectedPlanId, faq, slug, sellingPoints } = model;
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');

  const plan = useMemo(() => resolvePlan(plans, selectedPlanId), [plans, selectedPlanId]);
  const linkedChannels = useMemo(() => (plan ? planChannels(plan, channels) : []), [plan, channels]);

  const hasYearly = plan ? (plan.yearly_amount_minor ?? 0) > 0 : false;
  const price = plan ? planPrice(plan, billing) : null;
  const trialDays = plan?.trial_days && plan.trial_days > 0 ? plan.trial_days : null;

  const avatarInitial = (page.communityName.trim()[0] || '?').toUpperCase();
  const memberCount = plan?.member_counts.active ?? 0;
  const displayMembers = memberCount > 0 ? memberCount : 28;

  const features = useMemo(() => sellingPointsToFeatures(sellingPoints), [sellingPoints]);

  const yearlySavings =
    plan && hasYearly && plan.monthly_amount_minor > 0
      ? Math.max(0, plan.monthly_amount_minor * 12 - (plan.yearly_amount_minor ?? 0))
      : 0;

  return (
    <div
      className="pp"
      style={{ ['--pp-accent-dynamic' as string]: page.accentColor }}
    >
      <header className="pp-top">
        <span className="pp-brand">
          <span className="pp-brand-mark">A</span>
          Secured by AccessGate
        </span>
      </header>

      <section className="pp-hero">
        <div className="pp-wrap">
          <div className="pp-hero-inner">
            <div
              className="pp-avatar"
              style={{
                background: `linear-gradient(135deg, ${page.accentColor}, color-mix(in srgb, ${page.accentColor} 55%, #7c3aed))`,
              }}
            >
              {avatarInitial}
            </div>
            {slug ? <p className="pp-handle">@{slug}</p> : null}
            <h1>{page.headline || page.communityName}</h1>
            <p className="pp-tagline">{page.subHeadline || page.tagline}</p>

            <div className="pp-trust-row">
              <span className="pp-trust-item">
                <span className="pp-live-dot" />
                <span>
                  <strong>{Math.max(3, Math.round(displayMembers * 0.15))}</strong> online now
                </span>
              </span>
              <span className="pp-trust-sep" />
              <span className="pp-trust-item">
                <strong>{displayMembers}</strong> members
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="pp-wrap">
        <div className="pp-content">
          <div className="pp-left-col">
            <div className="pp-card">
              <div className="pp-card-head">
                <h2>
                  What&apos;s <span className="accent">included</span>
                </h2>
                <span className="pp-card-count">{features.length} benefits</span>
              </div>
              <div className="pp-features">
                {features.map(f => (
                  <div key={f.title} className="pp-feature">
                    <span className="pp-feature-icon">{f.icon}</span>
                    <div>
                      <p className="pp-feature-title">{f.title}</p>
                      {f.desc ? <p className="pp-feature-desc">{f.desc}</p> : null}
                    </div>
                    <span className="pp-feature-check">
                      <CheckIcon />
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {linkedChannels.length > 0 ? (
              <div className="pp-discord-card">
                <div className="pp-discord-head">
                  <span className="pp-discord-icon">
                    <DiscordIcon />
                  </span>
                  <div>
                    <h3>What&apos;s inside the server</h3>
                    <p>A peek at the channels you&apos;ll unlock.</p>
                  </div>
                </div>
                <div>
                  {linkedChannels.map((ch, idx) => (
                    <div key={ch.id} className={`pp-channel${idx === 0 ? ' active' : ' locked'}`}>
                      <span className="pp-channel-hash">#</span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ch.name.toLowerCase().replace(/\s+/g, '-')}
                      </span>
                      {idx === 0 ? (
                        <span className="pp-channel-meta">{ch.members_synced ?? 12} online</span>
                      ) : (
                        <span className="pp-channel-meta">
                          <LockIcon />
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="pp-pricing-col">
            {plan && price ? (
              <div className="pp-pricing">
                {hasYearly ? (
                  <div className="pp-billing-toggle" role="tablist" aria-label="Billing period">
                    <button
                      type="button"
                      className={billing === 'monthly' ? 'is-active' : ''}
                      onClick={() => setBilling('monthly')}
                    >
                      Monthly
                    </button>
                    <button
                      type="button"
                      className={billing === 'yearly' ? 'is-active' : ''}
                      onClick={() => setBilling('yearly')}
                    >
                      Yearly
                      {yearlySavings > 0 ? <span className="pp-save-chip">SAVE</span> : null}
                    </button>
                  </div>
                ) : null}

                <div>
                  <div className="pp-price-row">
                    <span className="pp-price-amount">{fmtAmount(price.amount, plan.currency)}</span>
                    <span className="pp-price-period">{price.period}</span>
                  </div>
                  <p className="pp-price-sub">
                    {trialDays ? (
                      <>
                        <strong>{trialDays}-day free trial</strong> · then {fmtAmount(price.amount, plan.currency)}
                        {price.period}
                      </>
                    ) : billing === 'yearly' && yearlySavings > 0 ? (
                      <>
                        Billed annually · <strong>save {fmtAmount(yearlySavings, plan.currency)}</strong>
                      </>
                    ) : (
                      price.sub
                    )}
                  </p>
                </div>

                <button type="button" className="pp-cta">
                  {trialDays
                    ? `Start ${trialDays}-day free trial`
                    : `Join for ${fmtAmount(price.amount, plan.currency)}${price.ctaSuffix}`}
                </button>

                <div className="pp-perks">
                  <div className="pp-perk">
                    <CheckIcon />
                    Instant Discord access
                  </div>
                  <div className="pp-perk">
                    <CheckIcon />
                    Cancel anytime
                  </div>
                  <div className="pp-perk">
                    <CheckIcon />
                    Secure payment via Stripe
                  </div>
                </div>

                <div className="pp-secure-note">
                  <LockIcon />
                  Secured by Stripe · Powered by AccessGate
                </div>
              </div>
            ) : (
              <div className="pp-pricing pp-empty-plan">Add a plan to preview pricing.</div>
            )}
          </div>
        </div>
      </section>

      {faq.length > 0 ? (
        <section className="pp-faq pp-wrap">
          <span className="pp-faq-label">Common questions</span>
          <div className="pp-faq-grid">
            {faq.map(item => (
              <div key={item.q} className="pp-faq-item">
                <p className="pp-faq-q">{item.q}</p>
                <p className="pp-faq-a">{item.a}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <footer className="pp-footer pp-wrap">
        <span>
          © {new Date().getFullYear()} {page.communityName} · Powered by AccessGate
        </span>
      </footer>
    </div>
  );
}
