import { CommunityPlan } from '@/lib/types';
import { fmtAmount, planColor } from '@/components/community/setup-utils';
import { PlanSellingPoint } from '@/components/community/setup-preview-types';
import {
  normalizePlanSellingPoints,
} from '@/components/community/plan-selling-points';

export function planIsOneTime(plan: CommunityPlan): boolean {
  if (plan.billing_type === 'one_time') return true;
  if (plan.billing_type === 'recurring') return false;
  return (plan.one_time_amount_minor ?? 0) > 0;
}

export function planHasMonthly(plan: CommunityPlan): boolean {
  if (planIsOneTime(plan)) return false;
  if (plan.monthly_enabled === false) return false;
  return (plan.monthly_amount_minor ?? 0) > 0;
}

export function planHasYearly(plan: CommunityPlan): boolean {
  if (planIsOneTime(plan)) return false;
  if (plan.annual_enabled === false) return false;
  return (plan.yearly_amount_minor ?? 0) > 0;
}

export function planFrequencyValue(plan: CommunityPlan): 'monthly' | 'annual' | 'onetime' {
  if (planIsOneTime(plan)) return 'onetime';
  if (planHasMonthly(plan)) return 'monthly';
  if (planHasYearly(plan)) return 'annual';
  return 'monthly';
}

export function planAccentColor(plan: CommunityPlan): string {
  return plan.color ?? planColor(plan.offer_name);
}

export function planFeaturesToSellingPoints(plan: CommunityPlan): PlanSellingPoint[] {
  return normalizePlanSellingPoints(plan.features);
}

export function sellingPointsForPlan(
  plan: CommunityPlan,
  local?: PlanSellingPoint[],
): PlanSellingPoint[] {
  if (local !== undefined) return local;
  const fromApi = planFeaturesToSellingPoints(plan);
  if (fromApi.length) return fromApi;
  return [];
}

export function mergePlanSellingPointsMapFromPlans(
  existing: Record<string, PlanSellingPoint[]>,
  plans: CommunityPlan[],
): Record<string, PlanSellingPoint[]> {
  const map = { ...existing };

  for (const plan of plans) {
    if (map[plan.id] !== undefined) continue;

    const fromApi = planFeaturesToSellingPoints(plan);
    map[plan.id] = fromApi.length ? fromApi : [];
  }

  return map;
}

export function planOneTimeAmountMinor(plan: CommunityPlan): number {
  return plan.one_time_amount_minor ?? plan.monthly_amount_minor ?? 0;
}

export function planDisplayPriceMinor(plan: CommunityPlan): number {
  if (planIsOneTime(plan)) return planOneTimeAmountMinor(plan);
  if (planHasMonthly(plan)) return plan.monthly_amount_minor;
  if (planHasYearly(plan)) return plan.yearly_amount_minor ?? 0;
  return plan.monthly_amount_minor ?? 0;
}

export function planPriceLabel(plan: CommunityPlan): string {
  if (planIsOneTime(plan)) {
    return `${fmtAmount(planOneTimeAmountMinor(plan), plan.currency)} · one-time`;
  }

  const parts: string[] = [];
  if (planHasMonthly(plan)) {
    parts.push(`${fmtAmount(plan.monthly_amount_minor, plan.currency)}/mo`);
  }
  if (planHasYearly(plan)) {
    parts.push(`${fmtAmount(plan.yearly_amount_minor!, plan.currency)}/yr`);
  }

  if (parts.length) return parts.join(' · ');
  return `${fmtAmount(plan.monthly_amount_minor ?? 0, plan.currency)}/mo`;
}

export function planPickSubline(plan: CommunityPlan): string {
  const parts: string[] = [planPriceLabel(plan)];

  if (plan.member_counts.active > 0) {
    parts.push(
      `${plan.member_counts.active} active member${plan.member_counts.active === 1 ? '' : 's'}`,
    );
  }

  return parts.join(' · ');
}
