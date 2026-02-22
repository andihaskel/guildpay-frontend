'use client';

import { useState } from 'react';
import { Bell, LogOut, Settings, User } from 'lucide-react';
import { useAuth } from '@/contexts';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export function Topbar() {
  const { user } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-64 right-0 h-16 border-b border-border bg-background z-30">
      <div className="flex items-center justify-end h-full px-6">
        <div className="flex items-center gap-3">
          <button className="relative p-2 rounded-lg hover:bg-accent transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-primary rounded-full" />
          </button>

          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Avatar className="h-8 w-8">
                {user?.discordAvatar ? (
                  <AvatarImage
                    src={`https://cdn.discordapp.com/avatars/${user.discordId}/${user.discordAvatar}.png`}
                    alt={user.discordUsername || user.username}
                  />
                ) : null}
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-semibold">
                  {user?.discordUsername?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'SW'}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">
                {user?.discordUsername || user?.username || 'Sarah Wilson'}
              </span>
            </button>

            {userMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setUserMenuOpen(false)}
                />
                <div className="absolute top-full right-0 mt-2 w-56 z-50 rounded-lg border border-border bg-popover shadow-lg">
                  <div className="p-2 space-y-1">
                    <button className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm hover:bg-accent/50 transition-colors">
                      <Settings className="h-4 w-4" />
                      <span>Account Settings</span>
                    </button>
                    <button className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm text-destructive hover:bg-destructive/10 transition-colors">
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
