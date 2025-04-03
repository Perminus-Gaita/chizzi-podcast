import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Loader2, 
  Plus, 
  ChevronRight, 
  Phone, 
  CreditCard, 
  Building2 
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import Image from 'next/image';
// Bank and Card components removed as they're not needed
// import BankAccountForm from './bank-withdrawal-flow/BankAccountForm';
// import CardAccountForm from './bank-withdrawal-flow/CardAccountForm';

const STEPS = {
  RECIPIENT_LIST: 'recipient-list',
  CREATE_RECIPIENT: 'create-recipient',
  ADD_MPESA: 'add-mpesa',
  ADD_BANK: 'add-bank',
  ADD_CARD: 'add-card',
  CONFIRM_WITHDRAWAL: 'confirm-withdrawal',
};

const WithdrawModal = ({ isOpen, onClose, onWithdraw }) => {
  const [step, setStep] = useState(STEPS.RECIPIENT_LIST);
  const [recipients, setRecipients] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  // No need for activeTab as we only have M-Pesa now
  // const [activeTab, setActiveTab] = useState("mpesa");
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState(null);
  const [withdrawAmount, setWithdrawAmount] = useState('50');

  // Load recipients when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchRecipients();
    } else {
      resetModalState();
    }
  }, [isOpen]);

  const resetModalState = () => {
    setStep(STEPS.RECIPIENT_LIST);
    setSelectedRecipient(null);
    setError(null);
    setPhoneNumber('');
  };

  const fetchRecipients = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/payments/withdraw/paystack/get-user-or-workspace-transfer-recipients');
      setRecipients(response.data.recipients);
    } catch (error) {
      console.error('Error fetching recipients:', error);
      setError('Failed to load recipients. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRecipient = () => {
    setStep(STEPS.CREATE_RECIPIENT);
  };

  const handleBackToList = () => {
    setStep(STEPS.RECIPIENT_LIST);
    setError(null);
  };

  const handleRecipientSelect = (recipient) => {
    setSelectedRecipient(recipient);
    setStep(STEPS.CONFIRM_WITHDRAWAL);
  };

  // Tab change handler removed as there's only one tab
  // const handleTabChange = (value) => {
  //   setActiveTab(value);
  //   setError(null);
  // };

  const handleAddMpesa = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/payments/withdraw/paystack/create-transfer-recipient', {
        type: 'mobile_money',
        name: phoneNumber,
        accountNumber: phoneNumber,
        bankCode: 'MPESA',
        currency: 'KES'
      });
      
      await fetchRecipients();
      setStep(STEPS.RECIPIENT_LIST);
      setPhoneNumber('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add phone number');
    } finally {
      setLoading(false);
    }
  };

  // Bank and Card handlers removed as they're not needed
  // const handleAddBankAccount = async (bankData) => {
  //   // ... implementation removed
  // };
  //
  // const handleAddCardAccount = async (cardData) => {
  //   // ... implementation removed
  // };

  const handleConfirmWithdrawal = () => {
    if (!withdrawAmount || Number(withdrawAmount) < 49 || Number(withdrawAmount) > 140000) {
      setError('Please enter a valid amount between KES 49 and KES 140,000');
      return;
    }
    
    onWithdraw({
      ...selectedRecipient,
      amount: withdrawAmount
    });
    onClose();
  };

  const renderRecipientsList = () => {
    const filteredRecipients = recipients.filter(recipient => {
      return recipient.type === "mobile_money";
    });

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">Withdraw Funds</h3>
        </div>

        <Tabs defaultValue="mpesa">
          <TabsList className="w-full">
            <TabsTrigger value="mpesa" className="w-full">M-Pesa</TabsTrigger>
          </TabsList>
          
          <div className="mt-4">
            <Button 
              variant="outline" 
              className="w-full justify-between mb-4"
              onClick={handleCreateRecipient}
            >
              <span className="flex items-center">
                <Plus size={16} className="mr-2" />
                Add M-Pesa Number
              </span>
              <ChevronRight size={16} />
            </Button>

            {loading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Loading recipients...</span>
              </div>
            ) : filteredRecipients.length === 0 ? (
              <div className="text-center p-4 border rounded-md bg-muted/50">
                <p className="text-muted-foreground">
                  No M-Pesa numbers found.
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Add one using the button above.
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[240px]">
                <div className="space-y-2">
                  {filteredRecipients.map((recipient) => (
                    <Card
                      key={recipient.paystackRecipientCode}
                      className="p-3 cursor-pointer hover:border-primary"
                      onClick={() => handleRecipientSelect(recipient)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {recipient.type === "mobile_money" && <Phone className="h-5 w-5 mr-3 text-muted-foreground" />}
                          {recipient.type === "nuban" && <Building2 className="h-5 w-5 mr-3 text-muted-foreground" />}
                          {recipient.type === "authorization" && <CreditCard className="h-5 w-5 mr-3 text-muted-foreground" />}
                          
                          <div>
                            <p className="font-medium">{recipient.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {recipient.type === "mobile_money" ? recipient.details.accountNumber :
                               recipient.type === "nuban" ? `${recipient.details.bankName} - ****${recipient.details.accountNumber.slice(-4)}` :
                               `Card - ****${recipient.details.accountNumber || "••••"}`}
                            </p>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-muted-foreground" />
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </Tabs>
      </div>
    );
  };

  const renderCreateRecipient = () => {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={handleBackToList} className="mb-2">
          &larr; Back to Recipients
        </Button>
        
        <Tabs defaultValue="mpesa">
          <TabsList className="w-full">
            <TabsTrigger value="mpesa" className="w-full">M-Pesa</TabsTrigger>
          </TabsList>
          
          <TabsContent value="mpesa">
            <div className="space-y-4 mt-4">
              <h3 className="font-medium">Add M-Pesa Number</h3>
              <div className="grid gap-2">
                <Label htmlFor="phone">M-Pesa Number</Label>
                <Input 
                  id="phone" 
                  placeholder="e.g., 0712345678" 
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Enter your M-Pesa registered phone number
                </p>
              </div>
              <Button 
                onClick={handleAddMpesa} 
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add M-Pesa Number"
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  const renderConfirmWithdrawal = () => {
    if (!selectedRecipient) return null;
    
    const recipientTypeLabel = 
      selectedRecipient.type === "mobile_money" ? "M-Pesa" :
      selectedRecipient.type === "nuban" ? "Bank Account" : "Card";
      
    const recipientIcon = 
      selectedRecipient.type === "mobile_money" ? <Phone className="h-5 w-5 mr-2" /> :
      selectedRecipient.type === "nuban" ? <Building2 className="h-5 w-5 mr-2" /> :
      <CreditCard className="h-5 w-5 mr-2" />;
      
    const recipientDetail = 
      selectedRecipient.type === "mobile_money" ? selectedRecipient.details.accountNumber :
      selectedRecipient.type === "nuban" ? `${selectedRecipient.details.bankName} - ****${selectedRecipient.details.accountNumber.slice(-4)}` :
      `Card - ****${selectedRecipient.details.accountNumber || "••••"}`;

    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={handleBackToList} className="mb-2">
          &larr; Back to Recipients
        </Button>
        
        <h3 className="font-semibold">Confirm Withdrawal</h3>
        
        <Card className="p-4">
          <h4 className="font-medium mb-3">Withdrawal Details</h4>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount" className="mb-1 block">Amount (KES)</Label>
              <Input
                id="amount"
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Enter amount"
                min="49"
                max="140000"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Min KES 49, Max KES 140,000
              </p>
            </div>
            
            <div className="p-3 border rounded-md">
              <p className="text-sm font-medium mb-1">Withdraw to:</p>
              <div className="flex items-center">
                {recipientIcon}
                <div>
                  <p className="font-medium">{selectedRecipient.name}</p>
                  <p className="text-sm text-muted-foreground">{recipientDetail}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
        
        <div className="flex gap-2 pt-2">
          <Button variant="outline" onClick={handleBackToList} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleConfirmWithdrawal} className="flex-1">
            Confirm Withdrawal
          </Button>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (step) {
      case STEPS.RECIPIENT_LIST:
        return renderRecipientsList();
      case STEPS.CREATE_RECIPIENT:
        return renderCreateRecipient();
      case STEPS.CONFIRM_WITHDRAWAL:
        return renderConfirmWithdrawal();
      default:
        return renderRecipientsList();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card">
        <DialogHeader>
          <DialogTitle>Withdraw Funds</DialogTitle>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawModal;