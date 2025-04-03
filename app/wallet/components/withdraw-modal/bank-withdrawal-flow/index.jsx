// components/withdraw-modal/bank-withdrawal-flow/index.jsx
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CreditCard, Plus, Building2 } from "lucide-react";

const STEPS = {
  RECIPIENT_SELECTION: 'recipient-selection',
  ADD_BANK_ACCOUNT: 'add-bank-account',
  ADD_CARD_ACCOUNT: 'add-card-account',
  CONFIRM_WITHDRAWAL: 'confirm-withdrawal'
};

const BankWithdrawFlow = ({
  bankRecipients,
  step,
  onStepChange,
  onConfirm,
  onBack
}) => {
  const [selectedRecipient, setSelectedRecipient] = useState(null);

  const handleBack = () => {
    setSelectedRecipient(null);
    onBack();
  };

  const handleRecipientSelect = (recipient) => {
    setSelectedRecipient(recipient);
    onStepChange(STEPS.CONFIRM_WITHDRAWAL);
  };

  const handleAddBankClick = () => {
    setSelectedRecipient(null);
    onStepChange(STEPS.ADD_BANK_ACCOUNT);
  };

  const handleAddCardClick = () => {
    setSelectedRecipient(null);
    onStepChange(STEPS.ADD_CARD_ACCOUNT);
  };

  const handleConfirmWithdrawal = () => {
    onConfirm(selectedRecipient);
  };

  const renderRecipientSelection = () => (
    <div className="grid gap-4">
      <h3 className="font-semibold">Choose a bank account</h3>
      <ScrollArea className="h-[300px] w-full">
        <div className="flex flex-col space-y-4">
          {bankRecipients.map((recipient) => (
            <Card
              key={recipient.paystackRecipientCode}
              className={`p-4 cursor-pointer hover:border-primary transition-colors ${
                selectedRecipient?.paystackRecipientCode === recipient.paystackRecipientCode ? 'border-primary' : ''
              }`}
              onClick={() => handleRecipientSelect(recipient)}
            >
              <div className="flex items-center space-x-4">
                <Building2 className="h-8 w-8" />
                <div className="flex-1">
                  <p className="font-semibold text-sm">
                    {recipient.name}
                  </p>
                  <div className="mt-2">
                    <p>{recipient.details.bankName}</p>
                    <p className="text-sm text-muted-foreground">
                      Account: •••• {recipient.details.accountNumber.slice(-4)}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or add new
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={handleAddBankClick}
        >
          <Building2 className="mr-2 h-4 w-4" />
          Add Bank Account
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={handleAddCardClick}
        >
          <CreditCard className="mr-2 h-4 w-4" />
          Add via Card
        </Button>
      </div>

      <Button variant="outline" onClick={handleBack}>
        Back
      </Button>
    </div>
  );

  const renderConfirmation = () => (
    <div className="grid gap-4">
      <h3 className="font-semibold">Confirm Withdrawal</h3>
      <Card className="p-4">
        <p className="font-semibold mb-2 text-sm">
          Withdraw to:
        </p>
        <div className="text-sm">
          <p>{selectedRecipient?.details.bankName}</p>
          <p>Account: •••• {selectedRecipient?.details.accountNumber.slice(-4)}</p>
          <p className="text-muted-foreground">{selectedRecipient?.name}</p>
        </div>
      </Card>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          onClick={() => {
            setSelectedRecipient(null);
            onStepChange(STEPS.RECIPIENT_SELECTION);
          }}
        >
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
      case STEPS.RECIPIENT_SELECTION:
        return renderRecipientSelection();
      case STEPS.CONFIRM_WITHDRAWAL:
        return renderConfirmation();
      default:
        return null;
    }
  };

  return <div>{renderStepContent()}</div>;
};

export default BankWithdrawFlow;