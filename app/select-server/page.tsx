'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { X, AlertTriangle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ServerCardProps {
  id: string;
  name: string;
  icon?: string;
  initials: string;
  memberCount: number;
  botInstalled: boolean;
  isSelected: boolean;
  onSelect: () => void;
  color: string;
}

function ServerCard({
  id,
  name,
  icon,
  initials,
  memberCount,
  botInstalled,
  isSelected,
  onSelect,
  color,
}: ServerCardProps) {
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
        {icon ? (
          <img
            src={icon}
            alt={name}
            className="w-14 h-14 rounded-xl"
          />
        ) : (
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold"
            style={{ backgroundColor: color }}
          >
            {initials}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg mb-1">{name}</h3>
          <p className="text-sm text-muted-foreground">
            {memberCount.toLocaleString()} members
          </p>
        </div>
      </div>

      <div className="mt-4">
        {botInstalled ? (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-500/10 border border-green-500/20">
            <Check className="h-3.5 w-3.5 text-green-500" />
            <span className="text-xs text-green-500 font-medium">Bot Installed</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-orange-500/10 border border-orange-500/20">
            <AlertTriangle className="h-3.5 w-3.5 text-orange-500" />
            <span className="text-xs text-orange-500 font-medium">Bot Not Installed</span>
          </div>
        )}
      </div>
    </button>
  );
}

export default function SelectServerPage() {
  const router = useRouter();
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);

  const mockServers = [
    {
      id: '1',
      name: 'GuildPay Community',
      initials: 'GP',
      memberCount: 12453,
      botInstalled: true,
      color: '#C084FC',
    },
    {
      id: '2',
      name: 'Dev Community Hub',
      initials: 'DC',
      memberCount: 8921,
      botInstalled: true,
      color: '#3B82F6',
    },
    {
      id: '3',
      name: 'Premium Masterclass',
      initials: 'PM',
      memberCount: 3542,
      botInstalled: false,
      color: '#F97316',
    },
    {
      id: '4',
      name: 'Fitness Guild',
      initials: 'FG',
      memberCount: 6789,
      botInstalled: true,
      color: '#10B981',
    },
    {
      id: '5',
      name: 'Creative Collective',
      initials: 'CC',
      memberCount: 15234,
      botInstalled: false,
      color: '#A855F7',
    },
    {
      id: '6',
      name: 'Gaming Squad',
      initials: 'GS',
      memberCount: 22891,
      botInstalled: true,
      color: '#EC4899',
    },
  ];

  const handleContinue = async () => {
    if (!selectedServerId) return;

    const selectedServer = mockServers.find(s => s.id === selectedServerId);
    if (!selectedServer) return;

    if (selectedServer.botInstalled) {
      router.push(`/dashboard/overview`);
    } else {
      const params = new URLSearchParams({
        id: selectedServer.id,
        name: selectedServer.name,
        members: selectedServer.memberCount.toString(),
      });

      router.push(`/install-bot?${params.toString()}`);
    }
  };

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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {mockServers.map((server) => (
              <ServerCard
                key={server.id}
                id={server.id}
                name={server.name}
                initials={server.initials}
                memberCount={server.memberCount}
                botInstalled={server.botInstalled}
                isSelected={selectedServerId === server.id}
                onSelect={() => setSelectedServerId(server.id)}
                color={server.color}
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
        </div>
      </main>
    </div>
  );
}
