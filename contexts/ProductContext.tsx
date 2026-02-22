'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '@/lib/types';
import { api } from '@/lib/api';

interface ProductContextType {
  products: Product[];
  currentProduct: Product | null;
  isLoading: boolean;
  setCurrentProductId: (id: string) => void;
  refetchProducts: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const productsData = await api.getProducts();
      setProducts(productsData);

      if (productsData.length > 0 && !currentProduct) {
        setCurrentProduct(productsData[0]);
      }
    } catch (error) {
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const setCurrentProductId = (id: string) => {
    const product = products.find((p) => p.id === id);
    if (product) {
      setCurrentProduct(product);
    }
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
