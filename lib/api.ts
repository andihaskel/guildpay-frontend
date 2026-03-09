import { User, Product, Role, Member, CreatorSubscription, ApiError, DiscordServer, DiscordRole, StripePrice } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const error: ApiError = await response.json().catch(() => ({
          error: 'Request failed',
          message: `HTTP ${response.status}: ${response.statusText}`,
          statusCode: response.status,
        }));
        throw error;
      }

      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      if ((error as ApiError).statusCode) {
        throw error;
      }
      throw {
        error: 'Network error',
        message: 'Failed to connect to the server',
        statusCode: 0,
      } as ApiError;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async getMe(): Promise<User> {
    return this.get<User>('/auth/me');
  }

  async signOut(): Promise<void> {
    return this.post<void>('/auth/logout');
  }

  async getProducts(): Promise<Product[]> {
    return this.get<Product[]>('/creator/products');
  }

  async getProduct(id: string): Promise<Product> {
    return this.get<Product>(`/creator/products/${id}`);
  }

  async createProduct(data: {
    name: string;
    discord_guild_id: string;
    description?: string;
  }): Promise<Product> {
    return this.post<Product>('/creator/products', data);
  }

  async getRoles(productId: string): Promise<Role[]> {
    return this.get<Role[]>(`/creator/products/${productId}/roles`);
  }

  async createRole(
    productId: string,
    data: {
      discordRoleId: string;
      name: string;
      description?: string;
      price: number;
      interval: 'month' | 'year';
    }
  ): Promise<Role> {
    return this.post<Role>(`/creator/products/${productId}/roles`, data);
  }

  async updateRole(
    productId: string,
    roleId: string,
    data: Partial<{
      name: string;
      description: string;
      price: number;
      isActive: boolean;
    }>
  ): Promise<Role> {
    return this.put<Role>(`/creator/products/${productId}/roles/${roleId}`, data);
  }

  async deleteRole(productId: string, roleId: string): Promise<void> {
    return this.delete<void>(`/creator/products/${productId}/roles/${roleId}`);
  }

  async getMembers(productId: string): Promise<Member[]> {
    return this.get<Member[]>(`/creator/products/${productId}/members`);
  }

  async getProductOverview(productId: string): Promise<{
    payingMembers: number;
    monthlyRevenue: number;
  }> {
    return this.get<{ payingMembers: number; monthlyRevenue: number }>(
      `/creator/products/${productId}/overview`
    );
  }

  async getBilling(): Promise<CreatorSubscription> {
    return this.get<CreatorSubscription>('/billing');
  }

  async getBillingPlan(): Promise<{
    planName: string;
    status: string;
    maxProducts: number;
    maxRoles: number;
  }> {
    return this.get<{
      planName: string;
      status: string;
      maxProducts: number;
      maxRoles: number;
    }>('/billing/plan');
  }

  async getProductsCount(): Promise<{ count: number }> {
    return this.get<{ count: number }>('/creator/products/count');
  }

  async getDiscordGuildRoles(guildId: string): Promise<DiscordRole[]> {
    return this.get<DiscordRole[]>(`/creator/discord/guilds/${guildId}/roles`);
  }

  async getStripePrices(): Promise<StripePrice[]> {
    return this.get<StripePrice[]>('/billing/prices');
  }
}

export const api = new ApiClient(API_BASE_URL);
