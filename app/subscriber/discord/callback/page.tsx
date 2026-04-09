'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CircleCheck as CheckCircle, Loader as Loader2, ArrowRight, CircleAlert as AlertCircle } from 'lucide-react';

interface DiscordCallbackData {
  connected: boolean;
  guild_id?: string;
  welcome_channel_id?: string;
  error?: string;
}

const GlowWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
    <div className="grain" aria-hidden="true" />
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-primary/5 rounded-full blur-[140px]" />
    </div>
    <div className="relative z-10 w-full max-w-md">
      <div className="bg-card border border-border rounded-2xl p-8 text-center">
        {children}
      </div>
    </div>
  </div>
);

export default function DiscordCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [callbackData, setCallbackData] = useState<DiscordCallbackData | null>(null);

  useEffect(() => {
    const connected = searchParams.get('connected');
    const guildId = searchParams.get('guild_id');
    const welcomeChannelId = searchParams.get('welcome_channel_id');
    const error = searchParams.get('error');

    if (error) {
      setStatus('error');
      setCallbackData({ connected: false, error });
      return;
    }

    if (connected === 'true') {
      setStatus('success');
      setCallbackData({ connected: true, guild_id: guildId || undefined, welcome_channel_id: welcomeChannelId || undefined });
    } else {
      setStatus('error');
      setCallbackData({ connected: false, error: 'Failed to connect Discord account' });
    }
  }, [searchParams]);

  const handleGoToDiscord = () => {
    if (callbackData?.guild_id && callbackData?.welcome_channel_id) {
      window.open(`https://discord.com/channels/${callbackData.guild_id}/${callbackData.welcome_channel_id}`, '_blank');
    } else if (callbackData?.guild_id) {
      window.open(`https://discord.com/channels/${callbackData.guild_id}`, '_blank');
    }
  };

  if (status === 'loading') {
    return (
      <GlowWrapper>
        <div className="flex flex-col items-center gap-4 py-4">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <h2 className="text-2xl font-bold tracking-tight">Connecting Discord</h2>
          <p className="text-muted-foreground text-sm">
            Please wait while we connect your Discord account...
          </p>
        </div>
      </GlowWrapper>
    );
  }

  if (status === 'error') {
    return (
      <GlowWrapper>
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="h-7 w-7 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Connection Failed</h2>
          <p className="text-muted-foreground text-sm">
            {callbackData?.error || 'Unable to connect your Discord account'}
          </p>
          <Button
            onClick={() => router.push('/dashboard/home')}
            variant="ghost"
            className="mt-2 text-muted-foreground hover:text-foreground"
          >
            Go to Dashboard
          </Button>
        </div>
      </GlowWrapper>
    );
  }

  const hasDiscordLink = callbackData?.guild_id && (callbackData?.welcome_channel_id || true);

  return (
    <GlowWrapper>
      <div className="flex flex-col items-center gap-6 py-2">
        <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center">
          <CheckCircle className="h-9 w-9 text-green-500" />
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Discord Connected!</h1>
          <p className="text-muted-foreground text-sm">
            Your Discord account has been successfully linked.
          </p>
        </div>

        {hasDiscordLink && (
          <div className="w-full bg-background/60 border border-border rounded-xl p-5 space-y-4 text-left">
            <div>
              <h3 className="font-semibold mb-1">Access Your Server</h3>
              <p className="text-sm text-muted-foreground">
                {callbackData?.welcome_channel_id
                  ? 'Click below to open your welcome channel in Discord.'
                  : 'Click below to open your Discord server.'}
              </p>
            </div>
            <Button
              onClick={handleGoToDiscord}
              className="w-full gap-2.5 font-semibold hover:scale-[1.01] active:scale-[0.99] transition-transform"
              size="lg"
            >
              Open Discord
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        <Button
          onClick={() => router.push('/dashboard/home')}
          variant="ghost"
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          Continue to Dashboard
        </Button>
      </div>
    </GlowWrapper>
  );
}
