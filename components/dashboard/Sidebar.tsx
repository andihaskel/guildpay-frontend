'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Chrome as HomeIcon, Users, ChartBar as BarChart3, CreditCard, Settings, ChevronDown, Plus, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useProduct } from '@/contexts';

const navigation = [
  { name: 'Home', href: '/dashboard/home', icon: HomeIcon },
  { name: 'Pages', href: '/dashboard/pages', icon: FileText },
  { name: 'Members', href: '/dashboard/members', icon: Users },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { products, currentProduct, setCurrentProductId, isLoading } = useProduct();
  const [isProductOpen, setIsProductOpen] = useState(false);

  const getProductInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };

  const getProductColor = (index: number) => {
    const colors = ['#C084FC', '#3B82F6', '#F97316', '#10B981', '#A855F7', '#EC4899'];
    return colors[index % colors.length];
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-border bg-card/50 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-6 border-b border-border">
        <Link href="/dashboard/home" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <svg className="w-5 h-5 text-primary-foreground" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
          </div>
          <span className="font-semibold">GuildPay</span>
        </Link>
      </div>

      <div className="p-3">
        {isLoading ? (
          <div className="w-full h-12 rounded-lg bg-accent/50 animate-pulse" />
        ) : currentProduct ? (
          <>
            <Button
              variant="ghost"
              className="w-full justify-between h-auto p-3 hover:bg-accent/50"
              onClick={() => setIsProductOpen(!isProductOpen)}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{currentProduct.guildName || currentProduct.name}</p>
                </div>
              </div>
              <ChevronDown className={cn("h-4 w-4 transition-transform", isProductOpen && "rotate-180")} />
            </Button>

            {isProductOpen && (
              <div className="mt-2 space-y-1 ml-2 pl-4 border-l border-border">
                {products.filter(p => p.id !== currentProduct.id).map((product, index) => (
                  <button
                    key={product.id}
                    onClick={() => {
                      setCurrentProductId(product.id);
                      setIsProductOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-accent/50 transition-colors flex items-center gap-3"
                  >
                    <div
                      className="w-7 h-7 rounded flex items-center justify-center text-xs font-semibold text-white"
                      style={{ backgroundColor: getProductColor(index + 1) }}
                    >
                      {getProductInitials(product.guildName || product.name)}
                    </div>
                    <span className="text-muted-foreground truncate">{product.guildName || product.name}</span>
                  </button>
                ))}
                <button
                  onClick={() => router.push('/select-server')}
                  className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-accent/50 transition-colors flex items-center gap-3 text-primary"
                >
                  <div className="w-7 h-7 rounded bg-primary/10 flex items-center justify-center">
                    <Plus className="h-4 w-4" />
                  </div>
                  <span className="font-medium">Create Product</span>
                </button>
              </div>
            )}
          </>
        ) : (
          <Button
            variant="outline"
            className="w-full justify-start h-auto p-3"
            onClick={() => router.push('/select-server')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Product
          </Button>
        )}
      </div>

      <nav className="flex flex-col gap-1 px-3 mt-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
