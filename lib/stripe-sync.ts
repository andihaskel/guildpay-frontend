import { api } from './api';

const SESSION_KEY_PREFIX = 'accessgate:stripeSync:session:';
const LAST_DATE_KEY_PREFIX = 'accessgate:stripeSync:lastDate:';

const getTodayDate = (): string => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

export const shouldSyncStripe = (productId: string): boolean => {
  const sessionKey = `${SESSION_KEY_PREFIX}${productId}`;
  const lastDateKey = `${LAST_DATE_KEY_PREFIX}${productId}`;

  if (sessionStorage.getItem(sessionKey)) {
    return false;
  }

  const lastSyncDate = localStorage.getItem(lastDateKey);
  const today = getTodayDate();

  if (lastSyncDate === today) {
    return false;
  }

  return true;
};

export const markStripeSynced = (productId: string): void => {
  const sessionKey = `${SESSION_KEY_PREFIX}${productId}`;
  const lastDateKey = `${LAST_DATE_KEY_PREFIX}${productId}`;
  const today = getTodayDate();

  sessionStorage.setItem(sessionKey, '1');
  localStorage.setItem(lastDateKey, today);
};

export const syncStripeUnmatched = async (productId: string): Promise<boolean> => {
  if (!shouldSyncStripe(productId)) {
    return false;
  }

  try {
    await api.post(`/creator/products/${productId}/sync-stripe-unmatched`);
    markStripeSynced(productId);
    return true;
  } catch (error) {
    console.error('Failed to sync Stripe unmatched subscriptions:', error);
    return false;
  }
};
