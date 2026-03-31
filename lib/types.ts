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
  email: string;
  discord_user_id?: string;
  discord_username?: string;
  discord_avatar?: string;
  discord_connect_url?: string;
  page_id?: string;
  page_name?: string;
  page_offer_name?: string;
  role_name?: string;
  price: number;
  payment_status: 'active' | 'trialing' | 'canceling' | 'free';
  access_status: 'active' | 'onboarding' | 'free';
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
  onboarding: {
    has_published_page: boolean;
    stripe_connected: boolean;
    has_guildpay_subscription: boolean;
  };
  paying_members: number;
  monthly_revenue: number;
  discord_guild_id: string;
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

export interface PageMemberCounts {
  active: number;
  trialing: number;
  canceling: number;
}

export interface AccessPage {
  id: string;
  slug: string;
  offer_name: string;
  hero_image_url?: string;
  description: any;
  features: any;
  media_gallery_enabled: boolean;
  discord_role_id: string;
  discord_welcome_channel_id?: string;
  published: boolean;
  accepts_signups: boolean;
  stripe_product_id?: string;
  monthly_amount_minor: number;
  yearly_amount_minor?: number;
  currency: string;
  trial_days?: number;
  settings: any;
  created_at: string;
  updated_at: string;
  member_counts: PageMemberCounts;
  public_path?: string;
  active?: boolean;
}

export interface CreatePageRequest {
  slug: string;
  offer_name: string;
  hero_image_url?: string;
  description: any;
  features: any;
  media_gallery_enabled: boolean;
  discord_role_id: string;
  discord_welcome_channel_id?: string;
  accepts_signups?: boolean;
  monthly_amount_minor: number;
  yearly_amount_minor?: number;
  currency: string;
  trial_days?: number;
  settings?: any;
}

export interface OnboardingStatus {
  discordConnected: boolean;
  firstPageCreated: boolean;
  linkShared: boolean;
}
