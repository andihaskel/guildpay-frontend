'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, Shield, Eye, Users, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LOGO_SVG = (
  <svg className="w-4 h-4 text-primary-foreground" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

const DISCORD_LARGE_SVG = (
  <svg className="w-10 h-10 text-primary" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

const PERMISSIONS = [
  {
    icon: Shield,
    title: 'Manage Roles',
    description: 'Assign subscriber roles automatically',
  },
  {
    icon: Eye,
    title: 'View Channels',
    description: 'Access channel information for setup',
  },
  {
    icon: Users,
    title: 'Read Member List',
    description: 'Verify member subscriptions',
  },
];

export default function InstallBotPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleBack = () => router.push('/select-server');

  const handleInstallBot = () => {
    window.open('https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=268435456&scope=bot', '_blank');
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="grain" aria-hidden="true" />
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-primary/5 rounded-full blur-[140px]" />
      </div>

      <header className="relative z-10 h-16 border-b border-border/30 bg-background/70 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
              {LOGO_SVG}
            </div>
            <span className="font-semibold text-base tracking-tight">GuildPay</span>
          </Link>
          <span className="text-sm text-muted-foreground">Step 2 of 3</span>
        </div>
      </header>

      <div className="relative z-10 max-w-2xl mx-auto w-full px-6 pt-8">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Server Selection
        </button>
      </div>

      <main className="relative z-10 flex-1 flex items-center justify-center py-10 px-6">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              {DISCORD_LARGE_SVG}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Install GuildPay Bot
            </h1>
            <p className="text-muted-foreground text-lg max-w-lg mx-auto">
              To automatically assign and remove roles when members subscribe or cancel, the GuildPay bot must be added to your server.
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-7 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Info className="h-4 w-4 text-primary" />
              </div>
              <h3 className="font-semibold">Required Permissions</h3>
            </div>

            <div className="space-y-5">
              {PERMISSIONS.map(({ icon: Icon, title, description }) => (
                <div key={title} className="flex gap-4">
                  <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-0.5">{title}</h4>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Button
              size="lg"
              onClick={handleInstallBot}
              className="w-full font-semibold gap-2 hover:scale-[1.01] active:scale-[0.99] transition-transform"
            >
              <Download className="h-4 w-4" />
              Install Bot to Discord
            </Button>

            <Button
              variant="ghost"
              size="lg"
              onClick={handleBack}
              className="w-full gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            <p className="text-center text-xs text-muted-foreground pt-1 flex items-center justify-center gap-1.5">
              <Info className="h-3.5 w-3.5" />
              You&apos;ll be redirected back automatically after installation
            </p>
          </div>
        </div>
      </main>

      <footer className="relative z-10 border-t border-border/30 py-5">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-xs text-muted-foreground">
          <p>© 2024 GuildPay</p>
          <div className="flex items-center gap-5">
            <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
