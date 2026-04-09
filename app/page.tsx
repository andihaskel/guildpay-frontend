'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, ChevronDown, ArrowRight, LayoutDashboard, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const DISCORD_ICON = (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
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
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <Avatar className="h-8 w-8 border border-border">
          <AvatarImage src={user.avatar || undefined} alt={user.email || 'User'} />
          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
            {user.email?.[0]?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium hidden md:block text-foreground/80">
          {user.email || 'User'}
        </span>
      </button>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
          <div className="absolute top-full right-0 mt-2 w-52 z-50 rounded-xl border border-border bg-card shadow-xl">
            <div className="p-1.5 space-y-0.5">
              <button
                onClick={() => { setMenuOpen(false); onGoToDashboard(); }}
                className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors"
              >
                <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => { setMenuOpen(false); onSignOut(); }}
                className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Connect your Discord server',
    body: 'Sign in with Discord and select the server you want to monetize. Our bot installs in seconds and manages everything automatically.',
  },
  {
    step: '02',
    title: 'Set up your access page',
    body: 'Create a beautiful signup page, pick which roles to grant, and set your pricing. Full control, no code needed.',
  },
  {
    step: '03',
    title: 'Share and start earning',
    body: 'Send your link to your community. Subscribers get instant role access, payments land directly in your Stripe account.',
  },
];

const FAQS = [
  {
    q: 'How does role assignment work?',
    a: 'When a member subscribes, our bot automatically grants them the Discord roles you configured. If their subscription lapses, roles are removed instantly. Fully hands-free.',
  },
  {
    q: 'Do I need a Stripe account?',
    a: 'Yes. You connect your own Stripe account, so payments go directly to you with no middleman. We never touch your money.',
  },
  {
    q: 'What does GuildPay charge?',
    a: 'We charge a small platform fee on successful payments. There are no monthly fees, no setup costs, and no charges until you earn.',
  },
  {
    q: 'Can I offer multiple membership tiers?',
    a: 'Absolutely. Create as many tiers as you want, each with different pricing, different roles, and different benefits.',
  },
  {
    q: 'What happens if a subscriber cancels?',
    a: 'Their roles are revoked at the end of the billing period. You can also configure grace periods and custom messaging.',
  },
  {
    q: 'Is there a free trial?',
    a: 'You can sign up and configure everything for free. You only pay the platform fee when a member subscribes.',
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/me`, { credentials: 'include' });
        if (response.ok) {
          const productsResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/creator/products`, { credentials: 'include' });
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/me`, { credentials: 'include' });
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
    window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/discord/start`;
  };

  const handleGoToDashboard = () => router.push('/dashboard/overview');

  const handleSignOut = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
      setUser(null);
      router.push('/');
    } catch {}
  };

  const CtaButton = ({ size = 'lg', className = '' }: { size?: 'lg' | 'default'; className?: string }) => {
    if (loading) return <div className={`h-12 w-52 animate-pulse bg-muted rounded-lg ${className}`} />;
    if (user) {
      return (
        <Button size={size} className={`gap-2 font-semibold ${className}`} onClick={handleGoToDashboard}>
          <LayoutDashboard className="h-4 w-4" />
          Go to Dashboard
        </Button>
      );
    }
    return (
      <Button size={size} className={`gap-2 font-semibold ${className}`} onClick={handleDiscordLogin}>
        {DISCORD_ICON}
        Get started with Discord
      </Button>
    );
  };

  if (isRedirecting) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Setting up your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="grain" aria-hidden="true" />

      <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-border/30 bg-background/70 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
              <svg className="w-4 h-4 text-primary-foreground" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
            </div>
            <span className="font-semibold text-base tracking-tight">GuildPay</span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm">
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How it works</a>
            <a href="#faq" className="text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            {loading ? (
              <div className="h-9 w-32 animate-pulse bg-muted rounded-lg" />
            ) : user ? (
              <UserMenu user={user} onSignOut={handleSignOut} onGoToDashboard={handleGoToDashboard} />
            ) : (
              <Button size="sm" variant="outline" className="font-medium" onClick={() => router.push('/choose-login')}>
                Sign in
              </Button>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16">
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  'radial-gradient(circle, rgba(56,107,140,0.45) 0.6px, transparent 0.6px), radial-gradient(circle, rgba(56,107,140,0.22) 0.6px, transparent 0.6px)',
                backgroundSize: '22px 22px',
                backgroundPosition: '0 0, 11px 11px',
              }}
            />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_55%_at_50%_50%,transparent_30%,hsl(var(--background))_75%)]" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-primary/5 rounded-full blur-[120px]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_55%,hsl(var(--background))_100%)]" />
          </div>

          <div className="relative max-w-4xl mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border/60 bg-card/60 backdrop-blur-sm mb-10 text-xs text-muted-foreground font-medium tracking-wide uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
              Discord monetization, automated
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-[5.5rem] font-bold leading-[1.04] tracking-[-0.03em] mb-7">
              Monetize access to<br />
              <span className="text-primary">your community</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto mb-12 font-light">
              Accept payments and automatically grant access — no manual work.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14">
              <CtaButton size="lg" className="text-base hover:scale-[1.03] active:scale-[0.98]" />
              <Button
                variant="ghost"
                size="lg"
                className="text-base gap-1.5 text-muted-foreground hover:text-foreground hover:bg-foreground/6 hover:scale-[1.03] active:scale-[0.98]"
                asChild
              >
                <a href="#how-it-works">
                  See how it works
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </div>

            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
              {['Free to start', '5 minute setup', 'No code required'].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center overflow-hidden h-12">
            <div className="w-px h-12 bg-gradient-to-b from-transparent via-muted-foreground/40 to-transparent animate-scroll-line" />
          </div>
        </section>

        <section id="how-it-works" className="py-28 md:py-36">
          <div className="max-w-5xl mx-auto px-6">
            <div className="mb-20">
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-4">How it works</p>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight max-w-xl">
                Set up in minutes,<br />earn forever
              </h2>
            </div>

            <div className="space-y-0">
              {HOW_IT_WORKS.map((item, i) => (
                <div
                  key={item.step}
                  className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8 md:gap-16 py-12 border-t border-border/50 last:border-b"
                >
                  <div className="flex items-start gap-4 md:gap-6">
                    <span className="text-xs text-muted-foreground/50 font-mono mt-1 w-6 flex-shrink-0">{item.step}</span>
                    <h3 className="text-lg font-semibold leading-snug">{item.title}</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed md:max-w-lg">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="py-28 md:py-36">
          <div className="max-w-5xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-16 md:gap-24">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-4">FAQ</p>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
                  Common<br />questions
                </h2>
              </div>

              <div className="space-y-0">
                {FAQS.map((faq, i) => (
                  <div key={i} className="border-t border-border/50 last:border-b">
                    <button
                      className="w-full flex items-center justify-between gap-4 py-5 text-left group"
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    >
                      <span className="font-medium text-sm md:text-base group-hover:text-primary transition-colors">
                        {faq.q}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {openFaq === i && (
                      <p className="text-sm text-muted-foreground leading-relaxed pb-5 max-w-lg">
                        {faq.a}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-28 md:py-36 border-t border-border/40">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-6">Get started</p>
            <h2 className="text-4xl md:text-6xl font-bold tracking-[-0.03em] leading-tight mb-6">
              Your community,<br />your revenue
            </h2>
            <p className="text-muted-foreground text-lg mb-12 max-w-md mx-auto">
              Start accepting payments from your Discord members today. Free setup, no monthly fees.
            </p>
            <CtaButton size="lg" className="text-base" />
          </div>
        </section>
      </main>

      <footer className="border-t border-border/30 bg-card/10">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-10">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
                <svg className="w-4 h-4 text-primary-foreground" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
              </div>
              <span className="font-semibold text-sm">GuildPay</span>
            </Link>

            <nav className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a>
              <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            </nav>
          </div>

          <div className="pt-8 border-t border-border/30">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} GuildPay. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
