// app/admin/client.jsx
"use client";
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import TabNavigation from './components/tab-navigation';
import SendMessage from './components/tab-items/telegram/send-message';
import BotGroups from './components/tab-items/telegram/bot-groups';
import Webhook from './components/tab-items/telegram/webhook';

const AdminAPI = () => {
  const formOptions = [
    // Telegram settings
    {
      parentTab: 'Telegram',
      childTab: 'SendMessage',
      component: SendMessage
    },
    {
      parentTab: 'Telegram',
      childTab: 'BotGroups',
      component: BotGroups
    },
    {
      parentTab: 'Telegram',
      childTab: 'Webhook',
      component: Webhook
    }
  ];

  const formContent = (
    <Card className="bg-card/50 h-full" style={{minHeight: "500px"}}>
      <CardContent className="p-0 h-full">
        <TabNavigation formOptions={formOptions} />
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-[750px] w-full">
        {formContent}
      </div>
    </div>
  );
};

export default AdminAPI;