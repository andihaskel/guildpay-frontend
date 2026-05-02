'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { ExternalLink, Plus, Download, MoveHorizontal as MoreHorizontal } from 'lucide-react';
import { useCommunity } from '@/contexts/CommunityContext';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Community, CommunityOverview, CommunityPlan, CommunityChannel, CommunityMember, ActivityItem } from '@/lib/types';

// ─── helpers ─────────────────────────────────────────────────────────────────

const SERVER_COLORS = [
  '#5865f2','#3b82f6','#10b981','#f59e0b','#ef4444',
  '#8b5cf6','#06b6d4','#f97316','#ec4899','#14b8a6',
];

function communityColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return SERVER_COLORS[Math.abs(h) % SERVER_COLORS.length];
}
function communityInitial(name: string) { return (name.trim()[0] || '?').toUpperCase(); }

function fmtAmount(minor: number, currency = 'usd') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase(), minimumFractionDigits: 0 }).format(minor / 100);
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m || 1}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d`;
  return `${Math.floor(d / 30)}mo`;
}

// ─── sub-components ───────────────────────────────────────────────────────────

type TabName = 'overview' | 'plans' | 'channels' | 'members' | 'settings';

function TabBar({ active, onSelect, counts }: { active: TabName; onSelect: (t: TabName) => void; counts: Partial<Record<TabName, number>> }) {
  const tabs: { key: TabName; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'plans', label: 'Plans' },
    { key: 'channels', label: 'Channels' },
    { key: 'members', label: 'Members' },
    { key: 'settings', label: 'Settings' },
  ];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2px', borderBottom: '0.5px solid var(--border)', marginBottom: '28px', overflowX: 'auto' }}>
      {tabs.map(t => (
        <button
          key={t.key}
          onClick={() => onSelect(t.key)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '12px 14px', fontSize: '13.5px', fontWeight: 500,
            color: active === t.key ? 'var(--text)' : 'var(--text-secondary)',
            background: 'none', border: 'none', cursor: 'pointer',
            position: 'relative', whiteSpace: 'nowrap',
            transition: 'color 180ms ease',
          }}
          onMouseEnter={e => { if (active !== t.key) (e.currentTarget as HTMLElement).style.color = 'var(--text)'; }}
          onMouseLeave={e => { if (active !== t.key) (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
        >
          {active === t.key && (
            <div style={{ position: 'absolute', left: '8px', right: '8px', bottom: '-0.5px', height: '2px', background: 'var(--text)', borderRadius: '2px 2px 0 0' }} />
          )}
          {t.label}
          {counts[t.key] != null && (
            <span style={{ fontSize: '11px', color: active === t.key ? 'var(--text)' : 'var(--text-muted)', background: active === t.key ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.05)', padding: '1px 6px', borderRadius: '10px', fontVariantNumeric: 'tabular-nums' }}>
              {counts[t.key]}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

function StatCard({ label, value, delta, deltaDown }: { label: string; value: string | number; delta?: string; deltaDown?: boolean }) {
  return (
    <div style={{ background: 'var(--surface-1)', border: '0.5px solid var(--border)', borderRadius: '10px', padding: '16px 18px' }}>
      <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: '24px', fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--text)', marginTop: '6px', fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      {delta && <div style={{ fontSize: '12px', color: deltaDown ? '#e06a6a' : '#4ab585', marginTop: '4px' }}>{delta}</div>}
    </div>
  );
}

function PlanStatusChip({ plan }: { plan: CommunityPlan }) {
  const live = plan.published && plan.status !== 'disabled';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '2px 8px',
      borderRadius: '999px', fontSize: '11.5px', fontWeight: 500, border: '0.5px solid',
      background: live ? 'var(--success-soft-bg)' : 'rgba(255,255,255,0.04)',
      borderColor: live ? 'var(--success-soft-border)' : 'var(--border)',
      color: live ? 'var(--success-soft-text)' : 'var(--text-secondary)',
    }}>
      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'currentColor' }} />
      {live ? 'Live' : 'Disabled'}
    </span>
  );
}

function PaymentStatusChip({ status }: { status: string }) {
  const map: Record<string, { bg: string; border: string; color: string; label: string }> = {
    active:    { bg: 'var(--success-soft-bg)', border: 'var(--success-soft-border)', color: 'var(--success-soft-text)', label: 'Active' },
    trialing:  { bg: 'var(--accent-soft-bg)',  border: 'var(--accent-soft-border)',  color: 'var(--accent-soft-text)',  label: 'Trialing' },
    canceling: { bg: 'var(--warning-soft-bg)', border: 'var(--warning-soft-border)', color: 'var(--warning-soft-text)', label: 'Canceling' },
    free:      { bg: 'rgba(255,255,255,0.04)', border: 'var(--border)', color: 'var(--text-secondary)', label: 'Free' },
  };
  const s = map[status] ?? map.free;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '2px 8px', borderRadius: '999px', fontSize: '11.5px', fontWeight: 500, border: `0.5px solid ${s.border}`, background: s.bg, color: s.color }}>
      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'currentColor' }} />
      {s.label}
    </span>
  );
}

function AvatarCell({ name, avatarUrl }: { name: string; avatarUrl?: string }) {
  const initials = name.split(' ').slice(0, 2).map(w => w[0] || '').join('').toUpperCase() || '?';
  const colors = ['#5865f2','#2b7a4b','#b84a3a','#6b3fb2','#c4963a','#14b8a6'];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  const bg = colors[Math.abs(h) % colors.length];
  return (
    <span style={{ width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 600, color: '#fff', background: avatarUrl ? 'transparent' : bg, overflow: 'hidden' }}>
      {avatarUrl ? <img src={avatarUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
    </span>
  );
}

// ─── tab: Overview ───────────────────────────────────────────────────────────

function OverviewTab({ communityId, overview, plans, activity, onNewPlan }: { communityId: string; overview: CommunityOverview | null; plans: CommunityPlan[]; activity: ActivityItem[]; onNewPlan: () => void }) {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '28px' }}>
        <StatCard label="Active members" value={overview?.paying_members ?? '—'} />
        <StatCard label="MRR" value={overview?.monthly_revenue != null ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(overview.monthly_revenue / 100) : '—'} />
        <StatCard label="Trialing" value={overview?.trialing ?? '—'} />
        <StatCard label="Canceling" value={overview?.canceling ?? '—'} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {/* Plans card */}
        <div style={{ background: 'var(--surface-1)', border: '0.5px solid var(--border)', borderRadius: '10px' }}>
          <div style={{ padding: '16px 20px', borderBottom: '0.5px solid var(--border-soft)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 500, letterSpacing: '-0.005em', margin: 0, color: 'var(--text)' }}>Plans</h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '2px 0 0' }}>Public paywalls for this community.</p>
            </div>
            <button
              onClick={onNewPlan}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 500, padding: '6px 12px', borderRadius: '6px', background: 'transparent', border: '0.5px solid rgba(255,255,255,0.12)', color: 'var(--text)', cursor: 'pointer', transition: 'border-color 180ms ease, background 180ms ease' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.25)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              New plan
            </button>
          </div>
          <div>
            {plans.length === 0 ? (
              <div style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '0.5px solid var(--border)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flexShrink: 0 }}>
                  <Plus size={14} />
                </span>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '0 0 2px' }}>No plans yet</p>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: 0 }}>Create your first plan to start accepting members.</p>
                </div>
              </div>
            ) : plans.map((plan, idx) => {
              const color = communityColor(plan.offer_name);
              const initial = (plan.offer_name[0] || '?').toUpperCase() + (plan.offer_name.split(' ')[1]?.[0] || '');
              return (
                <div key={plan.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 20px', borderBottom: idx < plans.length - 1 ? '0.5px solid var(--border-soft)' : 'none', transition: 'background 180ms ease' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.015)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                >
                  <span style={{ width: '36px', height: '36px', borderRadius: '8px', flexShrink: 0, background: color, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 600, fontSize: '13px' }}>{initial}</span>
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--text)' }}>{plan.offer_name}</span>
                      <PlanStatusChip plan={plan} />
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {plan.member_counts.active} active · {plan.member_counts.trialing} trialing
                    </span>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)' }}>{fmtAmount(plan.monthly_amount_minor, plan.currency)}</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>/ month</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Activity card */}
        <div style={{ background: 'var(--surface-1)', border: '0.5px solid var(--border)', borderRadius: '10px' }}>
          <div style={{ padding: '16px 20px', borderBottom: '0.5px solid var(--border-soft)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 500, letterSpacing: '-0.005em', margin: 0, color: 'var(--text)' }}>Recent activity</h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '2px 0 0' }}>Last 7 days.</p>
            </div>
          </div>
          <div>
            {activity.length === 0 ? (
              <div style={{ padding: '20px', color: 'var(--text-muted)', fontSize: '13px' }}>No recent activity.</div>
            ) : activity.map((item, idx) => (
              <div key={item.id ?? idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', borderBottom: idx < activity.length - 1 ? '0.5px solid var(--border-soft)' : 'none' }}>
                <span style={{ width: '28px', height: '28px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: 'var(--success-soft-bg)', border: '0.5px solid var(--success-soft-border)', color: 'var(--success-soft-text)' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
                <div style={{ flex: 1, fontSize: '13px', color: 'var(--text)' }}>{item.message}</div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>{timeAgo(item.created_at)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── tab: Plans ──────────────────────────────────────────────────────────────

function PlansTab({ communityId, plans, onNewPlan, onRefresh }: { communityId: string; plans: CommunityPlan[]; onNewPlan: () => void; onRefresh: () => void }) {
  return (
    <div style={{ background: 'var(--surface-1)', border: '0.5px solid var(--border)', borderRadius: '10px' }}>
      <div style={{ padding: '16px 20px', borderBottom: '0.5px solid var(--border-soft)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <h3 style={{ fontSize: '14px', fontWeight: 500, margin: 0, color: 'var(--text)' }}>Plans</h3>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '2px 0 0' }}>Public-facing checkout plans. One plan can grant access to multiple channels.</p>
        </div>
        <button
          onClick={onNewPlan}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500, padding: '8px 14px', borderRadius: '6px', background: '#fff', color: '#0a0a0a', border: '0.5px solid #fff', cursor: 'pointer', transition: 'opacity 180ms ease' }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = '0.92')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = '1')}
        >
          <Plus size={13} />
          New plan
        </button>
      </div>
      <div>
        {plans.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>No plans yet. Create one to start accepting members.</div>
        ) : plans.map((plan, idx) => {
          const color = communityColor(plan.offer_name);
          const initial = (plan.offer_name[0] || '?').toUpperCase() + (plan.offer_name.split(' ')[1]?.[0] || '');
          return (
            <div key={plan.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 20px', borderBottom: idx < plans.length - 1 ? '0.5px solid var(--border-soft)' : 'none', transition: 'background 180ms ease' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.015)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
            >
              <span style={{ width: '36px', height: '36px', borderRadius: '8px', flexShrink: 0, background: color, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 600, fontSize: '13px' }}>{initial}</span>
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--text)' }}>{plan.offer_name}</span>
                  <PlanStatusChip plan={plan} />
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '2px 8px', borderRadius: '999px', fontSize: '11.5px', fontWeight: 500, background: 'var(--accent-soft-bg)', border: '0.5px solid var(--accent-soft-border)', color: 'var(--accent-soft-text)' }}>
                    {(plan.channel_ids?.length ?? 0)} channels
                  </span>
                </div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {plan.member_counts.active} active · {plan.member_counts.trialing} trialing
                </span>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)' }}>{fmtAmount(plan.monthly_amount_minor, plan.currency)}</div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>/ month</div>
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                <button style={{ width: '30px', height: '30px', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 180ms ease, background 180ms ease' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; (e.currentTarget as HTMLElement).style.background = 'none'; }}
                  aria-label="View">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" stroke="currentColor" strokeWidth="1.6"/><circle cx="12" cy="12" r="2.8" stroke="currentColor" strokeWidth="1.6"/></svg>
                </button>
                <button style={{ width: '30px', height: '30px', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 180ms ease, background 180ms ease' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; (e.currentTarget as HTMLElement).style.background = 'none'; }}
                  aria-label="Edit">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M4 20h4l10.5-10.5a2.12 2.12 0 0 0-3-3L5 17v3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── tab: Channels ────────────────────────────────────────────────────────────

function ChannelIcon({ provider }: { provider: string }) {
  if (provider === 'discord') return (
    <span style={{ width: '36px', height: '36px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(88,101,242,0.12)', border: '0.5px solid rgba(88,101,242,0.25)', color: '#8b92f8', flexShrink: 0 }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.5 4.4a16.5 16.5 0 0 0-4-1.3l-.2.4a15 15 0 0 1 3.7 1.2 14 14 0 0 0-14 0 15 15 0 0 1 3.7-1.2l-.2-.4a16.5 16.5 0 0 0-4 1.3C1.7 9 .9 13.4 1.3 17.8c1.6 1.2 3.2 1.9 4.8 2.4.4-.5.7-1.1 1-1.7a10 10 0 0 1-1.6-.8l.4-.3a10 10 0 0 0 12.2 0l.4.3a10 10 0 0 1-1.6.8c.3.6.6 1.2 1 1.7 1.6-.5 3.2-1.2 4.8-2.4.5-5-1-9.4-3.2-13.4zM8.5 15.2c-1 0-1.8-1-1.8-2.1 0-1.2.8-2.2 1.8-2.2s1.8 1 1.8 2.2c0 1.2-.8 2.1-1.8 2.1zm7 0c-1 0-1.8-1-1.8-2.1 0-1.2.8-2.2 1.8-2.2s1.8 1 1.8 2.2c0 1.2-.8 2.1-1.8 2.1z"/></svg>
    </span>
  );
  return (
    <span style={{ width: '36px', height: '36px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.04)', border: '0.5px solid var(--border)', color: 'var(--text-muted)', flexShrink: 0 }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9.5 13.5l5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
    </span>
  );
}

function ChannelsTab({ channels }: { channels: CommunityChannel[] }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: '15px', fontWeight: 500, margin: 0, letterSpacing: '-0.01em', color: 'var(--text)' }}>Channels</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '2px 0 0' }}>The places paying members get access to when they subscribe.</p>
        </div>
        <button style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500, padding: '8px 14px', borderRadius: '6px', background: '#fff', color: '#0a0a0a', border: '0.5px solid #fff', cursor: 'pointer', transition: 'opacity 180ms ease' }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = '0.92')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = '1')}
        >
          <Plus size={13} />
          Add channel
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        {channels.map(ch => (
          <div key={ch.id} style={{ background: 'var(--surface-1)', border: '0.5px solid var(--border)', borderRadius: '10px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <ChannelIcon provider={ch.provider} />
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', margin: 0 }}>{ch.name}</h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '1px 0 0' }}>{ch.provider}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', paddingTop: '12px', borderTop: '0.5px solid var(--border-soft)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '2px 8px', borderRadius: '999px', fontSize: '11.5px', fontWeight: 500, background: ch.connected ? 'var(--success-soft-bg)' : 'rgba(255,255,255,0.04)', border: `0.5px solid ${ch.connected ? 'var(--success-soft-border)' : 'var(--border)'}`, color: ch.connected ? 'var(--success-soft-text)' : 'var(--text-secondary)' }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'currentColor' }} />
                {ch.connected ? 'Connected' : 'Not connected'}
              </span>
              {ch.members_synced != null && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{ch.members_synced} members synced</span>}
            </div>
          </div>
        ))}
        {channels.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '32px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--surface-1)', border: '0.5px solid var(--border)', borderRadius: '10px' }}>
            No channels connected yet.
          </div>
        )}
        <button style={{ background: 'transparent', border: '1px dashed var(--border-strong)', borderRadius: '10px', padding: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', cursor: 'pointer', color: 'var(--text-secondary)', minHeight: '100px', transition: 'background 180ms ease, border-color 180ms ease', flexDirection: 'column' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--text-muted)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)'; }}
        >
          <span style={{ width: '36px', height: '36px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.03)', border: '0.5px solid var(--border)', color: 'var(--text-muted)' }}>
            <Plus size={16} />
          </span>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--text)' }}>Add another channel</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Discord, Telegram, or email list</div>
          </div>
        </button>
      </div>
    </div>
  );
}

// ─── tab: Members ─────────────────────────────────────────────────────────────

function MembersTab({ members, total }: { members: CommunityMember[]; total: number }) {
  return (
    <div style={{ background: 'var(--surface-1)', border: '0.5px solid var(--border)', borderRadius: '10px' }}>
      <div style={{ padding: '16px 20px', borderBottom: '0.5px solid var(--border-soft)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <h3 style={{ fontSize: '14px', fontWeight: 500, margin: 0, color: 'var(--text)' }}>Members</h3>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '2px 0 0' }}>Everyone with active access to this community.</p>
        </div>
        <button style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 500, padding: '6px 12px', borderRadius: '6px', background: 'transparent', border: '0.5px solid rgba(255,255,255,0.12)', color: 'var(--text)', cursor: 'pointer', transition: 'border-color 180ms ease, background 180ms ease' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.25)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
        >
          <Download size={13} />
          Export CSV
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 2fr) 1fr 1fr 90px 32px', alignItems: 'center', gap: '12px', padding: '10px 20px', background: 'var(--bg-alt, #0d0d0d)', borderBottom: '0.5px solid var(--border)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 500 }}>
        <div>Member</div>
        <div>Plan</div>
        <div>Since</div>
        <div>Status</div>
        <div />
      </div>
      {members.length === 0 ? (
        <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>No members yet.</div>
      ) : members.map((m, idx) => {
        const name = m.display_name || m.email || 'Unknown';
        const plan = m.source_page_name || m.page_name || '—';
        return (
          <div key={m.id} style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 2fr) 1fr 1fr 90px 32px', alignItems: 'center', gap: '12px', padding: '12px 20px', borderBottom: idx < members.length - 1 ? '0.5px solid var(--border-soft)' : 'none', fontSize: '13px', transition: 'background 180ms ease' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.015)')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
              <AvatarCell name={name} avatarUrl={m.avatar_url} />
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <span style={{ fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                {m.email && m.display_name && <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.email}</span>}
              </div>
            </div>
            <div style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{plan}</div>
            <div style={{ color: 'var(--text-muted)' }}>{timeAgo(m.created_at)}</div>
            <div><PaymentStatusChip status={m.payment_status} /></div>
            <div>
              <button style={{ width: '28px', height: '28px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 180ms ease, background 180ms ease' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; (e.currentTarget as HTMLElement).style.background = 'none'; }}
                aria-label="More">
                <MoreHorizontal size={14} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── tab: Settings ────────────────────────────────────────────────────────────

function SettingsTab({ community, overview }: { community: Community; overview: CommunityOverview | null }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ background: 'var(--surface-1)', border: '0.5px solid var(--border)', borderRadius: '10px' }}>
        <div style={{ padding: '16px 20px', borderBottom: '0.5px solid var(--border-soft)' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 500, margin: 0, color: 'var(--text)' }}>Community details</h3>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '2px 0 0' }}>Name, slug, and branding.</p>
        </div>
        {[
          { title: 'Name', value: community.name },
          { title: 'Slug', value: community.slug || '—', mono: true },
          { title: 'Tagline', value: community.tagline || 'Not set' },
        ].map(row => (
          <div key={row.title} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', padding: '14px 20px', borderBottom: '0.5px solid var(--border-soft)' }}>
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--text)' }}>{row.title}</div>
              <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '1px', fontFamily: row.mono ? 'var(--font-mono)' : undefined }}>{row.value}</div>
            </div>
            <button style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 500, padding: '6px 12px', borderRadius: '6px', background: 'transparent', border: '0.5px solid rgba(255,255,255,0.12)', color: 'var(--text)', cursor: 'pointer', transition: 'border-color 180ms ease, background 180ms ease', whiteSpace: 'nowrap' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.25)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >Edit</button>
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--surface-1)', border: '0.5px solid var(--border)', borderRadius: '10px' }}>
        <div style={{ padding: '16px 20px', borderBottom: '0.5px solid var(--border-soft)' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 500, margin: 0, color: 'var(--text)' }}>Payments</h3>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '2px 0 0' }}>Stripe account that receives money for this community.</p>
        </div>
        <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px' }}>
          <div>
            <div style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--text)' }}>Stripe</div>
            <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '1px' }}>
              {overview?.onboarding.stripe_connected ? 'Connected' : 'Not connected'}
            </div>
          </div>
          {overview?.onboarding.stripe_connected ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '2px 8px', borderRadius: '999px', fontSize: '11.5px', fontWeight: 500, background: 'var(--success-soft-bg)', border: '0.5px solid var(--success-soft-border)', color: 'var(--success-soft-text)' }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'currentColor' }} />
              Connected
            </span>
          ) : overview?.stripe_connect_url ? (
            <a href={overview.stripe_connect_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 500, padding: '6px 12px', borderRadius: '6px', background: 'transparent', border: '0.5px solid rgba(245,158,11,0.3)', color: '#fbbf24', textDecoration: 'none', transition: 'background 180ms ease' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(245,158,11,0.08)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
            >
              <ExternalLink size={12} />
              Connect Stripe
            </a>
          ) : null}
        </div>
      </div>

      <div style={{ background: 'var(--surface-1)', border: '0.5px solid rgba(214,69,69,0.22)', borderRadius: '10px' }}>
        <div style={{ padding: '16px 20px', borderBottom: '0.5px solid rgba(214,69,69,0.22)' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 500, margin: 0, color: '#e06a6a', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 3L2 21h20L12 3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><path d="M12 10v5M12 18h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
            Danger zone
          </h3>
        </div>
        <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--text)' }}>Delete this community</div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '2px 0 0', maxWidth: '440px' }}>Members lose access immediately. Revenue history is preserved.</p>
          </div>
          <button style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 500, padding: '7px 13px', borderRadius: '6px', background: 'transparent', border: '0.5px solid rgba(214,69,69,0.22)', color: '#e06a6a', cursor: 'pointer', transition: 'background 180ms ease, border-color 180ms ease', whiteSpace: 'nowrap' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(214,69,69,0.08)'; (e.currentTarget as HTMLElement).style.borderColor = '#e06a6a'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(214,69,69,0.22)'; }}
          >Delete</button>
        </div>
      </div>
    </div>
  );
}

// ─── main page ────────────────────────────────────────────────────────────────

export default function CommunityPage() {
  const { communityId } = useParams<{ communityId: string }>();
  const router = useRouter();
  const { communities, setCurrentCommunityId } = useCommunity();

  const [community, setCommunity] = useState<Community | null>(null);
  const [overview, setOverview] = useState<CommunityOverview | null>(null);
  const [previewPlans, setPreviewPlans] = useState<CommunityPlan[]>([]);
  const [allPlans, setAllPlans] = useState<CommunityPlan[]>([]);
  const [channels, setChannels] = useState<CommunityChannel[]>([]);
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [memberTotal, setMemberTotal] = useState(0);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [activeTab, setActiveTab] = useState<TabName>('overview');
  const [isLoading, setIsLoading] = useState(true);

  const loadAllPlans = useCallback(() => {
    if (!communityId) return;
    api.getCommunityPlans(communityId).then(setAllPlans).catch(() => {});
  }, [communityId]);

  // Load bootstrap data
  useEffect(() => {
    if (!communityId) return;
    setCurrentCommunityId(communityId);
    setIsLoading(true);

    Promise.allSettled([
      api.getCommunity(communityId),
      api.getCommunityOverview(communityId),
      api.getCommunityPlans(communityId, { mode: 'home', limit: 2 }),
      api.getCommunityActivity(communityId, { window: '7d', limit: 8 }),
    ]).then(([comm, ovr, plans, act]) => {
      if (comm.status === 'fulfilled') setCommunity(comm.value);
      if (ovr.status === 'fulfilled') setOverview(ovr.value);
      if (plans.status === 'fulfilled') setPreviewPlans(plans.value);
      if (act.status === 'fulfilled') setActivity(act.value);
      setIsLoading(false);
    });
  }, [communityId]);

  // Load full plans on plans tab
  useEffect(() => {
    if (activeTab === 'plans' && communityId && allPlans.length === 0) {
      loadAllPlans();
    }
  }, [activeTab, communityId]);

  // Load channels on channels tab
  useEffect(() => {
    if (activeTab === 'channels' && communityId && channels.length === 0) {
      api.getCommunityChannels(communityId).then(setChannels).catch(() => {});
    }
  }, [activeTab, communityId]);

  // Load members on members tab
  useEffect(() => {
    if (activeTab === 'members' && communityId && members.length === 0) {
      api.getCommunityMembers(communityId, { page: 1, limit: 50 }).then(res => {
        setMembers(res.members);
        setMemberTotal(res.total);
      }).catch(() => {});
    }
  }, [activeTab, communityId]);

  const comm = community ?? communities.find(c => c.id === communityId) ?? null;

  function handleOpenNewPlan() {
    router.push(`/dashboard/plans/new?community_id=${communityId}&community_name=${encodeURIComponent(comm?.name || '')}`);
  }

  if (!comm && isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {[1,2,3].map(i => <div key={i} style={{ height: '56px', borderRadius: '10px', background: 'var(--surface-1)', border: '0.5px solid var(--border)' }} />)}
      </div>
    );
  }

  if (!comm) return <div style={{ color: 'var(--text-muted)', padding: '32px' }}>Community not found.</div>;

  const color = communityColor(comm.name);
  const initial = communityInitial(comm.name);

  const counts: Partial<Record<TabName, number>> = {
    plans: allPlans.length || previewPlans.length || comm.pages_count,
    members: memberTotal || comm.members_count,
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ width: '44px', height: '44px', borderRadius: '10px', flexShrink: 0, background: color, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 600, fontSize: '18px' }}>
            {initial}
          </span>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 500, color: 'var(--text)', margin: '0 0 2px', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '10px' }}>
              {comm.name}
            </h1>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', margin: 0 }}>
              {comm.tagline || ''}
              {comm.members_count != null && `${comm.tagline ? ' · ' : ''}${comm.members_count} members`}
            </p>
          </div>
        </div>
        <div style={{ display: 'inline-flex', gap: '8px' }}>
          <button style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 500, background: 'transparent', color: 'var(--text)', border: '0.5px solid rgba(255,255,255,0.15)', cursor: 'pointer', transition: 'border-color 180ms ease, background 180ms ease' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.3)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.15)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            <ExternalLink size={13} />
            Visit page
          </button>
          <button
            onClick={handleOpenNewPlan}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 500, background: '#fff', color: '#0a0a0a', border: '0.5px solid #fff', cursor: 'pointer', transition: 'opacity 180ms ease' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = '0.92')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = '1')}
          >
            <Plus size={13} />
            New plan
          </button>
        </div>
      </div>

      {/* Tabs */}
      <TabBar active={activeTab} onSelect={setActiveTab} counts={counts} />

      {/* Tab panes */}
      {activeTab === 'overview' && (
        <OverviewTab communityId={communityId} overview={overview} plans={previewPlans} activity={activity} onNewPlan={handleOpenNewPlan} />
      )}
      {activeTab === 'plans' && (
        <PlansTab communityId={communityId} plans={allPlans.length > 0 ? allPlans : previewPlans} onNewPlan={handleOpenNewPlan} onRefresh={loadAllPlans} />
      )}
      {activeTab === 'channels' && (
        <ChannelsTab channels={channels} />
      )}
      {activeTab === 'members' && (
        <MembersTab members={members} total={memberTotal} />
      )}
      {activeTab === 'settings' && (
        <SettingsTab community={comm} overview={overview} />
      )}

    </div>
  );
}
