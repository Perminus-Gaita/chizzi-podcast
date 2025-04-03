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
import { Crown, Loader } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const TournamentAnalytics = () => {
  const [timeRange, setTimeRange] = useState('daily');

  // Fetch analytics data
  const { data: analyticsData, error: analyticsError, isLoading: isAnalyticsLoading } = useSWR('/api/analytics/tournaments', fetcher);
  const { data: sessionData, error: sessionError, isLoading: isSessionLoading } = useSWR('/api/user/session', fetcher);

  const data = analyticsData?.data?.[timeRange]?.timeSeriesData || [];
  const totals = analyticsData?.data?.[timeRange]?.totals || {
    totalTournaments: 0,
    tournaments: 0,
    matches: 0,
    participants: 0
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
                  <span>Tournament Analytics</span>
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
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {isAnalyticsLoading ? (
          <>
            <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg dark:from-indigo-950 dark:to-indigo-900">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Tournaments</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                <span className="opacity-50"><LoadingDots /></span>
              </p>
            </div>
            <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg dark:from-orange-950 dark:to-orange-900">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Matches</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                <span className="opacity-50"><LoadingDots /></span>
              </p>
            </div>
            <div className="p-4 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg dark:from-cyan-950 dark:to-cyan-900">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Participants</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                <span className="opacity-50"><LoadingDots /></span>
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg dark:from-indigo-950 dark:to-indigo-900">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Tournaments</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {totals.totalTournaments?.toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg dark:from-orange-950 dark:to-orange-900">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Matches</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {totals.matches?.toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg dark:from-cyan-950 dark:to-cyan-900">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Participants</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {totals.participants?.toLocaleString()}
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
              />
              <Tooltip 
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
                <linearGradient id="tournamentsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="matchesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fb923c" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#fb923c" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="participantsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="tournaments"
                stroke="#818cf8"
                fill="url(#tournamentsGradient)"
                name="Tournaments"
              />
              <Area
                type="monotone"
                dataKey="matches"
                stroke="#fb923c"
                fill="url(#matchesGradient)"
                name="Matches"
              />
              <Area
                type="monotone"
                dataKey="participants"
                stroke="#22d3ee"
                fill="url(#participantsGradient)"
                name="Participants"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-lg text-muted-foreground mb-2">You have no tournament analytics to show yet.</p>
              <p className="text-sm text-muted-foreground">Create tournaments and your analytics data will show here.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TournamentAnalytics;