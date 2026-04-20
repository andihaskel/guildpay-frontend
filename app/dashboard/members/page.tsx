'use client';

import { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Filter, Share2, Copy, Check, Users, ChevronDown } from 'lucide-react';
import { useProduct } from '@/contexts';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { api } from '@/lib/api';
import { Member, Role } from '@/lib/types';

export default function MembersPage() {
  const { currentProduct } = useProduct();
  const [searchQuery, setSearchQuery] = useState('');
  const [pageFilter, setPageFilter] = useState<string>('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('');
  const [accessStatusFilter, setAccessStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [members, setMembers] = useState<Member[]>([]);
  const [totalMembers, setTotalMembers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [pages, setPages] = useState<any[]>([]);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const membersPerPage = 20;

  useEffect(() => {
    if (currentProduct?.id) {
      loadPages();
    }
  }, [currentProduct?.id]);

  useEffect(() => {
    if (currentProduct?.id) {
      loadMembers();
    }
  }, [currentProduct?.id, currentPage, searchQuery, pageFilter, paymentStatusFilter, accessStatusFilter]);

  const loadPages = async () => {
    if (!currentProduct?.id) return;

    try {
      const pagesData = await api.getPages(currentProduct.id);
      setPages(pagesData);
    } catch (error) {
      console.error('Failed to load pages:', error);
    }
  };

  const loadMembers = async () => {
    if (!currentProduct?.id) return;

    try {
      setIsLoading(true);
      const params: {
        page: number;
        limit: number;
        page_id?: string;
        payment_status?: string;
        access_status?: string;
        email?: string;
        sort_by?: string;
        sort_order?: 'asc' | 'desc';
      } = {
        page: currentPage,
        limit: membersPerPage,
        sort_by: 'created_at',
        sort_order: 'desc',
      };

      if (pageFilter) params.page_id = pageFilter;
      if (paymentStatusFilter) params.payment_status = paymentStatusFilter;
      if (accessStatusFilter) params.access_status = accessStatusFilter;
      if (searchQuery) params.email = searchQuery;

      const response = await api.getMembers(currentProduct.id, params);
      setMembers(response.members);
      setTotalMembers(response.total);
    } catch (error) {
      console.error('Failed to load members:', error);
      setMembers([]);
      setTotalMembers(0);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return `$${(price / 100).toFixed(2)}`;
  };

  const totalPages = Math.ceil(totalMembers / membersPerPage);


  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handlePaymentStatusFilter = (status: string) => {
    setPaymentStatusFilter(status === paymentStatusFilter ? '' : status);
    setCurrentPage(1);
  };

  const handleAccessStatusFilter = (status: string) => {
    setAccessStatusFilter(status === accessStatusFilter ? '' : status);
    setCurrentPage(1);
  };

  const handlePageFilter = (pageId: string) => {
    setPageFilter(pageId === pageFilter ? '' : pageId);
    setCurrentPage(1);
  };

  const handleShareClick = (member: Member) => {
    setSelectedMember(member);
    setShareDialogOpen(true);
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getSelectedPageName = () => {
    if (!pageFilter) return 'All Pages';
    const page = pages.find((p) => p.id === pageFilter);
    return page?.offer_name || 'All Pages';
  };

  const getSelectedPaymentStatusName = () => {
    if (!paymentStatusFilter) return 'Payment Status';
    return paymentStatusFilter.charAt(0).toUpperCase() + paymentStatusFilter.slice(1);
  };

  const getSelectedAccessStatusName = () => {
    if (!accessStatusFilter) return 'Access Status';
    return accessStatusFilter.charAt(0).toUpperCase() + accessStatusFilter.slice(1);
  };

  const paymentChip = (status: string) => {
    const map: Record<string, { bg: string; border: string; color: string; label: string }> = {
      active:    { bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.2)',   color: '#4ade80', label: 'Active' },
      trialing:  { bg: 'var(--accent-soft-bg)', border: 'var(--accent-soft-border)', color: 'var(--accent-soft-text)', label: 'Trialing' },
      canceling: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)',  color: '#fbbf24', label: 'Canceling' },
      free:      { bg: 'rgba(255,255,255,0.04)', border: 'var(--border)',        color: 'var(--text-muted)', label: 'Free' },
    };
    const s = map[status] || { bg: 'rgba(255,255,255,0.04)', border: 'var(--border)', color: 'var(--text-muted)', label: status };
    return (
      <span style={{ fontSize: '11px', fontWeight: 500, padding: '2px 7px', borderRadius: '20px', background: s.bg, border: `0.5px solid ${s.border}`, color: s.color }}>
        {s.label}
      </span>
    );
  };

  const accessChip = (status: string) => {
    const map: Record<string, { bg: string; border: string; color: string; label: string }> = {
      active:     { bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.2)',   color: '#4ade80', label: 'Active' },
      onboarding: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)',  color: '#fbbf24', label: 'Onboarding' },
      free:       { bg: 'rgba(255,255,255,0.04)', border: 'var(--border)',        color: 'var(--text-muted)', label: 'Free' },
    };
    const s = map[status] || { bg: 'rgba(255,255,255,0.04)', border: 'var(--border)', color: 'var(--text-muted)', label: status };
    return (
      <span style={{ fontSize: '11px', fontWeight: 500, padding: '2px 7px', borderRadius: '20px', background: s.bg, border: `0.5px solid ${s.border}`, color: s.color }}>
        {s.label}
      </span>
    );
  };

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 500, color: 'var(--text)', margin: '0 0 4px', letterSpacing: '-0.015em' }}>
          Members
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
          Manage subscribers for this server.
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1', maxWidth: '320px', minWidth: '200px' }}>
          <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <input
            placeholder="Search by email..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            style={{
              width: '100%', padding: '7px 12px 7px 30px', borderRadius: '6px', fontSize: '13px',
              background: 'var(--surface-1)', border: '0.5px solid var(--border)', color: 'var(--text)',
              outline: 'none', transition: 'border-color 180ms ease',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          />
        </div>

        {[
          { label: getSelectedPageName(), items: [{ label: 'All Pages', val: '' }, ...(pages?.map(p => ({ label: p.offer_name, val: p.id })) || [])], onChange: handlePageFilter, active: !!pageFilter },
          { label: getSelectedPaymentStatusName(), items: [{ label: 'All', val: '' }, { label: 'Active', val: 'active' }, { label: 'Trialing', val: 'trialing' }, { label: 'Canceling', val: 'canceling' }, { label: 'Free', val: 'free' }], onChange: handlePaymentStatusFilter, active: !!paymentStatusFilter },
          { label: getSelectedAccessStatusName(), items: [{ label: 'All', val: '' }, { label: 'Active', val: 'active' }, { label: 'Onboarding', val: 'onboarding' }, { label: 'Free', val: 'free' }], onChange: handleAccessStatusFilter, active: !!accessStatusFilter },
        ].map((filter, fi) => (
          <FilterDropdown key={fi} label={filter.label} items={filter.items} onChange={filter.onChange} active={filter.active} />
        ))}
      </div>

      <div style={{ background: 'var(--surface-1)', border: '0.5px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ height: '56px', borderBottom: '0.5px solid var(--border-soft)', background: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent' }} />
            ))}
          </div>
        ) : totalMembers === 0 ? (
          <div style={{ padding: '64px 24px', textAlign: 'center' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Users size={16} style={{ color: 'var(--text-muted)' }} />
            </div>
            <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', margin: '0 0 6px' }}>No members yet</p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>Members will appear here when they subscribe to your roles</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '0.5px solid var(--border-soft)' }}>
                  {['Email', 'Role', 'Price', 'Payment', 'Access', 'Renewal', ''].map((h, i) => (
                    <th key={i} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {members?.map((member) => (
                  <tr key={member.id} style={{ borderBottom: '0.5px solid var(--border-soft)', transition: 'background 120ms ease' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.015)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: member.discord_user_id ? '3px' : 0 }}>{member.email}</div>
                      {member.discord_user_id && (
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Discord: {member.discord_user_id}</div>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{member.role_name || '—'}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>{formatPrice(member.price)}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>{paymentChip(member.payment_status)}</td>
                    <td style={{ padding: '12px 16px' }}>{accessChip(member.access_status)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>{formatDate(member.current_period_end)}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {member.access_status === 'onboarding' && member.discord_connect_url && (
                        <button
                          onClick={() => handleShareClick(member)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '5px',
                            fontSize: '12px', fontWeight: 500, padding: '5px 10px', borderRadius: '5px',
                            background: 'none', border: '0.5px solid var(--border)', color: 'var(--text-secondary)',
                            cursor: 'pointer', transition: 'all 180ms ease',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--text)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                        >
                          <Share2 size={12} />
                          Share
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!isLoading && totalMembers > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px' }}>
          <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
            Showing {(currentPage - 1) * membersPerPage + 1}–{Math.min(currentPage * membersPerPage, totalMembers)} of {totalMembers} members
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              style={{ width: '30px', height: '30px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: '0.5px solid var(--border)', color: 'var(--text-muted)', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.4 : 1, transition: 'all 180ms ease' }}
            >
              <ChevronLeft size={13} />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let p = i + 1;
              if (totalPages > 5) {
                if (currentPage <= 3) p = i + 1;
                else if (currentPage >= totalPages - 2) p = totalPages - 4 + i;
                else p = currentPage - 2 + i;
              }
              if (p < 1 || p > totalPages) return null;
              return (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  style={{
                    width: '30px', height: '30px', borderRadius: '6px', fontSize: '12.5px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: currentPage === p ? 'var(--surface-2)' : 'none',
                    border: `0.5px solid ${currentPage === p ? 'var(--border-strong)' : 'var(--border)'}`,
                    color: currentPage === p ? 'var(--text)' : 'var(--text-muted)', cursor: 'pointer', transition: 'all 180ms ease',
                  }}
                >{p}</button>
              );
            })}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              style={{ width: '30px', height: '30px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: '0.5px solid var(--border)', color: 'var(--text-muted)', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.4 : 1, transition: 'all 180ms ease' }}
            >
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}

      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent style={{ background: 'var(--surface-1)', border: '0.5px solid var(--border)', maxWidth: '480px' }}>
          <DialogHeader>
            <DialogTitle style={{ color: 'var(--text)' }}>Share Discord Connection Link</DialogTitle>
            <DialogDescription style={{ color: 'var(--text-muted)' }}>
              This member has completed payment but hasn't connected their Discord account yet.
            </DialogDescription>
          </DialogHeader>
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ padding: '12px', background: 'var(--accent-soft-bg)', border: '0.5px solid var(--accent-soft-border)', borderRadius: '8px' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                Send this link to <strong style={{ color: 'var(--text)' }}>{selectedMember?.email}</strong> so they can connect their Discord account and gain access to the server.
              </p>
            </div>
            {selectedMember?.discord_connect_url && (
              <div>
                <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 8px' }}>Discord Connect Link</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    value={selectedMember.discord_connect_url}
                    readOnly
                    style={{
                      flex: 1, padding: '8px 12px', borderRadius: '6px', fontSize: '12px',
                      background: 'var(--surface-2)', border: '0.5px solid var(--border)',
                      color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', outline: 'none',
                    }}
                  />
                  <button
                    onClick={() => copyToClipboard(selectedMember.discord_connect_url!, 'discord')}
                    style={{
                      padding: '8px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 500,
                      background: copiedField === 'discord' ? 'rgba(34,197,94,0.1)' : 'var(--surface-2)',
                      border: `0.5px solid ${copiedField === 'discord' ? 'rgba(34,197,94,0.3)' : 'var(--border-strong)'}`,
                      color: copiedField === 'discord' ? '#4ade80' : 'var(--text)', cursor: 'pointer', flexShrink: 0,
                      display: 'flex', alignItems: 'center', gap: '5px', transition: 'all 180ms ease',
                    }}
                  >
                    {copiedField === 'discord' ? <Check size={12} /> : <Copy size={12} />}
                    {copiedField === 'discord' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '8px 0 0', lineHeight: 1.5 }}>
                  Once they click this link and authorize Discord, they'll automatically receive their role and access.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface FilterDropdownProps {
  label: string;
  items: { label: string; val: string }[];
  onChange: (val: string) => void;
  active: boolean;
}

function FilterDropdown({ label, items, onChange, active }: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px',
          borderRadius: '6px', fontSize: '12.5px', fontWeight: 500, cursor: 'pointer',
          background: active ? 'var(--surface-2)' : 'var(--surface-1)',
          border: `0.5px solid ${active ? 'var(--border-strong)' : 'var(--border)'}`,
          color: active ? 'var(--text)' : 'var(--text-secondary)',
          transition: 'all 180ms ease',
        }}
      >
        <Filter size={12} />
        {label}
        <ChevronDown size={11} style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 180ms ease' }} />
      </button>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 30 }} onClick={() => setOpen(false)} />
          <div style={{
            position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 40,
            background: 'var(--surface-1)', border: '0.5px solid var(--border)', borderRadius: '8px',
            minWidth: '160px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.4)', padding: '4px',
          }}>
            {items.map(item => (
              <button
                key={item.val}
                onClick={() => { onChange(item.val); setOpen(false); }}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '7px 10px', borderRadius: '5px', fontSize: '13px',
                  background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer',
                  transition: 'background 120ms ease, color 120ms ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--text)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
