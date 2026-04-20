'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, LogOut, ChevronDown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const LogoMark = () => (
  <svg width="22" height="22" viewBox="0 0 32 32" aria-hidden="true" style={{ display: 'inline-block', flexShrink: 0 }}>
    <path d="M6 28 L6 14 A10 10 0 0 1 26 14 L26 28" stroke="#f0f0f0" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4 28 L28 28" stroke="#f0f0f0" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M11 20 L21 20" stroke="#5865f2" strokeWidth="1.6" strokeLinecap="round" />
    <circle cx="16" cy="12" r="1.8" fill="#5865f2" />
  </svg>
);

const DISCORD_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

interface User {
  id: string;
  email: string | null;
  avatar: string | null;
}

interface UserMenuProps {
  user: User;
  onSignOut: () => void;
  onGoToDashboard: () => void;
}

function UserMenu({ user, onSignOut, onGoToDashboard }: UserMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', transition: 'opacity 200ms ease' }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
      >
        <Avatar style={{ width: '32px', height: '32px', border: '0.5px solid rgba(255,255,255,0.12)' }}>
          <AvatarImage src={user.avatar || undefined} alt={user.email || 'User'} />
          <AvatarFallback style={{ background: '#5865f2', color: '#fff', fontSize: '12px', fontWeight: 600 }}>
            {user.email?.[0]?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        <span style={{ fontSize: '14px', color: 'var(--text-secondary)', display: 'none' }} className="md:block">
          {user.email || 'User'}
        </span>
      </button>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
          <div style={{
            position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: '200px', zIndex: 50,
            background: 'var(--surface-1)', border: '0.5px solid var(--border)',
            borderRadius: 'var(--radius)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            padding: '6px',
          }}>
            <button
              onClick={() => { setMenuOpen(false); onGoToDashboard(); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                padding: '9px 12px', borderRadius: '6px', fontSize: '14px',
                color: 'var(--text)', background: 'none', cursor: 'pointer',
                transition: 'background 200ms ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              <LayoutDashboard size={14} style={{ color: 'var(--text-muted)' }} />
              Dashboard
            </button>
            <button
              onClick={() => { setMenuOpen(false); onSignOut(); }}
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
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}

const HOW_IT_WORKS = [
  {
    num: '01',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M7 4l10 4v8l-10 4V4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M17 8l4-1.5v11L17 16" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="1.3" fill="currentColor" />
      </svg>
    ),
    title: 'Connect your Discord server',
    desc: 'Authorize the bot with one click. No server config, no webhooks to manage.',
  },
  {
    num: '02',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="6" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3 10h18" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 15h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="17" cy="15" r="1.3" fill="currentColor" />
      </svg>
    ),
    title: 'Set your price',
    desc: 'Monthly, annual, or one-time. Paid through your own Stripe account.',
  },
  {
    num: '03',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="6" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="18" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="12" cy="18" r="2.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 7.5l3 8.5M16 7.5l-3 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: 'Share your link',
    desc: 'Members pay, get added, and lose access on cancel. We handle all of it.',
  },
];

const FEATURES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M4 7c0-1.1.9-2 2-2h12a2 2 0 0 1 2 2v2H4V7z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M4 9h16v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 14.5l2 2 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Stripe-native payments',
    desc: 'Payments flow straight to your Stripe account. We never take a cut.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="9" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M6 20c0-3 2.7-5 6-5s6 2 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M17.5 7.5l1.8 1.8 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Auto role management',
    desc: 'Roles assigned on payment, revoked on cancel. Zero manual moderation.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="14" height="3" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="3" y="10.5" width="18" height="3" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="3" y="17" width="11" height="3" rx="1" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
    title: 'Multiple tiers',
    desc: 'Free, monthly, annual, or one-time — stack tiers in a single server.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3 8h18" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="5.5" cy="6" r="0.6" fill="currentColor" />
        <circle cx="7.5" cy="6" r="0.6" fill="currentColor" />
        <path d="M8 21h8M12 18v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: 'Custom landing page',
    desc: 'Your brand, your copy, your domain. Looks like yours, not ours.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M3 17l5-5 4 3 5-7 4 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="8" cy="12" r="1.5" fill="currentColor" />
        <circle cx="12" cy="15" r="1.5" fill="currentColor" />
        <circle cx="17" cy="8" r="1.5" fill="currentColor" />
        <path d="M3 21h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: 'Real-time analytics',
    desc: 'Active members, MRR, and churn — all in a single quiet dashboard.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 10V7a4 4 0 0 1 7.5-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M10 14l4 4M14 14l-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: 'Cancellation handling',
    desc: 'If a member cancels, their access is revoked the moment it ends.',
  },
];

const FAQS = [
  {
    q: 'Does AccessGate take a commission on my payments?',
    a: 'No. You keep 100% of your revenue, minus Stripe\'s standard processing fees. Payments flow directly from your members into your Stripe account — we never touch the money.',
  },
  {
    q: 'What happens if a member cancels their subscription?',
    a: 'Their role and access are revoked automatically as soon as their billing period ends. If they cancel mid-cycle, access continues until the paid period is over — then it\'s removed without any action from you.',
  },
  {
    q: 'Can I run multiple roles or tiers in the same server?',
    a: 'Yes. Create as many tiers as you want — each mapped to its own Discord role. Members can upgrade, downgrade, or stack tiers, and role permissions update in real time.',
  },
  {
    q: 'Do I need to know how to code to set this up?',
    a: 'Not a line. Setup is three clicks: authorize the bot, connect Stripe, set your price. Most creators are live in about two minutes.',
  },
  {
    q: 'Does it work alongside existing Discord bots?',
    a: 'Yes. AccessGate only touches the roles you assign to it — your existing mod, music, or utility bots keep working normally. No permission conflicts.',
  },
  {
    q: 'Can I use my own domain for the checkout page?',
    a: 'On the Pro plan, yes. Point a subdomain at AccessGate with a single CNAME record and your checkout page lives on your brand — not ours.',
  },
];

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    checkAuthAndRedirect();
  }, []);

  const checkAuthAndRedirect = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const fromDiscord = urlParams.get('from') === 'discord';

    if (fromDiscord) {
      setIsRedirecting(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, { credentials: 'include' });
        if (response.ok) {
          const productsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/creator/products`, { credentials: 'include' });
          if (productsResponse.ok) {
            const products = await productsResponse.json();
            router.push(products?.length > 0 ? '/dashboard/overview' : '/select-server');
          } else {
            router.push('/select-server');
          }
        } else {
          router.push('/login');
        }
      } catch {
        router.push('/login');
      }
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, { credentials: 'include' });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleDiscordLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/discord/start`;
  };

  const handleGoToDashboard = () => router.push('/dashboard/overview');

  const handleSignOut = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
      setUser(null);
      router.push('/');
    } catch {}
  };

  if (isRedirecting) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            border: '2px solid var(--accent-soft-border)',
            borderTopColor: 'var(--accent)',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Setting up your account...</p>
        </div>
      </div>
    );
  }

  const navStyle: React.CSSProperties = {
    position: 'sticky',
    top: 0,
    zIndex: 50,
    background: 'rgba(10, 10, 10, 0.82)',
    backdropFilter: 'saturate(140%) blur(10px)',
    WebkitBackdropFilter: 'saturate(140%) blur(10px)',
    borderBottom: '0.5px solid var(--border-soft)',
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: 'var(--container)',
    margin: '0 auto',
    padding: '0 24px',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>

      {/* NAV */}
      <header style={navStyle} role="banner">
        <div style={{ ...containerStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', fontWeight: 600, fontSize: '15px', letterSpacing: '-0.01em', color: 'var(--text)', textDecoration: 'none' }} aria-label="AccessGate home">
            <LogoMark />
            AccessGate
          </Link>

          <nav style={{ display: 'flex', gap: '32px', fontSize: '14px', color: 'var(--text-secondary)' }} aria-label="Primary" className="hidden md:flex">
            <a href="#features" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 200ms ease' }} onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}>Features</a>
            <a href="#faq" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 200ms ease' }} onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}>FAQ</a>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {loading ? (
              <div style={{ height: '36px', width: '120px', background: 'var(--surface-1)', borderRadius: '6px', animation: 'pulse 1.5s ease-in-out infinite' }} />
            ) : user ? (
              <UserMenu user={user} onSignOut={handleSignOut} onGoToDashboard={handleGoToDashboard} />
            ) : (
              <>
                <button
                  onClick={() => router.push('/choose-login')}
                  style={{
                    display: 'inline-flex', alignItems: 'center', padding: '9px 12px',
                    fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)',
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    borderRadius: '6px', transition: 'color 200ms ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
                >
                  Sign in
                </button>
                <button
                  onClick={handleDiscordLogin}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '9px 16px', fontSize: '14px', fontWeight: 500,
                    background: '#ffffff', color: '#0a0a0a',
                    border: '0.5px solid #ffffff', borderRadius: '6px',
                    cursor: 'pointer', transition: 'transform 200ms ease, opacity 200ms ease',
                    letterSpacing: '-0.005em',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.01)'; e.currentTarget.style.opacity = '0.95'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = '1'; }}
                >
                  Get started
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* HERO */}
      <section style={{ position: 'relative', padding: '140px 0 160px', textAlign: 'center', overflow: 'hidden' }}>
        {/* grid */}
        <div aria-hidden="true" style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.025) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 0%, black 40%, transparent 75%)',
          maskImage: 'radial-gradient(ellipse at center, black 0%, black 40%, transparent 75%)',
        }} />
        {/* glow orbs */}
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', left: '18%', top: '10%', width: '480px', height: '480px',
            borderRadius: '50%', filter: 'blur(60px)', opacity: 0.4,
            background: 'radial-gradient(circle, rgba(88,101,242,0.5) 0%, transparent 70%)',
          }} />
          <div style={{
            position: 'absolute', bottom: '6%', right: '14%', width: '480px', height: '480px',
            borderRadius: '50%', filter: 'blur(60px)', opacity: 0.35,
            background: 'radial-gradient(circle, rgba(139,146,248,0.4) 0%, transparent 70%)',
          }} />
          <div style={{
            position: 'absolute', left: '50%', top: '50%',
            width: '760px', height: '760px',
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, rgba(88,101,242,0.18) 0%, rgba(88,101,242,0.04) 38%, transparent 65%)',
            filter: 'blur(6px)',
          }} />
        </div>

        <div style={{ ...containerStyle, position: 'relative', zIndex: 1 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '6px 12px',
            background: 'var(--accent-soft-bg)',
            border: '0.5px solid var(--accent-soft-border)',
            color: 'var(--accent-soft-text)',
            borderRadius: '999px', fontSize: '12px', fontWeight: 500,
            letterSpacing: '-0.005em', whiteSpace: 'nowrap', marginBottom: '28px',
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-soft-text)', boxShadow: '0 0 8px var(--accent-soft-text)' }} aria-hidden="true" />
            Now in public beta
            <span style={{ width: '1px', height: '10px', background: 'var(--accent-soft-border)' }} aria-hidden="true" />
            Free to start
          </span>

          <h1 style={{
            fontSize: 'clamp(44px, 6vw, 72px)',
            fontWeight: 500,
            letterSpacing: '-0.03em',
            lineHeight: 1.08,
            margin: '0 auto 20px',
            maxWidth: '880px',
            color: 'var(--text)',
          }}>
            Turn your Discord<br />
            into a paid community.
          </h1>

          <p style={{
            fontSize: 'clamp(18px, 2vw, 20px)',
            lineHeight: 1.55,
            color: 'var(--text-secondary)',
            maxWidth: '560px',
            margin: '0 auto 36px',
          }}>
            Connect Stripe, set a price, done. AccessGate handles payments, access, and cancellations — automatically.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '56px' }}>
            {loading ? (
              <div style={{ height: '50px', width: '180px', background: 'var(--surface-1)', borderRadius: '6px' }} />
            ) : user ? (
              <button
                onClick={handleGoToDashboard}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '14px 22px', fontSize: '15px', fontWeight: 500,
                  background: '#ffffff', color: '#0a0a0a',
                  border: '0.5px solid #ffffff', borderRadius: '6px',
                  cursor: 'pointer', transition: 'transform 200ms ease, opacity 200ms ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.01)'; e.currentTarget.style.opacity = '0.95'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = '1'; }}
              >
                <LayoutDashboard size={16} />
                Go to dashboard
              </button>
            ) : (
              <button
                onClick={handleDiscordLogin}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '14px 22px', fontSize: '15px', fontWeight: 500,
                  background: '#ffffff', color: '#0a0a0a',
                  border: '0.5px solid #ffffff', borderRadius: '6px',
                  cursor: 'pointer', transition: 'transform 200ms ease, opacity 200ms ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.01)'; e.currentTarget.style.opacity = '0.95'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = '1'; }}
              >
                {DISCORD_ICON}
                Start for free
              </button>
            )}
            <a
              href="#how-it-works"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500,
                padding: '9px 8px', textDecoration: 'none',
                transition: 'color 200ms ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              See how it works
              <ArrowIcon />
            </a>
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '14px', color: 'var(--text-muted)', fontSize: '13px' }}>
            <div style={{ display: 'inline-flex' }}>
              {[
                { initials: 'MK', bg: 'linear-gradient(135deg, #5865f2, #7983f5)' },
                { initials: 'JT', bg: 'linear-gradient(135deg, #2b7a4b, #3fb27a)' },
                { initials: 'AR', bg: 'linear-gradient(135deg, #b84a3a, #e0735a)' },
                { initials: 'SN', bg: 'linear-gradient(135deg, #6b3fb2, #9b6de0)' },
                { initials: 'DV', bg: 'linear-gradient(135deg, #c4963a, #e8b85a)', color: '#1a1500' },
              ].map((av, i) => (
                <span key={av.initials} aria-hidden="true" style={{
                  width: '26px', height: '26px', borderRadius: '50%',
                  border: '1.5px solid var(--bg)',
                  marginLeft: i === 0 ? 0 : '-8px',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '10px', fontWeight: 600, color: av.color || '#fff',
                  background: av.bg, letterSpacing: '-0.01em',
                }}>{av.initials}</span>
              ))}
            </div>
            <span>Trusted by 1,200+ Discord creators</span>
          </div>
        </div>
      </section>

      <hr style={{ height: '1px', background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)', border: 0, margin: 0 }} />

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{ padding: '120px 0' }}>
        <div style={containerStyle}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--accent-soft-text)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>How it works</div>
            <h2 style={{ fontSize: 'clamp(36px, 4vw, 48px)', fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1.1, color: 'var(--text)', margin: 0 }}>Up and running in minutes.</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '56px', position: 'relative' }}>
            {HOW_IT_WORKS.map((step) => (
              <div key={step.num} style={{ position: 'relative' }}>
                <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '48px', fontWeight: 400, color: 'var(--text-faint)', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: '24px', display: 'block' }}>{step.num}</span>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: '36px', height: '36px', borderRadius: '8px',
                  background: 'var(--surface-1)', border: '0.5px solid var(--border)',
                  color: 'var(--accent)', marginBottom: '18px',
                }}>{step.icon}</span>
                <h3 style={{ fontSize: '17px', fontWeight: 500, letterSpacing: '-0.015em', color: 'var(--text)', margin: '0 0 8px' }}>{step.title}</h3>
                <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr style={{ height: '1px', background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)', border: 0, margin: 0 }} />

      {/* FEATURES */}
      <section id="features" style={{ padding: '120px 0' }}>
        <div style={containerStyle}>
          <div style={{ marginBottom: '64px' }}>
            <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--accent-soft-text)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>Features</div>
            <h2 style={{ fontSize: 'clamp(36px, 4vw, 48px)', fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1.1, color: 'var(--text)', margin: '0 0 12px' }}>Everything you need. Nothing you don't.</h2>
            <p style={{ fontSize: '17px', color: 'var(--text-secondary)', maxWidth: '540px', margin: 0, lineHeight: 1.55 }}>Every tool needed to run a paid Discord community — without the bloat, the fees, or the learning curve.</p>
          </div>

          <div style={{
            display: 'grid',
            gap: '1px',
            background: 'var(--border-soft)',
            border: '0.5px solid var(--border-soft)',
            borderRadius: '10px',
            overflow: 'hidden',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          }}>
            {FEATURES.map((f) => (
              <FeatureCard key={f.title} icon={f.icon} title={f.title} desc={f.desc} />
            ))}
          </div>
        </div>
      </section>

      <hr style={{ height: '1px', background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)', border: 0, margin: 0 }} />

      {/* FAQ */}
      <section id="faq" style={{ padding: '120px 0', background: 'var(--bg-alt)' }}>
        <div style={containerStyle}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--accent-soft-text)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>FAQ</div>
            <h2 style={{ fontSize: 'clamp(36px, 4vw, 48px)', fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1.1, color: 'var(--text)', margin: 0 }}>Common questions.</h2>
          </div>

          <div style={{ maxWidth: '760px', margin: '0 auto', background: 'var(--bg-alt)', border: '0.5px solid var(--border-soft)', borderRadius: '14px', overflow: 'hidden' }}>
            {FAQS.map((faq, i) => (
              <div key={i} style={{ borderBottom: i < FAQS.length - 1 ? '0.5px solid var(--border-soft)' : 'none' }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: '100%', textAlign: 'left', padding: '22px 28px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px',
                    fontSize: '15.5px', fontWeight: 500, color: 'var(--text)',
                    letterSpacing: '-0.01em', background: 'none', cursor: 'pointer',
                    transition: 'background 200ms ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.015)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                >
                  {faq.q}
                  <ChevronDown size={16} style={{ flexShrink: 0, color: 'var(--text-muted)', transition: 'transform 200ms ease', transform: openFaq === i ? 'rotate(180deg)' : 'none' }} />
                </button>
                {openFaq === i && (
                  <div style={{ padding: '0 28px 24px', fontSize: '14.5px', lineHeight: 1.65, color: 'var(--text-secondary)', maxWidth: '620px' }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{
        borderTop: '0.5px solid var(--border-soft)', background: 'var(--bg-cta)',
        padding: '140px 0', textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ ...containerStyle, position: 'relative' }}>
          <h2 style={{ fontSize: 'clamp(44px, 5vw, 56px)', fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 16px', color: 'var(--text)' }}>
            Start monetizing today.
          </h2>
          <p style={{ fontSize: '17px', color: 'var(--text-secondary)', margin: '0 auto 36px', maxWidth: '480px' }}>
            Free to start. No credit card required. Setup in 2 minutes — and you keep 100% of your revenue.
          </p>
          {loading ? (
            <div style={{ height: '54px', width: '220px', background: 'var(--surface-1)', borderRadius: '6px', margin: '0 auto' }} />
          ) : user ? (
            <button
              onClick={handleGoToDashboard}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '18px 28px', fontSize: '16px', fontWeight: 500,
                background: '#ffffff', color: '#0a0a0a',
                border: '0.5px solid #ffffff', borderRadius: '6px',
                cursor: 'pointer', transition: 'transform 200ms ease, opacity 200ms ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.01)'; e.currentTarget.style.opacity = '0.95'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = '1'; }}
            >
              <LayoutDashboard size={18} />
              Go to dashboard
            </button>
          ) : (
            <button
              onClick={handleDiscordLogin}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '18px 28px', fontSize: '16px', fontWeight: 500,
                background: '#ffffff', color: '#0a0a0a',
                border: '0.5px solid #ffffff', borderRadius: '6px',
                cursor: 'pointer', transition: 'transform 200ms ease, opacity 200ms ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.01)'; e.currentTarget.style.opacity = '0.95'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = '1'; }}
            >
              {DISCORD_ICON}
              Create your AccessGate
            </button>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '0.5px solid var(--border-soft)', padding: '32px 0', background: 'var(--bg)' }}>
        <div style={{ ...containerStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', fontWeight: 600, fontSize: '15px', letterSpacing: '-0.01em', color: 'var(--text)', textDecoration: 'none' }}>
            <LogoMark />
            AccessGate
          </Link>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '28px', fontSize: '13px', color: 'var(--text-muted)' }} aria-label="Footer">
            {['Terms', 'Privacy', 'Contact'].map(label => (
              <a key={label} href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 200ms ease' }} onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>{label}</a>
            ))}
          </nav>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>© {new Date().getFullYear()} AccessGate</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <article
      style={{
        background: hovered ? 'var(--surface-2)' : 'var(--surface-1)',
        padding: '32px 28px',
        display: 'flex', flexDirection: 'column', gap: '14px',
        transition: 'background 200ms ease',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span style={{
        width: '36px', height: '36px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--accent-soft-text)', background: 'var(--accent-soft-bg)',
        border: '0.5px solid var(--accent-soft-border)', borderRadius: '8px',
      }}>{icon}</span>
      <h3 style={{ fontSize: '16px', fontWeight: 500, color: 'var(--text)', letterSpacing: '-0.01em', margin: 0 }}>{title}</h3>
      <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0 }}>{desc}</p>
    </article>
  );
}
