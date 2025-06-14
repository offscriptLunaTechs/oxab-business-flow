
import { useProducts } from '@/hooks/useProducts';
import { useTopSellingProducts } from './useTopSellingProducts';

export const useProductDisplay = (searchTerm: string) => {
  const { data: allProducts = [] } = useProducts(searchTerm);
  const topSellingProducts = useTopSellingProducts();

  // Sort products to prioritize top-selling items
  const displayProducts = searchTerm ? 
    allProducts.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    ) : 
    allProducts
      .filter(product => product.status === 'active') // Only show active products
      .sort((a, b) => {
        // First, prioritize top-selling products
        const aIndex = topSellingProducts.indexOf(a.id);
        const bIndex = topSellingProducts.indexOf(b.id);
        
        if (aIndex !== -1 && bIndex !== -1) {
          return aIndex - bIndex; // Both are top-selling, maintain their order
        }
        if (aIndex !== -1) return -1; // a is top-selling, b is not
        if (bIndex !== -1) return 1;  // b is top-selling, a is not
        
        // For non-top-selling products, prioritize by stock level and name
        if (a.stock_level !== b.stock_level) {
          return (b.stock_level || 0) - (a.stock_level || 0);
        }
        return a.name.localeCompare(b.name);
      })
      .slice(0, 8); // Show top 8 products when no search

  return { displayProducts };
};
