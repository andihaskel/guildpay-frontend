'use client';

import { useRouter } from 'next/navigation';
import { Community } from '@/lib/types';
import { getCommunityPreviewPath } from '@/components/community/community-preview';

export type WorkspaceMode = 'overview' | 'analytics' | 'members';

const SERVER_COLORS = [
  '#5865f2', '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#06b6d4', '#f97316', '#ec4899', '#14b8a6',
];

function communityColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return SERVER_COLORS[Math.abs(h) % SERVER_COLORS.length];
}

function communityInitial(name: string) {
  return (name.trim()[0] || '?').toUpperCase();
}

const MODES: { key: WorkspaceMode; label: string; icon: React.ReactNode }[] = [
  {
    key: 'overview',
    label: 'Overview',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2v-9z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>,
  },
  {
    key: 'analytics',
    label: 'Analytics',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 3v18h18M7 14l4-4 3 3 5-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  },
  {
    key: 'members',
    label: 'Members',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /><circle cx="9" cy="7" r="3.2" stroke="currentColor" strokeWidth="1.6" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>,
  },
];

export function CommunityWorkspaceChrome({
  community,
  activeMode,
  communityId,
}: {
  community: Community;
  activeMode: WorkspaceMode;
  communityId: string;
}) {
  const router = useRouter();
  const color = communityColor(community.name);
  const initial = communityInitial(community.name);

  function navigateMode(mode: WorkspaceMode) {
    if (mode === activeMode) return;
    const query = mode === 'overview' ? '' : `?mode=${mode}`;
    router.push(`/dashboard/community/${communityId}${query}`);
  }

  return (
    <>
      <CommunityHeader community={community} color={color} initial={initial} />
      <CommunityModeBar activeMode={activeMode} communityId={communityId} onNavigate={navigateMode} />
    </>
  );
}

function CommunityHeader({ community, color, initial }: { community: Community; color: string; initial: string }) {
  return (
    <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '14px' }}>
      <span
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '10px',
          flexShrink: 0,
          background: color,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 600,
          fontSize: '18px',
        }}
      >
        {initial}
      </span>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 500, color: 'var(--text)', margin: '0 0 2px', letterSpacing: '-0.02em' }}>
          {community.name}
        </h1>
        <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', margin: 0 }}>
          {community.tagline || ''}
          {community.members_count != null && `${community.tagline ? ' · ' : ''}${community.members_count} members`}
        </p>
      </div>
    </div>
  );
}

function CommunityModeBar({
  activeMode,
  communityId,
  onNavigate,
}: {
  activeMode: WorkspaceMode;
  communityId: string;
  onNavigate: (m: WorkspaceMode) => void;
}) {
  return (
    <div className="ws-community-toolbar">
      <div className="ws-mode-tabs">
        {MODES.map(m => {
          const isActive = activeMode === m.key;
          return (
            <button
              key={m.key}
              type="button"
              onClick={() => onNavigate(m.key)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                padding: '7px 14px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 500,
                color: isActive ? 'var(--text)' : 'var(--text-secondary)',
                background: isActive ? 'var(--surface-3)' : 'none',
                border: 'none',
                cursor: isActive ? 'default' : 'pointer',
                boxShadow: isActive ? 'inset 0 0 0 0.5px var(--border-strong)' : 'none',
                transition: 'color 180ms ease, background 180ms ease',
              }}
              onMouseEnter={e => {
                if (!isActive) (e.currentTarget as HTMLElement).style.color = 'var(--text)';
              }}
              onMouseLeave={e => {
                if (!isActive) (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
              }}
            >
              {m.icon}
              {m.label}
            </button>
          );
        })}
      </div>
      <div className="ws-mode-actions">
        <a href={`/dashboard/community/${communityId}/setup`} className="ws-setup-cta">
          Setup
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 2v3M12 19v3M4.2 4.2l2.2 2.2M17.6 17.6l2.2 2.2M2 12h3M19 12h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        </a>
        <a
          href={getCommunityPreviewPath(communityId)}
          target="_blank"
          rel="noopener noreferrer"
          className="ws-visit-cta"
        >
          Visit page
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M7 17L17 7M9 7h8v8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>
    </div>
  );
}
