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

export const DEFAULT_PLAN_SELLING_POINTS: PlanSellingPoint[] = [
  {
    id: 'sp-default-1',
    icon: '📈',
    title: 'Daily trade signals',
    description:
      'Entry, target and stop-loss for every position — posted in real time across Discord and Telegram.',
  },
  {
    id: 'sp-default-2',
    icon: '🎟️',
    title: 'Live trading sessions',
    description:
      'Tuesdays and Thursdays at 9am EST. We open positions on-stream and answer questions live.',
  },
  {
    id: 'sp-default-3',
    icon: '📦',
    title: 'Members-only research drops',
    description:
      'Weekly deep-dives on tickers, macro, and the watchlist for the week ahead — only inside.',
  },
];

export function createSellingPointId() {
  return `sp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function cloneDefaultSellingPoints(planId?: string): PlanSellingPoint[] {
  return DEFAULT_PLAN_SELLING_POINTS.map(point => ({
    ...point,
    id: planId ? `${planId}-${point.id}` : createSellingPointId(),
  }));
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
    map[planId] = normalized.length ? normalized : cloneDefaultSellingPoints(planId);
  }

  return map;
}
