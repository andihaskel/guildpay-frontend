'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, FileText, Grid3x3, List } from 'lucide-react';
import { useProduct } from '@/contexts';
import { AccessPageCard } from '@/components/dashboard/AccessPageCard';
import { AccessPageListItem } from '@/components/dashboard/AccessPageListItem';
import { AccessPage } from '@/lib/types';
import { api } from '@/lib/api';

type ViewMode = 'grid' | 'list';

export default function PagesPage() {
  const router = useRouter();
  const { currentProduct } = useProduct();
  const [isLoading, setIsLoading] = useState(true);
  const [pages, setPages] = useState<AccessPage[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  useEffect(() => {
    if (currentProduct?.id) {
      loadPages();
    }
  }, [currentProduct?.id]);

  const loadPages = async () => {
    if (!currentProduct?.id) return;
    try {
      setIsLoading(true);
      const pagesData = await api.getPages(currentProduct.id);
      setPages(pagesData);
    } catch (error) {
      console.error('Failed to load pages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const iconToggle = (active: boolean) => ({
    width: '28px', height: '28px', borderRadius: '5px',
    background: active ? 'var(--surface-2)' : 'none',
    border: active ? '0.5px solid var(--border-strong)' : '0.5px solid transparent',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: active ? 'var(--text)' : 'var(--text-muted)',
    transition: 'all 180ms ease',
  } as React.CSSProperties);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 500, color: 'var(--text)', margin: '0 0 4px', letterSpacing: '-0.015em' }}>
            Access Pages
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
            Manage your community access pages
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {!isLoading && pages.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px', background: 'var(--surface-1)', border: '0.5px solid var(--border)', borderRadius: '7px' }}>
              <button style={iconToggle(viewMode === 'grid')} onClick={() => setViewMode('grid')} title="Grid view">
                <Grid3x3 size={13} />
              </button>
              <button style={iconToggle(viewMode === 'list')} onClick={() => setViewMode('list')} title="List view">
                <List size={13} />
              </button>
            </div>
          )}
          <button
            onClick={() => router.push('/dashboard/pages/edit')}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '13px', fontWeight: 500, padding: '7px 14px', borderRadius: '6px',
              background: 'var(--text)', color: 'var(--bg)',
              border: 'none', cursor: 'pointer', transition: 'opacity 180ms ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            <Plus size={13} />
            Create page
          </button>
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ height: '76px', borderRadius: '10px', background: 'var(--surface-1)', border: '0.5px solid var(--border)' }} />
          ))}
        </div>
      ) : pages.length === 0 ? (
        <div style={{
          padding: '64px 24px', textAlign: 'center',
          background: 'var(--surface-1)', border: '0.5px solid var(--border)', borderRadius: '10px',
        }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '8px',
            background: 'var(--accent-soft-bg)', border: '0.5px solid var(--accent-soft-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px',
          }}>
            <FileText size={16} style={{ color: 'var(--accent-soft-text)' }} />
          </div>
          <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', margin: '0 0 6px' }}>
            Create your first access page
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 20px', maxWidth: '340px', marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.5 }}>
            Set up a page where your community members can purchase access to exclusive content and perks
          </p>
          <button
            onClick={() => router.push('/dashboard/pages/edit')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              fontSize: '13px', fontWeight: 500, padding: '8px 16px', borderRadius: '6px',
              background: 'var(--text)', color: 'var(--bg)', cursor: 'pointer',
              border: 'none', transition: 'opacity 180ms ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            <Plus size={13} />
            Create page
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {pages.map((page, index) => (
            <AccessPageCard
              key={page.id}
              page={page}
              gradientClass={['bg-gradient-to-br from-amber-700 via-amber-800 to-stone-800', 'bg-gradient-to-br from-stone-700 via-stone-800 to-zinc-800', 'bg-gradient-to-br from-orange-800 via-stone-800 to-zinc-900'][index % 3]}
            />
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {pages.map((page) => (
            <AccessPageListItem key={page.id} page={page} />
          ))}
        </div>
      )}
    </div>
  );
}
