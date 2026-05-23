const SERVER_COLORS = [
  '#5865f2', '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#06b6d4', '#f97316', '#ec4899', '#14b8a6',
];

export function planColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return SERVER_COLORS[Math.abs(h) % SERVER_COLORS.length];
}

export function planInitials(offerName: string) {
  const parts = offerName.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  const w = parts[0] || '?';
  return (w.slice(0, 2) || '?').toUpperCase();
}

export function fmtAmount(minor: number, currency = 'usd') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: minor % 100 === 0 ? 0 : 2,
  }).format(minor / 100);
}

export function mergePlanOrderIds(planOrderIds: string[] | undefined, planIds: string[]) {
  const base = (planOrderIds ?? []).filter(id => planIds.includes(id));
  const missing = planIds.filter(id => !base.includes(id));
  return [...base, ...missing];
}

export function reorderByIndex<T>(items: T[], from: number, to: number) {
  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}
