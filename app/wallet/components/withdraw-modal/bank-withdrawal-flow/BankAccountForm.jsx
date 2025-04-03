// BankAccountForm.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

const BankAccountForm = ({ onSubmit, onBack, loading }) => {
  const [banks, setBanks] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    accountNumber: '',
    bankCode: '',
  });
  const [error, setError] = useState(null);
  const [loadingBanks, setLoadingBanks] = useState(false);

  useEffect(() => {
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    setLoadingBanks(true);
    try {
      const response = await axios.get('https://api.paystack.co/bank?currency=KES');
      const banksData = response.data.data;
      
      // Remove duplicates based on bank code
      const uniqueBanks = banksData.reduce((acc, bank) => {
        if (!acc.find(b => b.code === bank.code)) {
          acc.push(bank);
        }
        return acc;
      }, []);

      // Sort banks alphabetically by name
      uniqueBanks.sort((a, b) => a.name.localeCompare(b.name));
      
      setBanks(uniqueBanks);
    } catch (error) {
      console.error('Error fetching banks:', error);
      setError('Failed to load banks. Please try again.');
    } finally {
      setLoadingBanks(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name.trim()) {
      setError('Account holder name is required');
      return;
    }
    if (!formData.accountNumber.trim()) {
      setError('Account number is required');
      return;
    }
    if (!formData.bankCode) {
      setError('Please select a bank');
      return;
    }

    onSubmit(formData);
  };

  const renderBankSelect = () => {
    if (loadingBanks) {
      return (
        <div className="flex items-center space-x-2 p-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading banks...</span>
        </div>
      );
    }

    if (banks.length === 0) {
      return (
        <SelectItem value="no-banks" disabled>
          No banks available
        </SelectItem>
      );
    }

    return banks.map((bank) => (
      <SelectItem 
        key={`bank-${bank.code}-${bank.name}`} 
        value={bank.code}
      >
        {bank.name}
      </SelectItem>
    ));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="font-semibold">Add Bank Account</h3>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Account Holder Name</Label>
        <Input
          id="name"
          placeholder="Enter account holder name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="accountNumber">Account Number</Label>
        <Input
          id="accountNumber"
          placeholder="Enter account number"
          value={formData.accountNumber}
          onChange={(e) => handleChange('accountNumber', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bank">Select Bank</Label>
        <Select
          value={formData.bankCode}
          onValueChange={(value) => handleChange('bankCode', value)}
          disabled={loadingBanks}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a bank" />
          </SelectTrigger>
          <SelectContent>
            {renderBankSelect()}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding Account...
            </>
          ) : (
            'Add Account'
          )}
        </Button>
      </div>
    </form>
  );
};

export default BankAccountForm;