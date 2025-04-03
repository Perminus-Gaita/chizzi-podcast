import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Users, Trophy, Award, Crown, Settings2 } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import useSWR from 'swr';
import axios from 'axios';

// Fetcher function for SWR
const fetcher = url => axios.get(url).then(res => res.data);

const StatCard = ({ title, value, trend, icon: Icon, trendValue, currency, exchangeRate }) => {
  const formatValue = (val) => {
    if (typeof val !== 'number') return '0';
    
    // If it's a participant count, just return the number
    if (title.toLowerCase().includes('participants')) {
      return val.toLocaleString();
    }
    
    // For revenue values, handle currency conversion
    if (title.toLowerCase().includes('revenue')) {
      // Convert cents to shillings for KES and round down
      const adjustedValue = currency === 'KES' ? Math.floor(val / 100) : val;
      // Apply exchange rate
      const convertedValue = currency === 'KES' ? adjustedValue : (adjustedValue * exchangeRate);
      return `${currency === 'KES' ? 'KES' : '$'} ${convertedValue.toLocaleString(undefined, {
        minimumFractionDigits: currency === 'KES' ? 0 : 2,
        maximumFractionDigits: currency === 'KES' ? 0 : 2
      })}`;
    }
    
    // For other numeric values (like tournament counts)
    return val.toLocaleString();
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-muted-foreground text-sm font-medium break-words">{title}</h3>
          <Icon className="text-primary flex-shrink-0 ml-2" size={20} />
        </div>
        <div>
          <p className="text-2xl font-semibold text-foreground break-words">
            {formatValue(value)}
          </p>
          {trend && (
            <span className={`flex items-center text-sm ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
              {trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {trendValue}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const PrizePoolCard = ({ title, value, icon: Icon, currency, exchangeRate }) => {
  const formatValue = (val) => {
    if (typeof val !== 'number') return '0';
    
    // Convert cents to shillings for KES and round down
    const adjustedValue = currency === 'KES' ? Math.floor(val / 100) : val;
    
    // Apply exchange rate
    const convertedValue = currency === 'KES' ? adjustedValue : (adjustedValue * exchangeRate);
    
    return `${currency === 'KES' ? 'KES' : '$'} ${convertedValue.toLocaleString(undefined, {
      minimumFractionDigits: currency === 'KES' ? 0 : 2,
      maximumFractionDigits: currency === 'KES' ? 0 : 2
    })}`;
  };

  return (
    <Card className="col-span-2">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-muted-foreground text-sm font-medium break-words">{title}</h3>
          <Icon className="text-primary flex-shrink-0 ml-2" size={20} />
        </div>
        <p className="text-2xl font-semibold text-foreground break-words">
          {formatValue(value)}
        </p>
      </CardContent>
    </Card>
  );
};

const AnalyticsDashboard = () => {
  const [currency, setCurrency] = useState('KES');
  const exchangeRate = currency === 'KES' ? 1 : 0.000075;

  const { data: analyticsData, error: analyticsError, isLoading: isAnalyticsLoading } = useSWR('/api/analytics/overview', fetcher);
  const { data: sessionData, error: sessionError, isLoading: isSessionLoading } = useSWR('/api/user/session', fetcher);

  const analytics = analyticsData?.data || {
    revenue: { today: 0, week: 0, month: 0, total: 0 },
    participants: { today: 0, week: 0, month: 0, total: 0 },
    tournaments: { active: 0, total: 0 },
    prizePool: { average: 0 }
  };

  const currentWorkspace = sessionData?.currentWorkspace || {
    name: '',
    username: '',
    profilePicture: ''
  };

  if ((analyticsError && !analytics) || (sessionError && !currentWorkspace)) {
    return (
      <Card className="border-none">
        <CardContent className="p-6">
          <p className="text-red-500">Error loading data</p>
        </CardContent>
      </Card>
    );
  }

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Card className="border-none">
      <CardContent className="p-6 space-y-8">
        {/* Profile Header with Settings */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Avatar className="h-12 w-12 flex-shrink-0">
              <AvatarImage src={currentWorkspace.profilePicture} alt={currentWorkspace.name} />
              <AvatarFallback>{getInitials(currentWorkspace.name)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-sm font-medium text-foreground">{currentWorkspace.name}</span>
                <span className="text-muted-foreground text-sm">@{currentWorkspace.username}</span>
              </div>
              <div className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full inline-flex items-center gap-1">
                <Crown size={12} />
                <span>Overview Analytics</span>
              </div>
            </div>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <Settings2 className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card">
              <DialogHeader>
                <DialogTitle>Analytics Settings</DialogTitle>
              </DialogHeader>
              <div className="py-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-3">Currency</h4>
                    <RadioGroup value={currency} onValueChange={setCurrency}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="KES" id="kes" />
                        <Label htmlFor="kes">KES</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="USD" id="usd" />
                        <Label htmlFor="usd">USD</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Metrics Grid */}
        <div className={`grid grid-cols-2 gap-4 ${(isAnalyticsLoading || isSessionLoading) ? 'opacity-50' : ''}`}>
          {/* <StatCard 
            title="Today's Revenue" 
            value={analytics.revenue.today}
            icon={Trophy}
            currency={currency}
            exchangeRate={exchangeRate}
          />
          <StatCard 
            title="Today's Participants" 
            value={analytics.participants.today}
            icon={Users}
            currency={currency}
            exchangeRate={exchangeRate}
          />
          <StatCard 
            title="This Week's Revenue" 
            value={analytics.revenue.week}
            icon={Trophy}
            currency={currency}
            exchangeRate={exchangeRate}
          />
          <StatCard 
            title="This Week's Participants" 
            value={analytics.participants.week}
            icon={Users}
            currency={currency}
            exchangeRate={exchangeRate}
          />
          <StatCard 
            title="This Month's Revenue" 
            value={analytics.revenue.month}
            icon={Trophy}
            currency={currency}
            exchangeRate={exchangeRate}
          />
          <StatCard 
            title="This Month's Participants" 
            value={analytics.participants.month}
            icon={Users}
            currency={currency}
            exchangeRate={exchangeRate}
          /> */}
          <StatCard 
            title="Total Revenue" 
            value={analytics.revenue.total}
            icon={Trophy}
            currency={currency}
            exchangeRate={exchangeRate}
          />
          <StatCard 
            title="Total Participants" 
            value={analytics.participants.total}
            icon={Users}
            currency={currency}
            exchangeRate={exchangeRate}
          />
          <StatCard 
            title="Active Tournaments" 
            value={analytics.tournaments.active}
            icon={Trophy}
            currency={currency}
            exchangeRate={exchangeRate}
          />
          <StatCard 
            title="Total Tournaments" 
            value={analytics.tournaments.total}
            icon={Trophy}
            currency={currency}
            exchangeRate={exchangeRate}
          />
          <PrizePoolCard 
            title="Average Prize Pool" 
            value={analytics.prizePool.average}
            icon={Award}
            currency={currency}
            exchangeRate={exchangeRate}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalyticsDashboard;