"use client";
import Link from "next/link";
import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";

import moment from "moment";
import { motion, AnimatePresence } from "framer-motion";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Clock,
  Plus,
  Trophy,
  AlertCircle,
  AlertTriangle,
  PlayCircle,
  Timer,
  Users,
  Star,
  ArrowRight,
  WifiOff,
  CalendarClock,
  Calendar,
  Loader2,
} from "lucide-react";
import { createNotification } from "@/app/store/notificationSlice";
import MatchCard from "@/page_components/Matches/MatchCard";
import { init_page } from "@/app/store/pageSlice";
import { setUrgentMatches } from "@/app/store/notificationSlice";
import { useMatchesSocket } from "@/hooks/useMatchesSocket";

const CONNECTION_STATES = {
  INITIALIZING: "Initializing connection...",
  AUTHENTICATING: "Authenticating your session...",
  CONNECTING: "Connecting to game server...",
  JOINING_ROOMS: "Joining game rooms...",
  SYNCING: "Syncing match data...",
};

const OfflineState = () => (
  <Card className="w-full p-8">
    <CardContent className="flex flex-col items-center justify-center space-y-4">
      <WifiOff className="h-12 w-12 text-muted-foreground" />
      <div className="text-center space-y-2">
        <h3 className="font-semibold">You&apos;re Offline</h3>
        <p className="text-sm text-muted-foreground">
          Check your connection and try again
        </p>
      </div>
    </CardContent>
  </Card>
);

const ErrorState = ({ error, retry }) => (
  <Card className="w-full p-8">
    <CardContent className="flex flex-col items-center justify-center space-y-4">
      <AlertCircle className="h-12 w-12 text-destructive" />
      <div className="text-center space-y-2">
        <h3 className="font-semibold">Unable to Load Matches</h3>
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button onClick={retry} className="mt-4">
          Try Again
        </Button>
      </div>
    </CardContent>
  </Card>
);

const ConnectionLoader = ({ state }) => (
  <div className="flex flex-col gap-8" style={{ minHeight: "100vh" }}>
    {/* Connection Status Card */}
    <Card className="mb-6">
      <CardContent className="flex items-center justify-center p-4">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <div className="space-y-1">
            <p className="font-medium text-sm">{state}</p>
            <p className="text-xs text-muted-foreground">
              Please wait while we connect
            </p>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Header Section */}
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div className="space-y-2 w-full">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-8 w-24" />
    </div>

    {/* Tabs Loader */}
    <div className="mb-6">
      <div className="grid grid-cols-3 gap-2">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    </div>

    {/* Match Cards Loader */}
    {[1, 2, 3].map((i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: i * 0.1 }}
        className="w-full mb-4"
      >
        <Card className="relative overflow-hidden dark:bg-gray-800/70">
          <CardContent className="p-4 sm:p-6">
            {/* Match Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-16" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>

            {/* Player Information */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32 sm:w-40" />
                  <Skeleton className="h-3 w-24 sm:w-32" />
                </div>
              </div>

              <div className="text-right space-y-2">
                <Skeleton className="h-4 w-28 sm:w-36" />
                <Skeleton className="h-3 w-20 sm:w-24" />
              </div>
            </div>

            {/* Game State Indicators */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 p-3 bg-muted/30 rounded-lg mb-4">
              {[0, 1, 2].map((j) => (
                <div key={j} className="text-center space-y-1">
                  <Skeleton className="h-3 w-12 mx-auto mb-1" />
                  <Skeleton className="h-4 w-8 mx-auto" />
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Skeleton className="h-9 flex-1" />
              <Skeleton className="h-9 w-9" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    ))}
  </div>
);

const EmptyState = ({ category }) => {
  const config = {
    urgent: {
      icon: <Clock className="h-12 w-12 text-yellow-500" />,
      title: "No Urgent Matches",
      description:
        "You're all caught up! No matches need your immediate attention.",
      action: (
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Link href="/arena">
            <Button variant="default" className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Create Match
            </Button>
          </Link>
          <Link href="/arena?tab=tournaments">
            <Button variant="outline" className="w-full sm:w-auto">
              <Trophy className="w-4 h-4 mr-2" />
              Browse Tournaments
            </Button>
          </Link>
        </div>
      ),
    },
    active: {
      icon: <PlayCircle className="h-12 w-12 text-blue-500" />,
      title: "No Active Matches",
      description: "You don't have any ongoing matches at the moment.",
      action: (
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Link href="/arena">
            <Button variant="default" className="w-full sm:w-auto">
              <Users className="w-4 h-4 mr-2" />
              Join Arena Games
            </Button>
          </Link>
          <Link href="/arena">
            <Button variant="outline" className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Create Match
            </Button>
          </Link>
        </div>
      ),
    },
    scheduled: {
      icon: <CalendarClock className="h-12 w-12 text-purple-500" />,
      title: "No Scheduled Matches",
      description: "You don't have any upcoming matches scheduled.",
      action: (
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Link href="/arena?tab=tournaments">
            <Button variant="default" className="w-full sm:w-auto">
              <Trophy className="w-4 h-4 mr-2" />
              Browse Tournaments
            </Button>
          </Link>
          <Link href="/arena">
            <Button variant="outline" className="w-full sm:w-auto">
              <Users className="w-4 h-4 mr-2" />
              Join Arena Games
            </Button>
          </Link>
        </div>
      ),
    },
  };

  const { icon, title, description, action } = config[category];

  return (
    <Card className="bg-background border-dashed">
      <CardContent className="flex flex-col items-center text-center py-8 px-4">
        <div className="rounded-full bg-muted p-3 mb-4">{icon}</div>
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm">
          {description}
        </p>
        {action}
      </CardContent>
    </Card>
  );
};

const Matches = () => {
  const dispatch = useDispatch();
  const userProfile = useSelector((state) => state.auth.profile);

  const [activeTab, setActiveTab] = useState("urgent");

  const {
    isConnected,
    connectionState,
    matches,
    error,
    isOffline,
    reconnect,
    openSuitModal,
    handleAcesPlay,
    handleCloseSuitModal,
  } = useMatchesSocket();

  // const categorizedMatches = useMemo(() => {
  //   if (!matches) return { urgent: [], active: [], scheduled: [] };
  //   return matches;
  // }, [matches]);

  // const matchCounts = {
  //   urgent: categorizedMatches.urgent?.length || 0,
  //   active: categorizedMatches.active?.length || 0,
  //   scheduled: categorizedMatches.scheduled?.length || 0,
  // };

  // TEMPORARY!!!!
  const AI_PLAYER_ID = "676112252e2cd5a9df380aad";

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

  useEffect(() => {
    dispatch(setUrgentMatches(categorizedMatches.urgent?.length));
  }, [matches]);

  useEffect(() => {
    dispatch(
      init_page({
        page_title: "Matches",
        show_back: false,
        show_menu: true,
        route_to: "",
      })
    );
  }, []);

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

  // // Optional: Notification when it becomes your turn in a tournament match
  // useEffect(() => {
  //   const tournamentUrgentMatch = matches?.urgent?.find(match => match.tournamentContext);
  //   if (tournamentUrgentMatch) {
  //     dispatch(
  //       createNotification({
  //         open: true,
  //         type: "warning",
  //         message: `Tournament Match: It's your turn to play!`,
  //       })
  //     );
  //   }
  // }, [matches?.urgent]);

  // Handle loading state
  // if (isLoading) {
  //   return (
  // <div className="container max-w-4xl mx-auto p-4">
  //   <MatchesPageLoader />
  // </div>;
  //   );
  // }

  // Handle offline state
  if (isOffline) {
    return (
      <div className="container max-w-4xl mx-auto p-4">
        <Card className="py-8">
          <CardContent className="flex flex-col items-center text-center">
            <WifiOff className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">You&apos;re Offline</h3>
            <p className="text-sm text-muted-foreground">
              Please check your internet connection
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-8" style={{ minHeight: "100vh" }}>
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="min-w-0 space-y-1 pr-24 sm:pr-0">
            {" "}
            {/* Add right padding for badge space */}
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

        {/* <Tabs defaultValue="urgent" className="w-full"> */}
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
                    <MatchCard key={match._id} match={match} />
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

          {/* <AnimatePresence mode="wait">
          <TabsContent value="urgent" className="space-y-4">
            {matches?.urgent?.length > 0 ? (
              matches?.urgent.map((match, index) => (
                <MatchCard
                  key={index}
                  match={{
                    id: match._id,
                    name: match.name,
                    type: match.tournamentContext ? "tournament" : "casual",
                    timeLeft: match.timer ? "30s" : null,
                    status:
                      match.turn === userProfile?.uuid
                        ? "your_turn"
                        : "opponent_turn",
                    opponents: match.opponents,
                    context: match.tournamentContext,
                    gameState: {
                      cards: match.playerState?.playerDeck?.length,
                      topCard: match.gameState?.topCard,
                      discardPile: match.gameState.discardPile,
                      currentSuit: match.currentSuit,
                      direction: match.gameState.direction,
                      isKickback: match.gameState.isKickback,
                      isPenalty: match.gameState.isPenalty,
                      isQuestion: match.gameState.isQuestion,
                      jumpCounter: match.gameState.jumpCounter,
                      lastGamePlay: match.gameState.lastGamePlay,
                      lastMove: match.createdAt,
                      turn: match.turn,
                      desiredSuit: match.desiredSuit,
                      playerObj: match.playerState,
                    },
                    playerDeck: match.playerState?.playerDeck,
                  }}
                  matchesMutate={matchesMutate}
                />
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <EmptyState category="urgent" />
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {matches?.active?.length > 0 ? (
              <>
                {matches?.active.map((match, index) => (
                  <MatchCard
                    key={index}
                    match={{
                      id: match._id,
                      name: match.name,
                      type: match.tournamentContext ? "tournament" : "casual",
                      timeLeft: match.timer ? "30s" : null,
                      status:
                        match.turn === userProfile?.uuid
                          ? "your_turn"
                          : "opponent_turn",
                      opponents: match.opponents,
                      context: match.tournamentContext,
                      gameState: {
                        cards: match.playerState?.playerDeck?.length,
                        topCard: match.gameState?.topCard,
                        discardPile: match.gameState.discardPile,
                        currentSuit: match.currentSuit,
                        direction: match.gameState.direction,
                        isKickback: match.gameState.isKickback,
                        isPenalty: match.gameState.isPenalty,
                        isQuestion: match.gameState.isQuestion,
                        jumpCounter: match.gameState.jumpCounter,
                        lastGamePlay: match.gameState.lastGamePlay,
                        lastMove: match.createdAt,
                        turn: match.turn,
                        desiredSuit: match.desiredSuit,
                        playerObj: match.playerState,
                      },
                      playerDeck: match.playerState?.playerDeck,
                    }}
                    matchesMutate={matchesMutate}
                  />
                ))}

                {hasMoreActive && (
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={loadMoreActive}
                  >
                    Show More Active Matches
                  </Button>
                )}
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <EmptyState category="active" />
              </motion.div>
            )}
          </TabsContent>

          {/* <TabsContent value="scheduled" className="space-y-4">
            {matches?.scheduled?.length > 0 ? (
              <>
                {matches?.scheduled.map((match, index) => (
                  <MatchCard
                    key={index}
                    match={{
                      id: match._id,
                      name: match.name,
                      type: match.tournamentContext ? "tournament" : "casual",
                      timeLeft: match.timer ? "30s" : null,
                      status:
                        match.turn === userProfile?.uuid
                          ? "your_turn"
                          : "opponent_turn",
                      opponents: match.opponents,
                      context: match.tournamentContext,
                      gameState: {
                        cards: match.playerState?.playerDeck?.length,
                        topCard: match.gameState?.topCard,
                        discardPile: match.gameState.discardPile,
                        currentSuit: match.currentSuit,
                        direction: match.gameState.direction,
                        isKickback: match.gameState.isKickback,
                        isPenalty: match.gameState.isPenalty,
                        isQuestion: match.gameState.isQuestion,
                        jumpCounter: match.gameState.jumpCounter,
                        lastGamePlay: match.gameState.lastGamePlay,
                        lastMove: match.createdAt,
                        turn: match.turn,
                        desiredSuit: match.desiredSuit,
                        playerObj: match.playerState,
                      },
                      playerDeck: match.playerState?.playerDeck,
                    }}
                    matchesMutate={matchesMutate}
                  />
                ))}

                {hasMoreScheduled && (
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={loadMoreScheduled}
                  >
                    Show More Scheduled Matches
                  </Button>
                )}
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <EmptyState category="scheduled" />
              </motion.div>
            )}
          </TabsContent> 
        </AnimatePresence> */}
        </Tabs>

        {/* <button onClick={() => console.log(matches)}>MATCHES</button>
      <br />
      <br />
      <button onClick={() => console.log(hasMoreActive)}>ONE</button>
      <br />
      <br />
      <button onClick={() => console.log(hasMoreScheduled)}>TWO</button>
      <br />
      <br /> */}

        {/* <button onClick={() => console.log(urgentMatches)}>URGENTi</button>
      <br />
      <br />

      <button onClick={() => console.log(activeMatches)}>ACTIVE</button>
      <br />
      <br />

      <button onClick={() => console.log(scheduledMatches)}>SCHEDULED </button> */}

        {/* <button onClick={() => console.log(categorizedMatches)}>STEP</button>

      <button onClick={() => console.log(matches)}>THE UPDATES</button> */}
      </div>
    </>
  );
};

export default Matches;
