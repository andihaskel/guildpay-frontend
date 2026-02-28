'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, Zap, Crown, Bot, ArrowRight, LogOut, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.avatar || undefined} alt={user.email || 'User'} />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-semibold">
            {user.email?.[0]?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium hidden md:block">
          {user.email || 'User'}
        </span>
      </button>

      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute top-full right-0 mt-2 w-56 z-50 rounded-lg border border-border bg-popover shadow-lg">
            <div className="p-2 space-y-1">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onGoToDashboard();
                }}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm hover:bg-accent/50 transition-colors"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Ir al Panel</span>
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onSignOut();
                }}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    checkAuthAndRedirect();
  }, []);

  const checkAuthAndRedirect = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const fromDiscord = urlParams.get('from') === 'discord';

    if (fromDiscord) {
      setIsRedirecting(true);

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/me`, {
          credentials: 'include',
        });

        if (response.ok) {
          const productsResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/products`, {
            credentials: 'include',
          });

          if (productsResponse.ok) {
            const products = await productsResponse.json();

            if (products && products.length > 0) {
              router.push('/dashboard/overview');
            } else {
              router.push('/select-server');
            }
          } else {
            router.push('/select-server');
          }
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/login');
      }
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/me`, {
        credentials: 'include',
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDiscordLogin = () => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    window.location.href = `${backendUrl}/auth/discord/start`;
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard/overview');
  };

  const handleSignOut = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  if (isRedirecting) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Completing authentication...</h2>
          <p className="text-sm text-muted-foreground">Please wait while we set up your account.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            <span className="font-semibold text-base">GuildPay</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#how-it-works" className="hover:text-foreground transition-colors">
              How It Works
            </a>
            <a href="#features" className="hover:text-foreground transition-colors">
              Features
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {loading ? (
              <div className="h-9 w-32 animate-pulse bg-muted rounded-md" />
            ) : user ? (
              <UserMenu user={user} onSignOut={handleSignOut} onGoToDashboard={handleGoToDashboard} />
            ) : (
              <>
                <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Sign In
                </Link>
                <Button size="sm" onClick={handleDiscordLogin}>
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                  Continue with Discord
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="pt-14">
        <section className="container mx-auto px-6 py-20 md:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 mb-6">
              <Check className="h-3 w-3 text-green-500" />
              <span className="text-xs text-green-500">Powered by Stripe</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Monetize Your <br />
              <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600 text-transparent bg-clip-text">
                Discord Server
              </span>
            </h1>

            <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Sell access to exclusive roles with automated Stripe subscriptions. No manual approvals. No hassle.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
              {loading ? (
                <div className="h-10 w-48 animate-pulse bg-muted rounded-md" />
              ) : user ? (
                <Button className="text-sm px-6" size="lg" onClick={handleGoToDashboard}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Ir al Panel
                </Button>
              ) : (
                <>
                  <Button className="text-sm px-6" size="lg" onClick={handleDiscordLogin}>
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                    </svg>
                    Continuar con Discord
                  </Button>
                  <Button variant="ghost" className="text-sm px-6" size="lg">
                    Saber Más
                  </Button>
                </>
              )}
            </div>

            <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5" />
                <span>Free to start</span>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="container mx-auto px-6 py-20">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">How It Works</h2>
              <p className="text-sm text-muted-foreground">
                Three simple steps to start earning from your Discord community
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="relative bg-card border border-border rounded-xl p-6">
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-sm font-bold text-primary-foreground">1</span>
                </div>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 mt-2">
                  <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Connect Your Server</h3>
                <p className="text-sm text-muted-foreground">
                  Sign in with Discord and select the server you want to monetize. Takes less than 30 seconds.
                </p>
              </div>

              <div className="relative bg-card border border-border rounded-xl p-6">
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-sm font-bold text-primary-foreground">2</span>
                </div>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 mt-2">
                  <Crown className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Create Paid Roles</h3>
                <p className="text-sm text-muted-foreground">
                  Set up subscription tiers and assign exclusive roles. Define pricing and access levels.
                </p>
              </div>

              <div className="relative bg-card border border-border rounded-xl p-6">
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-sm font-bold text-primary-foreground">3</span>
                </div>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 mt-2">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Get Paid Automatically</h3>
                <p className="text-sm text-muted-foreground">
                  Members subscribe via Stripe. Roles are assigned instantly. You get paid directly.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="bg-card/30 py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-3">Built for Discord Creators</h2>
                <p className="text-sm text-muted-foreground">
                  Professional tools you can trust
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-7 h-7 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Secure Payments via Stripe</h3>
                  <p className="text-sm text-muted-foreground">
                    Industry-standard payment processing. Your data stays safe.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-14 h-14 rounded-xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                    <Bot className="w-7 h-7 text-purple-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Fully Automated</h3>
                  <p className="text-sm text-muted-foreground">
                    Role assignment happens instantly. No manual work required.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-14 h-14 rounded-xl bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                    <Check className="w-7 h-7 text-green-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No Manual Approvals</h3>
                  <p className="text-sm text-muted-foreground">
                    Members get access immediately after payment. Simple.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-6 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Ready to Start Earning?</h2>
            <p className="text-sm text-muted-foreground mb-8">
              Join Discord creators who are already monetizing their communities with GuildPay.
            </p>
            {loading ? (
              <div className="h-10 w-48 mx-auto animate-pulse bg-muted rounded-md" />
            ) : user ? (
              <Button className="text-sm px-6" size="lg" onClick={handleGoToDashboard}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Ir al Panel
              </Button>
            ) : (
              <Button className="text-sm px-6" size="lg" onClick={handleDiscordLogin}>
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                Continuar con Discord
              </Button>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              <span className="font-semibold">GuildPay</span>
            </div>

            <div className="flex items-center gap-6 text-xs text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact</a>
            </div>

            <p className="text-xs text-muted-foreground">
              © 2024 GuildPay. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
