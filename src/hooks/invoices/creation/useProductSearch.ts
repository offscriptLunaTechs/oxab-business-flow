
import { useMemo } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useTopSellingProducts } from '@/hooks/invoices/useTopSellingProducts';

export const useProductSearch = (searchTerm: string) => {
  const { data: allProducts = [], isLoading } = useProducts(searchTerm);
  const topSellingProductIds = useTopSellingProducts();

  const displayProducts = useMemo(() => {
    if (searchTerm) {
      return allProducts
        .filter(product => 
          product.status === 'active' &&
          (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase())))
        )
        .slice(0, 20);
    }

    // For empty search, show top-selling products first
    return allProducts
      .filter(product => product.status === 'active')
      .sort((a, b) => {
        const aIndex = topSellingProductIds.indexOf(a.id);
        const bIndex = topSellingProductIds.indexOf(b.id);
        
        if (aIndex !== -1 && bIndex !== -1) {
          return aIndex - bIndex;
        }
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        
        return a.name.localeCompare(b.name);
      })
      .slice(0, 8);
  }, [allProducts, searchTerm, topSellingProductIds]);

  return {
    displayProducts,
    isLoading,
  };
};
