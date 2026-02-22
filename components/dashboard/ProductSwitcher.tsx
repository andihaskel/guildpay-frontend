'use client';

import { useState } from 'react';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { useProduct } from '@/contexts';
import { cn } from '@/lib/utils';

export function ProductSwitcher() {
  const { products, currentProduct, setCurrentProductId } = useProduct();
  const [open, setOpen] = useState(false);

  if (!currentProduct) {
    return (
      <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card hover:bg-accent transition-colors">
        <Plus className="h-4 w-4" />
        <span className="text-sm font-medium">Add Server</span>
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card hover:bg-accent transition-colors min-w-[200px]"
      >
        {currentProduct.guildIcon ? (
          <img
            src={`https://cdn.discordapp.com/icons/${currentProduct.guildId}/${currentProduct.guildIcon}.png`}
            alt={currentProduct.guildName}
            className="h-6 w-6 rounded"
          />
        ) : (
          <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
            <span className="text-xs text-primary-foreground font-medium">
              {currentProduct.guildName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <span className="text-sm font-medium flex-1 text-left truncate">
          {currentProduct.guildName}
        </span>
        <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-lg border border-border bg-popover shadow-lg">
            <div className="p-2 space-y-1">
              {products.map((product) => {
                const isSelected = product.id === currentProduct.id;
                return (
                  <button
                    key={product.id}
                    onClick={() => {
                      setCurrentProductId(product.id);
                      setOpen(false);
                    }}
                    className={cn(
                      'flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm transition-colors',
                      isSelected
                        ? 'bg-accent text-accent-foreground'
                        : 'hover:bg-accent/50'
                    )}
                  >
                    {product.guildIcon ? (
                      <img
                        src={`https://cdn.discordapp.com/icons/${product.guildId}/${product.guildIcon}.png`}
                        alt={product.guildName}
                        className="h-5 w-5 rounded"
                      />
                    ) : (
                      <div className="h-5 w-5 rounded bg-primary flex items-center justify-center">
                        <span className="text-xs text-primary-foreground font-medium">
                          {product.guildName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <span className="flex-1 text-left truncate">
                      {product.guildName}
                    </span>
                    {isSelected && <Check className="h-4 w-4" />}
                  </button>
                );
              })}
            </div>
            <div className="border-t border-border p-2">
              <button className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm hover:bg-accent/50 transition-colors">
                <Plus className="h-4 w-4" />
                <span>Add Server</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
