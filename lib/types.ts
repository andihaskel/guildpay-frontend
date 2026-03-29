export interface User {
  id: string;
  email: string;
  username: string;
  discordId?: string;
  discordUsername?: string;
  discordAvatar?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  discord_guild_id: string;
  bot_installed: boolean;
  guildName?: string;
  guildIcon?: string;
  description?: string;
  isActive?: boolean;
  stripeAccountId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Role {
  id: string;
  productId?: string;
  discordRoleId?: string;
  name?: string;
  description?: string;
  price?: number;
  interval?: 'month' | 'year';
  stripePriceId?: string;
  isActive?: boolean;
  memberCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Member {
  id: string;
  email?: string;
  discord_user_id: string;
  discord_username?: string;
  discord_avatar?: string;
  discord_connect_url?: string;
  checkout_url?: string;
  role_identifier?: string;
  role_id: string;
  price: number;
  subscription_status?: 'active' | 'canceled' | 'past_due' | 'trialing';
  status: 'active' | 'pending_discord' | 'pending_stripe' | 'canceled' | 'past_due' | 'trialing';
  current_period_end?: string;
  created_at: string;
}

export interface BillingPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  isActive: boolean;
}

export interface CreatorSubscription {
  id: string;
  planId: string;
  planName: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

export interface DiscordServer {
  id: string;
  name: string;
  icon?: string;
  memberCount: number;
  botInstalled: boolean;
}

export interface DiscordRole {
  id: string;
  name: string;
  color: number;
  position: number;
}

export interface StripePrice {
  id: string;
  product: string;
  currency: string;
  unit_amount: number;
  recurring: {
    interval: string;
    interval_count: number;
  };
  active: boolean;
}

export interface ProductOverview {
  paying_members: number;
  monthly_revenue: number;
  top_roles_by_revenue: TopRoleByRevenue[];
}

export interface TopRoleByRevenue {
  guild_config_id: string;
  role_identifier: string;
  role_id: string;
  stripe_price_id: string;
  price: number;
  members_count: number;
  revenue: number;
}

export interface AccessPage {
  id: string;
  productId: string;
  name: string;
  description?: string;
  coverImage?: string;
  price: number;
  interval: 'month' | 'year';
  url: string;
  isActive: boolean;
  activeMembers: number;
  trialingMembers: number;
  cancelingMembers: number;
  createdAt: string;
  updatedAt: string;
}

export interface OnboardingStatus {
  discordConnected: boolean;
  firstPageCreated: boolean;
  linkShared: boolean;
}
