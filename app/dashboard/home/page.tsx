'use client';

import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { useCommunity } from '@/contexts/CommunityContext';
import { useAuth } from '@/contexts/AuthContext';
import { Community } from '@/lib/types';

const SERVER_COLORS = [
  '#5865f2','#3b82f6','#10b981','#f59e0b','#ef4444',
  '#8b5cf6','#06b6d4','#f97316','#ec4899','#14b8a6',
];

function communityColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return SERVER_COLORS[Math.abs(h) % SERVER_COLORS.length];
}

function communityInitial(name: string) {
  return (name.trim()[0] || '?').toUpperCase();
}

function formatMrr(minor: number) {
  const val = minor / 100;
  if (val >= 1000) return `$${(val / 1000).toFixed(1)}k`;
  return `$${val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatChurn(bps: number) {
  return `${(bps / 100).toFixed(1)}%`;
}

function StatCard({ label, value, delta, deltaDown }: { label: string; value: string; delta?: string; deltaDown?: boolean }) {
  return (
    <div style={{ background: 'var(--surface-1)', border: '0.5px solid var(--border)', borderRadius: '10px', padding: '16px 18px' }}>
      <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: '24px', fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--text)', marginTop: '6px', fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      {delta && (
        <div style={{ fontSize: '12px', color: deltaDown ? 'var(--danger-soft-text, #e06a6a)' : 'var(--success-soft-text, #4ab585)', marginTop: '4px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
          {delta}
        </div>
      )}
    </div>
  );
}

function CommunityCard({ community, onClick }: { community: Community; onClick: () => void }) {
  const color = communityColor(community.name);
  const initial = communityInitial(community.name);
  return (
    <button
      onClick={onClick}
      style={{
        background: 'var(--surface-1)', border: '0.5px solid var(--border)', borderRadius: '10px',
        padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px',
        textAlign: 'left', cursor: 'pointer', width: '100%',
        transition: 'background 180ms ease, border-color 180ms ease',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-1)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ width: '40px', height: '40px', borderRadius: '9px', flexShrink: 0, background: color, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 600, fontSize: '16px', letterSpacing: '-0.01em' }}>
          {initial}
        </span>
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text)', letterSpacing: '-0.01em', margin: 0 }}>{community.name}</h3>
          {community.tagline && <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '1px 0 0' }}>{community.tagline}</p>}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', paddingTop: '14px', borderTop: '0.5px solid var(--border-soft)' }}>
        <div>
          <div style={{ fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 500 }}>Members</div>
          <div style={{ fontSize: '16px', fontWeight: 500, color: 'var(--text)', marginTop: '2px', fontVariantNumeric: 'tabular-nums' }}>{community.members_count ?? 0}</div>
        </div>
        <div>
          <div style={{ fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 500 }}>Pages</div>
          <div style={{ fontSize: '16px', fontWeight: 500, color: 'var(--text)', marginTop: '2px', fontVariantNumeric: 'tabular-nums' }}>{community.pages_count ?? 0}</div>
        </div>
        <div>
          <div style={{ fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 500 }}>MRR</div>
          <div style={{ fontSize: '16px', fontWeight: 500, color: 'var(--text)', marginTop: '2px', fontVariantNumeric: 'tabular-nums' }}>
            {community.monthly_revenue != null ? formatMrr(community.monthly_revenue) : '—'}
          </div>
        </div>
      </div>
    </button>
  );
}

export default function HomePage() {
  const router = useRouter();
  const { communities, homeStats, isLoading, setCurrentCommunityId } = useCommunity();
  const { user } = useAuth();

  const userName = user?.username || user?.discordUsername || user?.email?.split('@')[0] || 'there';

  function goToCommunity(community: Community) {
    setCurrentCommunityId(community.id);
    router.push(`/dashboard/community/${community.id}`);
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 500, color: 'var(--text)', margin: '0 0 2px', letterSpacing: '-0.02em' }}>
            Welcome back, {userName}
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', margin: 0 }}>
            Pick a community to manage, or create a new one.
          </p>
        </div>
        <button
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 500, background: '#fff', color: '#0a0a0a', border: '0.5px solid #fff', cursor: 'pointer', transition: 'opacity 180ms ease', whiteSpace: 'nowrap' }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = '0.92')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = '1')}
        >
          <Plus size={14} />
          New community
        </button>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '28px' }}>
          {[1,2,3,4].map(i => <div key={i} style={{ height: '88px', borderRadius: '10px', background: 'var(--surface-1)', border: '0.5px solid var(--border)' }} />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '28px' }}>
          <StatCard label="Total members" value={String(homeStats?.total_members ?? communities.reduce((a, c) => a + (c.members_count ?? 0), 0))} />
          <StatCard label="MRR" value={homeStats?.total_mrr_minor != null ? formatMrr(homeStats.total_mrr_minor) : '—'} />
          <StatCard label="Communities" value={String(homeStats?.communities ?? communities.length)} />
          <StatCard
            label="Churn (30d)"
            value={homeStats?.churn_30d_bps != null ? formatChurn(homeStats.churn_30d_bps) : '—'}
            deltaDown={homeStats?.churn_30d_bps != null && homeStats.churn_30d_bps > 0}
          />
        </div>
      )}

      {/* Community cards */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {[1,2].map(i => <div key={i} style={{ height: '160px', borderRadius: '10px', background: 'var(--surface-1)', border: '0.5px solid var(--border)' }} />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {communities.map(community => (
            <CommunityCard key={community.id} community={community} onClick={() => goToCommunity(community)} />
          ))}
          <button
            style={{
              background: 'transparent', border: '1px dashed var(--border-strong)', borderRadius: '10px',
              padding: '18px', display: 'flex', alignItems: 'center', gap: '12px',
              textAlign: 'left', cursor: 'pointer', color: 'var(--text-secondary)',
              minHeight: '100px', transition: 'background 180ms ease, border-color 180ms ease',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--text-muted)'; (e.currentTarget as HTMLElement).style.color = 'var(--text)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
          >
            <span style={{ width: '40px', height: '40px', borderRadius: '9px', flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.03)', border: '0.5px solid var(--border)', color: 'var(--text-muted)' }}>
              <Plus size={18} />
            </span>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)' }}>Create a new community</div>
              <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '2px' }}>Each community is its own paywall + members + channels.</div>
            </div>
          </button>
        </div>
      )}

      {/* Hint */}
      <div style={{ marginTop: '24px', padding: '12px 14px', background: 'var(--accent-soft-bg)', border: '0.5px solid var(--accent-soft-border)', borderRadius: '8px', color: 'var(--accent-soft-text)', fontSize: '12.5px', lineHeight: '1.55', display: 'flex', alignItems: 'flex-start', gap: '9px' }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: '1px' }}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/><path d="M12 8v5M12 16.5v.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
        <span>A <strong style={{ color: 'var(--text)', fontWeight: 500 }}>community</strong> groups everything that belongs together: pages, channels, and members. One page can grant access to many channels at once — that&apos;s how you sell bundles.</span>
      </div>
    </div>
  );
}
