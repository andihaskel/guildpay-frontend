'use client';

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { Product } from '@/lib/types';
import { api } from '@/lib/api';

interface ProductContextType {
  products: Product[];
  currentProduct: Product | null;
  isLoading: boolean;
  setCurrentProductId: (id: string) => void;
  refetchProducts: () => Promise<void>;
  setPendingProductId: (id: string) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pendingIdRef = useRef<string | null>(null);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const productsData = await api.getProducts();
      setProducts(productsData);

      if (productsData.length > 0) {
        const pending = pendingIdRef.current;
        const target = pending
          ? productsData.find((p) => p.id === pending) ?? productsData[0]
          : productsData[0];
        setCurrentProduct((prev) => prev ?? target);
        pendingIdRef.current = null;
      }
    } catch {
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const setCurrentProductId = (id: string) => {
    const product = products.find((p) => p.id === id);
    if (product) setCurrentProduct(product);
  };

  const setPendingProductId = (id: string) => {
    pendingIdRef.current = id;
    // If products are already loaded, apply immediately
    const product = products.find((p) => p.id === id);
    if (product) setCurrentProduct(product);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <ProductContext.Provider
      value={{
        products,
        currentProduct,
        isLoading,
        setCurrentProductId,
        refetchProducts: fetchProducts,
        setPendingProductId,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProduct() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProduct must be used within a ProductProvider');
  }
  return context;
}
