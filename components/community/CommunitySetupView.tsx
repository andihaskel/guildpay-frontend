'use client';

import { useRef } from 'react';
import { CommunityOverview, CommunityPlan, CommunityChannel } from '@/lib/types';
import {
  DEFAULT_COMMUNITY_FAQ,
  DEFAULT_COMMUNITY_SELLING_POINTS,
  DEFAULT_COMMUNITY_TESTIMONIALS,
} from '@/components/community/community-preview';
import { useSetupWorkspace } from '@/components/community/SetupWorkspaceContext';
import { SetupPageDraft } from '@/components/community/setup-preview-types';
import { fmtAmount, planColor, planInitials } from '@/components/community/setup-utils';

// ─── types & props ───────────────────────────────────────────────────────────

export type SetupTab = 'page' | 'plans' | 'checkout';

// ─── helpers ─────────────────────────────────────────────────────────────────

const ACCENT_SWATCHES = ['#5865f2', '#7c3aed', '#2f9d6b', '#d97706', '#dc2626', '#0891b2'];

const STATIC_SELLING_POINTS = DEFAULT_COMMUNITY_SELLING_POINTS;
const DEFAULT_TESTIMONIALS = DEFAULT_COMMUNITY_TESTIMONIALS;
const DEFAULT_FAQ = DEFAULT_COMMUNITY_FAQ;

export { fmtAmount, planColor, planInitials } from '@/components/community/setup-utils';

function planIsLive(plan: CommunityPlan) {
  return !!plan.published && plan.status !== 'disabled';
}

function planPriceLabel(plan: CommunityPlan) {
  if (plan.yearly_amount_minor) return `${fmtAmount(plan.yearly_amount_minor, plan.currency)} / yr`;
  return `${fmtAmount(plan.monthly_amount_minor, plan.currency)} / mo`;
}

function planHintLine(plan: CommunityPlan, planChannels: CommunityChannel[]) {
  const providers = Array.from(new Set(planChannels.map(c => c.provider)));
  const provLabel = providers.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' + ') || 'No channels';
  return `${planPriceLabel(plan)} · ${plan.member_counts.active} active · ${provLabel} · 3 benefits`;
}

function channelsForPlan(plan: CommunityPlan, channels: CommunityChannel[]) {
  const ids = new Set(plan.channel_ids ?? []);
  return channels.filter(c => ids.has(c.id));
}

const btnPrimary: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '13px',
  fontWeight: 500,
  padding: '8px 14px',
  borderRadius: '6px',
  background: '#fff',
  color: '#0a0a0a',
  border: '0.5px solid #fff',
  cursor: 'pointer',
  fontFamily: 'inherit',
};

const btnSecondary: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '12.5px',
  fontWeight: 500,
  padding: '6px 12px',
  borderRadius: '6px',
  background: 'transparent',
  border: '0.5px solid rgba(255,255,255,0.15)',
  color: 'var(--text)',
  cursor: 'pointer',
  fontFamily: 'inherit',
};

// ─── chips ───────────────────────────────────────────────────────────────────

function Chip({ variant, children }: { variant: 'success' | 'muted' | 'accent'; children: React.ReactNode }) {
  const palette: Record<string, React.CSSProperties> = {
    success: { background: 'var(--success-soft-bg)', borderColor: 'var(--success-soft-border)', color: 'var(--success-soft-text)' },
    muted: { background: 'rgba(255,255,255,0.04)', borderColor: 'var(--border)', color: 'var(--text-secondary)' },
    accent: { background: 'var(--accent-soft-bg)', borderColor: 'var(--accent-soft-border)', color: 'var(--accent-soft-text)' },
  };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '2px 8px', borderRadius: '999px', fontSize: '11.5px', fontWeight: 500, border: '0.5px solid', whiteSpace: 'nowrap', ...palette[variant] }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} />
      {children}
    </span>
  );
}

function ChipLive() { return <Chip variant="success">Live</Chip>; }
function ChipDraft() { return <Chip variant="muted">Draft</Chip>; }
function ChipConnected() { return <Chip variant="success">Connected</Chip>; }
function ChipSynced() { return <Chip variant="success">Synced</Chip>; }
function ChipRequired() { return <Chip variant="accent">Required</Chip>; }

// ─── icons ───────────────────────────────────────────────────────────────────

function AccChevron() {
  return (
    <svg className="setup-acc-chev" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ProviderIcon({ id, size = 14 }: { id: string; size?: number }) {
  if (id === 'discord') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.5 4.4a16.5 16.5 0 0 0-4-1.3l-.2.4a15 15 0 0 1 3.7 1.2 14 14 0 0 0-14 0 15 15 0 0 1 3.7-1.2l-.2-.4a16.5 16.5 0 0 0-4 1.3C1.7 9 .9 13.4 1.3 17.8c1.6 1.2 3.2 1.9 4.8 2.4z" />
      </svg>
    );
  }
  if (id === 'telegram') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M21.7 3.3 2.6 10.7c-1.3.5-1.3 1.3-.2 1.6l4.9 1.5 1.9 5.8c.2.7.4.9.8.9.5 0 .7-.2 1-.5l2.4-2.3 5 3.7c.9.5 1.5.2 1.7-.8L22.7 5z" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 6.5l8.5 6 8.5-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function providerStyle(id: string) {
  if (id === 'discord') return { bg: 'rgba(88,101,242,0.14)', color: '#8b92f8' };
  if (id === 'telegram') return { bg: 'rgba(34,158,217,0.14)', color: '#5cb8e6' };
  return { bg: 'rgba(74,181,133,0.14)', color: '#4ab585' };
}


// ─── PagePane ──────────────────────────────────────────────────────────────────

function PagePane({
  plans,
  channels,
  pageDraft,
  onPageDraftChange,
  onJumpToPlans,
}: {
  plans: CommunityPlan[];
  channels: CommunityChannel[];
  pageDraft: SetupPageDraft;
  onPageDraftChange: (patch: Partial<SetupPageDraft>) => void;
  onJumpToPlans: () => void;
}) {
  const accRef = useRef<HTMLDivElement>(null);
  const { communityName, tagline, headline, subHeadline, accentColor } = pageDraft;

  const expandAll = () => {
    accRef.current?.querySelectorAll('details.setup-acc').forEach(el => { (el as HTMLDetailsElement).open = true; });
  };
  const collapseAll = () => {
    accRef.current?.querySelectorAll('details.setup-acc').forEach(el => { (el as HTMLDetailsElement).open = false; });
  };

  const planOrderSummary = plans.map(p => p.offer_name).join(' · ') || 'No plans yet';
  const initial = (communityName.trim()[0] || '?').toUpperCase();

  return (
    <div ref={accRef}>
      <div className="setup-progress">
        <div className="setup-progress-left">
          <div className="setup-progress-bar"><span style={{ width: '100%' }} /></div>
          <span className="setup-progress-label"><b>6 of 6</b> sections complete</span>
        </div>
        <div className="setup-progress-right">
          <button type="button" onClick={expandAll}>Expand all</button>
          <button type="button" onClick={collapseAll}>Collapse all</button>
        </div>
      </div>

      <details className="setup-acc" open>
        <summary className="setup-acc-head">
          <span className="setup-acc-num done">1</span>
          <div className="setup-acc-titles">
            <span className="setup-acc-title">Branding</span>
            <span className="setup-acc-hint">Cover, logo, and accent color.</span>
          </div>
          <span className="setup-acc-summary">
            <span>{communityName}</span>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: accentColor, border: '0.5px solid transparent', flexShrink: 0 }} />
          </span>
          <AccChevron />
        </summary>
        <div className="setup-acc-body">
          <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <label className="setup-field-label" style={{ marginBottom: '6px' }}>Cover image</label>
                <div style={{ height: '96px', borderRadius: '8px', background: `linear-gradient(135deg, ${accentColor}, #7c3aed)`, border: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.65)', fontSize: '12px', cursor: 'pointer' }}>
                  Click to upload · 1600×400
                </div>
              </div>
              <div style={{ width: '96px' }}>
                <label className="setup-field-label" style={{ marginBottom: '6px' }}>Logo</label>
                <div style={{ height: '96px', borderRadius: '50%', background: accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '34px', fontWeight: 600, border: '0.5px solid var(--border)', cursor: 'pointer' }}>
                  {initial}
                </div>
              </div>
            </div>
            <div>
              <label className="setup-field-label">Community name</label>
              <input className="setup-field-input" value={communityName} onChange={e => onPageDraftChange({ communityName: e.target.value })} />
            </div>
            <div>
              <label className="setup-field-label">Tagline</label>
              <input className="setup-field-input" value={tagline} onChange={e => onPageDraftChange({ tagline: e.target.value })} />
            </div>
            <div>
              <label className="setup-field-label">Accent color</label>
              <div className="setup-swatch-row">
                {ACCENT_SWATCHES.map(c => (
                  <button key={c} type="button" className="setup-swatch" aria-pressed={accentColor === c} style={{ background: c }} onClick={() => onPageDraftChange({ accentColor: c })} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </details>

      <details className="setup-acc">
        <summary className="setup-acc-head">
          <span className="setup-acc-num done">2</span>
          <div className="setup-acc-titles">
            <span className="setup-acc-title">Headline</span>
            <span className="setup-acc-hint">The promise visitors read first.</span>
          </div>
          <span className="setup-acc-summary">“{headline}”</span>
          <AccChevron />
        </summary>
        <div className="setup-acc-body">
          <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label className="setup-field-label">Headline</label>
              <input className="setup-field-input" value={headline} onChange={e => onPageDraftChange({ headline: e.target.value })} />
            </div>
            <div>
              <label className="setup-field-label">Sub-headline</label>
              <textarea className="setup-field-textarea" rows={2} value={subHeadline} onChange={e => onPageDraftChange({ subHeadline: e.target.value })} />
            </div>
          </div>
        </div>
      </details>

      <details className="setup-acc">
        <summary className="setup-acc-head">
          <span className="setup-acc-num done">3</span>
          <div className="setup-acc-titles">
            <span className="setup-acc-title">What&apos;s included</span>
            <span className="setup-acc-hint">Benefits and channels live on each plan.</span>
          </div>
          <span className="setup-acc-summary">Configured per plan</span>
          <AccChevron />
        </summary>
        <div className="setup-acc-body">
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="setup-callout">
              <span style={{ width: '26px', height: '26px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--accent)', color: '#fff', flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2L3 7v6c0 5 4 8 9 9 5-1 9-4 9-9V7l-9-5z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)' }}>Benefits &amp; channels are owned by the plan</span>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>Each plan defines its own selling points and the channels it unlocks. The public page renders them directly under whichever plan the visitor selects.</span>
              </div>
              <button type="button" onClick={onJumpToPlans} style={{ alignSelf: 'center', fontSize: '12.5px', fontWeight: 500, color: 'var(--accent)', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                Edit in Plans
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
            <div style={{ fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginTop: '4px' }}>Plan-specific previews</div>
            {plans.map(plan => {
              const pc = channelsForPlan(plan, channels);
              const color = planColor(plan.offer_name);
              const prov = Array.from(new Set(pc.map(c => c.provider))).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' + ') || 'No channels';
              return (
                <div key={plan.id} className="setup-settings-row" style={{ paddingLeft: '16px', paddingRight: '16px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="setup-acc-num done" style={{ width: '18px', height: '18px', fontSize: '9px', background: color, borderColor: color, color: '#fff' }}>{planInitials(plan.offer_name)}</span>
                      {plan.offer_name}
                    </div>
                    <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '1px' }}>3 selling points · {prov}</div>
                  </div>
                  <button type="button" style={btnSecondary} onClick={onJumpToPlans}>Edit</button>
                </div>
              );
            })}
            {plans.length === 0 && (
              <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', padding: '8px 0' }}>No plans yet — create one in the Plans tab.</div>
            )}
          </div>
        </div>
      </details>

      <details className="setup-acc">
        <summary className="setup-acc-head">
          <span className="setup-acc-num done">4</span>
          <div className="setup-acc-titles">
            <span className="setup-acc-title">Testimonials</span>
            <span className="setup-acc-hint">Social proof on the page.</span>
          </div>
          <span className="setup-acc-summary"><span>{DEFAULT_TESTIMONIALS.length}</span> quotes</span>
          <AccChevron />
        </summary>
        <div className="setup-acc-body">
          {DEFAULT_TESTIMONIALS.map(t => (
            <div key={t.author} className="setup-settings-row">
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--text)' }}>“{t.quote}” — {t.author}</div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '1px' }}>Member since {t.since}</div>
              </div>
              <button type="button" style={btnSecondary}>Edit</button>
            </div>
          ))}
          <div style={{ padding: '10px 20px 16px' }}><button type="button" style={btnSecondary}>Add testimonial</button></div>
        </div>
      </details>

      <details className="setup-acc">
        <summary className="setup-acc-head">
          <span className="setup-acc-num done">5</span>
          <div className="setup-acc-titles">
            <span className="setup-acc-title">FAQ</span>
            <span className="setup-acc-hint">Answer the obvious questions.</span>
          </div>
          <span className="setup-acc-summary"><span>{DEFAULT_FAQ.length}</span> questions</span>
          <AccChevron />
        </summary>
        <div className="setup-acc-body">
          {DEFAULT_FAQ.map(f => (
            <div key={f.q} className="setup-settings-row">
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--text)' }}>{f.q}</div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '1px' }}>{f.a}</div>
              </div>
              <button type="button" style={btnSecondary}>Edit</button>
            </div>
          ))}
          <div style={{ padding: '10px 20px 16px' }}><button type="button" style={btnSecondary}>Add question</button></div>
        </div>
      </details>

      <details className="setup-acc">
        <summary className="setup-acc-head">
          <span className="setup-acc-num done">6</span>
          <div className="setup-acc-titles">
            <span className="setup-acc-title">Plan order on page</span>
            <span className="setup-acc-hint">Drag to reorder. First plan is highlighted.</span>
          </div>
          <span className="setup-acc-summary">{planOrderSummary}</span>
          <AccChevron />
        </summary>
        <div className="setup-acc-body">
          {plans.map((plan, idx) => (
            <div key={plan.id} className="setup-settings-row" style={idx === plans.length - 1 ? { borderBottom: 0 } : undefined}>
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--text)' }}>{plan.offer_name} — {planPriceLabel(plan)}</div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '1px' }}>{idx === 0 ? 'Featured' : ''}</div>
              </div>
              <button type="button" className="btn-icon" aria-label="Reorder">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.4" /><circle cx="15" cy="6" r="1.4" /><circle cx="9" cy="12" r="1.4" /><circle cx="15" cy="12" r="1.4" /><circle cx="9" cy="18" r="1.4" /><circle cx="15" cy="18" r="1.4" /></svg>
              </button>
            </div>
          ))}
          {plans.length === 0 && <div className="setup-settings-row" style={{ color: 'var(--text-muted)', fontSize: '12.5px' }}>Add plans to set display order.</div>}
        </div>
      </details>
    </div>
  );
}

// ─── PlansPane ─────────────────────────────────────────────────────────────────

function PlanDetailBody({ plan, channels }: { plan: CommunityPlan; channels: CommunityChannel[] }) {
  const planChannels = channelsForPlan(plan, channels);
  const priceUsd = (plan.monthly_amount_minor / 100).toFixed(2);
  const trial = plan.trial_days ?? 0;

  return (
    <>
      <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '0.5px solid var(--border-soft)' }}>
        <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Changes apply to new sign-ups; existing members keep their price.</span>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <input type="checkbox" defaultChecked={planIsLive(plan)} style={{ accentColor: 'var(--accent)' }} />
          Active
        </label>
      </div>
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Pricing &amp; details</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div><label className="setup-field-label">Name</label><input className="setup-field-input" defaultValue={plan.offer_name} readOnly /></div>
          <div><label className="setup-field-label">Frequency</label><select className="setup-field-input" defaultValue={plan.yearly_amount_minor ? 'annual' : 'monthly'}><option value="monthly">Monthly</option><option value="annual">Annual</option><option value="onetime">One-time</option></select></div>
          <div><label className="setup-field-label">Price (USD)</label><input className="setup-field-input" defaultValue={priceUsd} readOnly /></div>
          <div><label className="setup-field-label">Trial (days)</label><input className="setup-field-input" defaultValue={String(trial)} readOnly /></div>
          <div style={{ gridColumn: '1 / -1' }}><label className="setup-field-label">Description</label><textarea className="setup-field-textarea" rows={2} defaultValue="Daily signals, live sessions, and the private Discord." readOnly /></div>
          <div><label className="setup-field-label">Seat cap <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>Optional</span></label><input className="setup-field-input" placeholder="No limit" readOnly /></div>
          <div><label className="setup-field-label">Currency</label><select className="setup-field-input" defaultValue={plan.currency.toLowerCase()}><option value="usd">USD</option><option value="eur">EUR</option><option value="ars">ARS</option></select></div>
        </div>
      </div>
      <div className="setup-incl-section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <span style={{ fontSize: '12.5px', fontWeight: 500, color: 'var(--text)' }}>Channels granted <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: '18px', height: '18px', padding: '0 6px', borderRadius: '999px', background: 'var(--surface-2)', border: '0.5px solid var(--border)', fontSize: '11px', color: 'var(--text-secondary)', marginLeft: '6px' }}>{planChannels.length}</span></span>
          <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Members get access the moment they pay.</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {planChannels.map(ch => {
            const ps = providerStyle(ch.provider);
            return (
              <div key={ch.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', border: '0.5px solid var(--border)', borderRadius: '8px', background: 'var(--surface-2)' }}>
                <span style={{ width: '26px', height: '26px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: ps.bg, color: ps.color }}>
                  <ProviderIcon id={ch.provider} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ch.provider.charAt(0).toUpperCase() + ch.provider.slice(1)} — {ch.name}</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                    {ch.provider === 'discord' ? <>Role <code style={{ fontFamily: 'var(--font-mono, ui-monospace, monospace)', fontSize: '11px' }}>@VIP</code></> : 'Private group'}
                    {ch.members_synced != null ? <> · {ch.members_synced} members</> : null}
                  </div>
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <ChipSynced />
                  <button type="button" className="btn-icon" aria-label="Remove"><svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg></button>
                </div>
              </div>
            );
          })}
          {planChannels.length === 0 && <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', padding: '4px 0' }}>No channels linked to this plan yet.</div>}
        </div>
        <button type="button" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 10px', border: '0.5px dashed var(--border)', borderRadius: '8px', color: 'var(--text-secondary)', fontSize: '12.5px', fontWeight: 500, background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', alignSelf: 'flex-start' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          Add channel
        </button>
      </div>
      <div className="setup-incl-section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <span style={{ fontSize: '12.5px', fontWeight: 500, color: 'var(--text)' }}>Selling points <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: '18px', height: '18px', padding: '0 6px', borderRadius: '999px', background: 'var(--surface-2)', border: '0.5px solid var(--border)', fontSize: '11px', color: 'var(--text-secondary)', marginLeft: '6px' }}>{STATIC_SELLING_POINTS.length}</span></span>
          <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Shown on the public page as the plan&apos;s checklist.</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {STATIC_SELLING_POINTS.map(pt => (
            <div key={pt} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 0', fontSize: '13px', color: 'var(--text)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--accent)', flexShrink: 0 }}><path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <span style={{ flex: 1, minWidth: 0 }}>{pt}</span>
              <svg className="bul-drag" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--text-muted)', cursor: 'grab', opacity: 0.5 }}><circle cx="9" cy="6" r="1.4" /><circle cx="15" cy="6" r="1.4" /><circle cx="9" cy="12" r="1.4" /><circle cx="15" cy="12" r="1.4" /><circle cx="9" cy="18" r="1.4" /><circle cx="15" cy="18" r="1.4" /></svg>
            </div>
          ))}
        </div>
        <button type="button" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 10px', border: '0.5px dashed var(--border)', borderRadius: '8px', color: 'var(--text-secondary)', fontSize: '12.5px', fontWeight: 500, background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', alignSelf: 'flex-start' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          Add selling point
        </button>
      </div>
    </>
  );
}

function PlansPane({
  plans,
  channels,
  openPlanId,
  onToggle,
  onNewPlan,
}: {
  plans: CommunityPlan[];
  channels: CommunityChannel[];
  openPlanId: string | null;
  onToggle: (planId: string) => void;
  onNewPlan: () => void;
}) {
  const liveCount = plans.filter(planIsLive).length;
  const progressPct = plans.length ? Math.round((liveCount / plans.length) * 100) : 0;
  const firstPlanId = plans[0]?.id ?? null;

  return (
  <div>
    <div className="setup-progress">
      <div className="setup-progress-left">
        <div className="setup-progress-bar"><span style={{ width: `${progressPct}%` }} /></div>
        <span className="setup-progress-label"><b>{liveCount} of {plans.length || 0}</b> plans live</span>
      </div>
      <button type="button" style={btnPrimary} onClick={onNewPlan}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        New plan
      </button>
    </div>

    {plans.length === 0 ? (
      <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--surface-1)', border: '0.5px solid var(--border)', borderRadius: '10px' }}>
        No plans yet. Create one to start accepting members.
      </div>
    ) : plans.map(plan => {
      const color = planColor(plan.offer_name);
      const initials = planInitials(plan.offer_name);
      const pc = channelsForPlan(plan, channels);
      const isOpen = openPlanId === plan.id;
      const isFirst = plan.id === firstPlanId;
      const provNames = Array.from(new Set(pc.map(c => c.provider.charAt(0).toUpperCase() + c.provider.slice(1))));

      return (
        <details key={plan.id} className="setup-acc" open={isOpen}>
          <summary
            className="setup-acc-head"
            onClick={e => {
              e.preventDefault();
              onToggle(plan.id);
            }}
          >
            <span className="setup-acc-num done" style={{ background: color, borderColor: color, color: '#fff' }}>{initials}</span>
            <div className="setup-acc-titles">
              <span className="setup-acc-title" style={{ display: 'inline-flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                {plan.offer_name}
                <span style={{ marginLeft: '2px' }}>{planIsLive(plan) ? <ChipLive /> : <ChipDraft />}</span>
              </span>
              <span className="setup-acc-hint">{planHintLine(plan, pc)}</span>
            </div>
            <span className="setup-acc-summary">
              {planPriceLabel(plan)}
              {provNames.map((p, i) => (
                <span key={p} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  {i > 0 && <span style={{ width: '1px', height: '10px', background: 'var(--border)', display: 'inline-block' }} />}
                  {p}
                </span>
              ))}
              {provNames.length > 0 && <span style={{ width: '1px', height: '10px', background: 'var(--border)', display: 'inline-block' }} />}
              <span>{plan.member_counts.active}</span>
            </span>
            <AccChevron />
          </summary>
          <div className="setup-acc-body">
            {isFirst && isOpen ? (
              <PlanDetailBody plan={plan} channels={channels} />
            ) : (
              <div style={{ padding: '18px 20px', color: 'var(--text-muted)', fontSize: '12.5px' }}>
                Tap to edit {plan.offer_name} plan details, channels, and selling points.
              </div>
            )}
          </div>
        </details>
      );
    })}
  </div>
  );
}

// ─── CheckoutPane ──────────────────────────────────────────────────────────────

function CheckoutPane({ overview }: { overview: CommunityOverview | null }) {
  const stripeConnected = overview?.onboarding.stripe_connected ?? false;

  return (
  <div>
    <div className="setup-progress">
      <div className="setup-progress-left">
        <div className="setup-progress-bar"><span style={{ width: '100%' }} /></div>
        <span className="setup-progress-label"><b>Checkout</b> ready to take payments</span>
      </div>
    </div>

    <details className="setup-acc" open>
      <summary className="setup-acc-head">
        <span className="setup-acc-num done">1</span>
        <div className="setup-acc-titles">
          <span className="setup-acc-title">Buyer fields</span>
          <span className="setup-acc-hint">What you collect at checkout.</span>
        </div>
        <span className="setup-acc-summary"><span>3</span> on · 1 custom</span>
        <AccChevron />
      </summary>
      <div className="setup-acc-body">
        <div className="setup-settings-row"><div><div style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--text)' }}>Email</div><div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '1px' }}>Required · used to deliver access</div></div><ChipRequired /></div>
        <div className="setup-settings-row"><div><div style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--text)' }}>Discord username</div><div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '1px' }}>Needed to auto-assign roles</div></div><label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', cursor: 'pointer' }}><input type="checkbox" defaultChecked style={{ accentColor: 'var(--accent)' }} />On</label></div>
        <div className="setup-settings-row"><div><div style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--text)' }}>Full name</div><div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '1px' }}>Shown on invoice</div></div><label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', cursor: 'pointer' }}><input type="checkbox" defaultChecked style={{ accentColor: 'var(--accent)' }} />On</label></div>
        <div className="setup-settings-row"><div><div style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--text)' }}>Phone</div><div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '1px' }}>Optional</div></div><label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', cursor: 'pointer' }}><input type="checkbox" style={{ accentColor: 'var(--accent)' }} />Off</label></div>
        <div className="setup-settings-row"><div><div style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--text)' }}>Custom question</div><div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '1px' }}>“What do you trade?”</div></div><button type="button" style={btnSecondary}>Edit</button></div>
      </div>
    </details>

    <details className="setup-acc">
      <summary className="setup-acc-head">
        <span className="setup-acc-num done">2</span>
        <div className="setup-acc-titles">
          <span className="setup-acc-title">After payment</span>
          <span className="setup-acc-hint">What members see right after they pay.</span>
        </div>
        <span className="setup-acc-summary">Thank-you message</span>
        <AccChevron />
      </summary>
      <div className="setup-acc-body">
        <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label className="setup-field-label">Behaviour</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <label style={{ flex: 1, display: 'flex', gap: '10px', padding: '12px', border: '0.5px solid var(--accent-soft-border)', background: 'var(--accent-soft-bg)', borderRadius: '8px', cursor: 'pointer' }}>
                <input type="radio" name="after" defaultChecked style={{ accentColor: 'var(--accent)', marginTop: '2px' }} />
                <div><div style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 500 }}>Show thank-you message</div><div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Built-in confirmation screen</div></div>
              </label>
              <label style={{ flex: 1, display: 'flex', gap: '10px', padding: '12px', border: '0.5px solid var(--border)', borderRadius: '8px', cursor: 'pointer' }}>
                <input type="radio" name="after" style={{ accentColor: 'var(--accent)', marginTop: '2px' }} />
                <div><div style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 500 }}>Redirect to URL</div><div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Send to your own page</div></div>
              </label>
            </div>
          </div>
          <div>
            <label className="setup-field-label">Thank-you message</label>
            <textarea className="setup-field-textarea" rows={3} defaultValue="Welcome to the desk. Check your inbox — your Discord invite is on its way." />
          </div>
        </div>
      </div>
    </details>

    <details className="setup-acc">
      <summary className="setup-acc-head">
        <span className="setup-acc-num done">3</span>
        <div className="setup-acc-titles">
          <span className="setup-acc-title">Payment methods</span>
          <span className="setup-acc-hint">Money goes to the Stripe account connected at the account level.</span>
        </div>
        <span className="setup-acc-summary">
          Stripe
          {stripeConnected && <span style={{ color: 'var(--success, #2f9d6b)' }}> ● Connected</span>}
        </span>
        <AccChevron />
      </summary>
      <div className="setup-acc-body">
        <div className="setup-settings-row" style={{ alignItems: 'flex-start' }}>
          <span style={{ width: '36px', height: '36px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '0.5px solid rgba(99,91,255,0.25)', background: 'rgba(99,91,255,0.12)', color: '#8d87ff', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M13.4 10.2c0-.7.6-1 1.5-1 1.3 0 3 .4 4.3 1.1V6.4a11.4 11.4 0 0 0-4.3-.8c-3.5 0-5.9 1.8-5.9 4.9 0 4.7 6.5 4 6.5 6 0 .8-.7 1.1-1.7 1.1-1.4 0-3.3-.6-4.7-1.4v3.9c1.6.7 3.2 1 4.7 1 3.6 0 6.1-1.8 6.1-4.9 0-5.1-6.5-4.3-6.5-6z" /></svg>
          </span>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--text)' }}>Stripe</span>
              {stripeConnected ? <ChipConnected /> : <Chip variant="muted">Not connected</Chip>}
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Card, Apple Pay, Google Pay · USD</span>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            {overview?.stripe_dashboard_url ? (
              <a href={overview.stripe_dashboard_url} target="_blank" rel="noopener noreferrer" style={btnSecondary}>Settings</a>
            ) : overview?.stripe_connect_url && !stripeConnected ? (
              <a href={overview.stripe_connect_url} target="_blank" rel="noopener noreferrer" style={btnSecondary}>Connect</a>
            ) : (
              <button type="button" style={btnSecondary}>Settings</button>
            )}
          </div>
        </div>
        <div className="setup-settings-row" style={{ alignItems: 'flex-start' }}>
          <span style={{ width: '36px', height: '36px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '0.5px solid var(--border)', background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2v-9z" stroke="currentColor" strokeWidth="1.6" /></svg>
          </span>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--text)' }}>Mercado Pago</span>
              <Chip variant="muted">Coming soon</Chip>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Local payments for LATAM members.</span>
          </div>
          <button type="button" style={{ ...btnSecondary, opacity: 0.4, cursor: 'not-allowed' }} disabled>Connect</button>
        </div>
      </div>
    </details>
  </div>
  );
}

// ─── Setup section pages (routed) ────────────────────────────────────────────

export function SetupPageSection() {
  const { plans, channels, pageDraft, updatePageDraft, goToPlans } = useSetupWorkspace();
  return (
    <PagePane
      plans={plans}
      channels={channels}
      pageDraft={pageDraft}
      onPageDraftChange={updatePageDraft}
      onJumpToPlans={goToPlans}
    />
  );
}

export function SetupPlansSection() {
  const { plans, channels, openPlanId, handlePlanToggle, onNewPlan } = useSetupWorkspace();
  return (
    <PlansPane
      plans={plans}
      channels={channels}
      openPlanId={openPlanId}
      onToggle={handlePlanToggle}
      onNewPlan={onNewPlan}
    />
  );
}

export function SetupCheckoutSection() {
  const { overview } = useSetupWorkspace();
  return <CheckoutPane overview={overview} />;
}
