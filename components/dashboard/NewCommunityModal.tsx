'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { X, Upload, Loader as Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useCommunity } from '@/contexts/CommunityContext';

const SWATCHES = [
  '#5865f2', '#7c3aed', '#2f9d6b', '#d97706',
  '#dc2626', '#0891b2', '#db2777', '#475569',
];

function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export function NewCommunityModal({ open, onClose }: Props) {
  const router = useRouter();
  const { refetchCommunities, setCurrentCommunityId } = useCommunity();

  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManual, setSlugManual] = useState(false);
  const [selectedColor, setSelectedColor] = useState(SWATCHES[0]);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Open/close animation
  useEffect(() => {
    if (open) {
      setMounted(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 260);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Reset form on open
  useEffect(() => {
    if (open) {
      setName('');
      setDescription('');
      setSlug('');
      setSlugManual(false);
      setSelectedColor(SWATCHES[0]);
      setLogoFile(null);
      setLogoPreview(null);
      setError('');
      setLoading(false);
    }
  }, [open]);

  // Auto-slug from name
  useEffect(() => {
    if (!slugManual) {
      setSlug(slugify(name));
    }
  }, [name, slugManual]);

  // Escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, handleKeyDown]);

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    const url = URL.createObjectURL(file);
    setLogoPreview(url);
  }

  function handleRemoveLogo() {
    setLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleSlugChange(val: string) {
    setSlugManual(true);
    setSlug(slugify(val) || val.toLowerCase().replace(/[^a-z0-9-]/g, ''));
  }

  const isNameValid = name.trim().length >= 2;
  const isSlugValid = slug.length >= 2 && /^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(slug);
  const canSubmit = isNameValid && isSlugValid && !loading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError('');
    try {
      let logoUrl: string | undefined;

      if (logoFile) {
        try {
          // presign not tied to a community yet — skip silently if not available
          // logo_url is optional
        } catch {}
      }

      const community = await api.createCommunity({
        name: name.trim(),
        description: description.trim() || undefined,
        logo_url: logoUrl,
      });

      await refetchCommunities();
      setCurrentCommunityId(community.id);
      onClose();
      router.push(`/dashboard/community/${community.id}`);
    } catch (err: any) {
      setError(err?.message || 'Failed to create community. Please try again.');
      setLoading(false);
    }
  }

  if (!mounted) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
        background: visible ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0)',
        backdropFilter: visible ? 'blur(6px)' : 'blur(0px)',
        WebkitBackdropFilter: visible ? 'blur(6px)' : 'blur(0px)',
        transition: 'background 260ms ease, backdrop-filter 260ms ease',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: 'var(--surface-1)',
          border: '0.5px solid var(--border)',
          borderRadius: '14px',
          width: '100%',
          maxWidth: '480px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          overflow: 'hidden',
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.97)',
          opacity: visible ? 1 : 0,
          transition: 'transform 260ms cubic-bezier(0.16,1,0.3,1), opacity 260ms ease',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 22px 16px',
          borderBottom: '0.5px solid var(--border-soft)',
        }}>
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', margin: 0, letterSpacing: '-0.01em' }}>New community</h2>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '2px 0 0' }}>Set up your community workspace</p>
          </div>
          <button
            onClick={onClose}
            style={{ padding: '6px', borderRadius: '6px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', transition: 'color 160ms ease, background 160ms ease' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLElement).style.background = 'none'; }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ padding: '20px 22px 22px', display: 'flex', flexDirection: 'column', gap: '18px' }}>

          {/* Logo + color row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            {/* Preview circle */}
            <div style={{ flexShrink: 0 }}>
              <div
                style={{
                  width: '56px', height: '56px', borderRadius: '12px',
                  background: logoPreview ? 'transparent' : selectedColor,
                  overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '0.5px solid var(--border)', flexShrink: 0,
                }}
              >
                {logoPreview
                  ? <img src={logoPreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontSize: '22px', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>
                      {name.trim()[0]?.toUpperCase() || 'A'}
                    </span>
                }
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoChange} />
              <div style={{ display: 'flex', gap: '5px', marginTop: '7px' }}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', border: '0.5px solid var(--border)', background: 'none', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'background 160ms ease' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'none')}
                >
                  Upload
                </button>
                {logoPreview && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', border: '0.5px solid var(--border)', background: 'none', color: '#e06a6a', cursor: 'pointer' }}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            {/* Color swatches */}
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '11.5px', fontWeight: 500, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Color</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '6px' }}>
                {SWATCHES.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    style={{
                      width: '28px', height: '28px', borderRadius: '6px',
                      background: color, border: 'none', cursor: 'pointer',
                      outline: selectedColor === color ? `2px solid ${color}` : '2px solid transparent',
                      outlineOffset: '2px',
                      transition: 'outline 120ms ease, transform 120ms ease',
                      transform: selectedColor === color ? 'scale(1.1)' : 'scale(1)',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Name */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>Name <span style={{ color: '#e06a6a' }}>*</span></label>
              <span style={{ fontSize: '11px', color: name.length > 36 ? '#e06a6a' : 'var(--text-muted)' }}>{name.length}/40</span>
            </div>
            <input
              type="text"
              value={name}
              maxLength={40}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Trading Mastermind"
              autoFocus
              style={{
                width: '100%', padding: '9px 12px', borderRadius: '7px',
                background: 'var(--surface-2)', border: '0.5px solid var(--border)',
                color: 'var(--text)', fontSize: '13.5px', outline: 'none',
                transition: 'border-color 160ms ease',
                boxSizing: 'border-box',
              }}
              onFocus={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)')}
              onBlur={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--border)')}
            />
          </div>

          {/* Description */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>Description <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
              <span style={{ fontSize: '11px', color: description.length > 110 ? '#e06a6a' : 'var(--text-muted)' }}>{description.length}/120</span>
            </div>
            <textarea
              value={description}
              maxLength={120}
              onChange={e => setDescription(e.target.value)}
              placeholder="Short description of your community"
              rows={2}
              style={{
                width: '100%', padding: '9px 12px', borderRadius: '7px',
                background: 'var(--surface-2)', border: '0.5px solid var(--border)',
                color: 'var(--text)', fontSize: '13.5px', outline: 'none',
                resize: 'none', lineHeight: '1.5',
                transition: 'border-color 160ms ease',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
              }}
              onFocus={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)')}
              onBlur={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--border)')}
            />
          </div>

          {/* Slug */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>URL slug</label>
              {slug.length >= 2 && !isSlugValid && (
                <span style={{ fontSize: '11px', color: '#e06a6a' }}>Only lowercase letters, numbers, hyphens</span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', borderRadius: '7px', background: 'var(--surface-2)', border: '0.5px solid var(--border)', overflow: 'hidden', transition: 'border-color 160ms ease' }}
              onFocusCapture={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onBlurCapture={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              <span style={{ padding: '9px 0 9px 12px', fontSize: '13px', color: 'var(--text-muted)', whiteSpace: 'nowrap', userSelect: 'none', flexShrink: 0 }}>accessgate.io/</span>
              <input
                type="text"
                value={slug}
                onChange={e => handleSlugChange(e.target.value)}
                placeholder="your-slug"
                style={{
                  flex: 1, padding: '9px 12px 9px 2px',
                  background: 'transparent', border: 'none', outline: 'none',
                  color: 'var(--text)', fontSize: '13.5px',
                }}
              />
            </div>
          </div>

          {error && (
            <div style={{ fontSize: '12.5px', color: '#e06a6a', background: 'rgba(224,106,106,0.08)', border: '0.5px solid rgba(224,106,106,0.2)', borderRadius: '6px', padding: '9px 12px' }}>
              {error}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', paddingTop: '2px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 500, background: 'none', border: '0.5px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'background 160ms ease, color 160ms ease' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLElement).style.color = 'var(--text)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              style={{
                padding: '8px 18px', borderRadius: '6px', fontSize: '13px', fontWeight: 500,
                background: canSubmit ? '#fff' : 'rgba(255,255,255,0.12)',
                color: canSubmit ? '#0a0a0a' : 'rgba(255,255,255,0.3)',
                border: 'none', cursor: canSubmit ? 'pointer' : 'not-allowed',
                transition: 'background 160ms ease, color 160ms ease, opacity 160ms ease',
                display: 'inline-flex', alignItems: 'center', gap: '6px',
              }}
            >
              {loading && <Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} />}
              Create community
            </button>
          </div>
        </form>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
