'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lightbulb, CircleUser as UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DISCORD_SVG = (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

export default function ChooseLoginPage() {
  const router = useRouter();

  const handleCreatorLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/discord/start`;
  };

  const handleMemberLogin = () => {
    router.push('/member-login');
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="grain" aria-hidden="true" />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[400px] bg-amber-500/5 rounded-full blur-[120px]" />
        <div className="absolute top-0 right-1/4 w-[500px] h-[400px] bg-sky-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/4 rounded-full blur-[140px]" />
      </div>

      <header className="relative z-10 h-16 border-b border-border/30 bg-background/70 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-full flex items-center">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
              <svg className="w-4 h-4 text-primary-foreground" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
            </div>
            <span className="font-semibold text-base tracking-tight">AccessGate</span>
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Sign in to AccessGate</h1>
          <p className="text-muted-foreground">Choose how you want to continue</p>
        </div>

        <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-px bg-border rounded-2xl overflow-hidden shadow-2xl shadow-black/10">
          <div className="bg-card p-10 flex flex-col items-center text-center gap-6">
            <div className="w-20 h-20 rounded-2xl border-2 border-amber-400/60 bg-amber-400/8 flex items-center justify-center">
              <Lightbulb className="w-9 h-9 text-amber-400" strokeWidth={1.5} />
            </div>

            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-1.5">Creator</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Log in to your dashboard and manage your community
              </p>
            </div>

            <Button
              className="w-full gap-2.5 font-semibold hover:scale-[1.02] active:scale-[0.98] transition-transform"
              size="lg"
              onClick={handleCreatorLogin}
            >
              {DISCORD_SVG}
              Connect Discord
            </Button>
          </div>

          <div className="bg-card p-10 flex flex-col items-center text-center gap-6">
            <div className="w-20 h-20 rounded-2xl border-2 border-sky-400/60 bg-sky-400/8 flex items-center justify-center">
              <UserCircle className="w-9 h-9 text-sky-400" strokeWidth={1.5} />
            </div>

            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-1.5">Member</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Manage your subscription and access your communities
              </p>
            </div>

            <Button
              variant="outline"
              className="w-full font-semibold hover:scale-[1.02] active:scale-[0.98] transition-transform"
              size="lg"
              onClick={handleMemberLogin}
            >
              Sign In
            </Button>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          New to AccessGate?{' '}
          <Link href="/" className="text-foreground hover:text-foreground/80 font-medium transition-colors">
            Learn more
          </Link>
        </p>
      </main>
    </div>
  );
}
