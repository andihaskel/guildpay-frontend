'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Community } from '@/lib/types';
import { api } from '@/lib/api';
import {
  getCommunityPublicDisplayHost,
  getCommunityPublicPath,
  getCommunityPublicUrl,
} from '@/components/community/community-preview';

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
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2v-9z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: 'analytics',
    label: 'Analytics',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M3 3v18h18M7 14l4-4 3 3 5-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: 'members',
    label: 'Members',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="9" cy="7" r="3.2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
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
  const [creatorSlug, setCreatorSlug] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .getCreatorProfile()
      .then(profile => {
        if (!cancelled) setCreatorSlug(profile.slug?.trim() || null);
      })
      .catch(() => {
        if (!cancelled) setCreatorSlug(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const publicPath = useMemo(() => {
    if (!creatorSlug || !community.slug?.trim()) return null;
    return getCommunityPublicPath(creatorSlug, community.slug.trim());
  }, [creatorSlug, community.slug]);

  function navigateMode(mode: WorkspaceMode) {
    if (mode === activeMode) return;
    const query = mode === 'overview' ? '' : `?mode=${mode}`;
    router.push(`/dashboard/community/${communityId}${query}`);
  }

  return (
    <>
      <CommunityHeader community={community} color={color} initial={initial} />
      <CommunityModeBar
        activeMode={activeMode}
        communityId={communityId}
        community={community}
        creatorSlug={creatorSlug}
        publicPath={publicPath}
        onNavigate={navigateMode}
      />
    </>
  );
}

function CommunityHeader({ community, color, initial }: { community: Community; color: string; initial: string }) {
  return (
    <div className="ws-community-header">
      <span className="ws-community-avatar" style={{ background: color }}>
        {initial}
      </span>
      <div className="ws-community-heading">
        <h1 className="ws-community-title">{community.name}</h1>
        <p className="ws-community-subtitle">
          {community.tagline || ''}
          {community.members_count != null && `${community.tagline ? ' · ' : ''}${community.members_count} members`}
        </p>
      </div>
    </div>
  );
}

function CommunitySharePill({
  community,
  creatorSlug,
  publicPath,
}: {
  community: Community;
  creatorSlug: string | null;
  publicPath: string | null;
}) {
  const [copied, setCopied] = useState(false);
  const displayHost = getCommunityPublicDisplayHost();
  const slugLabel = community.slug?.trim() || 'your-page';

  const copyLink = useCallback(async () => {
    if (!publicPath || !creatorSlug || !community.slug?.trim()) return;
    const url = getCommunityPublicUrl(creatorSlug, community.slug.trim());
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked */
    }
  }, [community.slug, creatorSlug, publicPath]);

  const urlContent = (
    <>
      <span className="ws-share-host">{displayHost}/</span>
      <span className="ws-share-slug">{slugLabel}</span>
    </>
  );

  return (
    <div className={`ws-share-pill${publicPath ? '' : ' is-pending'}`}>
      <span className="ws-share-live" aria-hidden />
      {publicPath ? (
        <a href={publicPath} target="_blank" rel="noopener noreferrer" className="ws-share-url">
          {urlContent}
        </a>
      ) : (
        <span className="ws-share-url">{urlContent}</span>
      )}
      <span className="ws-share-divider" aria-hidden />
      <button
        type="button"
        className="ws-share-copy-btn"
        disabled={!publicPath}
        onClick={() => void copyLink()}
      >
        {copied ? (
          <>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Copied
          </>
        ) : (
          <>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
              <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.6" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="1.6" />
            </svg>
            Copy
          </>
        )}
      </button>
    </div>
  );
}

function CommunityModeBar({
  activeMode,
  communityId,
  community,
  creatorSlug,
  publicPath,
  onNavigate,
}: {
  activeMode: WorkspaceMode;
  communityId: string;
  community: Community;
  creatorSlug: string | null;
  publicPath: string | null;
  onNavigate: (m: WorkspaceMode) => void;
}) {
  return (
    <div className="ws-community-toolbar">
      <div className="ws-mode-tabs">
        {MODES.map(m => (
          <button
            key={m.key}
            type="button"
            className={`ws-mode-tab${activeMode === m.key ? ' is-active' : ''}`}
            onClick={() => onNavigate(m.key)}
          >
            {m.icon}
            {m.label}
          </button>
        ))}
        <Link href={`/dashboard/community/${communityId}/setup`} className="ws-mode-tab ws-mode-tab-link">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 2v3M12 19v3M4.2 4.2l2.2 2.2M17.6 17.6l2.2 2.2M2 12h3M19 12h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.6" />
          </svg>
          Setup
        </Link>
      </div>
      <CommunitySharePill community={community} creatorSlug={creatorSlug} publicPath={publicPath} />
    </div>
  );
}
