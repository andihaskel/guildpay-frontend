'use client';

import { useState } from 'react';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { useProduct } from '@/contexts';
import { cn } from '@/lib/utils';

const DISCORD_CLIENT_ID = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID!;
const API_URL = process.env.NEXT_PUBLIC_API_URL!;
const BOT_PERMISSIONS = process.env.NEXT_PUBLIC_DISCORD_BOT_PERMISSIONS || '8';

function buildDiscordBotUrl() {
  const redirectUri = encodeURIComponent(`${API_URL}/discord/bot-callback`);
  return (
    `https://discord.com/oauth2/authorize` +
    `?client_id=${DISCORD_CLIENT_ID}` +
    `&scope=bot%20applications.commands` +
    `&permissions=${BOT_PERMISSIONS}` +
    `&response_type=code` +
    `&redirect_uri=${redirectUri}`
  );
}

function GuildAvatar({
  guildIcon,
  guildId,
  name,
  size = 'md',
}: {
  guildIcon?: string;
  guildId: string;
  name: string;
  size?: 'sm' | 'md';
}) {
  const dim = size === 'sm' ? 'h-5 w-5' : 'h-6 w-6';
  const text = size === 'sm' ? 'text-[10px]' : 'text-xs';
  if (guildIcon) {
    return (
      <img
        src={`https://cdn.discordapp.com/icons/${guildId}/${guildIcon}.png`}
        alt={name}
        className={`${dim} rounded object-cover`}
      />
    );
  }
  return (
    <div className={`${dim} rounded bg-primary flex items-center justify-center shrink-0`}>
      <span className={`${text} text-primary-foreground font-medium`}>
        {name.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}

function ConnectServerButton({ label = 'Connect new server' }: { label?: string }) {
  const handleClick = () => {
    window.location.href = buildDiscordBotUrl();
  };
  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm hover:bg-accent/50 transition-colors text-left"
    >
      <div className="h-5 w-5 rounded border border-dashed border-border flex items-center justify-center shrink-0">
        <Plus className="h-3 w-3 text-muted-foreground" />
      </div>
      <span className="text-muted-foreground">{label}</span>
    </button>
  );
}

export function ProductSwitcher() {
  const { products, currentProduct, setCurrentProductId } = useProduct();
  const [open, setOpen] = useState(false);

  if (!currentProduct) {
    return (
      <button
        onClick={() => { window.location.href = buildDiscordBotUrl(); }}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card hover:bg-accent transition-colors"
      >
        <Plus className="h-4 w-4" />
        <span className="text-sm font-medium">Add Server</span>
      </button>
    );
  }

  const displayName = currentProduct.guildName || currentProduct.name;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card hover:bg-accent transition-colors min-w-[200px]"
      >
        <GuildAvatar
          guildIcon={currentProduct.guildIcon}
          guildId={currentProduct.discord_guild_id}
          name={displayName}
        />
        <span className="text-sm font-medium flex-1 text-left truncate">{displayName}</span>
        <ChevronsUpDown className="h-4 w-4 text-muted-foreground shrink-0" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full left-0 right-0 mb-2 z-50 rounded-lg border border-border bg-popover shadow-lg overflow-hidden">
            {products.length > 0 && (
              <div className="p-2 space-y-0.5">
                {products.map((product) => {
                  const isSelected = product.id === currentProduct.id;
                  const name = product.guildName || product.name;
                  return (
                    <button
                      key={product.id}
                      onClick={() => {
                        setCurrentProductId(product.id);
                        setOpen(false);
                      }}
                      className={cn(
                        'flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm transition-colors',
                        isSelected ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
                      )}
                    >
                      <GuildAvatar
                        guildIcon={product.guildIcon}
                        guildId={product.discord_guild_id}
                        name={name}
                        size="sm"
                      />
                      <span className="flex-1 text-left truncate">{name}</span>
                      {isSelected && <Check className="h-4 w-4 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
            <div className={cn('p-2', products.length > 0 && 'border-t border-border')}>
              <ConnectServerButton label={products.length === 0 ? 'Connect your first server' : 'Connect new server'} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
