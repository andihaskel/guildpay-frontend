'use client';

import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import type { SetupSection } from '@/components/community/SetupWorkspaceContext';

const SECTIONS: {
  key: SetupSection;
  label: string;
  href: (base: string) => string;
  match: (pathname: string, base: string) => boolean;
  icon: React.ReactNode;
}[] = [
  {
    key: 'page',
    label: 'Page',
    href: base => base,
    match: (pathname, base) => pathname === base || pathname === `${base}/`,
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: 'plans',
    label: 'Plans',
    href: base => `${base}/plans`,
    match: (pathname, base) => pathname.startsWith(`${base}/plans`),
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="3" y="6" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M7 11h2M3 11h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: 'checkout',
    label: 'Checkout',
    href: base => `${base}/checkout`,
    match: (pathname, base) => pathname.startsWith(`${base}/checkout`),
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M5 7h14l-1.5 10a2 2 0 0 1-2 1.7H8.5a2 2 0 0 1-2-1.7L5 7zM9 11v4M15 11v4"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

function resolveActiveSection(pathname: string, base: string): SetupSection {
  const section = SECTIONS.find(s => s.match(pathname, base));
  return section?.key ?? 'page';
}

export function SetupSectionNav() {
  const { communityId } = useParams<{ communityId: string }>();
  const pathname = usePathname() ?? '';

  const base = `/dashboard/community/${communityId}/setup`;
  const activeSection = resolveActiveSection(pathname, base);

  return (
    <div className="setup-nav" role="tablist" aria-label="Setup sections">
        {SECTIONS.map(s => {
          const isActive = activeSection === s.key;
          return (
            <Link
              key={s.key}
              href={s.href(base)}
              role="tab"
              className={isActive ? 'is-active' : undefined}
              aria-current={isActive ? 'page' : undefined}
            >
              {s.icon}
              {s.label}
            </Link>
          );
        })}
    </div>
  );
}
