import { api } from './api';

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
