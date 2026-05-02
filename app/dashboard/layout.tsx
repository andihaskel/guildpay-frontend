'use client';

import { useState } from 'react';
import { Sidebar, Topbar } from '@/components/dashboard';
import { CommunityProvider } from '@/contexts/CommunityContext';
import { NewCommunityModal } from '@/components/dashboard/NewCommunityModal';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newCommunityOpen, setNewCommunityOpen] = useState(false);

  return (
    <CommunityProvider>
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex' }}>
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onNewCommunity={() => setNewCommunityOpen(true)}
        />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }} className="lg:ml-[260px]">
          <Topbar onMenuClick={() => setSidebarOpen(true)} />
          <main style={{ flex: 1, padding: '28px 28px 64px', maxWidth: '1100px', width: '100%', margin: '0 auto' }}>
            {children}
          </main>
        </div>
      </div>
      <NewCommunityModal open={newCommunityOpen} onClose={() => setNewCommunityOpen(false)} />
    </CommunityProvider>
  );
}
