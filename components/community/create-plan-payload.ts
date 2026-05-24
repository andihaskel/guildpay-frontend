import { CreateCommunityPlanRequest, CommunityPlan, UpdateCommunityPlanRequest } from '@/lib/types';
import { PlanSellingPoint } from '@/components/community/setup-preview-types';
import {
  planHasMonthly,
  planHasYearly,
  planIsOneTime,
  planOneTimeAmountMinor,
} from '@/components/community/plan-model';

type BillingType = 'recurring' | 'onetime';

export type NewPlanFormValues = {
  name: string;
  billingType: BillingType;
  currency: string;
  trialDays: string;
  monthlyEnabled: boolean;
  monthlyPrice: string;
  annualEnabled: boolean;
  annualPrice: string;
  oneTimePrice: string;
  description: string;
  seatCap: string;
  color: string;
};

function parseMoney(value: string): number {
  const n = parseFloat(value.replace(/[^0-9.]/g, ''));
  return Number.isNaN(n) ? 0 : n;
}

function confirmedFeatures(
  sellingPoints: PlanSellingPoint[],
  draftIds: Set<string>,
): CreateCommunityPlanRequest['features'] {
  const features = sellingPoints
    .filter(point => !draftIds.has(point.id) && point.title.trim().length >= 2)
    .map(({ id, icon, title, description }) => ({
      id,
      icon,
      title: title.trim(),
      description: description?.trim() || undefined,
    }));

  return features.length > 0 ? features : undefined;
}

function parseSeatCap(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const n = parseInt(trimmed, 10);
  return !Number.isNaN(n) && n > 0 ? n : undefined;
}

export function buildCreateCommunityPlanPayload(
  form: NewPlanFormValues,
  sellingPoints: PlanSellingPoint[],
  draftSellingPointIds: Set<string>,
): CreateCommunityPlanRequest {
  const trial = parseInt(form.trialDays, 10);
  const trialDays = !Number.isNaN(trial) && trial > 0 ? trial : undefined;
  const description = form.description.trim() || undefined;
  const seatCap = parseSeatCap(form.seatCap);
  const features = confirmedFeatures(sellingPoints, draftSellingPointIds);

  const base = {
    offer_name: form.name.trim(),
    currency: form.currency,
    trial_days: trialDays,
    description,
    color: form.color,
    seat_cap: seatCap,
    features,
  } satisfies Omit<CreateCommunityPlanRequest, 'billing_type'>;

  if (form.billingType === 'onetime') {
    return {
      ...base,
      billing_type: 'one_time',
      one_time_amount_minor: Math.round(parseMoney(form.oneTimePrice) * 100),
    };
  }

  const monthlyMinor = Math.round(parseMoney(form.monthlyPrice) * 100);
  const annualMinor = Math.round(parseMoney(form.annualPrice) * 100);

  return {
    ...base,
    billing_type: 'recurring',
    monthly_enabled: form.monthlyEnabled,
    annual_enabled: form.annualEnabled,
    monthly_amount_minor: form.monthlyEnabled ? monthlyMinor : 0,
    yearly_amount_minor: form.annualEnabled && annualMinor > 0 ? annualMinor : undefined,
  };
}

export type UpdateCommunityPlanFormValues = {
  offerName: string;
  description: string;
  trialDays: string;
  seatCap: string;
  currency: string;
  acceptsSignups: boolean;
};

function featuresFromSellingPoints(
  sellingPoints: PlanSellingPoint[],
): UpdateCommunityPlanRequest['features'] {
  const features = sellingPoints
    .filter(point => point.title.trim().length >= 2)
    .map(({ id, icon, title, description }) => ({
      id,
      icon,
      title: title.trim(),
      description: description?.trim() || undefined,
    }));

  return features.length > 0 ? features : undefined;
}

export function buildUpdateCommunityPlanPayload(
  plan: CommunityPlan,
  form: UpdateCommunityPlanFormValues,
  sellingPoints: PlanSellingPoint[],
): UpdateCommunityPlanRequest {
  const trial = parseInt(form.trialDays, 10);
  const trialDays = !Number.isNaN(trial) && trial > 0 ? trial : undefined;
  const description = form.description.trim() || undefined;
  const seatCap = parseSeatCap(form.seatCap);
  const acceptsSignups = form.acceptsSignups;
  const channelIds = plan.channel_ids?.length ? plan.channel_ids : undefined;

  const base = {
    offer_name: form.offerName.trim(),
    currency: form.currency.toLowerCase(),
    trial_days: trialDays,
    description,
    color: plan.color,
    seat_cap: seatCap,
    features: featuresFromSellingPoints(sellingPoints),
    accepts_signups: acceptsSignups,
    channel_ids: channelIds,
  } satisfies Omit<UpdateCommunityPlanRequest, 'billing_type'>;

  if (planIsOneTime(plan)) {
    return {
      ...base,
      billing_type: 'one_time',
      one_time_amount_minor: planOneTimeAmountMinor(plan),
    };
  }

  return {
    ...base,
    billing_type: 'recurring',
    monthly_enabled: planHasMonthly(plan),
    annual_enabled: planHasYearly(plan),
    monthly_amount_minor: planHasMonthly(plan) ? plan.monthly_amount_minor : 0,
    yearly_amount_minor:
      planHasYearly(plan) && plan.yearly_amount_minor ? plan.yearly_amount_minor : undefined,
  };
}
