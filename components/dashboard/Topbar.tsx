'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LogOut, Settings, Menu } from 'lucide-react';
import { useAuth } from '@/contexts';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface TopbarProps {
  onMenuClick?: () => void;
}

const ROUTE_LABELS: Record<string, string> = {
  '/dashboard/home': 'Home',
  '/dashboard/pages': 'Pages',
  '/dashboard/members': 'Members',
  '/dashboard/analytics': 'Analytics',
  '/dashboard/billing': 'Billing',
  '/dashboard/settings': 'Settings',
};

export function Topbar({ onMenuClick }: TopbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const routeLabel = ROUTE_LABELS[pathname || ''] || Object.entries(ROUTE_LABELS).find(([k]) => pathname?.startsWith(k))?.[1] || '';

  return (
    <header style={{
      height: '60px', borderBottom: '0.5px solid var(--border-soft)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 28px', position: 'sticky', top: 0, zIndex: 10,
      background: 'rgba(10,10,10,0.85)',
      backdropFilter: 'saturate(140%) blur(10px)',
      WebkitBackdropFilter: 'saturate(140%) blur(10px)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={onMenuClick}
          className="lg:hidden"
          style={{
            padding: '8px', borderRadius: '6px', background: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', border: 'none',
          }}
        >
          <Menu size={18} />
        </button>
        {routeLabel && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <span>AccessGate</span>
            <span style={{ color: 'var(--text-faint)' }}>/</span>
            <span style={{ color: 'var(--text)', fontWeight: 500 }}>{routeLabel}</span>
          </div>
        )}
      </div>

      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          style={{ background: 'none', cursor: 'pointer', borderRadius: '50%', border: 'none', transition: 'opacity 180ms ease' }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          <Avatar style={{ width: '30px', height: '30px', border: '0.5px solid var(--border)' }}>
            {user?.discordAvatar ? (
              <AvatarImage
                src={`https://cdn.discordapp.com/avatars/${user.discordId}/${user.discordAvatar}.png`}
                alt={user.discordUsername || user.username}
              />
            ) : null}
            <AvatarFallback style={{ background: '#5865f2', color: '#fff', fontSize: '11px', fontWeight: 600 }}>
              {user?.email?.[0]?.toUpperCase() || user?.discordUsername?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        </button>

        {userMenuOpen && (
          <>
            <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setUserMenuOpen(false)} />
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: '220px',
              zIndex: 50, background: 'var(--surface-1)',
              border: '0.5px solid var(--border)', borderRadius: '10px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)', overflow: 'hidden',
            }}>
              <div style={{ padding: '14px 16px', borderBottom: '0.5px solid var(--border-soft)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Avatar style={{ width: '32px', height: '32px', border: '0.5px solid var(--border)' }}>
                    {user?.discordAvatar ? (
                      <AvatarImage
                        src={`https://cdn.discordapp.com/avatars/${user.discordId}/${user.discordAvatar}.png`}
                        alt={user.discordUsername || user.username}
                      />
                    ) : null}
                    <AvatarFallback style={{ background: '#5865f2', color: '#fff', fontSize: '11px', fontWeight: 600 }}>
                      {user?.email?.[0]?.toUpperCase() || user?.discordUsername?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {(user?.discordUsername || user?.username) && (
                      <p style={{ fontWeight: 500, fontSize: '13px', margin: '0 0 2px', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {user?.discordUsername || user?.username}
                      </p>
                    )}
                    <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user?.email || ''}
                    </p>
                  </div>
                </div>
              </div>
              <div style={{ padding: '6px' }}>
                <button
                  onClick={() => { setUserMenuOpen(false); router.push('/dashboard/settings'); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                    padding: '8px 10px', borderRadius: '6px', fontSize: '13.5px',
                    color: 'var(--text)', background: 'none', cursor: 'pointer', border: 'none',
                    transition: 'background 180ms ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                >
                  <Settings size={13} style={{ color: 'var(--text-muted)' }} />
                  Account Settings
                </button>
                <button
                  onClick={handleSignOut}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                    padding: '8px 10px', borderRadius: '6px', fontSize: '13.5px',
                    color: '#e06a6a', background: 'none', cursor: 'pointer', border: 'none',
                    transition: 'background 180ms ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(214,69,69,0.08)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                >
                  <LogOut size={13} />
                  Sign Out
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
