'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Menu, X } from 'lucide-react';
import { AccessGateLogoMark } from '@/components/brand/AccessGateLogoMark';
import { AccessGateWordmark } from '@/components/brand/AccessGateWordmark';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import './landing-nav.css';

const NAV_LINKS = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#features', label: 'Features' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' },
] as const;

interface User {
  id: string;
  email: string | null;
  avatar: string | null;
}

interface LandingNavProps {
  loading: boolean;
  user: User | null;
  heroRevealed: boolean;
  onLogin: () => void;
  onGoToDashboard: () => void;
  onSignOut: () => void;
}

function UserMenu({ user, onSignOut, onGoToDashboard }: {
  user: User;
  onSignOut: () => void;
  onGoToDashboard: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setMenuOpen(!menuOpen)}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', transition: 'opacity 200ms ease' }}
        aria-expanded={menuOpen}
        aria-haspopup="menu"
      >
        <Avatar style={{ width: '32px', height: '32px', border: '0.5px solid rgba(255,255,255,0.12)' }}>
          <AvatarImage src={user.avatar || undefined} alt={user.email || 'User'} />
          <AvatarFallback style={{ background: '#5865f2', color: '#fff', fontSize: '12px', fontWeight: 600 }}>
            {user.email?.[0]?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
      </button>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} aria-hidden />
          <div
            role="menu"
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              width: '200px',
              zIndex: 50,
              background: 'var(--surface-1)',
              border: '0.5px solid var(--border)',
              borderRadius: 'var(--radius)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              padding: '6px',
            }}
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => { setMenuOpen(false); onGoToDashboard(); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
                padding: '9px 12px',
                borderRadius: '6px',
                fontSize: '14px',
                color: 'var(--text)',
                background: 'none',
                cursor: 'pointer',
                border: 'none',
                fontFamily: 'inherit',
              }}
            >
              <AccessGateLogoMark size={14} />
              Dashboard
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => { setMenuOpen(false); onSignOut(); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
                padding: '9px 12px',
                borderRadius: '6px',
                fontSize: '14px',
                color: '#ef4444',
                background: 'none',
                cursor: 'pointer',
                border: 'none',
                fontFamily: 'inherit',
              }}
            >
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export function LandingNav({
  loading,
  user,
  heroRevealed,
  onLogin,
  onGoToDashboard,
  onSignOut,
}: LandingNavProps) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  const handleNavClick = () => {
    closeMobile();
  };

  return (
    <header className="landing-nav" role="banner">
      <div className="landing-nav-inner">
        <AccessGateWordmark expanded={heroRevealed} />

        <nav className="landing-nav-links" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="landing-nav-actions">
          {loading ? (
            <div className="landing-nav-skeleton" aria-hidden />
          ) : user ? (
            <UserMenu user={user} onSignOut={onSignOut} onGoToDashboard={onGoToDashboard} />
          ) : (
            <>
              <button type="button" className="landing-nav-btn-ghost" onClick={() => router.push('/login')}>
                Sign in
              </button>
              <button type="button" className="landing-nav-btn-primary" onClick={onLogin}>
                Get started
              </button>
              <button type="button" className="landing-nav-btn-primary mobile-cta" onClick={onLogin}>
                Get started
              </button>
            </>
          )}

          <button
            type="button"
            className="landing-nav-menu-btn"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <>
          <div className="landing-nav-backdrop" onClick={closeMobile} aria-hidden />
          <div className="landing-nav-mobile">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} onClick={handleNavClick}>
                {link.label}
              </a>
            ))}

            {!loading && !user && (
              <>
                <div className="landing-nav-mobile-divider" />
                <div className="landing-nav-mobile-actions">
                  <button type="button" className="landing-nav-mobile-ghost" onClick={() => { closeMobile(); router.push('/login'); }}>
                    Sign in
                  </button>
                  <button type="button" className="landing-nav-mobile-cta" onClick={() => { closeMobile(); onLogin(); }}>
                    <AccessGateLogoMark size={16} />
                    Get started
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </header>
  );
}
