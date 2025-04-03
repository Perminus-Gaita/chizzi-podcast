"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Users, AlertTriangle, PlayCircle, Calendar } from "lucide-react";

// Import components
import OfflineState from "./OfflineState";
import ErrorState from "./ErrorState";
import ConnectionLoader from "./ConnectionLoader";
import EmptyState from "./EmptyState";
import MockMatchCard from "./MockMatchCard";
import MatchCard from "@/page_components/Matches/MatchCard"; // The real MatchCard from your application

// Import action creators and data
import { init_page } from "@/app/store/pageSlice";
import { setUrgentMatches } from "@/app/store/notificationSlice";
import { DUMMY_MATCHES, CONNECTION_STATES, AI_PLAYER_ID } from "./dummyData";

const MatchesContainer = () => {
  const dispatch = useDispatch();
  const userProfile = useSelector((state) => state.auth?.profile || { uuid: "current-user-id" });

  const [activeTab, setActiveTab] = useState("urgent");
  
  // Simulate connection states
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState(CONNECTION_STATES.INITIALIZING);
  const [isOffline, setIsOffline] = useState(false);
  const [error, setError] = useState(null);
  const [matches, setMatches] = useState(null);

  // Simulate connection sequence
  useEffect(() => {
    const connectionSteps = [
      { state: CONNECTION_STATES.INITIALIZING, delay: 500 },
      { state: CONNECTION_STATES.AUTHENTICATING, delay: 800 },
      { state: CONNECTION_STATES.CONNECTING, delay: 700 },
      { state: CONNECTION_STATES.JOINING_ROOMS, delay: 600 },
      { state: CONNECTION_STATES.SYNCING, delay: 900 }
    ];

    let stepIndex = 0;
    
    const simulateConnection = () => {
      if (stepIndex < connectionSteps.length) {
        setConnectionState(connectionSteps[stepIndex].state);
        setTimeout(() => {
          stepIndex++;
          simulateConnection();
        }, connectionSteps[stepIndex].delay);
      } else {
        // Connection complete, set matches data
        setIsConnected(true);
        setMatches(DUMMY_MATCHES);
      }
    };
    
    simulateConnection();
    
    // Initialize page
    dispatch(
      init_page({
        page_title: "Matches",
        show_back: false,
        show_menu: true,
        route_to: "",
      })
    );
  }, [dispatch]);

  // Update urgent matches counter in notification
  useEffect(() => {
    if (matches) {
      dispatch(setUrgentMatches(matches.urgent.length));
    }
  }, [matches, dispatch]);

  // Mock reconnect function
  const reconnect = () => {
    setError(null);
    setConnectionState(CONNECTION_STATES.INITIALIZING);
    setTimeout(() => {
      setIsConnected(true);
      setMatches(DUMMY_MATCHES);
    }, 2000);
  };

  const categorizedMatches = useMemo(() => {
    if (!matches) return { urgent: [], active: [], scheduled: [] };

    const filterMatches = (matchList) =>
      matchList?.filter(
        (match) =>
          !match.opponents?.some((opponent) => opponent._id === AI_PLAYER_ID)
      ) || [];

    return {
      urgent: filterMatches(matches.urgent),
      active: filterMatches(matches.active),
      scheduled: filterMatches(matches.scheduled),
    };
  }, [matches]);

  const matchCounts = {
    urgent: categorizedMatches.urgent?.length || 0,
    active: categorizedMatches.active?.length || 0,
    scheduled: categorizedMatches.scheduled?.length || 0,
  };

  if (!isConnected) {
    return (
      <div className="container max-w-4xl mx-auto p-4">
        {isOffline ? (
          <OfflineState />
        ) : (
          <ConnectionLoader state={connectionState} />
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-4xl mx-auto p-4">
        <ErrorState error={error} retry={reconnect} />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-8" style={{ minHeight: "100vh" }}>
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="min-w-0 space-y-1 pr-24 sm:pr-0">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight truncate">
              Your Matches
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
              Manage active and upcoming matches
            </p>
          </div>

          <div className="absolute right-0 top-0 sm:relative sm:top-auto sm:right-auto flex items-center">
            <Badge
              variant="outline"
              className="h-7 sm:h-8 px-2 sm:px-3 gap-1.5 text-xs sm:text-sm whitespace-nowrap"
            >
              <Users className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              {matches && (
                <span className="flex items-center gap-1">
                  <span className="font-medium">
                    {Object.values(matches).flat().length}
                  </span>
                  <span className="hidden sm:inline">Active Matches</span>
                  <span className="sm:hidden">Active</span>
                </span>
              )}
            </Badge>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger
              value="urgent"
              className="relative flex items-center justify-center gap-1.5 px-2 sm:px-4 min-w-0"
            >
              <AlertTriangle className="h-4 w-4" />
              <span className="truncate text-xs sm:text-sm">Urgent</span>
              {matchCounts.urgent > 0 && (
                <Badge
                  variant="destructive"
                  className="hidden sm:flex ml-0.5 sm:ml-1.5"
                >
                  {matchCounts.urgent}
                </Badge>
              )}
              {matchCounts.urgent > 0 && (
                <Badge
                  variant="destructive"
                  className="flex sm:hidden h-5 w-5 p-0 justify-center items-center text-[10px]"
                >
                  {matchCounts.urgent}
                </Badge>
              )}
            </TabsTrigger>

            <TabsTrigger
              value="active"
              className="relative flex items-center justify-center gap-1.5 px-2 sm:px-4 min-w-0"
            >
              <PlayCircle className="h-4 w-4" />
              <span className="truncate text-xs sm:text-sm">Active</span>
              {matchCounts.active > 0 && (
                <Badge
                  variant="destructive"
                  className="hidden sm:flex ml-0.5 sm:ml-1.5"
                >
                  {matchCounts.active}
                </Badge>
              )}
              {matchCounts.active > 0 && (
                <Badge
                  variant="destructive"
                  className="flex sm:hidden h-5 w-5 p-0 justify-center items-center text-[10px]"
                >
                  {matchCounts.active}
                </Badge>
              )}
            </TabsTrigger>

            <TabsTrigger
              value="scheduled"
              className="relative flex items-center justify-center gap-1.5 px-2 sm:px-4 min-w-0"
            >
              <Calendar className="h-4 w-4" />
              <span className="truncate text-xs sm:text-sm">Scheduled</span>
              {matchCounts.scheduled > 0 && (
                <Badge
                  variant="destructive"
                  className="hidden sm:flex ml-0.5 sm:ml-1.5"
                >
                  {matchCounts.scheduled}
                </Badge>
              )}
              {matchCounts.scheduled > 0 && (
                <Badge
                  variant="destructive"
                  className="flex sm:hidden h-5 w-5 p-0 justify-center items-center text-[10px]"
                >
                  {matchCounts.scheduled}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            {Object.entries(categorizedMatches).map(([category, matches]) => (
              <TabsContent
                key={category}
                value={category}
                className="space-y-4"
              >
                {matches?.length > 0 ? (
                  matches.map((match, index) => (
                    <motion.div
                      key={match._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      {/* Use the provided MatchCard component if available, otherwise use our mock */}
                      {typeof MatchCard === 'function' ? (
                        <MatchCard match={match} />
                      ) : (
                        <MockMatchCard match={match} />
                      )}
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <EmptyState category={category} />
                  </motion.div>
                )}
              </TabsContent>
            ))}
          </AnimatePresence>
        </Tabs>
      </div>
    </>
  );
};

export default MatchesContainer;
