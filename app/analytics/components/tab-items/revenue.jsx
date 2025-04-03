import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Crown, Settings2, Loader } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import axios from 'axios';
import useSWR from 'swr';

const fetcher = url => axios.get(url).then(res => res.data);

const LoadingDots = () => {
  const [dots, setDots] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev < 3 ? prev + 1 : 1);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return '.'.repeat(dots);
};

const LoadingChart = () => (
  <div className="h-96 w-full rounded-lg p-4 flex items-center justify-center">
    <Loader className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const UserRevenueAnalytics = () => {
  const [timeRange, setTimeRange] = useState('daily');
  const [currency, setCurrency] = useState('KES');

  // Fetch analytics data
  const { data: analyticsData, error: analyticsError, isLoading: isAnalyticsLoading } = useSWR('/api/analytics/revenue', fetcher);
  const { data: sessionData, error: sessionError, isLoading: isSessionLoading } = useSWR('/api/user/session', fetcher);

  const currencySymbol = currency === 'KES' ? 'KES' : '$';
  const exchangeRate = currency === 'KES' ? 1 : 0.0070;

  const convertAmount = (amount) => {
    const wholeUnits = amount / 100;
    const converted = wholeUnits * exchangeRate;
    
    return currency === 'KES' 
      ? Math.round(converted)
      : converted.toFixed(2);
  };

  const data = analyticsData?.data?.[timeRange]?.timeSeriesData || [];
  const totals = analyticsData?.data?.[timeRange]?.totals || {
    totalRevenue: 0,
    buyInRevenue: 0,
    sponsorshipRevenue: 0
  };

  const currentWorkspace = sessionData?.currentWorkspace || {
    name: 'Loading...',
    username: 'loading',
    profilePicture: ''
  };

  if (analyticsError || sessionError) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        <p className="text-red-500">Error loading data</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-background rounded-xl shadow-lg dark:shadow-none">
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center mb-6">
        <div className="flex items-center gap-2">
          {isSessionLoading ? (
            <>
              <Skeleton className="h-12 w-12 rounded-full" />
              <div>
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
            </>
          ) : (
            <>
              <Avatar className="h-12 w-12">
                <AvatarImage src={currentWorkspace.profilePicture} alt={currentWorkspace.name} />
                <AvatarFallback>{currentWorkspace.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium text-foreground">{currentWorkspace.name}</span>
                  <span className="text-muted-foreground text-sm">@{currentWorkspace.username}</span>
                </div>
                <div className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full inline-flex items-center gap-1">
                  <Crown size={12} />
                  <span>Revenue Analytics</span>
                </div>
              </div>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-2 ml-14 sm:ml-0">
          <Select value={timeRange} onValueChange={setTimeRange} disabled={isAnalyticsLoading}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="allTime">All Time</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>

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
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {isAnalyticsLoading ? (
          <>
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg dark:from-blue-950 dark:to-blue-900">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                KES <span className="opacity-50"><LoadingDots /></span>
              </p>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg dark:from-purple-950 dark:to-purple-900">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Buy-in Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                KES <span className="opacity-50"><LoadingDots /></span>
              </p>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg dark:from-green-950 dark:to-green-900">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Sponsorship Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                KES <span className="opacity-50"><LoadingDots /></span>
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg dark:from-blue-950 dark:to-blue-900">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {currencySymbol} {convertAmount(totals.totalRevenue).toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg dark:from-purple-950 dark:to-purple-900">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Buy-in Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {currencySymbol} {convertAmount(totals.buyInRevenue).toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg dark:from-green-950 dark:to-green-900">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Sponsorship Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {currencySymbol} {convertAmount(totals.sponsorshipRevenue).toLocaleString()}
              </p>
            </div>
          </>
        )}
      </div>

      <div className="h-96">
        {isAnalyticsLoading ? (
          <LoadingChart />
        ) : data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="dark:stroke-gray-700" />
              <XAxis 
                dataKey="date" 
                className="dark:fill-gray-400"
                stroke="currentColor"
              />
              <YAxis 
                className="dark:fill-gray-400"
                stroke="currentColor"
                tickFormatter={(value) => `${currencySymbol} ${convertAmount(value)}`}
              />
              <Tooltip 
                formatter={(value) => [`${currencySymbol} ${convertAmount(value)}`, null]}
                contentStyle={{
                  backgroundColor: 'var(--background)',
                  borderRadius: '8px',
                  border: 'none',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  color: 'var(--foreground)'
                }}
              />
              <Legend className="dark:fill-gray-400" />
              <defs>
                <linearGradient id="buyInGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="sponsorshipGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="buyInRevenue"
                stroke="#8884d8"
                fill="url(#buyInGradient)"
                name="Buy-in Revenue"
                stackId="1"
              />
              <Area
                type="monotone"
                dataKey="sponsorshipRevenue"
                stroke="#82ca9d"
                fill="url(#sponsorshipGradient)"
                name="Sponsorship Revenue"
                stackId="1"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-lg text-muted-foreground mb-2">You have no revenue analytics to show yet.</p>
              <p className="text-sm text-muted-foreground">Create tournaments and your revenue data will show here.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserRevenueAnalytics;