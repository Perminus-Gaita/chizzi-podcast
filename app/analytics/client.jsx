"use client";
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import TabNavigation from './components/tab-navigation';
import Overview from './components/tab-items/overview';
import Revenue from './components/tab-items/revenue';
import Tournaments from './components/tab-items/tournaments';
import { useSearchParams } from 'next/navigation';

const Analytics = () => {
  const TabContent = () => {
    const searchParams = useSearchParams();
    const selectedTab = searchParams.get('tab') || 'overview';

    const components = {
      overview: Overview,
      revenue: Revenue,
      tournaments: Tournaments
    };

    const Component = components[selectedTab];
    return Component ? <Component /> : null;
  };

  return (
    <div className="min-h-screen" style={{ maxWidth: "750px", margin: "auto" }}>
      <div className="mx-auto">
        <Card className="bg-card/50 h-full" style={{minHeight: "500px"}}>
          <CardContent className="p-0 h-full">
            <TabNavigation>
              <TabContent />
            </TabNavigation>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;