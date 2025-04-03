import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Phone
} from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

const statusIcons = {
  pending: Clock,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle2
};

const statusColors = {
  pending: "bg-yellow-500",
  processing: "bg-blue-500",
  shipped: "bg-purple-500",
  delivered: "bg-green-500"
};

const ProductRedemptionStatus = ({ 
  product, 
  statusDetails, 
  onUpdateStatus 
}) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async (newStatus) => {
    setIsUpdating(true);
    try {
      await onUpdateStatus(newStatus);
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const StatusIcon = statusIcons[statusDetails.currentStatus] || AlertCircle;

  const renderCreatorView = () => (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <StatusIcon className="w-5 h-5" />
          Redemption Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge className={statusColors[statusDetails.currentStatus]}>
              {statusDetails.currentStatus.toUpperCase()}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium">Shipping Details:</p>
            <div className="text-sm text-gray-500">
              {product.redemptionDetails.shippingAddress}
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Phone className="w-4 h-4 mr-2" />
              {product.redemptionDetails.phoneNumber}
            </div>
          </div>

          {statusDetails.currentStatus === 'pending' && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Action Required</AlertTitle>
              <AlertDescription>
                Please process this redemption request and update the status once started.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        {statusDetails.availableActions.map(action => (
          <Button 
            key={action}
            onClick={() => handleStatusUpdate(action)}
            disabled={isUpdating}
          >
            Mark as {action}
          </Button>
        ))}
      </CardFooter>
    </Card>
  );

  const renderRedeemerView = () => (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <StatusIcon className="w-5 h-5" />
          Your Redemption Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge className={statusColors[statusDetails.currentStatus]}>
              {statusDetails.currentStatus.toUpperCase()}
            </Badge>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Shipping to:</p>
            <div className="text-sm text-gray-500">
              {product.redemptionDetails.shippingAddress}
            </div>
          </div>

          {statusDetails.currentStatus === 'shipped' && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Product Shipped!</AlertTitle>
              <AlertDescription>
                Once you receive the product, please mark it as delivered.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        {statusDetails.availableActions.map(action => (
          <Button 
            key={action}
            onClick={() => handleStatusUpdate(action)}
            disabled={isUpdating}
          >
            Mark as {action}
          </Button>
        ))}
      </CardFooter>
    </Card>
  );

  return statusDetails.isCreator ? renderCreatorView() : renderRedeemerView();
};

export default ProductRedemptionStatus;