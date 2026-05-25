'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { getCommunityPublicPath } from '@/components/community/community-preview';
import { CommunitySharePill } from '@/components/community/CommunitySharePill';
import { SetupSectionNav } from '@/components/community/SetupSectionNav';
import { useSetupWorkspace } from '@/components/community/SetupWorkspaceContext';

function communityInitial(name: string) {
  return (name.trim()[0] || '?').toUpperCase();
}

export function SetupChrome() {
  const { communityId } = useParams<{ communityId: string }>();
  const { pageDraft, community } = useSetupWorkspace();
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

  return (
    <header className="setup-chrome">
      <div className="setup-chrome-top">
        <Link href={`/dashboard/community/${communityId}`} className="setup-chrome-back">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to community
        </Link>
      </div>

      <div className="setup-chrome-main">
        <span
          className="setup-chrome-avatar"
          style={{
            background: `linear-gradient(135deg, ${pageDraft.accentColor}, color-mix(in srgb, ${pageDraft.accentColor} 55%, #7c3aed))`,
          }}
        >
          {communityInitial(pageDraft.communityName)}
        </span>
        <div className="setup-chrome-heading">
          <h1 className="setup-chrome-title">{pageDraft.communityName}</h1>
          <p className="setup-chrome-subtitle">Setup your public page</p>
        </div>
      </div>
      <div className="setup-chrome-toolbar">
        <SetupSectionNav />
        <CommunitySharePill community={community} publicPath={publicPath} />
      </div>
    </header>
  );
}
