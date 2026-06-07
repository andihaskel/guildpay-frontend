'use client';

import { useEffect, useId, useRef, useState } from 'react';
import './features-section.css';

const FEATURES = [
  {
    delay: 0,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="1" y="4" width="22" height="16" rx="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
    title: 'Stripe-native payments',
    desc: 'Payments go straight to your account. We never take a cut.',
  },
  {
    delay: 70,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: 'Auto role management',
    desc: 'Roles assigned on payment, revoked on cancel. Zero manual work.',
  },
  {
    delay: 140,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
    ),
    title: 'Automated channel access',
    desc: 'Define which channels each plan unlocks. Members get in automatically when they pay — and lose access the moment they cancel.',
  },
  {
    delay: 0,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" />
      </svg>
    ),
    title: 'Custom landing page',
    desc: 'Your brand, your copy, your domain. Looks like yours, not ours.',
  },
  {
    delay: 70,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    title: 'Real-time analytics',
    desc: 'Active members, MRR, and churn in one quiet dashboard.',
  },
  {
    delay: 140,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
    title: 'Cancellation handling',
    desc: 'Access revoked the moment a subscription ends. Automatic.',
  },
];

const DASH_STATS = [
  { label: 'Active Members', target: 312, prefix: '', suffix: '', decimals: 0, delta: '↑ 24 this month', deltaType: 'up' as const },
  { label: 'MRR', target: 4680, prefix: '$', suffix: '', decimals: 0, delta: '↑ 18% vs last month', deltaType: 'up' as const },
  { label: 'Churn 30d', target: 2.1, prefix: '', suffix: '%', decimals: 1, delta: '↓ 0.4% improvement', deltaType: 'down' as const },
  { label: 'Trialing', target: 18, prefix: '', suffix: '', decimals: 0, delta: '→ 6 converting soon', deltaType: 'neutral' as const },
];

const DASH_MEMBERS = [
  { initials: 'CM', name: 'Carlos M.', color: '#7c3aed', plan: 'Regular', since: 'Mar 2', status: 'active' as const },
  { initials: 'AR', name: 'Ana R.', color: '#0891b2', plan: 'Pro', since: 'Apr 15', status: 'active' as const },
  { initials: 'DF', name: 'Diego F.', color: '#059669', plan: 'Regular', since: 'May 3', status: 'trialing' as const },
  { initials: 'MK', name: 'Martina K.', color: '#b45309', plan: 'Pro', since: 'May 18', status: 'active' as const },
  { initials: 'JT', name: 'Jorge T.', color: '#be185d', plan: 'Regular', since: 'Jun 1', status: 'trialing' as const },
];

function formatStatValue(value: number, prefix: string, suffix: string, decimals: number) {
  const formatted = decimals > 0 ? value.toFixed(decimals) : Math.floor(value).toLocaleString();
  return `${prefix}${formatted}${suffix}`;
}

function useCountUp(active: boolean, target: number, prefix: string, suffix: string, decimals: number) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;

    const duration = 1600;
    let start: number | null = null;
    let frameId = 0;

    const step = (timestamp: number) => {
      if (start === null) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      } else {
        setValue(target);
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [active, target]);

  return formatStatValue(value, prefix, suffix, decimals);
}

function DashboardCard({ clipId }: { clipId: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const clipRectRef = useRef<SVGRectElement>(null);
  const [visible, setVisible] = useState(false);
  const [visibleRowCount, setVisibleRowCount] = useState(0);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setVisible(true);
        observer.disconnect();
      },
      { threshold: 0.2 },
    );

    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || !clipRectRef.current) return;

    const clipRect = clipRectRef.current;
    const duration = 2000;
    const delay = 300;
    let start: number | null = null;
    let frameId = 0;
    let delayTimer = 0;

    delayTimer = window.setTimeout(() => {
      const step = (timestamp: number) => {
        if (start === null) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        const eased = progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        clipRect.setAttribute('width', String(800 * eased));
        if (progress < 1) frameId = requestAnimationFrame(step);
      };
      frameId = requestAnimationFrame(step);
    }, delay);

    return () => {
      window.clearTimeout(delayTimer);
      cancelAnimationFrame(frameId);
    };
  }, [visible]);

  useEffect(() => {
    if (!visible) return;

    const timers = DASH_MEMBERS.map((_, index) =>
      window.setTimeout(() => {
        setVisibleRowCount((count) => Math.max(count, index + 1));
      }, 400 + index * 100),
    );

    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [visible]);

  const members = useCountUp(visible, DASH_STATS[0].target, DASH_STATS[0].prefix, DASH_STATS[0].suffix, DASH_STATS[0].decimals);
  const mrr = useCountUp(visible, DASH_STATS[1].target, DASH_STATS[1].prefix, DASH_STATS[1].suffix, DASH_STATS[1].decimals);
  const churn = useCountUp(visible, DASH_STATS[2].target, DASH_STATS[2].prefix, DASH_STATS[2].suffix, DASH_STATS[2].decimals);
  const trialing = useCountUp(visible, DASH_STATS[3].target, DASH_STATS[3].prefix, DASH_STATS[3].suffix, DASH_STATS[3].decimals);
  const statValues = [members, mrr, churn, trialing];

  return (
    <div ref={cardRef} className={`feat-dash-card${visible ? ' show' : ''}`}>
      <div className="feat-dash-header">
        <div className="feat-dash-community">
          <div className="feat-dash-avatar">S</div>
          <div>
            <div className="feat-dash-name">Surf Mappers</div>
            <div className="feat-dash-url">
              <span className="feat-dash-dot" aria-hidden="true" />
              accessgate.io/<strong>surfmappers</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="feat-dash-cols">
        <div className="feat-dash-col">
          <div className="feat-dash-stats">
            {DASH_STATS.map((stat, index) => (
              <div key={stat.label} className="feat-dash-stat">
                <div className="feat-dash-stat-label">{stat.label}</div>
                <div className="feat-dash-stat-val">{statValues[index]}</div>
                <div className={`feat-dash-stat-delta ${stat.deltaType}`}>{stat.delta}</div>
              </div>
            ))}
          </div>

          <div className="feat-dash-chart-wrap">
            <div className="feat-dash-chart-header">
              <div>
                <div className="feat-dash-chart-title">MRR trend</div>
                <div className="feat-dash-chart-sub">Last 90 days</div>
              </div>
              <div className="feat-dash-chart-tabs" aria-hidden="true">
                <span className="feat-dash-chart-tab">30d</span>
                <span className="feat-dash-chart-tab active">90d</span>
                <span className="feat-dash-chart-tab">12mo</span>
              </div>
            </div>
            <svg className="feat-dash-chart" viewBox="0 0 800 160" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id={`${clipId}-line`} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#4c1d95" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
                <linearGradient id={`${clipId}-area`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
                </linearGradient>
                <clipPath id={clipId}>
                  <rect ref={clipRectRef} x="0" y="0" width="0" height="160" />
                </clipPath>
              </defs>
              <line x1="0" y1="40" x2="800" y2="40" stroke="#1a1a2e" strokeWidth="1" />
              <line x1="0" y1="80" x2="800" y2="80" stroke="#1a1a2e" strokeWidth="1" />
              <line x1="0" y1="120" x2="800" y2="120" stroke="#1a1a2e" strokeWidth="1" />
              <path
                clipPath={`url(#${clipId})`}
                d="M0,140 L0,128 C80,122 160,115 240,105 C320,95 400,82 480,68 C560,54 640,38 720,22 L800,12 L800,140 Z"
                fill={`url(#${clipId}-area)`}
              />
              <path
                clipPath={`url(#${clipId})`}
                d="M0,128 C80,122 160,115 240,105 C320,95 400,82 480,68 C560,54 640,38 720,22 L800,12"
                fill="none"
                stroke={`url(#${clipId}-line)`}
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <text x="4" y="158" fill="#334155" fontSize="10" fontFamily="Inter, sans-serif">Mar 9</text>
              <text x="254" y="158" fill="#334155" fontSize="10" fontFamily="Inter, sans-serif">Apr 8</text>
              <text x="510" y="158" fill="#334155" fontSize="10" fontFamily="Inter, sans-serif">May 8</text>
              <text x="740" y="158" fill="#334155" fontSize="10" fontFamily="Inter, sans-serif">Jun 7</text>
            </svg>
          </div>
        </div>

        <div className="feat-dash-divider-v" aria-hidden="true" />

        <div className="feat-dash-col">
          <div className="feat-dash-members-header">
            <div>
              <div className="feat-dash-chart-title">All members</div>
              <div className="feat-dash-chart-sub">Everyone with access to this community</div>
            </div>
            <div className="feat-dash-search" aria-hidden="true">
              ⌕ Search
            </div>
          </div>

          <div className="feat-dash-table">
            <div className="feat-dash-table-head" aria-hidden="true">
              <span>Member</span>
              <span>Plan</span>
              <span>Since</span>
              <span>Status</span>
            </div>
            {DASH_MEMBERS.map((member, index) => (
              <div
                key={member.initials}
                className={`feat-dash-table-row${index < visibleRowCount ? ' show' : ''}`}
              >
                <span className="feat-dash-member-name">
                  <span className="feat-dash-member-av" style={{ background: member.color }}>
                    {member.initials}
                  </span>
                  {member.name}
                </span>
                <span className="feat-dash-member-plan">{member.plan}</span>
                <span className="feat-dash-member-since">{member.since}</span>
                <span className={`feat-dash-member-badge ${member.status}`}>
                  {member.status === 'active' ? 'Active' : 'Trialing'}
                </span>
              </div>
            ))}
            <div className="feat-dash-table-more">+ 307 more members</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ delay, icon, title, desc }: (typeof FEATURES)[number]) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        window.setTimeout(() => setVisible(true), delay);
        observer.disconnect();
      },
      { threshold: 0.12 },
    );

    observer.observe(card);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={cardRef} className={`feat-card${visible ? ' show' : ''}`}>
      <div className="feat-card-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  );
}

export function FeaturesSection() {
  const clipId = useId().replace(/:/g, '');

  return (
    <section id="features" className="feat-section">
      <div className="feat-container">
        <p className="feat-eyebrow">Features</p>
        <h2 className="feat-title">
          Everything you need.
          <br />
          Nothing you don&apos;t.
        </h2>
        <p className="feat-subtitle">
          Every tool to run a paid community — without the bloat, the fees, or the learning curve.
        </p>

        <DashboardCard clipId={`feat-chart-clip-${clipId}`} />

        <div className="feat-grid">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
