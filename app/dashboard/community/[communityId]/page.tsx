'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useCommunity } from '@/contexts/CommunityContext';
import { api } from '@/lib/api';
import { Community, CommunityOverview, CommunityPlan, CommunityMember, ActivityItem } from '@/lib/types';
import { CommunityWorkspaceChrome } from '@/components/community/CommunityWorkspaceChrome';
import { AnalyticsPane } from '@/components/community/AnalyticsPane';
import { MembersPane } from '@/components/community/MembersPane';
import { StatCard, fmtAmount, timeAgo } from '@/components/community/workspace-ui';
import './community-workspace.css';

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
// ─── types ────────────────────────────────────────────────────────────────────

type ModeName = 'overview' | 'analytics' | 'members';

// ─── OverviewPane ─────────────────────────────────────────────────────────────

function riskIconStyle(message: string) {
  const msg = message.toLowerCase();
  if (msg.includes('fail') || msg.includes('cancel') || msg.includes('remov')) {
    return {
      bg: 'var(--danger-soft-bg)', border: 'var(--danger-soft-border)', color: 'var(--danger-soft-text)',
      svg: <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
    };
  }
  return {
    bg: 'var(--warning-soft-bg)', border: 'var(--warning-soft-border)', color: 'var(--warning-soft-text)',
    svg: <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6"/><path d="M12 8v5M12 16.5v.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  };
}

function OverviewPane({
  overview,
  plans,
  activity,
  onViewSetup,
  onViewMembers,
}: {
  overview: CommunityOverview | null;
  plans: CommunityPlan[];
  activity: ActivityItem[];
  onViewSetup: () => void;
  onViewMembers: () => void;
}) {
  return (
    <div>
      <div className="stat-grid">
        <StatCard label="Active members" value={overview?.paying_members ?? '—'} />
        <StatCard label="MRR" value={overview?.monthly_revenue != null ? fmtAmount(overview.monthly_revenue) : '—'} />
        <StatCard label="Trialing" value={overview?.trialing ?? '—'} />
        <StatCard label="Canceling" value={overview?.canceling ?? '—'} />
      </div>

      <div className="grid-2">
        {/* Plans card */}
        <div style={{ background: 'var(--surface-1)', border: '0.5px solid var(--border)', borderRadius: '10px' }}>
          <div style={{ padding: '16px 20px', borderBottom: '0.5px solid var(--border-soft)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 500, margin: 0, color: 'var(--text)', letterSpacing: '-0.005em' }}>Plans</h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '2px 0 0' }}>Public paywalls for this community.</p>
            </div>
            <button
              onClick={onViewSetup}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 500, padding: '6px 12px', borderRadius: '6px', background: 'transparent', border: '0.5px solid rgba(255,255,255,0.12)', color: 'var(--text)', cursor: 'pointer', transition: 'border-color 180ms ease, background 180ms ease', whiteSpace: 'nowrap' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.25)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              View all
            </button>
          </div>
          <div>
            {plans.length === 0 ? (
              <div style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '0.5px solid var(--border)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                </span>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', margin: '0 0 2px' }}>No plans yet</p>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: 0 }}>Go to Setup to create your first plan.</p>
                </div>
              </div>
            ) : plans.map((plan, idx) => {
              const color = communityColor(plan.offer_name);
              const initial = (plan.offer_name[0] || '?').toUpperCase() + (plan.offer_name.split(' ')[1]?.[0] || '');
              const live = plan.published && plan.status !== 'disabled';
              return (
                <div key={plan.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 20px', borderBottom: idx < plans.length - 1 ? '0.5px solid var(--border-soft)' : 'none', transition: 'background 180ms ease' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.015)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                >
                  <span style={{ width: '36px', height: '36px', borderRadius: '8px', flexShrink: 0, background: color, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 600, fontSize: '13px' }}>{initial}</span>
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--text)' }}>{plan.offer_name}</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '2px 8px', borderRadius: '999px', fontSize: '11.5px', fontWeight: 500, border: '0.5px solid', background: live ? 'var(--success-soft-bg)' : 'rgba(255,255,255,0.04)', borderColor: live ? 'var(--success-soft-border)' : 'var(--border)', color: live ? 'var(--success-soft-text)' : 'var(--text-secondary)' }}>
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'currentColor' }} />
                        {live ? 'Live' : 'Disabled'}
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
                </div>
              );
            })}
          </div>
        </div>

        {/* Risk members card */}
        <div style={{ background: 'var(--surface-1)', border: '0.5px solid var(--border)', borderRadius: '10px' }}>
          <div style={{ padding: '16px 20px', borderBottom: '0.5px solid var(--border-soft)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 500, margin: 0, color: 'var(--text)', letterSpacing: '-0.005em' }}>Risk members</h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '2px 0 0' }}>Canceling, failed payments, or about to lapse.</p>
            </div>
            <button type="button" onClick={onViewMembers} className="btn-secondary" style={{ fontSize: '12.5px', padding: '6px 12px' }}>
              View all
            </button>
          </div>
          <div>
            {activity.length === 0 ? (
              <div style={{ padding: '20px', color: 'var(--text-muted)', fontSize: '13px' }}>No risk members at the moment.</div>
            ) : activity.slice(0, 5).map((item, idx) => {
              const risk = riskIconStyle(item.message);
              return (
                <div key={item.id ?? idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', borderBottom: idx < Math.min(activity.length, 5) - 1 ? '0.5px solid var(--border-soft)' : 'none' }}>
                  <span style={{ width: '28px', height: '28px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: risk.bg, border: `0.5px solid ${risk.border}`, color: risk.color }}>
                    {risk.svg}
                  </span>
                  <div style={{ flex: 1, fontSize: '13px', color: 'var(--text)' }}>{item.message}</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>{timeAgo(item.created_at)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── main page ────────────────────────────────────────────────────────────────

function parseMode(value: string | null): ModeName {
  if (value === 'analytics' || value === 'members') return value;
  return 'overview';
}

export default function CommunityPage() {
  const { communityId } = useParams<{ communityId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeMode = parseMode(searchParams.get('mode'));
  const { communities, setCurrentCommunityId } = useCommunity();

  const [community, setCommunity] = useState<Community | null>(null);
  const [overview, setOverview] = useState<CommunityOverview | null>(null);
  const [previewPlans, setPreviewPlans] = useState<CommunityPlan[]>([]);
  const [allPlans, setAllPlans] = useState<CommunityPlan[]>([]);
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [memberTotal, setMemberTotal] = useState(0);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    if (activeMode === 'analytics' && communityId && allPlans.length === 0) {
      api.getCommunityPlans(communityId).then(setAllPlans).catch(() => {});
    }
  }, [activeMode, communityId]);

  useEffect(() => {
    if (activeMode === 'members' && communityId) {
      if (members.length === 0) {
        api.getCommunityMembers(communityId, { page: 1, limit: 50 }).then(res => {
          setMembers(res.members);
          setMemberTotal(res.total);
        }).catch(() => {});
      }
      if (activity.length === 0) {
        api.getCommunityActivity(communityId, { window: '30d', limit: 20 }).then(setActivity).catch(() => {});
      }
    }
  }, [activeMode, communityId]);

  const comm = community ?? communities.find(c => c.id === communityId) ?? null;

  function handleSetup() {
    router.push(`/dashboard/community/${communityId}/setup`);
  }

  function handleViewMembers() {
    router.push(`/dashboard/community/${communityId}?mode=members`);
  }

  if (!comm && isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {[1, 2, 3].map(i => <div key={i} style={{ height: '56px', borderRadius: '10px', background: 'var(--surface-1)', border: '0.5px solid var(--border)' }} />)}
      </div>
    );
  }

  if (!comm) return <div style={{ color: 'var(--text-muted)', padding: '32px' }}>Community not found.</div>;

  return (
    <div>
      <CommunityWorkspaceChrome community={comm} activeMode={activeMode} communityId={communityId} />

      {/* Mode panes */}
      {activeMode === 'overview' && (
        <OverviewPane
          overview={overview}
          plans={previewPlans}
          activity={activity}
          onViewSetup={handleSetup}
          onViewMembers={handleViewMembers}
        />
      )}
      {activeMode === 'analytics' && (
        <AnalyticsPane
          overview={overview}
          plans={allPlans.length > 0 ? allPlans : previewPlans}
        />
      )}
      {activeMode === 'members' && (
        <MembersPane
          members={members}
          memberTotal={memberTotal}
          overview={overview}
          activity={activity}
        />
      )}
    </div>
  );
}
