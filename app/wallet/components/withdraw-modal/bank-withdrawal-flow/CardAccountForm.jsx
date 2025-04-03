// components/withdraw-modal/bank-withdrawal-flow/CardAccountForm.jsx.
import React, { useState } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CreditCard } from "lucide-react";
import { Card } from "@/components/ui/card";

const CardAccountForm = ({ onSubmit, onBack, loading }) => {
  const [paymentDetails, setPaymentDetails] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [error, setError] = useState(null);
  const [loadingCards, setLoadingCards] = useState(false);

  React.useEffect(() => {
    fetchPaymentDetails();
  }, []);

  const fetchPaymentDetails = async () => {
    setLoadingCards(true);
    try {
      const response = await axios.get('/api/payments/withdraw/paystack/get-payment-details');
      setPaymentDetails(response.data.paymentDetails);
    } catch (error) {
      console.error('Error fetching card details:', error);
      setError('Failed to load saved cards. Please try again.');
    } finally {
      setLoadingCards(false);
    }
  };

  const handleCardSelect = async (card) => {
    setSelectedCard(card);
    setError(null);

    try {
      await onSubmit({
        email: card.email,
        authorization_code: card.authorization.authorizationCode,
        name: card.name || `${card.authorization.bank} Card`,
      });
    } catch (error) {
      setError('Failed to create transfer recipient');
      setSelectedCard(null);
    }
  };

  if (loadingCards) {
    return (
      <div className="flex flex-col items-center justify-center p-4 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-sm text-muted-foreground">Loading your cards...</p>
      </div>
    );
  }

  if (paymentDetails.length === 0) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertDescription>
            No saved cards found. You need to add a card through a deposit first.
          </AlertDescription>
        </Alert>
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Select a Card</h3>
      
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-3">
        {paymentDetails.map((card) => (
          <Card
            key={card._id}
            className={`p-4 cursor-pointer hover:border-primary transition-colors ${
              selectedCard?._id === card._id ? 'border-primary' : ''
            }`}
            onClick={() => !loading && handleCardSelect(card)}
          >
            <div className="flex items-center space-x-4">
              <CreditCard className="h-6 w-6" />
              <div className="flex-1">
                <p className="font-medium">
                  {card.authorization.bank} •••• {card.authorization.last4}
                </p>
                <p className="text-sm text-muted-foreground">
                  Expires {card.authorization.expiryMonth}/{card.authorization.expiryYear}
                </p>
                <p className="text-sm text-muted-foreground">
                  {card.authorization.cardType.toUpperCase()}
                </p>
              </div>
              {selectedCard?._id === card._id && loading && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-start pt-4">
        <Button variant="outline" onClick={onBack} disabled={loading}>
          Back
        </Button>
      </div>

      <div className="text-sm text-muted-foreground mt-4">
        <p>
          Select a card to create a bank transfer recipient linked to its associated bank account.
          You&apos;ll be able to withdraw to this account in future transactions.
        </p>
      </div>
    </div>
  );
};

export default CardAccountForm;