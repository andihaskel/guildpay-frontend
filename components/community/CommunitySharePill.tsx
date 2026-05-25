'use client';

import { useCallback, useState } from 'react';
import { Community } from '@/lib/types';
import {
  getCommunityPublicDisplayHost,
  getCommunityPublicUrl,
} from '@/components/community/community-preview';

export function CommunitySharePill({
  community,
  publicPath,
}: {
  community: Community;
  publicPath: string | null;
}) {
  const [copied, setCopied] = useState(false);
  const displayHost = getCommunityPublicDisplayHost();
  const slugLabel = community.slug?.trim() || 'your-page';

  const copyLink = useCallback(async () => {
    if (!publicPath || !community.slug?.trim()) return;
    const pathParts = publicPath.split('/').filter(Boolean);
    const communitySlug = pathParts[pathParts.length - 1];
    const creatorSlug = pathParts[pathParts.length - 2];
    if (!creatorSlug || !communitySlug) return;

    const url = getCommunityPublicUrl(creatorSlug, communitySlug);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked */
    }
  }, [community.slug, publicPath]);

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
              <path
                d="M5 12l5 5L20 7"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Copied
          </>
        ) : (
          <>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
              <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.6" />
              <path
                d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
                stroke="currentColor"
                strokeWidth="1.6"
              />
            </svg>
            Copy
          </>
        )}
      </button>
    </div>
  );
}
