'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

interface DiscordGuild {
  id: string;
  name: string;
}

interface ServerCardProps {
  id: string;
  name: string;
  initials: string;
  isSelected: boolean;
  onSelect: () => void;
}

function ServerCard({
  id,
  name,
  initials,
  isSelected,
  onSelect,
}: ServerCardProps) {
  const colors = ['#C084FC', '#3B82F6', '#F97316', '#10B981', '#A855F7', '#EC4899'];
  const color = colors[Math.abs(id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % colors.length];

  return (
    <button
      onClick={onSelect}
      className={`relative w-full rounded-xl border-2 transition-all p-6 text-left ${
        isSelected
          ? 'border-primary bg-primary/5'
          : 'border-border bg-card hover:border-border/80'
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold"
          style={{ backgroundColor: color }}
        >
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg mb-1">{name}</h3>
        </div>
      </div>
    </button>
  );
}

export default function SelectServerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);
  const [servers, setServers] = useState<DiscordGuild[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const initializePage = async () => {
      try {
        const guildsParam = searchParams.get('guilds');

        if (guildsParam) {
          const decodedGuilds = atob(guildsParam);
          const guilds: DiscordGuild[] = JSON.parse(decodedGuilds);
          setServers(guilds);
          setLoading(false);
        } else {
          const user = await api.getMe();
          setUserId(user.id);

          const apiUrl = process.env.NEXT_PUBLIC_API_URL;
          const redirectUrl = `${apiUrl}/discord/connect?user_id=${user.id}&redirect_to=/select-server`;
          window.location.href = redirectUrl;
        }
      } catch (err) {
        console.error('Error initializing select server page:', err);
        setError('Failed to load servers. Please try again.');
        setLoading(false);
      }
    };

    initializePage();
  }, [searchParams]);

  const handleContinue = () => {
    if (!selectedServerId) return;

    const selectedServer = servers.find(s => s.id === selectedServerId);
    if (!selectedServer) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID;
    const guildId = selectedServer.id;
    const guildName = encodeURIComponent(selectedServer.name);

    const botAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=8&scope=bot%20applications.commands&guild_id=${guildId}&response_type=code&redirect_uri=${encodeURIComponent(`${apiUrl}/discord/bot-callback`)}&state=${guildName}`;

    window.location.href = botAuthUrl;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-lg font-semibold mb-2">Loading your servers...</h2>
          <p className="text-sm text-muted-foreground">Please wait while we fetch your Discord servers.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-destructive mb-4">{error}</div>
          <Button onClick={() => router.push('/login')}>Back to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            <span className="font-semibold text-base">GuildPay</span>
          </Link>

          <Link
            href="/"
            className="p-2 rounded-lg hover:bg-accent transition-colors"
          >
            <X className="h-5 w-5" />
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center py-12 px-6">
        <div className="w-full max-w-5xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Select a Discord Server
            </h1>
            <p className="text-muted-foreground text-lg">
              Choose the server you want to monetize.
            </p>
          </div>

          {servers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No servers found where you are the owner.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {servers.map((server) => (
                  <ServerCard
                    key={server.id}
                    id={server.id}
                    name={server.name}
                    initials={server.name.substring(0, 2).toUpperCase()}
                    isSelected={selectedServerId === server.id}
                    onSelect={() => setSelectedServerId(server.id)}
                  />
                ))}
              </div>

              <div className="flex items-center justify-center">
                <Button
                  size="lg"
                  onClick={handleContinue}
                  disabled={!selectedServerId}
                >
                  Continue
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
