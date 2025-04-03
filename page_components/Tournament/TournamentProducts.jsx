import React from "react";
import { Gift } from "lucide-react";
import { useToast } from "@/components/hooks/use-toast";
import RedeemProductModal from './RedeemProductModal';
import DetailedProductCard from './DetailedProductCard';
import StatusProductCard from './StatusProductCard';
import { useProductRedemption } from '@/hooks/useProductRedemption';

const TournamentProducts = ({ products = [] }) => {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Gift className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No products found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {products.map((product) => {
        // If product is redeemed, use the StatusProductCard
        if (product.isRedeemed) {
          return (
            <StatusProductCard 
              key={product._id} 
              product={product}
            />
          );
        }
        
        // Otherwise use the DetailedProductCard
        return (
          <DetailedProductCard 
            key={product._id} 
            product={product}
          />
        );
      })}
    </div>
  );
};

export default TournamentProducts;