'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, Shield, Eye, Users, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function InstallBotPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const serverName = searchParams.get('name') || 'Selected Server';
  const serverId = searchParams.get('id') || '';

  const handleBack = () => {
    router.push('/select-server');
  };

  const handleInstallBot = () => {
    window.open('https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=268435456&scope=bot', '_blank');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <svg className="w-5 h-5 text-primary-foreground" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
            </div>
            <span className="font-semibold text-base">GuildPay</span>
          </Link>

          <div className="text-sm text-muted-foreground">
            Step 2 of 3
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Server Selection
        </button>
      </div>

      <main className="flex-1 flex items-center justify-center py-12 px-6">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-12">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-primary" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Install GuildPay Bot
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              To automatically assign and remove roles when members subscribe or cancel, the GuildPay bot must be added to your server.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Info className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Required Permissions</h3>
            </div>

            <div className="space-y-5">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Manage Roles</h4>
                  <p className="text-sm text-muted-foreground">
                    Assign subscriber roles automatically
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Eye className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">View Channels</h4>
                  <p className="text-sm text-muted-foreground">
                    Access channel information for setup
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Read Member List</h4>
                  <p className="text-sm text-muted-foreground">
                    Verify member subscriptions
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Button
              size="lg"
              onClick={handleInstallBot}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Install Bot to Discord
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={handleBack}
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-2">
              <Info className="h-4 w-4" />
              <p>You&apos;ll be redirected back automatically after installation</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-border py-6">
        <div className="container mx-auto px-6 flex items-center justify-between text-sm text-muted-foreground">
          <p>© 2024 GuildPay</p>
          <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Contact Support
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
