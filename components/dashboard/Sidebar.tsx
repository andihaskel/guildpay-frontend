'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Chrome as Home, CreditCard, Settings, X, Plus, ChevronsUpDown } from 'lucide-react';
import { useCommunity } from '@/contexts/CommunityContext';
import { useAuth } from '@/contexts/AuthContext';

const SERVER_COLORS = [
  '#5865f2','#3b82f6','#10b981','#f59e0b','#ef4444',
  '#8b5cf6','#06b6d4','#f97316','#ec4899','#14b8a6',
];

function communityColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return SERVER_COLORS[Math.abs(h) % SERVER_COLORS.length];
}

function communityInitial(name: string) {
  return (name.trim()[0] || '?').toUpperCase();
}

const LogoMark = () => (
  <span style={{
    width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0,
    background: 'linear-gradient(135deg, #5865f2, #7983f5)',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: 700, fontSize: '12px',
  }}>A</span>
);

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  onNewCommunity?: () => void;
}

export function Sidebar({ isOpen = false, onClose, onNewCommunity }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { communities, currentCommunity, setCurrentCommunityId } = useCommunity();
  const { user } = useAuth();

  const userInitials = (user?.username || user?.email || 'U')
    .split(/[\s@.]+/).slice(0, 2).map((w: string) => w[0] || '').join('').toUpperCase() || 'U';

  const isHomeActive = pathname === '/dashboard/home';
  const isBillingActive = pathname === '/dashboard/billing';
  const isSettingsActive = pathname === '/dashboard/settings';

  function navItemStyle(active: boolean): React.CSSProperties {
    return {
      position: 'relative', display: 'flex', alignItems: 'center', gap: '10px',
      padding: '8px 10px', borderRadius: '6px', fontSize: '13.5px', fontWeight: 500,
      letterSpacing: '-0.005em', cursor: 'pointer', width: '100%', textAlign: 'left',
      background: active ? 'var(--surface-1)' : 'transparent',
      color: active ? 'var(--text)' : 'var(--text-secondary)',
      border: 'none', transition: 'background 180ms ease, color 180ms ease',
    };
  }

  return (
    <>
      {isOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40 }}
          className="lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        style={{
          position: 'fixed', left: 0, top: 0, height: '100vh', width: '260px',
          background: 'var(--bg)', borderRight: '0.5px solid var(--border-soft)',
          zIndex: 50, display: 'flex', flexDirection: 'column',
          transition: 'transform 300ms ease',
        }}
        className={`lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Header */}
        <div style={{
          height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 20px', borderBottom: '0.5px solid var(--border-soft)', flexShrink: 0,
        }}>
          <Link href="/dashboard/home" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', fontWeight: 600, fontSize: '14.5px', letterSpacing: '-0.01em', color: 'var(--text)', textDecoration: 'none' }}>
            <LogoMark />
            AccessGate
          </Link>
          <button onClick={onClose} className="lg:hidden" style={{ padding: '6px', borderRadius: '6px', background: 'none', cursor: 'pointer', color: 'var(--text-muted)', border: 'none' }}>
            <X size={16} />
          </button>
        </div>

        {/* Scrollable nav */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Top nav */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <Link
              href="/dashboard/home"
              onClick={onClose}
              style={navItemStyle(isHomeActive)}
              onMouseEnter={e => { if (!isHomeActive) { (e.currentTarget as HTMLElement).style.color = 'var(--text)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; } }}
              onMouseLeave={e => { if (!isHomeActive) { (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; } }}
            >
              {isHomeActive && <div style={{ position: 'absolute', left: '-12px', top: '50%', transform: 'translateY(-50%)', width: '2px', height: '16px', background: 'var(--accent)', borderRadius: '0 2px 2px 0' }} />}
              <Home size={16} style={{ flexShrink: 0, opacity: 0.9 }} />
              Home
            </Link>
          </div>

          {/* Communities */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px 6px' }}>
              <span style={{ fontSize: '10.5px', fontWeight: 500, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Communities</span>
              <button
                aria-label="New community"
                onClick={() => { onClose?.(); onNewCommunity?.(); }}
                style={{ color: 'var(--text-muted)', width: '18px', height: '18px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'color 180ms ease, background 180ms ease', background: 'none', border: 'none', cursor: 'pointer' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLElement).style.background = 'none'; }}
              >
                <Plus size={11} />
              </button>
            </div>

            {communities.map(community => {
              const isCurrent = currentCommunity?.id === community.id;
              const communityPath = `/dashboard/community/${community.id}`;
              const isActive = pathname?.startsWith(communityPath);
              const color = communityColor(community.name);
              const initial = communityInitial(community.name);
              return (
                <button
                  key={community.id}
                  onClick={() => {
                    setCurrentCommunityId(community.id);
                    router.push(`/dashboard/community/${community.id}`);
                    onClose?.();
                  }}
                  style={{
                    position: 'relative', display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '7px 10px', borderRadius: '6px', cursor: 'pointer',
                    background: isActive ? 'var(--surface-1)' : 'transparent',
                    color: isActive ? 'var(--text)' : 'var(--text-secondary)',
                    border: 'none', width: '100%', textAlign: 'left',
                    transition: 'background 180ms ease, color 180ms ease',
                  }}
                  onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; (e.currentTarget as HTMLElement).style.color = 'var(--text)'; } }}
                  onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; } }}
                >
                  {isActive && <div style={{ position: 'absolute', left: '-12px', top: '50%', transform: 'translateY(-50%)', width: '2px', height: '16px', background: 'var(--accent)', borderRadius: '0 2px 2px 0' }} />}
                  <span style={{ width: '22px', height: '22px', borderRadius: '5px', flexShrink: 0, background: color, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 600, fontSize: '11px' }}>
                    {initial}
                  </span>
                  <span style={{ flex: 1, fontSize: '13.5px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.005em' }}>
                    {community.name}
                  </span>
                  {community.members_count != null && (
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>
                      {community.members_count}
                    </span>
                  )}
                </button>
              );
            })}

            <button
              onClick={() => { onClose?.(); onNewCommunity?.(); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '8px 10px', borderRadius: '6px', color: 'var(--text-muted)',
                fontSize: '13.5px', fontWeight: 500, border: 'none', background: 'none',
                cursor: 'pointer', width: '100%', textAlign: 'left',
                transition: 'color 180ms ease, background 180ms ease',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLElement).style.background = 'none'; }}
            >
              <Plus size={14} style={{ flexShrink: 0 }} />
              New community
            </button>
          </div>

          {/* Account */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div style={{ padding: '6px 10px 6px' }}>
              <span style={{ fontSize: '10.5px', fontWeight: 500, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Account</span>
            </div>
            <Link
              href="/dashboard/billing"
              onClick={onClose}
              style={navItemStyle(isBillingActive)}
              onMouseEnter={e => { if (!isBillingActive) { (e.currentTarget as HTMLElement).style.color = 'var(--text)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; } }}
              onMouseLeave={e => { if (!isBillingActive) { (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; } }}
            >
              {isBillingActive && <div style={{ position: 'absolute', left: '-12px', top: '50%', transform: 'translateY(-50%)', width: '2px', height: '16px', background: 'var(--accent)', borderRadius: '0 2px 2px 0' }} />}
              <CreditCard size={16} style={{ flexShrink: 0, opacity: 0.9 }} />
              Billing
            </Link>
            <Link
              href="/dashboard/settings"
              onClick={onClose}
              style={navItemStyle(isSettingsActive)}
              onMouseEnter={e => { if (!isSettingsActive) { (e.currentTarget as HTMLElement).style.color = 'var(--text)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; } }}
              onMouseLeave={e => { if (!isSettingsActive) { (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; } }}
            >
              {isSettingsActive && <div style={{ position: 'absolute', left: '-12px', top: '50%', transform: 'translateY(-50%)', width: '2px', height: '16px', background: 'var(--accent)', borderRadius: '0 2px 2px 0' }} />}
              <Settings size={16} style={{ flexShrink: 0, opacity: 0.9 }} />
              Settings
            </Link>
          </div>
        </div>

        {/* User chip */}
        <div style={{ padding: '12px', borderTop: '0.5px solid var(--border-soft)', flexShrink: 0 }}>
          <button
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', borderRadius: '6px', cursor: 'pointer', transition: 'background 180ms ease', width: '100%', border: 'none', background: 'none' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
          >
            <span style={{ width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 600, color: '#fff', background: 'linear-gradient(135deg, #5865f2, #7983f5)' }}>
              {userInitials}
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, textAlign: 'left' }}>
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', letterSpacing: '-0.005em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.username || user?.email?.split('@')[0] || 'Account'}
              </span>
              <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email || ''}
              </span>
            </div>
            <ChevronsUpDown size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          </button>
        </div>
      </aside>
    </>
  );
}
