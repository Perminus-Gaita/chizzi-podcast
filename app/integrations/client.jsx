"use client";
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import TabNavigation from './components/tab-navigation';
import YourGroups from './components/tab-items/telegram/your-groups/index';

const AdminAPI = () => {
  const formOptions = [
    // Telegram settings
    {
      parentTab: 'Telegram',
      childTab: 'YourGroups',
      component: YourGroups
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