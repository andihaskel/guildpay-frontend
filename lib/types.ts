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
  guildId: string;
  guildName: string;
  guildIcon?: string;
  description?: string;
  isActive: boolean;
  stripeAccountId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  productId: string;
  discordRoleId: string;
  name: string;
  description?: string;
  price: number;
  interval: 'month' | 'year';
  stripePriceId?: string;
  isActive: boolean;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Member {
  id: string;
  productId: string;
  discordUserId: string;
  discordUsername: string;
  discordAvatar?: string;
  roleId: string;
  roleName: string;
  subscriptionId: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodEnd: string;
  createdAt: string;
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
