import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const RedeemProductModal = ({ isOpen, onClose, onRedeem, productName }) => {
  const [shippingInfo, setShippingInfo] = useState({
    shippingAddress: '',
    phoneNumber: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onRedeem({
        shippingAddress: shippingInfo.shippingAddress,
        phoneNumber: shippingInfo.phoneNumber
      });
      onClose();
    } catch (error) {
      console.error('Error redeeming product:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-card">
        <DialogHeader>
          <DialogTitle>Redeem {productName}</DialogTitle>
          <DialogDescription>
            Please provide your shipping information to redeem this product.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="shippingAddress">Shipping Address</Label>
              <Textarea
                id="shippingAddress"
                placeholder="Enter your full shipping address"
                value={shippingInfo.shippingAddress}
                onChange={(e) => setShippingInfo(prev => ({ ...prev, shippingAddress: e.target.value }))}
                required
                className="min-h-[100px]"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="Enter your phone number"
                value={shippingInfo.phoneNumber}
                onChange={(e) => setShippingInfo(prev => ({ ...prev, phoneNumber: e.target.value }))}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Redeeming...' : 'Redeem Product'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RedeemProductModal;