'use client';

import { useMemo, useState } from 'react';
import { ActivityItem, CommunityMember, CommunityOverview } from '@/lib/types';
import {
  BtnSecondary,
  MemberAvatar,
  PaymentStatusChip,
  StatCard,
  timeAgo,
} from '@/components/community/workspace-ui';

function exportMembersCsv(members: CommunityMember[]) {
  const headers = ['Name', 'Email', 'Plan', 'Status', 'Since'];
  const rows = members.map(m => {
    const name = m.display_name || m.email || 'Unknown';
    const plan = m.source_page_name || m.page_name || '';
    return [name, m.email || '', plan, m.payment_status, m.created_at];
  });
  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'members.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export function MembersPane({
  members,
  memberTotal,
  overview,
  activity,
}: {
  members: CommunityMember[];
  memberTotal?: number;
  overview: CommunityOverview | null;
  activity: ActivityItem[];
}) {
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const activeCount = members.filter(m => m.payment_status === 'active').length;
  const trialingCount = members.filter(m => m.payment_status === 'trialing').length;
  const cancelingCount = members.filter(m => m.payment_status === 'canceling').length;
  const atRisk = activity.length > 0 ? activity.length : cancelingCount;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter(m => {
      const name = (m.display_name || '').toLowerCase();
      const email = (m.email || '').toLowerCase();
      const plan = (m.source_page_name || m.page_name || '').toLowerCase();
      return name.includes(q) || email.includes(q) || plan.includes(q);
    });
  }, [members, query]);

  return (
    <div>
      <div className="stat-grid mb-16">
        <StatCard label="Active" value={overview?.paying_members ?? activeCount} />
        <StatCard label="Trialing" value={overview?.trialing ?? trialingCount} />
        <StatCard label="Canceling" value={overview?.canceling ?? cancelingCount} />
        <StatCard label="At risk" value={atRisk} />
      </div>

      <div className="ws-card">
        <div className="ws-card-head">
          <MembersHeadTitle total={memberTotal ?? members.length} />
          <MembersHeadActions
            searchOpen={searchOpen}
            query={query}
            onQueryChange={setQuery}
            onToggleSearch={() => setSearchOpen(v => !v)}
            onExport={() => exportMembersCsv(filtered)}
            exportDisabled={filtered.length === 0}
          />
        </div>

        <div className="members-table">
          <div className="members-row members-head">
            <div>Member</div>
            <div className="col-page">Plan</div>
            <div className="col-since">Since</div>
            <div>Status</div>
            <div aria-hidden />
          </div>

          {filtered.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              {members.length === 0 ? 'No members yet.' : 'No members match your search.'}
            </div>
          ) : (
            filtered.map(m => <MemberRow key={m.id} member={m} />)
          )}
        </div>
      </div>
    </div>
  );
}

function MembersHeadTitle({ total }: { total: number }) {
  return (
    <div>
      <h3>All members</h3>
      <p className="muted">
        Everyone with access to this community.
        {total > 0 ? ` · ${total} total` : ''}
      </p>
    </div>
  );
}

function MembersHeadActions({
  searchOpen,
  query,
  onQueryChange,
  onToggleSearch,
  onExport,
  exportDisabled,
}: {
  searchOpen: boolean;
  query: string;
  onQueryChange: (v: string) => void;
  onToggleSearch: () => void;
  onExport: () => void;
  exportDisabled: boolean;
}) {
  return (
    <div style={{ display: 'inline-flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
      {searchOpen && (
        <input
          type="search"
          value={query}
          onChange={e => onQueryChange(e.target.value)}
          placeholder="Search members…"
          autoFocus
          style={{
            width: '180px',
            padding: '7px 10px',
            fontSize: '13px',
            borderRadius: '6px',
            border: '0.5px solid var(--border)',
            background: 'var(--bg-alt, #0d0d0d)',
            color: 'var(--text)',
            outline: 'none',
          }}
        />
      )}
      <BtnSecondary onClick={onToggleSearch}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M21 21l-4.3-4.3M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
        Search
      </BtnSecondary>
      <BtnSecondary onClick={onExport} disabled={exportDisabled}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 4v12M6 10l6 6 6-6M4 20h16"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Export CSV
      </BtnSecondary>
    </div>
  );
}

function MemberRow({ member }: { member: CommunityMember }) {
  const name = member.display_name || member.email || 'Unknown';
  const plan = member.source_page_name || member.page_name || '—';

  return (
    <div className="members-row">
      <div className="who">
        <MemberAvatar name={name} avatarUrl={member.avatar_url} />
        <div className="who-meta">
          <span className="who-name">{name}</span>
          {member.email && member.display_name && (
            <span className="who-email">{member.email}</span>
          )}
        </div>
      </div>
      <div className="col-page">{plan}</div>
      <div className="col-since">{timeAgo(member.created_at)}</div>
      <div><PaymentStatusChip status={member.payment_status} /></div>
      <div>
        <button type="button" className="btn-icon" aria-label="More options">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <circle cx="5" cy="12" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="19" cy="12" r="1.5" />
          </svg>
        </button>
      </div>
    </div>
  );
}

