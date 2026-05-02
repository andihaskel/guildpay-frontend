'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, GripVertical, Loader as Loader2, Monitor, Tablet, Smartphone } from 'lucide-react';
import { api } from '@/lib/api';
import { DiscordRole, DiscordChannel } from '@/lib/types';

// ─── types ────────────────────────────────────────────────────────────────────

interface Perk {
  id: string;
  icon: string;
  title: string;
  description: string;
}

interface FormState {
  planName: string;
  tagline: string;
  featured: boolean;
  trialEnabled: boolean;
  trialDays: number;
  price: string;
  billing: 'monthly' | 'yearly' | 'quarterly' | 'once';
  yearlyEnabled: boolean;
  yearlyPrice: string;
  currency: string;
  perks: Perk[];
  discordRoleId: string;
  discordChannelIds: string[];
  isActive: boolean;
}

type DeviceView = 'mobile' | 'tablet' | 'desktop';
type Section = 'details' | 'pricing' | 'perks' | 'review';

const DEFAULT_PERKS: Perk[] = [
  { id: '1', icon: '✨', title: 'Exclusive access', description: 'Get into members-only channels and content.' },
  { id: '2', icon: '🔔', title: 'Real-time updates', description: 'Stay in the loop with instant notifications.' },
  { id: '3', icon: '🎟️', title: 'Community events', description: 'Join live sessions and Q&As.' },
];

const BILLING_LABELS: Record<string, string> = {
  monthly: 'Monthly recurring',
  yearly: 'Annual recurring',
  quarterly: 'Quarterly recurring',
  once: 'One-time payment',
};

const TRIAL_OPTIONS = [
  { label: 'No trial', value: 0 },
  { label: '7 days', value: 7 },
  { label: '14 days', value: 14 },
  { label: '30 days', value: 30 },
];

// ─── helpers ──────────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        position: 'relative', width: '32px', height: '18px', borderRadius: '999px',
        background: checked ? 'var(--accent, #5865f2)' : 'var(--surface-3, #1a1a1a)',
        border: `0.5px solid ${checked ? 'var(--accent, #5865f2)' : 'rgba(255,255,255,0.08)'}`,
        transition: 'background 180ms ease, border-color 180ms ease',
        flexShrink: 0, marginTop: '1px',
      }}
    >
      <span style={{
        position: 'absolute', top: '1px',
        left: checked ? 'calc(100% - 15px)' : '1px',
        width: '14px', height: '14px', borderRadius: '50%',
        background: checked ? '#fff' : 'var(--text-secondary, #888)',
        transition: 'left 180ms ease, background 180ms ease',
      }} />
    </button>
  );
}

function Input({ value, onChange, placeholder, required, autoFocus, type = 'text', step, min }: {
  value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean;
  autoFocus?: boolean; type?: string; step?: string; min?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      autoFocus={autoFocus}
      step={step}
      min={min}
      style={{
        width: '100%', padding: '9px 12px', borderRadius: '6px',
        background: 'var(--input-bg, #0d0d0d)',
        border: `0.5px solid ${focused ? 'rgba(88,101,242,0.4)' : 'rgba(255,255,255,0.08)'}`,
        boxShadow: focused ? '0 0 0 3px rgba(88,101,242,0.10)' : 'none',
        color: 'var(--text, #f0f0f0)', fontSize: '13.5px', outline: 'none',
        transition: 'border-color 180ms ease, box-shadow 180ms ease',
        boxSizing: 'border-box', fontFamily: 'inherit',
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className="ag-input"
    />
  );
}

function Select({ value, onChange, children }: { value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', padding: '9px 12px', paddingRight: '32px', borderRadius: '6px',
          background: 'var(--input-bg, #0d0d0d)',
          border: `0.5px solid ${focused ? 'rgba(88,101,242,0.4)' : 'rgba(255,255,255,0.08)'}`,
          boxShadow: focused ? '0 0 0 3px rgba(88,101,242,0.10)' : 'none',
          color: 'var(--text, #f0f0f0)', fontSize: '13.5px', outline: 'none',
          appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer',
          transition: 'border-color 180ms ease, box-shadow 180ms ease',
          boxSizing: 'border-box', fontFamily: 'inherit',
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      >
        {children}
      </select>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted, #555)', pointerEvents: 'none' }}>
        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label style={{ fontSize: '12.5px', fontWeight: 500, color: 'var(--text, #f0f0f0)', display: 'block', marginBottom: '6px', letterSpacing: '-0.005em' }}>
      {children}
      {required && <span style={{ color: 'var(--accent-soft-text, #8b92f8)', marginLeft: '3px' }}>*</span>}
    </label>
  );
}

function FieldHint({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: '11.5px', color: 'var(--text-muted, #555)', margin: '5px 0 0', lineHeight: '1.45' }}>{children}</p>;
}

function CardGroup({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--surface-1, #111)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '10px', overflow: 'hidden', marginBottom: '16px' }}>
      {children}
    </div>
  );
}

function CardHead({ title, subtitle, right }: { title: string; subtitle?: string; right?: React.ReactNode }) {
  return (
    <div style={{ padding: '16px 20px', borderBottom: '0.5px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
      <div>
        <h2 style={{ fontSize: '14px', fontWeight: 500, margin: 0, color: 'var(--text, #f0f0f0)', letterSpacing: '-0.005em' }}>{title}</h2>
        {subtitle && <p style={{ fontSize: '12px', color: 'var(--text-muted, #555)', margin: '2px 0 0', fontWeight: 400 }}>{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

function SwitchRow({ title, description, checked, onChange }: { title: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px' }}>
      <div>
        <h4 style={{ fontSize: '13.5px', fontWeight: 500, margin: '0 0 3px', color: 'var(--text, #f0f0f0)', letterSpacing: '-0.005em' }}>{title}</h4>
        <p style={{ fontSize: '12.5px', color: 'var(--text-muted, #555)', margin: 0, lineHeight: '1.5', maxWidth: '480px' }}>{description}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

// ─── preview ──────────────────────────────────────────────────────────────────

function Preview({ form, deviceView, communityName }: { form: FormState; deviceView: DeviceView; communityName: string }) {
  const price = parseFloat(form.price || '0');
  const billingPeriod = form.billing === 'monthly' ? 'month' : form.billing === 'yearly' ? 'year' : form.billing === 'quarterly' ? 'quarter' : '';
  const maxWidth = deviceView === 'mobile' ? '360px' : deviceView === 'desktop' ? '680px' : '480px';

  return (
    <div style={{ width: '100%', maxWidth, background: 'var(--bg, #0a0a0a)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', transition: 'max-width 220ms ease' }}>
      {/* Browser bar */}
      <div style={{ height: '30px', display: 'flex', alignItems: 'center', padding: '0 12px', background: 'var(--surface-1, #111)', borderBottom: '0.5px solid rgba(255,255,255,0.06)', gap: '10px' }}>
        <span style={{ display: 'inline-flex', gap: '5px' }}>
          {[0,1,2].map(i => <span key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />)}
        </span>
        <span style={{ flex: 1, height: '18px', background: 'var(--input-bg, #0d0d0d)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '4px', fontFamily: 'monospace', fontSize: '10.5px', color: 'var(--text-muted, #555)', display: 'inline-flex', alignItems: 'center', padding: '0 8px', overflow: 'hidden', whiteSpace: 'nowrap' }}>
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" style={{ marginRight: '5px', opacity: 0.5 }}><path d="M12 2l3 7h7l-5.5 4 2 8L12 17l-6.5 4 2-8L2 9h7l3-7z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>
          accessgate.io/c/{communityName.toLowerCase().replace(/\s+/g, '-')}/plans
        </span>
      </div>

      {/* Signup page */}
      <div style={{ background: 'var(--bg, #0a0a0a)', color: 'var(--text, #f0f0f0)', padding: '28px 22px 36px', minHeight: '500px', position: 'relative' }}>
        {/* grid bg */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.015) 1px, transparent 1px)', backgroundSize: '40px 40px', maskImage: 'radial-gradient(ellipse at top, black 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative' }}>
          {/* top bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', fontSize: '11.5px', fontWeight: 500, color: 'var(--text-secondary, #888)' }}>
              <span style={{ width: '15px', height: '15px', borderRadius: '4px', background: 'rgba(88,101,242,0.12)', border: '0.5px solid rgba(88,101,242,0.25)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#8b92f8', fontSize: '9px', fontWeight: 700 }}>A</span>
              Secured by AccessGate
            </span>
            {form.trialEnabled && form.trialDays > 0 && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 9px', borderRadius: '999px', background: 'rgba(88,101,242,0.12)', border: '0.5px solid rgba(88,101,242,0.25)', color: '#8b92f8', fontSize: '10.5px', fontWeight: 500 }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'currentColor' }} />
                {form.trialDays}-day free trial
              </span>
            )}
          </div>

          {/* hero */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '14px', background: 'linear-gradient(135deg, #5865f2, #7983f5)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '20px', fontWeight: 600, marginBottom: '14px', border: '0.5px solid rgba(255,255,255,0.08)', letterSpacing: '-0.01em' }}>
              {(form.planName || communityName)[0]?.toUpperCase() || 'A'}
            </div>
            <p style={{ fontSize: '11.5px', color: 'var(--text-muted, #555)', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 8px' }}>{communityName}</p>
            <h1 style={{ fontSize: '22px', fontWeight: 500, letterSpacing: '-0.02em', margin: '0 0 8px', lineHeight: '1.1' }}>{form.planName || 'Your Plan'}</h1>
            {form.tagline && <p style={{ fontSize: '13px', color: 'var(--text-secondary, #888)', margin: 0, lineHeight: '1.5' }}>{form.tagline}</p>}
          </div>

          <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '20px -22px' }} />

          {/* perks */}
          {form.perks.length > 0 && (
            <>
              <p style={{ fontSize: '10.5px', fontWeight: 500, color: 'var(--text-muted, #555)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 10px' }}>What&apos;s included</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginBottom: '20px' }}>
                {form.perks.slice(0, 4).map(p => (
                  <div key={p.id} style={{ display: 'flex', gap: '10px', padding: '10px 12px', background: 'var(--surface-1, #111)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '8px', alignItems: 'flex-start' }}>
                    <span style={{ width: '24px', height: '24px', borderRadius: '5px', background: 'rgba(88,101,242,0.12)', border: '0.5px solid rgba(88,101,242,0.25)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '11px' }}>{p.icon}</span>
                    <div>
                      <p style={{ fontSize: '12px', fontWeight: 500, margin: '0 0 1px', letterSpacing: '-0.005em' }}>{p.title || 'Perk title'}</p>
                      {p.description && <p style={{ fontSize: '11px', color: 'var(--text-secondary, #888)', margin: 0, lineHeight: '1.45' }}>{p.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0 -22px 20px' }} />
            </>
          )}

          {/* pricing card */}
          <div style={{ padding: '14px', background: 'linear-gradient(180deg, rgba(88,101,242,0.06), rgba(88,101,242,0.01))', border: '0.5px solid rgba(88,101,242,0.25)', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 500, margin: '0 0 2px', letterSpacing: '-0.005em' }}>{form.planName || 'Your Plan'}</p>
                {form.tagline && <p style={{ fontSize: '11px', color: 'var(--text-secondary, #888)', margin: 0, lineHeight: '1.45' }}>Cancel anytime.</p>}
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '18px', fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1 }}>{price > 0 ? `$${price}` : '—'}</div>
                {billingPeriod && <div style={{ fontSize: '10.5px', color: 'var(--text-muted, #555)' }}>/ {billingPeriod}</div>}
              </div>
            </div>
            <button type="button" style={{ width: '100%', padding: '9px', background: 'var(--accent, #5865f2)', border: '0.5px solid var(--accent, #5865f2)', borderRadius: '6px', color: '#fff', fontSize: '12.5px', fontWeight: 500, cursor: 'pointer', letterSpacing: '-0.005em' }}>
              {form.trialEnabled && form.trialDays > 0 ? `Start ${form.trialDays}-day free trial` : 'Subscribe now'}
            </button>
          </div>

          <p style={{ textAlign: 'center', fontSize: '10.5px', color: 'var(--text-muted, #555)', marginTop: '20px', display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'center' }}>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none"><path d="M12 2l3 7h7l-5.5 4 2 8L12 17l-6.5 4 2-8L2 9h7l3-7z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>
            Secure checkout via Stripe
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── main ─────────────────────────────────────────────────────────────────────

export default function NewPlanPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const communityId = searchParams.get('community_id') || '';
  const communityName = searchParams.get('community_name') || 'Community';

  const [section, setSection] = useState<Section>('details');
  const [deviceView, setDeviceView] = useState<DeviceView>('tablet');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [discordRoles, setDiscordRoles] = useState<DiscordRole[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);

  const [form, setForm] = useState<FormState>({
    planName: '',
    tagline: '',
    featured: true,
    trialEnabled: false,
    trialDays: 14,
    price: '29.00',
    billing: 'monthly',
    yearlyEnabled: false,
    yearlyPrice: '',
    currency: 'USD',
    perks: DEFAULT_PERKS,
    discordRoleId: '',
    discordChannelIds: [],
    isActive: true,
  });

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  // Load discord roles
  useEffect(() => {
    if (!communityId) return;
    setLoadingRoles(true);
    api.getCommunity(communityId).then(comm => {
      if (comm.discord_guild_id) {
        api.getDiscordGuildRoles(comm.discord_guild_id).then(roles => {
          setDiscordRoles(roles);
          if (roles.length > 0) update('discordRoleId', roles[0].id);
        }).catch(() => {}).finally(() => setLoadingRoles(false));
      } else {
        setLoadingRoles(false);
      }
    }).catch(() => setLoadingRoles(false));
  }, [communityId]);

  const sections: { key: Section; label: string }[] = [
    { key: 'details', label: 'Details' },
    { key: 'pricing', label: 'Pricing' },
    { key: 'perks', label: 'Perks' },
    { key: 'review', label: 'Review' },
  ];

  function addPerk() {
    update('perks', [...form.perks, { id: Date.now().toString(), icon: '✨', title: '', description: '' }]);
  }

  function removePerk(id: string) {
    update('perks', form.perks.filter(p => p.id !== id));
  }

  function updatePerk(id: string, field: keyof Perk, value: string) {
    update('perks', form.perks.map(p => p.id === id ? { ...p, [field]: value } : p));
  }

  const priceMinor = Math.round(parseFloat(form.price || '0') * 100);
  const yearlyPriceMinor = Math.round(parseFloat(form.yearlyPrice || '0') * 100);

  async function handlePublish() {
    if (!form.planName.trim()) { setError('Plan name is required.'); setSection('details'); return; }
    if (priceMinor <= 0) { setError('Please set a price greater than 0.'); setSection('pricing'); return; }
    setLoading(true);
    setError('');
    try {
      await api.createCommunityPlan(communityId, {
        offer_name: form.planName.trim(),
        monthly_amount_minor: priceMinor,
        currency: form.currency.toLowerCase(),
        yearly_amount_minor: form.yearlyEnabled && yearlyPriceMinor > 0 ? yearlyPriceMinor : undefined,
        trial_days: form.trialEnabled && form.trialDays > 0 ? form.trialDays : undefined,
        discord_role_id: form.discordRoleId || undefined,
      });
      router.push(`/dashboard/community/${communityId}?tab=plans`);
    } catch (err: any) {
      setError(err?.message || 'Failed to create plan. Please try again.');
      setLoading(false);
    }
  }

  const sectionIdx = sections.findIndex(s => s.key === section);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg, #0a0a0a)', color: 'var(--text, #f0f0f0)', fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
      {/* Topbar */}
      <header style={{ height: '52px', borderBottom: '0.5px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', position: 'sticky', top: 0, zIndex: 20, background: 'rgba(10,10,10,0.88)', backdropFilter: 'saturate(140%) blur(10px)', WebkitBackdropFilter: 'saturate(140%) blur(10px)' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', fontSize: '12.5px', color: 'var(--text-secondary, #888)', whiteSpace: 'nowrap' }}>
          <button onClick={() => router.push(`/dashboard/community/${communityId}`)} style={{ color: 'var(--text-secondary, #888)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 180ms ease' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text, #f0f0f0)')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-secondary, #888)')}
          >
            {communityName}
          </button>
          <span style={{ color: 'rgba(255,255,255,0.1)' }}>/</span>
          <button onClick={() => router.push(`/dashboard/community/${communityId}?tab=plans`)} style={{ color: 'var(--text-secondary, #888)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 180ms ease' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text, #f0f0f0)')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-secondary, #888)')}
          >
            Plans
          </button>
          <span style={{ color: 'rgba(255,255,255,0.1)' }}>/</span>
          <span style={{ color: 'var(--text, #f0f0f0)', fontWeight: 500 }}>{form.planName || 'New plan'}</span>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => router.push(`/dashboard/community/${communityId}`)}
            style={{ padding: '7px 13px', borderRadius: '6px', fontSize: '13px', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary, #888)', transition: 'color 180ms ease' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text, #f0f0f0)')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-secondary, #888)')}
          >
            Discard
          </button>
          <button
            type="button"
            onClick={handlePublish}
            disabled={loading}
            style={{ padding: '7px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 500, background: '#fff', color: '#0a0a0a', border: '0.5px solid #fff', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'opacity 180ms ease', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            {loading && <Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} />}
            Publish plan
          </button>
        </div>
      </header>

      {/* Two-col layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(420px, 520px)', minHeight: 'calc(100vh - 52px)' }} className="plan-builder-grid">
        {/* Form pane */}
        <div style={{ padding: '32px 40px 80px', maxWidth: '780px', margin: '0 auto', width: '100%' }}>
          {/* Back + heading */}
          <div style={{ marginBottom: '36px' }}>
            <button
              onClick={() => router.push(`/dashboard/community/${communityId}`)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary, #888)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '22px', transition: 'color 180ms ease', padding: 0 }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text, #f0f0f0)'; (e.currentTarget.querySelector('svg') as HTMLElement | null)?.style?.setProperty('transform', 'translateX(-2px)'); }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary, #888)'; (e.currentTarget.querySelector('svg') as HTMLElement | null)?.style?.setProperty('transform', 'none'); }}
            >
              <ArrowLeft size={14} />
              Back to {communityName}
            </button>
            <h1 style={{ fontSize: '28px', fontWeight: 500, letterSpacing: '-0.025em', margin: '0 0 6px', color: 'var(--text, #f0f0f0)' }}>Create a plan</h1>
            <p style={{ color: 'var(--text-secondary, #888)', fontSize: '14px', margin: 0, lineHeight: '1.5' }}>Plans are how members pay to access this community. Updates show live in the preview on the right.</p>
          </div>

          {/* Stepper */}
          <div style={{ display: 'flex', gap: '4px', marginBottom: '28px', background: 'var(--surface-1, #111)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '4px' }}>
            {sections.map((s, i) => {
              const isActive = section === s.key;
              const isDone = i < sectionIdx;
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setSection(s.key)}
                  style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 500, color: isActive ? 'var(--text, #f0f0f0)' : 'var(--text-secondary, #888)', background: isActive ? 'var(--surface-3, #1a1a1a)' : 'transparent', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', letterSpacing: '-0.005em', transition: 'background 180ms ease, color 180ms ease' }}
                >
                  <span style={{ width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10.5px', fontWeight: 500, border: '0.5px solid', background: isActive ? 'rgba(88,101,242,0.12)' : isDone ? 'rgba(47,157,107,0.10)' : 'var(--surface-2, #161616)', borderColor: isActive ? 'rgba(88,101,242,0.25)' : isDone ? 'rgba(47,157,107,0.22)' : 'rgba(255,255,255,0.08)', color: isActive ? '#8b92f8' : isDone ? '#4ab585' : 'var(--text-muted, #555)', transition: 'all 180ms ease' }}>
                    {isDone ? (
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    ) : i + 1}
                  </span>
                  {s.label}
                </button>
              );
            })}
          </div>

          {/* ─── Section: Details ─── */}
          {section === 'details' && (
            <>
              <CardGroup>
                <CardHead title="Plan details" subtitle="How this plan shows up on your community page." />
                <div style={{ padding: '22px 20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <div>
                    <FieldLabel required>Plan name</FieldLabel>
                    <Input value={form.planName} onChange={v => update('planName', v)} placeholder='e.g. "Monthly", "Annual", "VIP"' required autoFocus />
                    <FieldHint>Short label members see when picking a plan.</FieldHint>
                  </div>
                  <div>
                    <FieldLabel>Tagline</FieldLabel>
                    <Input value={form.tagline} onChange={v => update('tagline', v)} placeholder="A one-line hook shown under the plan name" />
                  </div>
                </div>
                <div style={{ padding: '16px 20px', borderTop: '0.5px solid rgba(255,255,255,0.06)' }}>
                  <SwitchRow
                    title="Featured plan"
                    description="Highlight this plan on your community page so it stands out from the others."
                    checked={form.featured}
                    onChange={v => update('featured', v)}
                  />
                </div>
                <div style={{ padding: '16px 20px', borderTop: '0.5px solid rgba(255,255,255,0.06)' }}>
                  <SwitchRow
                    title="Free trial"
                    description="Let members try the plan before they're charged. We'll collect card details up-front."
                    checked={form.trialEnabled}
                    onChange={v => update('trialEnabled', v)}
                  />
                  {form.trialEnabled && (
                    <div style={{ marginTop: '14px' }}>
                      <FieldLabel>Trial length</FieldLabel>
                      <Select value={String(form.trialDays)} onChange={v => update('trialDays', Number(v))}>
                        {TRIAL_OPTIONS.filter(o => o.value > 0).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </Select>
                    </div>
                  )}
                </div>
              </CardGroup>

              {/* Discord role */}
              <CardGroup>
                <CardHead title="Discord access" subtitle="Members automatically get this role when they subscribe." />
                <div style={{ padding: '22px 20px' }}>
                  <FieldLabel>Role to assign</FieldLabel>
                  {loadingRoles ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 12px', background: 'var(--input-bg, #0d0d0d)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: 'var(--text-muted, #555)', fontSize: '13px' }}>
                      <Loader2 size={12} style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
                      Loading roles...
                    </div>
                  ) : discordRoles.length === 0 ? (
                    <div style={{ padding: '9px 12px', background: 'var(--input-bg, #0d0d0d)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: 'var(--text-muted, #555)', fontSize: '13px' }}>
                      No Discord server connected to this community.
                    </div>
                  ) : (
                    <Select value={form.discordRoleId} onChange={v => update('discordRoleId', v)}>
                      <option value="">No role</option>
                      {discordRoles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </Select>
                  )}
                  <FieldHint>You can manage channels and roles in the Channels tab of your community.</FieldHint>
                </div>
              </CardGroup>
            </>
          )}

          {/* ─── Section: Pricing ─── */}
          {section === 'pricing' && (
            <CardGroup>
              <CardHead title="Pricing" subtitle="Set how members pay for this plan. Payments go to your Stripe account." />
              <div style={{ padding: '22px 20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px', gap: '12px' }}>
                  <div>
                    <FieldLabel required>Price</FieldLabel>
                    <div style={{ display: 'flex', background: 'var(--input-bg, #0d0d0d)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '6px', overflow: 'hidden' }}>
                      <span style={{ padding: '9px 12px', fontSize: '13px', color: 'var(--text-muted, #555)', background: 'rgba(255,255,255,0.02)', borderRight: '0.5px solid rgba(255,255,255,0.08)', fontFamily: 'monospace', flexShrink: 0 }}>$</span>
                      <input
                        type="number"
                        value={form.price}
                        onChange={e => update('price', e.target.value)}
                        placeholder="29.00"
                        min="0.50"
                        step="0.01"
                        style={{ flex: 1, padding: '9px 12px', background: 'transparent', border: 'none', outline: 'none', color: 'var(--text, #f0f0f0)', fontSize: '13.5px', fontFamily: 'inherit' }}
                        className="ag-input"
                      />
                    </div>
                  </div>
                  <div>
                    <FieldLabel required>Billing</FieldLabel>
                    <Select value={form.billing} onChange={v => update('billing', v as FormState['billing'])}>
                      <option value="monthly">Monthly recurring</option>
                      <option value="yearly">Annual recurring</option>
                      <option value="quarterly">Quarterly recurring</option>
                      <option value="once">One-time payment</option>
                    </Select>
                  </div>
                </div>

                <div>
                  <FieldLabel>Currency</FieldLabel>
                  <Select value={form.currency} onChange={v => update('currency', v)}>
                    {['USD', 'EUR', 'GBP', 'CAD', 'AUD'].map(c => <option key={c} value={c}>{c}</option>)}
                  </Select>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: form.yearlyEnabled ? '12px' : 0 }}>
                    <Toggle checked={form.yearlyEnabled} onChange={v => update('yearlyEnabled', v)} />
                    <span style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--text, #f0f0f0)' }}>Also offer yearly billing at a discount</span>
                  </div>
                  {form.yearlyEnabled && (
                    <div>
                      <FieldLabel>Yearly price</FieldLabel>
                      <div style={{ display: 'flex', background: 'var(--input-bg, #0d0d0d)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '6px', overflow: 'hidden' }}>
                        <span style={{ padding: '9px 12px', fontSize: '13px', color: 'var(--text-muted, #555)', background: 'rgba(255,255,255,0.02)', borderRight: '0.5px solid rgba(255,255,255,0.08)', fontFamily: 'monospace', flexShrink: 0 }}>$</span>
                        <input
                          type="number"
                          value={form.yearlyPrice}
                          onChange={e => update('yearlyPrice', e.target.value)}
                          placeholder="290.00"
                          min="0.50"
                          step="0.01"
                          style={{ flex: 1, padding: '9px 12px', background: 'transparent', border: 'none', outline: 'none', color: 'var(--text, #f0f0f0)', fontSize: '13.5px', fontFamily: 'inherit' }}
                          className="ag-input"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardGroup>
          )}

          {/* ─── Section: Perks ─── */}
          {section === 'perks' && (
            <CardGroup>
              <CardHead
                title="Perks"
                subtitle="What members get on top of access. Shown as bullets on your plan."
                right={<span style={{ fontSize: '11.5px', color: 'var(--text-muted, #555)', fontVariantNumeric: 'tabular-nums' }}>{form.perks.length} / 8</span>}
              />
              <div style={{ padding: '22px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {form.perks.map((perk) => (
                  <div key={perk.id} style={{ background: 'var(--surface-2, #161616)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '14px', display: 'grid', gridTemplateColumns: 'auto auto 1fr auto', gap: '12px', alignItems: 'center', transition: 'border-color 180ms ease' }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.14)')}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)')}
                  >
                    <span style={{ color: 'var(--text-muted, #555)', padding: '4px', borderRadius: '4px', cursor: 'grab', display: 'inline-flex' }}>
                      <GripVertical size={10} />
                    </span>
                    <button
                      type="button"
                      title="Change icon"
                      style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--surface-3, #1a1a1a)', border: '0.5px solid rgba(255,255,255,0.08)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', cursor: 'pointer' }}
                    >
                      {perk.icon}
                    </button>
                    <input
                      value={perk.title}
                      onChange={e => updatePerk(perk.id, 'title', e.target.value)}
                      placeholder="Perk title"
                      style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '13.5px', fontWeight: 500, color: 'var(--text, #f0f0f0)', letterSpacing: '-0.005em', minWidth: 0, fontFamily: 'inherit' }}
                      className="ag-input"
                    />
                    <button
                      type="button"
                      onClick={() => removePerk(perk.id)}
                      aria-label="Remove"
                      style={{ width: '28px', height: '28px', borderRadius: '6px', color: 'var(--text-muted, #555)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 180ms ease, background 180ms ease' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#e06a6a'; (e.currentTarget as HTMLElement).style.background = 'rgba(214,69,69,0.06)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted, #555)'; (e.currentTarget as HTMLElement).style.background = 'none'; }}
                    >
                      <Trash2 size={13} />
                    </button>
                    <div style={{ gridColumn: '2 / 5', paddingTop: '10px', borderTop: '0.5px dashed rgba(255,255,255,0.06)', marginTop: '2px' }}>
                      <textarea
                        value={perk.description}
                        onChange={e => updatePerk(perk.id, 'description', e.target.value)}
                        placeholder="Describe what this unlocks for the member."
                        rows={2}
                        style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontSize: '12.5px', color: 'var(--text-secondary, #888)', resize: 'none', minHeight: '36px', lineHeight: '1.5', fontFamily: 'inherit' }}
                        className="ag-input"
                      />
                    </div>
                  </div>
                ))}
                {form.perks.length < 8 && (
                  <button
                    type="button"
                    onClick={addPerk}
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '0.5px dashed rgba(255,255,255,0.1)', color: 'var(--text-muted, #555)', fontSize: '12.5px', fontWeight: 500, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'none', cursor: 'pointer', transition: 'color 180ms ease, border-color 180ms ease, background 180ms ease' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text, #f0f0f0)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.18)'; (e.currentTarget as HTMLElement).style.background = 'var(--surface-1, #111)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted, #555)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLElement).style.background = 'none'; }}
                  >
                    <Plus size={12} />
                    Add perk
                  </button>
                )}
              </div>
            </CardGroup>
          )}

          {/* ─── Section: Review ─── */}
          {section === 'review' && (
            <CardGroup>
              <CardHead title="Review & publish" subtitle="Double-check everything before publishing your plan." />
              <div style={{ padding: '22px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[
                  { label: 'Plan name', value: form.planName || '—' },
                  { label: 'Tagline', value: form.tagline || '—' },
                  { label: 'Price', value: form.price ? `$${form.price} / ${form.billing}` : '—' },
                  { label: 'Currency', value: form.currency },
                  { label: 'Free trial', value: form.trialEnabled ? `${form.trialDays} days` : 'None' },
                  { label: 'Yearly option', value: form.yearlyEnabled && form.yearlyPrice ? `$${form.yearlyPrice} / year` : 'No' },
                  { label: 'Perks', value: `${form.perks.length} defined` },
                  { label: 'Discord role', value: discordRoles.find(r => r.id === form.discordRoleId)?.name || (form.discordRoleId ? form.discordRoleId : 'None') },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '10px 0', borderBottom: '0.5px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary, #888)' }}>{row.label}</span>
                    <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text, #f0f0f0)' }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </CardGroup>
          )}

          {error && (
            <div style={{ padding: '11px 14px', background: 'rgba(224,106,106,0.08)', border: '0.5px solid rgba(224,106,106,0.2)', borderRadius: '8px', color: '#e06a6a', fontSize: '13px', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          {/* Sticky actions */}
          <div style={{ position: 'sticky', bottom: 0, background: 'linear-gradient(180deg, transparent 0, rgba(10,10,10,0.9) 30%, #0a0a0a 70%)', padding: '24px 0 4px', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ fontSize: '12.5px', color: 'var(--text-muted, #555)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ab585', boxShadow: '0 0 8px #4ab585' }} />
              Draft
            </div>
            <div style={{ display: 'inline-flex', gap: '8px' }}>
              {sectionIdx < sections.length - 1 && (
                <button
                  type="button"
                  onClick={() => setSection(sections[sectionIdx + 1].key)}
                  style={{ padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 500, background: 'transparent', color: 'var(--text, #f0f0f0)', border: '0.5px solid rgba(255,255,255,0.15)', cursor: 'pointer', transition: 'border-color 180ms ease, background 180ms ease' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.3)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.15)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  Next: {sections[sectionIdx + 1].label}
                </button>
              )}
              <button
                type="button"
                onClick={handlePublish}
                disabled={loading}
                style={{ padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 500, background: '#fff', color: '#0a0a0a', border: '0.5px solid #fff', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'opacity 180ms ease', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.opacity = '0.92'; }}
                onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLElement).style.opacity = '1'; }}
              >
                {loading && <Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} />}
                Publish plan
              </button>
            </div>
          </div>
        </div>

        {/* Preview pane */}
        <aside style={{ background: 'var(--bg-alt, #0d0d0d)', borderLeft: '0.5px solid rgba(255,255,255,0.06)', position: 'sticky', top: '52px', height: 'calc(100vh - 52px)', display: 'flex', flexDirection: 'column' }} className="plan-builder-preview">
          <div style={{ height: '46px', borderBottom: '0.5px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px', flexShrink: 0 }}>
            <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-muted, #555)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Live preview</span>
            <div style={{ display: 'inline-flex', padding: '3px', background: 'var(--surface-1, #111)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '7px' }}>
              {([['mobile', Smartphone, 'Mobile'], ['tablet', Tablet, 'Tablet'], ['desktop', Monitor, 'Desktop']] as const).map(([key, Icon, label]) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={deviceView === key}
                  aria-label={label}
                  onClick={() => setDeviceView(key)}
                  style={{ width: '26px', height: '22px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', border: 'none', cursor: 'pointer', background: deviceView === key ? 'var(--surface-3, #1a1a1a)' : 'transparent', color: deviceView === key ? 'var(--text, #f0f0f0)' : 'var(--text-muted, #555)', transition: 'background 180ms ease, color 180ms ease' }}
                >
                  <Icon size={12} />
                </button>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: '24px 20px 40px', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', background: 'radial-gradient(1000px 500px at 50% -10%, rgba(88,101,242,0.05), transparent 60%), var(--bg-alt, #0d0d0d)' }}>
            <Preview form={form} deviceView={deviceView} communityName={communityName} />
          </div>
        </aside>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .ag-input::placeholder { color: rgba(255,255,255,0.18) !important; }
        @media (max-width: 1100px) {
          .plan-builder-grid { grid-template-columns: 1fr !important; }
          .plan-builder-preview { display: none !important; }
        }
      `}</style>
    </div>
  );
}
