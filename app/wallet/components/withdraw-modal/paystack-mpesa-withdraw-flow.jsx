import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Phone, Loader2 } from "lucide-react";

const STEPS = {
  PHONE_INPUT: 'phone-input',
  RECIPIENT_SELECTION: 'recipient-selection',
  CONFIRM_WITHDRAWAL: 'confirm-withdrawal'
};

const MpesaWithdrawFlow = ({
  recipients,
  step,
  onStepChange,
  onConfirm,
  onBack,
  onPhoneSubmit,
  loading
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [error, setError] = useState(null);
  const [recipientsLoading, setRecipientsLoading] = useState(false);
  const [localRecipients, setLocalRecipients] = useState(recipients || []);

  // Effect to fetch recipients if they're not already provided
  useEffect(() => {
    if (recipients && recipients.length > 0) {
      setLocalRecipients(recipients);
    } else {
      fetchRecipients();
    }
  }, [recipients]);

  const fetchRecipients = async () => {
    setRecipientsLoading(true);
    try {
      const response = await axios.get('/api/payments/withdraw/paystack/get-user-or-workspace-transfer-recipients');
      const mobileMoneyRecipients = response.data.recipients.filter(
        recipient => recipient.type === 'mobile_money'
      );
      setLocalRecipients(mobileMoneyRecipients);
      
      // If recipients are available, set step to selection
      if (mobileMoneyRecipients.length > 0 && step === STEPS.PHONE_INPUT) {
        onStepChange(STEPS.RECIPIENT_SELECTION);
      }
    } catch (err) {
      setError('Failed to fetch M-Pesa accounts. Please try again.');
      console.error('Error fetching recipients:', err);
    } finally {
      setRecipientsLoading(false);
    }
  };

  const handlePhoneSubmit = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }
    onPhoneSubmit(phoneNumber);
  };

  const handleRecipientSelect = (recipient) => {
    setSelectedRecipient(recipient);
    onStepChange(STEPS.CONFIRM_WITHDRAWAL);
  };

  const handleConfirmWithdrawal = () => {
    onConfirm(selectedRecipient);
  };

  const renderPhoneInput = () => (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="phone">M-Pesa Number</Label>
        <Input 
          id="phone" 
          placeholder="e.g., 0712345678" 
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />
        <p className="text-sm text-muted-foreground">
          Enter your M-Pesa number
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handlePhoneSubmit} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continue"}
        </Button>
      </div>
    </div>
  );

  const renderRecipientSelection = () => (
    <div className="grid gap-4">
      <h3 className="font-semibold">Choose M-Pesa Account</h3>
      
      {recipientsLoading ? (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading accounts...</span>
        </div>
      ) : localRecipients && localRecipients.length > 0 ? (
        <ScrollArea className="h-[200px]">
          {localRecipients.map((recipient) => (
            <Card
              key={recipient.paystackRecipientCode}
              className="mb-2 p-3 cursor-pointer hover:border-primary"
              onClick={() => handleRecipientSelect(recipient)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{recipient.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {recipient.details.accountNumber}
                  </p>
                </div>
                <Phone className="h-5 w-5 text-muted-foreground" />
              </div>
            </Card>
          ))}
        </ScrollArea>
      ) : (
        <Alert>
          <AlertDescription>
            No saved M-Pesa accounts found. Add a new number below.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            {localRecipients && localRecipients.length > 0 ? 'or' : 'add new'}
          </span>
        </div>
      </div>
      
      <Button 
        variant="outline" 
        onClick={() => onStepChange(STEPS.PHONE_INPUT)}
        className="mt-2"
      >
        <Phone className="h-4 w-4 mr-2" />
        Add New Number
      </Button>
      
      <Button variant="outline" onClick={onBack}>
        Back
      </Button>
    </div>
  );

  const renderConfirmation = () => (
    <div className="grid gap-4">
      <h3 className="font-semibold">Confirm Withdrawal</h3>
      <Card className="p-4">
        <div className="flex items-center mb-2">
          <Image 
            src="/m-pesa-logo/mpesa_logo_no_bg.png" 
            alt="M-Pesa" 
            width={80} 
            height={16} 
            style={{objectFit: 'contain'}} 
          />
        </div>
        <p className="font-semibold text-sm">
          Withdraw to: <span className="font-normal">{selectedRecipient?.name}</span>
        </p>
        <p className="text-sm text-muted-foreground">
          {selectedRecipient?.details.accountNumber}
        </p>
      </Card>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleConfirmWithdrawal}>
          Confirm
        </Button>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (step) {
      case STEPS.PHONE_INPUT:
        return renderPhoneInput();
      case STEPS.RECIPIENT_SELECTION:
        return renderRecipientSelection();
      case STEPS.CONFIRM_WITHDRAWAL:
        return renderConfirmation();
      default:
        return null;
    }
  };

  return (
    <div>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {renderStepContent()}
    </div>
  );
};

export default MpesaWithdrawFlow;