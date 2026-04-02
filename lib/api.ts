import { User, Product, Role, Member, CreatorSubscription, ApiError, DiscordServer, DiscordRole, DiscordChannel, StripePrice, ProductOverview, AccessPage, CreatePageRequest, BillingPlan, BillingPlanStatus } from './types';

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
      console.log('API Request:', { url, method: config.method || 'GET' });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

      const response = await fetch(url, { ...config, signal: controller.signal });
      clearTimeout(timeoutId);

      console.log('API Response:', { url, status: response.status, ok: response.ok });

      if (!response.ok) {
        const error: ApiError = await response.json().catch(() => ({
          error: 'Request failed',
          message: `HTTP ${response.status}: ${response.statusText}`,
          statusCode: response.status,
        }));
        console.error('API Error:', error);
        throw error;
      }

      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error('Request timeout:', url);
        throw {
          error: 'Timeout',
          message: 'Request timed out after 15 seconds',
          statusCode: 408,
        } as ApiError;
      }
      if ((error as ApiError).statusCode) {
        throw error;
      }
      console.error('Network error:', error);
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
      stripe_price_id: string;
      guild_id: string;
      role_id: string;
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

  async createRoleCheckoutSession(productId: string, roleId: string): Promise<{ checkout_url: string }> {
    return this.post<{ checkout_url: string }>(`/creator/products/${productId}/roles/${roleId}/checkout-session`);
  }

  async getMembers(
    productId: string,
    params?: {
      page?: number;
      limit?: number;
      page_id?: string;
      payment_status?: string;
      access_status?: string;
      email?: string;
      sort_by?: string;
      sort_order?: 'asc' | 'desc';
    }
  ): Promise<{ members: Member[]; total: number; page: number; limit: number }> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.page_id) queryParams.append('page_id', params.page_id);
    if (params?.payment_status) queryParams.append('payment_status', params.payment_status);
    if (params?.access_status) queryParams.append('access_status', params.access_status);
    if (params?.email) queryParams.append('email', params.email);
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params?.sort_order) queryParams.append('sort_order', params.sort_order);

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `/creator/products/${productId}/members?${queryString}`
      : `/creator/products/${productId}/members`;

    const response = await this.get<{ data: Member[]; pagination: { page: number; limit: number; total: number } }>(endpoint);

    return {
      members: response.data,
      total: response.pagination.total,
      page: response.pagination.page,
      limit: response.pagination.limit
    };
  }

  async getProductOverview(productId: string): Promise<ProductOverview> {
    return this.get<ProductOverview>(
      `/creator/products/${productId}/overview`
    );
  }

  async getBilling(): Promise<CreatorSubscription> {
    return this.get<CreatorSubscription>('/billing');
  }

  async getBillingPlan(): Promise<BillingPlanStatus> {
    return this.get<BillingPlanStatus>('/billing/plan');
  }

  async getBillingPlans(): Promise<BillingPlan[]> {
    return this.get<BillingPlan[]>('/billing/plans');
  }

  async createBillingCheckoutSession(planSlug: string): Promise<{ checkout_url: string }> {
    return this.post<{ checkout_url: string }>('/billing/checkout-session', {
      plan_slug: planSlug
    });
  }

  async getProductsCount(): Promise<{ count: number }> {
    return this.get<{ count: number }>('/creator/products/count');
  }

  async getDiscordGuildRoles(guildId: string): Promise<DiscordRole[]> {
    return this.get<DiscordRole[]>(`/creator/discord/guilds/${guildId}/roles`);
  }

  async getDiscordGuildChannels(guildId: string, roleId: string): Promise<DiscordChannel[]> {
    return this.get<DiscordChannel[]>(`/creator/discord/guilds/${guildId}/channels?role_id=${roleId}`);
  }

  async getStripePrices(): Promise<StripePrice[]> {
    return this.get<StripePrice[]>('/billing/prices');
  }

  async getPages(productId: string, mode?: 'popular'): Promise<AccessPage[]> {
    const endpoint = mode
      ? `/creator/products/${productId}/pages?mode=${mode}`
      : `/creator/products/${productId}/pages`;
    return this.get<AccessPage[]>(endpoint);
  }

  async getPage(productId: string, pageId: string): Promise<AccessPage> {
    return this.get<AccessPage>(`/creator/products/${productId}/pages/${pageId}`);
  }

  async createPage(productId: string, data: CreatePageRequest): Promise<AccessPage> {
    return this.post<AccessPage>(`/creator/products/${productId}/pages`, data);
  }

  async updatePage(productId: string, pageId: string, data: Partial<CreatePageRequest>): Promise<AccessPage> {
    return this.put<AccessPage>(`/creator/products/${productId}/pages/${pageId}`, data);
  }

  async deletePage(productId: string, pageId: string): Promise<void> {
    return this.delete<void>(`/creator/products/${productId}/pages/${pageId}`);
  }

  async getPublicPage(publicPath: string): Promise<{
    creator_slug: string;
    page_slug: string;
    offer_name: string;
    hero_image_url: string;
    cover_url: string;
    description: string;
    features: Array<{
      id: string;
      icon: string;
      title: string;
      description: string;
    }>;
    media_gallery_enabled: boolean;
    monthly_amount_minor: number;
    yearly_amount_minor: number;
    currency: string;
    accepts_signups: boolean;
    has_yearly: boolean;
  }> {
    return this.get<any>(publicPath);
  }

  async createPublicCheckoutSession(
    publicPath: string,
    priceKind: 'monthly' | 'yearly'
  ): Promise<{ client_secret: string; stripe_account: string }> {
    return this.post<{ client_secret: string; stripe_account: string }>(
      `${publicPath}/checkout-session`,
      { price_kind: priceKind }
    );
  }
}

export const api = new ApiClient(API_BASE_URL);
