import { api } from './api';

export interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  backoffMultiplier?: number;
}

export async function fetchWithRetry<T>(
  fetchFn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delayMs = 500,
    backoffMultiplier = 1.5
  } = options;

  let lastError: any;
  let currentDelay = delayMs;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fetchFn();
    } catch (error) {
      lastError = error;

      if (attempt < maxAttempts) {
        console.log(`Auth attempt ${attempt} failed, retrying in ${currentDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, currentDelay));
        currentDelay = Math.floor(currentDelay * backoffMultiplier);
      }
    }
  }

  throw lastError;
}

export async function checkAuthWithRetry(
  backendUrl: string,
  options?: RetryOptions
): Promise<Response> {
  return fetchWithRetry(
    () => fetch(`${backendUrl}/auth/me`, {
      credentials: 'include',
    }),
    options
  );
}

export function getSessionErrorMessage(statusCode: number): string {
  switch (statusCode) {
    case 401:
      return 'No se pudo establecer sesión. Por favor, intentá login nuevamente.';
    case 408:
      return 'Tiempo de espera agotado. Verificá tu conexión e intentá nuevamente.';
    case 0:
      return 'Error de conexión. Verificá tu conexión a internet.';
    default:
      return 'Error al verificar sesión. Intentá nuevamente más tarde.';
  }
}

export async function checkProductsAndRedirect(): Promise<string> {
  try {
    const products = await api.getProducts();

    if (products && products.length > 0) {
      const lastProduct = products[products.length - 1];
      return `/dashboard/overview`;
    }

    return '/select-server';
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return '/select-server';
  }
}
