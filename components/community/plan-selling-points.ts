import { PlanSellingPoint } from '@/components/community/setup-preview-types';

export const SELLING_POINT_ICONS = [
  '✅',
  '📈',
  '🎟️',
  '📦',
  '⚡',
  '🔔',
  '🎯',
  '💎',
  '🚀',
  '📊',
  '🛡️',
  '🧠',
] as const;

export function createSellingPointId() {
  return `sp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function normalizePlanSellingPoints(raw: unknown): PlanSellingPoint[] {
  if (!Array.isArray(raw) || raw.length === 0) return [];

  if (typeof raw[0] === 'string') {
    return (raw as string[]).map((line, index) => {
      const [title, ...rest] = line.split(' — ');
      return {
        id: createSellingPointId(),
        icon: SELLING_POINT_ICONS[index % SELLING_POINT_ICONS.length],
        title: title || line,
        description: rest.length ? rest.join(' — ') : undefined,
      };
    });
  }

  return (raw as PlanSellingPoint[]).map(point => ({
    id: point.id || createSellingPointId(),
    icon: point.icon || SELLING_POINT_ICONS[0],
    title: point.title,
    description: point.description,
  }));
}

export function normalizePlanSellingPointsMap(
  raw: Record<string, unknown> | undefined,
  planIds: string[],
): Record<string, PlanSellingPoint[]> {
  const map: Record<string, PlanSellingPoint[]> = {};

  for (const planId of planIds) {
    const existing = raw?.[planId];
    const normalized = normalizePlanSellingPoints(existing);
    map[planId] = normalized;
  }

  return map;
}
