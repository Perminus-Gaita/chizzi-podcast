"use client";
import React, { useState } from "react";
import axios from "axios";

import {
  DollarSign,
  Package,
  ArrowRight,
  Check,
  Shield,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getTierIcon } from "@/utils/tournaments";

const SupportModal = ({
  isOpen,
  onClose,
  selectedTier,
  products,
  onDirectSupport,
  onProductSupport,
  isProcessing,
  // paymentInformation,
  // tournamentId,
}) => {
  const [supportType, setSupportType] = useState("direct");
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [paymentDetailsVisible, setPaymentDetailsVisible] = useState(false);
  const [transactionId, setTransactionId] = useState("");

  // Filter products for this tier
  const tierProducts = products.filter(
    (p) => p.currentOwner.tierId === selectedTier?.id
  );

  const handleSupportClick = async () => {
    if (supportType === "direct") {
      await onDirectSupport(selectedTier, "direct");
    } else {
      await onProductSupport(selectedProduct, "product");
    }
  };

  // const handleDirectSupportConfirmation = async () => {
  //   console.log("### coonfirming direct sponsorship");
  //   console.log(selectedTier.amount / 100, transactionId);

  //   try {
  //     const response = await axios.post(
  //       "/api/payments/sponsor/user-managed-payment",
  //       {
  //         tournamentId: tournamentId,
  //         amount: selectedTier.amount,
  //         currency: "KES",
  //         transactionCode: transactionId,
  //       }
  //     );

  //     console.log("Sponsorship confirmed:", response.data);
  //     setPaymentDetailsVisible(false);
  //     onClose();
  //   } catch (error) {
  //     console.error("Error confirming direct sponsorship:", error);
  //   }
  // };

  // const handleProductSupportConfirmation = async () => {
  //   console.log("### coonfirming product sponsorship");
  //   console.log(selectedProduct?._id, transactionId);

  //   try {
  //     const response = await axios.post(
  //       "/api/payments/products/user-managed-payment",
  //       {
  //         tournamentId: tournamentId,
  //         productId: selectedProduct?._id,
  //         currency: "KES",
  //         transactionCode: transactionId,
  //       }
  //     );

  //     console.log("Product purchase confirmed:", response.data);
  //     setPaymentDetailsVisible(false);
  //     onClose();
  //   } catch (error) {
  //     console.error("Error confirming product purchase:", error);
  //   }
  // };

  if (!selectedTier) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95%] sm:w-11/12 md:max-w-[80%] lg:max-w-[60%] h-[90vh] sm:h-[85vh] bg-light dark:bg-dark">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-md md:text-2xl">
            {React.createElement(getTierIcon(selectedTier.id).icon, {
              className: `h-4 w-4 md:h-6 md:w-6 ${selectedTier.color}`,
            })}
            {selectedTier.name} Support
          </DialogTitle>
          <DialogDescription className="text-xs md:text-md">
            Choose how you'd like to support this tournament
          </DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue="direct"
          value={supportType}
          onValueChange={setSupportType}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="direct" className="text-sm">
              <DollarSign className="h-4 w-4 mr-2" />
              Direct
            </TabsTrigger>
            <TabsTrigger value="products" className="text-sm">
              <Package className="h-4 w-4 mr-2" />
              Buy Product
            </TabsTrigger>
          </TabsList>

          <TabsContent value="direct" className="space-y-4 mt-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-medium">Amount</span>
                  <span className="text-2xl font-bold">
                    KES {(selectedTier.amount / 100).toLocaleString()}
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">
                      Direct Support Benefits
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      {selectedTier.directSponsorshipPerks.map(
                        (perk, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            <span className="text-sm">{perk}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* {!paymentDetailsVisible ? (
                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Tournament Impact
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Your direct sponsorship contributes 100% to the
                        tournament prize pool
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 ">
                      <p className="text-lg font-medium">
                        Make your payment of KES{" "}
                        {(selectedTier.amount / 100).toLocaleString()} via
                        M-Pesa to:
                      </p>

                      <div className="mt-4 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                        {/* <p className="text-sm">
                          Send KSH {tournament?.buyIn?.entryFee} to:
                        </p> 
                        <p className="font-medium">
                          {paymentInformation?.type === "phoneNumber" && (
                            <span>
                              Phone Number: {paymentInformation?.details}
                            </span>
                          )}
                          {paymentInformation?.type === "mpesaPaybill" && (
                            <span>Paybill: {paymentInformation?.details}</span>
                          )}
                          {paymentInformation?.type === "lipaNaMpesa" && (
                            <span>
                              Till/Business Number:{" "}
                              {paymentInformation?.details}
                            </span>
                          )}
                        </p>

                        {paymentInformation.type === "paybill" && (
                          <p className="text-sm mt-2">
                            Use your Kadi username as the reference/payment
                            note.
                          </p>
                        )}

                        <div className="mt-4">
                          <label
                            htmlFor="transactionId"
                            className="block text-sm font-medium mb-1"
                          >
                            Transaction ID/Confirmation Code
                          </label>
                          <input
                            type="text"
                            id="transactionId"
                            className="w-full border rounded px-3 py-2 dark:bg-zinc-800 bg-gray-100 dark:border-zinc-700 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter transaction ID"
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                          />
                          {/* {error && (
                            <p className="text-red-500 text-sm mt-1">{error}</p>
                          )} 
                        </div>
                      </div>
                    </div>
                  )} */}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-4 mt-4">
            {tierProducts.length > 0 ? (
              <div className="space-y-2">
                {/* <div className="grid gap-2 max-h-[35vh] overflow-y-auto pr-2">
                  {tierProducts.map((product) => (
                    <Card
                      key={product._id}
                      className={`cursor-pointer transition-all ${
                        selectedProduct?._id === product._id
                          ? "ring-2 ring-primary"
                          : ""
                      }`}
                      onClick={() => setSelectedProduct(product)}
                    >
                      <CardContent className="p-2">
                        <div className="flex items-start gap-4">
                          {product.image && (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium">{product.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  KES{" "}
                                  {(
                                    product.currentOwner.price.amount / 100
                                  ).toLocaleString()}
                                </p>
                              </div>
                             
                            </div>
                            <p className="text-sm mt-2">
                              {product.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div> */}

                <div className="grid gap-2 max-h-[35vh] overflow-y-auto pr-2">
                  {tierProducts.map((product) => (
                    <Card
                      key={product._id}
                      className={`cursor-pointer transition-all flex items-center p-2 ${
                        selectedProduct?._id === product._id
                          ? "ring-2 ring-primary"
                          : ""
                      }`}
                      onClick={() => setSelectedProduct(product)}
                    >
                      {product.image && (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-md mr-3" // Smaller image, margin
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        {" "}
                        <h3 className="text-sm font-medium truncate">
                          {product.name}
                        </h3>{" "}
                        <p className="text-xs text-muted-foreground">
                          KES{" "}
                          {(
                            product.currentOwner.price.amount / 100
                          ).toLocaleString()}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>

                {selectedProduct && !paymentDetailsVisible && (
                  <div className="bg-muted p-2 rounded-lg space-y-1">
                    <h4 className="font-medium text-sm">Includes:</h4>
                    <div className="space-y-1">
                      <p className="text-sm">
                        • {selectedProduct.name} &bull; All {selectedTier.name}{" "}
                        tier benefits
                      </p>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        70% supports the creator, 25% goes to tournament prizes,
                        5% platform fee
                      </p>
                    </div>
                  </div>
                )}

                {/* {selectedProduct &&
                  paymentDetailsVisible && ( // Payment details
                    <>
                      <div className="space-y-4 ">
                        <p className="text-lg font-medium">
                          Make your payment of KES{" "}
                          {(
                            selectedProduct.price.amount / 100
                          ).toLocaleString()}{" "}
                          via M-Pesa to:
                        </p>

                        <div className="mt-4 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                          {/* <p className="text-sm">
                          Send KSH {tournament?.buyIn?.entryFee} to:
                        </p> 
                          <p className="font-medium">
                            {paymentInformation?.type === "phoneNumber" && (
                              <span>
                                Phone Number: {paymentInformation?.details}
                              </span>
                            )}
                            {paymentInformation?.type === "mpesaPaybill" && (
                              <span>
                                Paybill: {paymentInformation?.details}
                              </span>
                            )}
                            {paymentInformation?.type === "lipaNaMpesa" && (
                              <span>
                                Till/Business Number:{" "}
                                {paymentInformation?.details}
                              </span>
                            )}
                          </p>

                          {paymentInformation.type === "paybill" && (
                            <p className="text-sm mt-2">
                              Use your Kadi username as the reference/payment
                              note.
                            </p>
                          )}

                          <div className="mt-4">
                            <label
                              htmlFor="transactionId"
                              className="block text-sm font-medium mb-1"
                            >
                              Transaction ID/Confirmation Code
                            </label>
                            <input
                              type="text"
                              id="transactionId"
                              className="w-full border rounded px-3 py-2 dark:bg-zinc-800 bg-gray-100 dark:border-zinc-700 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Enter transaction ID"
                              value={transactionId}
                              onChange={(e) => setTransactionId(e.target.value)}
                            />
                            {/* {error && (
                            <p className="text-red-500 text-sm mt-1">{error}</p>
                          )} 
                          </div>
                        </div>
                      </div>
                    </>
                  )} */}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No products available in this tier yet</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-2 md:mt-4">
          <Button
            variant="outline"
            onClick={() => {
              onClose();
              // setPaymentDetailsVisible(false);
            }}
            className="hidden md:inline"
          >
            Cancel
          </Button>
          {/* <Button
            onClick={
              paymentDetailsVisible
                ? supportType === "direct"
                  ? handleDirectSupportConfirmation
                  : handleProductSupportConfirmation
                : handleSupportClick
            }
            disabled={
              isProcessing ||
              (supportType === "products" && !selectedProduct) ||
              (supportType === "products" &&
                paymentDetailsVisible &&
                !transactionId) ||
              (supportType === "direct" &&
                paymentDetailsVisible &&
                !transactionId)
            }
          >
            {isProcessing
              ? "Processing..."
              : paymentDetailsVisible
              ? "Confirm Payment"
              : supportType === "direct"
              ? "Proceed to Direct Payment"
              : "Proceed to Product Payment"}
          </Button> */}

          <Button
            onClick={handleSupportClick}
            disabled={
              isProcessing || (supportType === "products" && !selectedProduct)
            }
          >
            {isProcessing ? (
              "Processing..."
            ) : (
              <span className="flex items-center gap-2">
                {supportType === "direct"
                  ? "Proceed to Direct Payment"
                  : "Proceed to Product Payment"}
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>
        </div>

        <p className="text-[10px] sm:text-xs text-center text-muted-foreground">
          Secure payment via M-Pesa • Instant Recognition
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default SupportModal;
