'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Eye, Copy, Share2, CircleHelp as HelpCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AccessPage } from '@/lib/types';

interface AccessPageListItemProps {
  page: AccessPage;
}

export function AccessPageListItem({ page }: AccessPageListItemProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const pageUrl = page.public_path ? `${baseUrl}${page.public_path}` : `${baseUrl}/p/${page.slug}`;
  const pageStatus = page.status ?? (page.accepts_signups === false ? 'disabled' : 'active');
  const isDisabled = pageStatus === 'disabled';
  const isPaymentConfigRequired = pageStatus === 'payment_config_required';
  const dimmed = isDisabled || isPaymentConfigRequired;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(pageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEdit = () => {
    router.push(`/dashboard/pages/edit?id=${page.id}`);
  };

  const iconBtn = {
    width: '30px', height: '30px', borderRadius: '6px',
    background: 'none', border: '0.5px solid var(--border)',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--text-muted)', transition: 'background 180ms ease, color 180ms ease, border-color 180ms ease',
  } as React.CSSProperties;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '48px 1fr auto auto',
      alignItems: 'center',
      gap: '16px',
      padding: '14px 16px',
      background: 'var(--surface-1)',
      border: '0.5px solid var(--border)',
      borderRadius: '10px',
      opacity: dimmed ? 0.55 : 1,
      transition: 'border-color 180ms ease',
    }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
    >
      <div style={{
        width: '48px', height: '48px', borderRadius: '8px', overflow: 'hidden',
        background: 'var(--surface-2)', border: '0.5px solid var(--border)', flexShrink: 0,
      }}>
        {page.hero_image_url ? (
          <img src={page.hero_image_url} alt={page.offer_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'var(--surface-2)' }} />
        )}
      </div>

      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--text)', whiteSpace: 'nowrap' }}>
            {page.offer_name}
          </span>

          {isDisabled && (
            <span style={{
              fontSize: '11px', fontWeight: 500, padding: '2px 7px', borderRadius: '20px',
              background: 'rgba(239,68,68,0.1)', border: '0.5px solid rgba(239,68,68,0.25)', color: '#f87171',
            }}>
              Disabled
            </span>
          )}
          {isPaymentConfigRequired && (
            <span style={{
              fontSize: '11px', fontWeight: 500, padding: '2px 7px', borderRadius: '20px',
              background: 'rgba(245,158,11,0.1)', border: '0.5px solid rgba(245,158,11,0.25)', color: '#fbbf24',
              display: 'flex', alignItems: 'center', gap: '4px',
            }}>
              <HelpCircle size={10} />
              Payment config required
            </span>
          )}

          <span style={{
            fontSize: '11px', fontWeight: 500, padding: '2px 7px', borderRadius: '20px',
            background: 'rgba(34,197,94,0.08)', border: '0.5px solid rgba(34,197,94,0.2)', color: '#4ade80',
          }}>
            Active {page.member_counts.active}
          </span>
          <span style={{
            fontSize: '11px', fontWeight: 500, padding: '2px 7px', borderRadius: '20px',
            background: 'var(--accent-soft-bg)', border: '0.5px solid var(--accent-soft-border)', color: 'var(--accent-soft-text)',
          }}>
            Trialing {page.member_counts.trialing}
          </span>
          {page.member_counts.canceling > 0 && (
            <span style={{
              fontSize: '11px', fontWeight: 500, padding: '2px 7px', borderRadius: '20px',
              background: 'rgba(245,158,11,0.08)', border: '0.5px solid rgba(245,158,11,0.2)', color: '#fbbf24',
            }}>
              Canceling {page.member_counts.canceling}
            </span>
          )}
        </div>

        <div
          style={{
            display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
            fontSize: '12px', color: copied ? '#4ade80' : 'var(--text-muted)',
            transition: 'color 180ms ease',
          }}
          onClick={handleCopy}
          title="Click to copy link"
        >
          <Copy size={11} style={{ flexShrink: 0 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '340px' }}>
            {copied ? 'Copied!' : pageUrl}
          </span>
        </div>
      </div>

      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-mono)', letterSpacing: '-0.03em' }}>
          ${(page.monthly_amount_minor / 100).toFixed(2)}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>/month</div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
        <button
          style={iconBtn}
          onClick={() => window.open(pageUrl, '_blank')}
          title="Preview page"
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
        >
          <Eye size={13} />
        </button>
        <button
          style={iconBtn}
          onClick={handleEdit}
          title="Edit page"
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
        >
          <Pencil size={13} />
        </button>
        <button
          style={{ ...iconBtn, opacity: dimmed ? 0.4 : 1, cursor: dimmed ? 'not-allowed' : 'pointer' }}
          onClick={() => !dimmed && setShareDialogOpen(true)}
          title="Share page"
          disabled={dimmed}
          onMouseEnter={e => { if (!dimmed) { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; } }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
        >
          <Share2 size={13} />
        </button>
      </div>

      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent style={{ background: 'var(--surface-1)', border: '0.5px solid var(--border)' }}>
          <DialogHeader>
            <DialogTitle style={{ color: 'var(--text)' }}>Share access page</DialogTitle>
            <DialogDescription style={{ color: 'var(--text-muted)' }}>
              Share this link with your community to allow them to purchase access to {page.offer_name}.
            </DialogDescription>
          </DialogHeader>
          <div style={{ marginTop: '16px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px',
              background: 'var(--surface-2)', border: '0.5px solid var(--border)', borderRadius: '8px',
            }}>
              <code style={{ fontSize: '12px', color: 'var(--text-secondary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)' }}>
                {pageUrl}
              </code>
              <button
                onClick={handleCopy}
                style={{
                  fontSize: '12px', fontWeight: 500, padding: '5px 10px', borderRadius: '6px',
                  background: copied ? 'rgba(34,197,94,0.1)' : 'var(--surface-1)',
                  border: `0.5px solid ${copied ? 'rgba(34,197,94,0.3)' : 'var(--border-strong)'}`,
                  color: copied ? '#4ade80' : 'var(--text)', cursor: 'pointer', flexShrink: 0,
                  transition: 'all 180ms ease',
                }}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
