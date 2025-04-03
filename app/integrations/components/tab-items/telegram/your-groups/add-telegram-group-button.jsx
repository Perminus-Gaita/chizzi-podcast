import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from 'lucide-react';

const AddTelegramGroupButton = ({ hasTelegramAccount, isSendingMessage, onClick }) => {
  return (
    <Button onClick={onClick} disabled={!hasTelegramAccount || isSendingMessage}>
      {isSendingMessage ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Plus className="h-4 w-4 mr-2" />
      )}
      Add Telegram Group
    </Button>
  );
};

export default AddTelegramGroupButton;

