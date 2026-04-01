'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, LogOut, Settings, User, Menu } from 'lucide-react';
import { useAuth, useProduct } from '@/contexts';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface TopbarProps {
  onMenuClick?: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { currentProduct, isLoading } = useProduct();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleAccountSettings = () => {
    setUserMenuOpen(false);
    router.push('/dashboard/settings');
  };

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 border-b border-border bg-background z-30">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button className="relative p-2 rounded-lg hover:bg-accent transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-primary rounded-full" />
          </button>

          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="hover:opacity-80 transition-opacity"
            >
              <Avatar className="h-9 w-9">
                {user?.discordAvatar ? (
                  <AvatarImage
                    src={`https://cdn.discordapp.com/avatars/${user.discordId}/${user.discordAvatar}.png`}
                    alt={user.discordUsername || user.username}
                  />
                ) : null}
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-semibold">
                  {user?.email?.[0]?.toUpperCase() || user?.discordUsername?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </button>

            {userMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setUserMenuOpen(false)}
                />
                <div className="absolute top-full right-0 mt-2 w-64 z-50 rounded-lg border border-border bg-popover shadow-lg">
                  <div className="p-3 border-b border-border">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        {user?.discordAvatar ? (
                          <AvatarImage
                            src={`https://cdn.discordapp.com/avatars/${user.discordId}/${user.discordAvatar}.png`}
                            alt={user.discordUsername || user.username}
                          />
                        ) : null}
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-semibold">
                          {user?.email?.[0]?.toUpperCase() || user?.discordUsername?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        {(user?.discordUsername || user?.username) && (
                          <p className="font-medium text-sm truncate">
                            {user?.discordUsername || user?.username}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground truncate">
                          {user?.email || 'user@example.com'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-2 space-y-1">
                    <button
                      onClick={handleAccountSettings}
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm hover:bg-accent/50 transition-colors"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Account Settings</span>
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
