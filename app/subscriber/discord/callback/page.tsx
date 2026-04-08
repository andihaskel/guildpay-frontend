'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CircleCheck as CheckCircle, Loader as Loader2, ArrowRight, CircleAlert as AlertCircle } from 'lucide-react';

interface DiscordCallbackData {
  connected: boolean;
  guild_id?: string;
  welcome_channel_id?: string;
  error?: string;
}

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
      setCallbackData({
        connected: true,
        guild_id: guildId || undefined,
        welcome_channel_id: welcomeChannelId || undefined,
      });
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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 bg-slate-900/80 border-slate-800/50 text-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-16 w-16 text-primary animate-spin" />
            <h2 className="text-2xl font-bold">Connecting Discord</h2>
            <p className="text-slate-400">
              Please wait while we connect your Discord account...
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 bg-slate-900/80 border-slate-800/50 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold">Connection Failed</h2>
            <p className="text-slate-400">
              {callbackData?.error || 'Unable to connect your Discord account'}
            </p>
            <Button
              onClick={() => router.push('/dashboard/home')}
              variant="outline"
              className="mt-4"
            >
              Go to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const hasDiscordLink = callbackData?.guild_id && (callbackData?.welcome_channel_id || true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 bg-slate-900/80 border-slate-800/50 text-center">
        <div className="flex flex-col items-center gap-6">
          <div className="h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>

          <div>
            <h1 className="text-3xl font-bold mb-2">Discord Connected!</h1>
            <p className="text-slate-400">
              Your Discord account has been successfully linked.
            </p>
          </div>

          {hasDiscordLink && (
            <div className="w-full bg-slate-800/50 rounded-lg p-6 space-y-4">
              <h3 className="font-semibold text-lg">Access Your Server</h3>
              <p className="text-sm text-slate-400">
                {callbackData?.welcome_channel_id
                  ? 'Click below to open your welcome channel in Discord.'
                  : 'Click below to open your Discord server.'}
              </p>

              <Button
                onClick={handleGoToDiscord}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-lg font-semibold"
                size="lg"
              >
                Open Discord
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          )}

          <Button
            onClick={() => router.push('/dashboard/home')}
            variant="ghost"
            className="text-slate-400 hover:text-white"
          >
            Continue to Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
}
