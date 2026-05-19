'use client';

import { useId, useMemo, useState } from 'react';
import { CommunityOverview, CommunityPlan } from '@/lib/types';
import { BtnSecondary, StatCard, fmtAmount } from '@/components/community/workspace-ui';

const PLAN_COLORS = ['#5865f2', '#7c3aed', '#2f9d6b', '#f59e0b', '#ef4444', '#06b6d4'];

const MRR_CHART_PATH =
  'M0,140 L40,135 L80,130 L120,125 L160,118 L200,115 L240,108 L280,102 L320,95 L360,88 L400,75 L440,68 L480,58 L520,50 L560,42 L600,38';

function planLabel(plan: CommunityPlan) {
  if (plan.yearly_amount_minor && !plan.monthly_amount_minor) return `${plan.offer_name} · Annual`;
  if (plan.yearly_amount_minor) return `${plan.offer_name} · Monthly`;
  return plan.offer_name;
}

function planMrrMinor(plan: CommunityPlan) {
  if (plan.yearly_amount_minor && !plan.monthly_amount_minor) {
    return Math.round((plan.yearly_amount_minor * plan.member_counts.active) / 12);
  }
  return plan.monthly_amount_minor * plan.member_counts.active;
}

export function AnalyticsPane({
  overview,
  plans,
}: {
  overview: CommunityOverview | null;
  plans: CommunityPlan[];
}) {
  const gradientId = useId().replace(/:/g, '');
  const [chartRange, setChartRange] = useState<'30d' | '90d' | '12mo'>('90d');

  const paying = overview?.paying_members ?? 0;
  const mrrMinor = overview?.monthly_revenue ?? 0;
  const arpu = paying > 0 && mrrMinor > 0 ? fmtAmount(Math.round(mrrMinor / paying)) : '—';

  const planRevenue = useMemo(() => {
    return plans
      .map(plan => ({
        plan,
        rev: planMrrMinor(plan),
        label: planLabel(plan),
      }))
      .filter(p => p.rev > 0)
      .sort((a, b) => b.rev - a.rev);
  }, [plans]);

  const totalPlanMrr = planRevenue.reduce((acc, p) => acc + p.rev, 0) || mrrMinor;

  const rangeLabel =
    chartRange === '30d' ? 'Last 30 days' : chartRange === '90d' ? 'Last 90 days' : 'Last 12 months';

  const chartAxisLabels = useMemo(() => {
    const end = new Date();
    const spanDays = chartRange === '30d' ? 30 : chartRange === '90d' ? 90 : 365;
    const step = spanDays / 3;
    const fmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
    return [0, 1, 2, 3].map(i => {
      const d = new Date(end);
      d.setDate(d.getDate() - Math.round(spanDays - step * i));
      return fmt.format(d);
    });
  }, [chartRange]);

  return (
    <div>
      <AnalyticsStats paying={paying} mrrMinor={mrrMinor} arpu={arpu} overview={overview} />

      <MrrTrendCard
        gradientId={gradientId}
        rangeLabel={rangeLabel}
        axisLabels={chartAxisLabels}
        chartRange={chartRange}
        onRangeChange={setChartRange}
      />

      <div className="grid-2">
        <RevenueByPlan plans={plans} planRevenue={planRevenue} totalPlanMrr={totalPlanMrr} />
        <ConversionFunnel />
      </div>
    </div>
  );
}

function AnalyticsStats({
  paying,
  mrrMinor,
  arpu,
  overview,
}: {
  paying: number;
  mrrMinor: number;
  arpu: string;
  overview: CommunityOverview | null;
}) {
  return (
    <div className="stat-grid cols-6">
      <StatCard label="Active members" value={paying || '—'} />
      <StatCard label="MRR" value={mrrMinor > 0 ? fmtAmount(mrrMinor) : '—'} />
      <StatCard label="ARPU" value={arpu} />
      <StatCard label="LTV" value="—" />
      <StatCard label="Trialing" value={overview?.trialing ?? '—'} />
      <StatCard label="Churn 30d" value="—" />
    </div>
  );
}

function MrrTrendCard({
  gradientId,
  rangeLabel,
  axisLabels,
  chartRange,
  onRangeChange,
}: {
  gradientId: string;
  rangeLabel: string;
  axisLabels: string[];
  chartRange: '30d' | '90d' | '12mo';
  onRangeChange: (r: '30d' | '90d' | '12mo') => void;
}) {
  return (
    <div className="ws-card mb-16">
      <div className="ws-card-head">
        <div>
          <h3>MRR trend</h3>
          <p className="muted">{rangeLabel}</p>
        </div>
        <div style={{ display: 'inline-flex', gap: '8px' }}>
          {(['30d', '90d', '12mo'] as const).map(r => (
            <BtnSecondary key={r} active={chartRange === r} onClick={() => onRangeChange(r)}>
              {r}
            </BtnSecondary>
          ))}
        </div>
      </div>
      <div className="ws-card-body" style={{ paddingTop: 16 }}>
        <svg
          viewBox="0 0 600 180"
          style={{ width: '100%', height: '180px', display: 'block' }}
          preserveAspectRatio="none"
          aria-hidden
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5865f2" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#5865f2" stopOpacity="0" />
            </linearGradient>
          </defs>
          <g stroke="rgba(255,255,255,0.05)" strokeWidth="1">
            <line x1="0" y1="40" x2="600" y2="40" />
            <line x1="0" y1="90" x2="600" y2="90" />
            <line x1="0" y1="140" x2="600" y2="140" />
          </g>
          <path d={`${MRR_CHART_PATH} L600,180 L0,180 Z`} fill={`url(#${gradientId})`} />
          <path
            d={MRR_CHART_PATH}
            fill="none"
            stroke="#8b92f8"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '11px',
            color: 'var(--text-muted)',
            marginTop: '6px',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {axisLabels.map(label => (
            <span key={label}>{label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function RevenueByPlan({
  plans,
  planRevenue,
  totalPlanMrr,
}: {
  plans: CommunityPlan[];
  planRevenue: { plan: CommunityPlan; rev: number; label: string }[];
  totalPlanMrr: number;
}) {
  return (
    <div className="ws-card">
      <div className="ws-card-head">
        <div>
          <h3>Revenue by plan</h3>
          <p className="muted">Share of this month&apos;s MRR.</p>
        </div>
      </div>
      <div className="ws-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {plans.length === 0 ? (
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>No plan data yet.</p>
        ) : (
          planRevenue.map((row, idx) => {
            const pct = totalPlanMrr > 0 ? Math.round((row.rev / totalPlanMrr) * 100) : 0;
            const color = PLAN_COLORS[idx % PLAN_COLORS.length];
            return (
              <PlanRevRow key={row.plan.id} row={row} pct={pct} color={color} />
            );
          })
        )}
      </div>
    </div>
  );
}

function PlanRevRow({
  row,
  pct,
  color,
}: {
  row: { plan: CommunityPlan; rev: number; label: string };
  pct: number;
  color: string;
}) {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '6px',
          fontSize: '13px',
        }}
      >
        <span>
          <span
            style={{
              display: 'inline-block',
              width: '8px',
              height: '8px',
              borderRadius: '2px',
              background: color,
              marginRight: '8px',
            }}
          />
          {row.label}
        </span>
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>
          {fmtAmount(row.rev, row.plan.currency)} · {pct}%
        </span>
      </div>
      <div
        style={{
          height: '6px',
          background: 'rgba(255,255,255,0.04)',
          borderRadius: '999px',
          overflow: 'hidden',
        }}
      >
        <PlanRevBarFill pct={pct} color={color} />
      </div>
    </div>
  );
}

function PlanRevBarFill({ pct, color }: { pct: number; color: string }) {
  return (
    <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '999px' }} />
  );
}

function ConversionFunnel() {
  const rows = [
    {
      label: 'Visitors',
      pct: 100,
      fill: 'linear-gradient(90deg, rgba(88,101,242,0.3), rgba(88,101,242,0.15))',
    },
    {
      label: 'Checkout',
      pct: 18,
      fill: 'linear-gradient(90deg, rgba(88,101,242,0.45), rgba(88,101,242,0.22))',
    },
    {
      label: 'Paid',
      pct: 7,
      fill: 'linear-gradient(90deg, #5865f2, #7983f5)',
    },
  ];

  return (
    <div className="ws-card">
      <div className="ws-card-head">
        <div>
          <h3>Conversion funnel</h3>
          <p className="muted">Last 30 days · page → paid.</p>
        </div>
      </div>
      <div className="ws-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {rows.map(row => (
          <div key={row.label} className="funnel-row">
            <span className="funnel-label">{row.label}</span>
            <div className="funnel-bar">
              <div
                style={{
                  height: '100%',
                  width: `${row.pct}%`,
                  background: row.fill,
                  borderRadius: '6px',
                }}
              />
            </div>
            <span className="funnel-value" style={{ color: 'var(--text-muted)' }}>
              —
            </span>
          </div>
        ))}
        <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
          Overall conversion: <span style={{ color: 'var(--text-muted)' }}>—</span>
        </p>
      </div>
    </div>
  );
}
