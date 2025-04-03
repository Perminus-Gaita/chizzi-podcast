// DetailedProductCard.jsx
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Award, Gift, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useToast } from "@/components/hooks/use-toast";
import RedeemProductModal from './RedeemProductModal';

const formatPrice = (price) => {
  if (!price) return "N/A";
  
  const { amount, currency } = price;
  
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100);
  } else if (currency === 'KES') {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      currencyDisplay: 'symbol'
    }).format(amount / 100);
  }
  
  return `${currency} ${amount / 100}`;
};

const DetailedProductCard = ({ product }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const showRedeemButton = 
    product.currentOwner?.isSessionUser && 
    !product.isRedeemed && 
    product.creator._id !== product.currentOwner._id;

  const handleRedeem = async (redemptionData) => {
    try {
      const response = await fetch(`/api/products/${product._id}/redeem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(redemptionData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to redeem product');
      }

      toast({
        title: "Success!",
        description: "Product redeemed successfully. The creator will be notified.",
      });
      
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-3 md:p-4 mb-4 hover:shadow-lg transition-shadow">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Product Image */}
        <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
          <img
            src={product.image || "/api/placeholder/96/96"}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-base md:text-lg truncate">
                {product.name}
              </h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {product.description}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="text-base md:text-lg font-bold whitespace-nowrap">
                {formatPrice(product.price)}
              </span>
              {showRedeemButton && (
                <Button 
                  size="sm"
                  variant="default"
                  className="whitespace-nowrap"
                  onClick={() => setIsModalOpen(true)}
                >
                  Redeem Product
                </Button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-4 mt-3">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Award className="w-4 h-4" />
              <span>{product.tournamentWins} wins</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Gift className="w-4 h-4" />
              <span>{product.transferCount} transfers</span>
            </div>
            {product.sold > 0 && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <span>{product.sold} sold</span>
              </div>
            )}
          </div>

          {/* Current Owner */}
          {product.currentOwner && (
            <div className="mt-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm">
                  <span className="text-sm font-medium mr-2">Current Owner:</span>
                  <Link
                    href={`/${product.currentOwner.username}`}
                    className="font-medium hover:underline text-primary"
                  >
                    {product.currentOwner.name}
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Ownership History */}
          <div className="mt-3">
            <h4 className="text-sm font-medium mb-2">Ownership History</h4>
            <div className="space-y-2">
              {product.ownershipHistory.map((history, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:items-center text-sm gap-1 sm:gap-0"
                >
                  <div className="flex items-center min-w-0">
                    <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                    <Link
                      href={`/${history.owner.username}`}
                      className={`font-medium hover:underline truncate ${
                        history.isSessionUser ? 'text-primary' : ''
                      }`}
                    >
                      {history.owner.name}
                    </Link>
                  </div>
                  <div className="flex items-center ml-6 sm:ml-0">
                    <ArrowRight className="w-4 h-4 mx-2 text-muted-foreground" />
                    <span className="text-muted-foreground truncate">
                      {new Date(history.acquiredAt).toLocaleDateString()} via{" "}
                      {history.transactionType}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Redemption Modal */}
      <RedeemProductModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRedeem={handleRedeem}
        productName={product.name}
      />
    </Card>
  );
};

export default DetailedProductCard;