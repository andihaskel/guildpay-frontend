'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Settings, Menu } from 'lucide-react';
import { useAuth, useProduct } from '@/contexts';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface TopbarProps {
  onMenuClick?: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { currentProduct } = useProduct();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleAccountSettings = () => {
    setUserMenuOpen(false);
    router.push('/dashboard/settings');
  };

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: '64px',
      background: 'rgba(10,10,10,0.88)',
      backdropFilter: 'saturate(140%) blur(10px)',
      WebkitBackdropFilter: 'saturate(140%) blur(10px)',
      borderBottom: '0.5px solid var(--border-soft)',
      zIndex: 30,
    }} className="lg:left-64">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%', padding: '0 16px' }} className="lg:px-6">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onMenuClick}
            className="lg:hidden"
            style={{
              padding: '8px', borderRadius: '6px', background: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', transition: 'color 200ms ease, background 200ms ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.background = 'var(--surface-2)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'none'; }}
          >
            <Menu size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              style={{
                background: 'none', cursor: 'pointer', borderRadius: '50%',
                transition: 'opacity 200ms ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              <Avatar style={{ width: '34px', height: '34px', border: '0.5px solid var(--border)' }}>
                {user?.discordAvatar ? (
                  <AvatarImage
                    src={`https://cdn.discordapp.com/avatars/${user.discordId}/${user.discordAvatar}.png`}
                    alt={user.discordUsername || user.username}
                  />
                ) : null}
                <AvatarFallback style={{ background: '#5865f2', color: '#fff', fontSize: '13px', fontWeight: 600 }}>
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
                      <Avatar style={{ width: '36px', height: '36px', border: '0.5px solid var(--border)' }}>
                        {user?.discordAvatar ? (
                          <AvatarImage
                            src={`https://cdn.discordapp.com/avatars/${user.discordId}/${user.discordAvatar}.png`}
                            alt={user.discordUsername || user.username}
                          />
                        ) : null}
                        <AvatarFallback style={{ background: '#5865f2', color: '#fff', fontSize: '13px', fontWeight: 600 }}>
                          {user?.email?.[0]?.toUpperCase() || user?.discordUsername?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {(user?.discordUsername || user?.username) && (
                          <p style={{ fontWeight: 500, fontSize: '13px', margin: '0 0 2px', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {user?.discordUsername || user?.username}
                          </p>
                        )}
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {user?.email || ''}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: '6px' }}>
                    <button
                      onClick={handleAccountSettings}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                        padding: '9px 12px', borderRadius: '6px', fontSize: '14px',
                        color: 'var(--text)', background: 'none', cursor: 'pointer',
                        transition: 'background 200ms ease',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                    >
                      <Settings size={14} style={{ color: 'var(--text-muted)' }} />
                      Account Settings
                    </button>
                    <button
                      onClick={handleSignOut}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                        padding: '9px 12px', borderRadius: '6px', fontSize: '14px',
                        color: '#ef4444', background: 'none', cursor: 'pointer',
                        transition: 'background 200ms ease',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                    >
                      <LogOut size={14} />
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
