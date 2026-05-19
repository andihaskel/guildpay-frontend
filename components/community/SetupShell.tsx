'use client';

import { type ReactNode } from 'react';
import { CommunitySetupPreview } from '@/components/community/CommunitySetupPreview';
import { getCommunityPreviewPath } from '@/components/community/community-preview';
import { useSetupWorkspace } from '@/components/community/SetupWorkspaceContext';

function SetupPreviewPanel() {
  const {
    communityId,
    community,
    previewDevice,
    setPreviewDevice,
    previewModel,
  } = useSetupWorkspace();

  const displayUrl = community.slug ? `accessgate.io/${community.slug}` : 'accessgate.io/your-page';
  const previewTabUrl = getCommunityPreviewPath(communityId);

  return (
    <div className="setup-preview">
      <div className="preview-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <div className="preview-bar-dots" aria-hidden>
            <span />
            <span />
            <span />
          </div>
          <span className="preview-url">{displayUrl}</span>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <button
            type="button"
            className="btn-icon"
            aria-label="Desktop"
            onClick={() => setPreviewDevice('desktop')}
            style={previewDevice === 'desktop' ? { background: 'var(--surface-3)' } : undefined}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.6" />
              <path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
          <button
            type="button"
            className="btn-icon"
            aria-label="Mobile"
            onClick={() => setPreviewDevice('mobile')}
            style={previewDevice === 'mobile' ? { background: 'var(--surface-3)' } : undefined}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <rect x="7" y="2" width="10" height="20" rx="2" stroke="currentColor" strokeWidth="1.6" />
              <path d="M11 18h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
          <a className="btn-icon" href={previewTabUrl} target="_blank" rel="noopener noreferrer" aria-label="Open preview in new tab">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M7 17L17 7M9 7h8v8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>
      <div className={`preview-frame-wrap${previewDevice === 'mobile' ? ' is-mobile' : ''}`}>
        <div className="setup-preview-scroll">
          <CommunitySetupPreview model={previewModel} />
        </div>
      </div>
    </div>
  );
}

export function SetupShell({ children }: { children: ReactNode }) {
  return (
    <div className="setup-split">
      <div className="setup-editor">{children}</div>
      <div className="setup-preview-col">
        <SetupPreviewPanel />
      </div>
    </div>
  );
}
