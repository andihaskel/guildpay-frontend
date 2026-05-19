'use client';

import { Suspense, type ReactNode } from 'react';
import { SetupChrome } from '@/components/community/SetupChrome';
import { SetupShell } from '@/components/community/SetupShell';
import { SetupWorkspaceProvider } from '@/components/community/SetupWorkspaceContext';

import './community-setup.css';
import '@/components/community/setup-preview.css';

function SetupLayoutFallback() {
  return (
    <div className="setup-workspace-loading">
      {[1, 2, 3].map(i => (
        <div key={i} className="setup-workspace-skeleton" />
      ))}
    </div>
  );
}

export default function CommunitySetupLayout({ children }: { children: ReactNode }) {
  return (
    <div className="community-setup-embedded">
      <Suspense fallback={<SetupLayoutFallback />}>
        <SetupWorkspaceProvider>
          <SetupChrome />
          <SetupShell>{children}</SetupShell>
        </SetupWorkspaceProvider>
      </Suspense>
    </div>
  );
}
