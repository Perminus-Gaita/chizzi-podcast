import React from 'react';
import { X, AlertCircle, CheckCircle2, CreditCard, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import moment from 'moment';

const DepositNotification = ({ notification, onDelete, isLoading }) => {
  const isSuccess = notification.status === "success";
  const bgColor = isSuccess ? "bg-green-800" : "bg-red-800";

  // Format payment method display
  const formatPaymentMethod = (method) => {
    const paymentMethods = {
      'pending': 'Pending',
      'wufwufWallet': 'Wufwuf Wallet',
      'paystackCard': 'Card',
      'paystackMpesa': 'M-Pesa',
      'mpesa': 'M-Pesa'
    };
    return paymentMethods[method] || method;
  };

  // Format amount with dynamic currency from notification
  const formatAmount = (amount, currency) => {
    // Convert from base units (cents/cents) to main units
    const convertedAmount = amount / 100;

    // Define currency locale mapping
    const currencyLocales = {
      'KES': 'en-KE', // Kenya
      'USD': 'en-US', // United States
    };

    // Get the appropriate locale for the currency, fallback to 'en-US'
    const locale = currencyLocales[currency] || 'en-US';

    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency || 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(convertedAmount);
    } catch (error) {
      // Fallback formatting if the currency is not supported
      return `${currency} ${convertedAmount.toFixed(2)}`;
    }
  };

  return (
    <div className={`${bgColor} bg-opacity-50 rounded-lg p-4`}>
      <div className="flex items-start justify-between">
        {/* Left side - Icon and main content */}
        <div className="flex flex-grow">
          <div className="flex-shrink-0 mr-4">
            {isSuccess ? (
              <div className="bg-green-500 bg-opacity-20 p-2 rounded-full">
                <CheckCircle2 className="h-6 w-6 text-green-300" />
              </div>
            ) : (
              <div className="bg-red-500 bg-opacity-20 p-2 rounded-full">
                <AlertCircle className="h-6 w-6 text-red-300" />
              </div>
            )}
          </div>
          
          <div className="flex-grow">
            {/* Amount and Payment Method */}
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-gray-400" />
              <p className="text-[15px] font-medium">
                {formatAmount(
                  notification.metadata?.amount,
                  notification.metadata?.currency
                )}
                {notification.metadata?.paymentChannel && (
                  <span className="text-gray-400 text-xs ml-2">
                    via {formatPaymentMethod(notification.metadata.paymentChannel)}
                  </span>
                )}
              </p>
            </div>
            
            {/* Main Message */}
            <p className="text-[15px] mt-1">
              {notification.message}
            </p>

            {/* Details */}
            {notification.details && (
              <p className="text-sm text-gray-300 mt-1">
                {notification.details}
              </p>
            )}

            {/* Show Wallet Balance for Success */}
            {isSuccess && notification.metadata?.walletBalance && (
              <div className="flex items-center gap-2 mt-2 text-gray-300">
                <Wallet className="h-4 w-4" />
                <span className="text-sm">
                  Balance: {formatAmount(
                    notification.metadata.walletBalance,
                    notification.metadata?.currency
                  )}
                </span>
              </div>
            )}

            {/* Transaction Reference */}
            {notification.relatedId && (
              <p className="text-xs text-gray-400 mt-1">
                Transaction ID: {notification.relatedId}
              </p>
            )}

            {/* Timestamp */}
            <p className="text-xs text-gray-400 mt-2">
              {moment(notification.createdAt).fromNow()}
            </p>
          </div>
        </div>

        {/* Delete button */}
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.(notification._id);
          }}
          variant="ghost"
          size="sm"
          disabled={isLoading}
          className="ml-2 flex-shrink-0 -mt-1"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default DepositNotification;
