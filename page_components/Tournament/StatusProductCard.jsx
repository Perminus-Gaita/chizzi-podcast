import React from 'react';
import { Card } from "@/components/ui/card";
import { Award, Gift, Clock, ArrowRight, AlertCircle, Package } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useProductRedemption } from '@/hooks/useProductRedemption';

const getStatusColor = (status) => {
  const colors = {
    pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    processing: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    shipped: "bg-purple-100 text-purple-800 hover:bg-purple-100",
    delivered: "bg-green-100 text-green-800 hover:bg-green-100"
  };
  return colors[status] || colors.pending;
};

const CreatorActions = ({ currentStatus, onUpdateStatus, isUpdating }) => {
  const getNextAction = (status) => {
    switch (status) {
      case 'pending':
        return {
          label: 'Start Processing',
          status: 'processing',
          description: 'Begin processing this redemption request'
        };
      case 'processing':
        return {
          label: 'Mark as Shipped',
          status: 'shipped',
          description: 'Mark this product as shipped to the redeemer'
        };
      default:
        return null;
    }
  };

  const nextAction = getNextAction(currentStatus);
  
  if (!nextAction) return null;

  return (
    <div className="mt-4 p-4 bg-muted/50 rounded-lg space-y-3">
      <div className="flex items-start gap-3">
        <Package className="w-5 h-5 text-muted-foreground mt-1" />
        <div className="flex-1">
          <h4 className="font-medium text-sm">Creator Actions</h4>
          <p className="text-sm text-muted-foreground mb-3">{nextAction.description}</p>
          <Button 
            onClick={() => onUpdateStatus(nextAction.status)}
            disabled={isUpdating}
            size="sm"
          >
            {nextAction.label}
          </Button>
        </div>
      </div>

      {currentStatus === 'pending' && (
        <Alert variant="info" className="bg-blue-50 text-blue-800 border-blue-200">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Once you start processing, make sure to have the product ready for shipping.
          </AlertDescription>
        </Alert>
      )}

      {currentStatus === 'processing' && (
        <Alert variant="info" className="bg-purple-50 text-purple-800 border-purple-200">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Before marking as shipped, ensure you have properly packaged and dispatched the product.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

const StatusProductCard = ({ product }) => {
  const { toast } = useToast();
  const { updateRedemptionStatus, isUpdating } = useProductRedemption(product._id);
  const currentStatus = product.redemptionDetails?.status || 'pending';
  const isCreator = product.creator?.isSessionUser;

  const handleStatusUpdate = async (newStatus) => {
    try {
      await updateRedemptionStatus(newStatus);
      toast({
        title: "Status Updated",
        description: `Product redemption status has been updated to ${newStatus}.`,
      });
    } catch (err) {
      toast({
        title: "Update Failed",
        description: err.message,
        variant: "destructive"
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
          <div>
            <h3 className="font-semibold text-base md:text-lg">
              {product.name}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {product.description}
            </p>
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
              
              {/* Redemption Entry */}
              {product.redemptionDetails && (
                <div className="flex flex-col sm:flex-row sm:items-center text-sm gap-1 sm:gap-0 pt-2 border-t">
                  <div className="flex items-center min-w-0">
                    <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                    <Link
                      href={`/${product.redemptionDetails.redeemedBy?.username}`}
                      className="font-medium hover:underline truncate"
                    >
                      {product.redemptionDetails.redeemedBy?.name}
                    </Link>
                  </div>
                  <div className="flex items-center ml-6 sm:ml-0">
                    <ArrowRight className="w-4 h-4 mx-2 text-muted-foreground" />
                    <span className="text-muted-foreground truncate">
                      {new Date(product.redemptionDetails.redeemedAt).toLocaleDateString()} via redemption
                    </span>
                    <Badge 
                      variant="secondary" 
                      className={`ml-2 ${getStatusColor(currentStatus)}`}
                    >
                      redemption status: {currentStatus}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Creator Actions */}
          {isCreator && (
            <CreatorActions 
              currentStatus={currentStatus}
              onUpdateStatus={handleStatusUpdate}
              isUpdating={isUpdating}
            />
          )}

        </div>
      </div>
    </Card>
  );
};

export default StatusProductCard;