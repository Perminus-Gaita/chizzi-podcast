"use client";
import Link from "next/link";

import { motion, AnimatePresence } from "framer-motion";

import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  User,
  Clock,
  Timer,
  PlayCircle,
  Crown,
  Coins,
  Trophy,
  CheckCircle2,
} from "lucide-react";

import { cn } from "@/lib/utils";

const GameCard = ({ room, joinGame, loading, index }) => {
  const userProfile = useSelector((state) => state.auth.profile);

  const playerCount = room.players.length;
  const maxPlayers = room.maxPlayers || playerCount;
  const currentTurn =
    room.gameStatus === "active" ? room.currentTurn || 0 : null;

  const isTournamentMatch = !!room.tournamentId;
  const tournamentInfo = room.tournamentId
    ? {
        roundText: room.name?.split("-")[0] || "Tournament Match",
      }
    : null;

  const sortedPlayers = [...room.players].sort((a, b) => {
    if (room.gameStatus === "gameover") {
      if (a.winner) return -1;
      if (b.winner) return 1;
      return a.score - b.score;
    }
    return 0;
  });

  const emptySlots =
    room.gameStatus === "waiting"
      ? Array(maxPlayers - playerCount).fill(null)
      : [];

  const StatusBadge = ({ status }) => {
    const styles = {
      active:
        "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
      waiting:
        "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
      gameover: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400",
    };

    return (
      <span className={`text-xs px-2 py-0.5 rounded-full ${styles[status]}`}>
        {status}
      </span>
    );
  };

  const WaitingDots = () => {
    const [dots, setDots] = useState("");

    useEffect(() => {
      const interval = setInterval(() => {
        setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
      }, 800);

      return () => clearInterval(interval);
    }, []);

    return <span className="text-gray-400 dark:text-gray-500">{dots}</span>;
  };

  const EmptyPlayerSlot = () => (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 animate-pulse">
      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
        <User className="w-4 h-4 text-gray-400 dark:text-gray-500" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm text-gray-400 dark:text-gray-500">
            Waiting for player
            <WaitingDots />
          </span>
        </div>
      </div>
    </div>
  );

  const GameContext = ({ type, name, roundText }) => (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1.5 rounded-md",
        type === "tournament"
          ? "bg-amber-50 dark:bg-amber-900/20"
          : "bg-gray-50 dark:bg-gray-800"
      )}
    >
      <Trophy className="w-3 h-3 text-amber-500" />
      <span className="text-xs font-medium">Tournament: {roundText}</span>
    </div>
  );

  const PotDisplay = ({ pot }) => {
    return (
      <div className="flex items-center gap-2 overflow-hidden">
        <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
          Pot:
        </span>
        <span className="flex items-center gap-1 text-sm font-medium text-green-600 dark:text-green-400 truncate">
          <Coins className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">KES{pot / 100}</span>
        </span>
      </div>
    );
  };

  const PlayerRow = ({
    player,
    gameStatus,
    currentTurn,
    playerIndex,
    winner,
    isTournament,
  }) => {
    const getPlayerIndicator = () => {
      if (gameStatus === "waiting") {
        const statusStyles = {
          ready: {
            base: "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-400",
            icon: "text-emerald-500 dark:text-emerald-400",
          },
          waiting: {
            base: "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-400",
            icon: "text-amber-500 dark:text-amber-400",
          },
        };

        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                {player.checkedIn ? (
                  <Badge
                    variant="outline"
                    className={`
                      h-6 px-2 flex items-center gap-1.5
                      transition-colors duration-150
                      ${statusStyles.ready.base}
                    `}
                  >
                    <CheckCircle2
                      className={`w-3 h-3 ${statusStyles.ready.icon}`}
                    />
                    <span className="text-xs font-medium">Ready</span>
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className={`
                      h-6 px-2 flex items-center gap-1.5
                      transition-colors duration-150
                      ${statusStyles.waiting.base}
                    `}
                  >
                    <Clock
                      className={`w-3 h-3 ${statusStyles.waiting.icon} animate-pulse`}
                    />
                    <span className="text-xs font-medium">Waiting</span>
                  </Badge>
                )}
              </TooltipTrigger>
              <TooltipContent className="bg-popover/95 backdrop-blur-sm">
                {player.checkedIn
                  ? "Player is ready to start"
                  : "Player needs to check in"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      }
    };

    return (
      <Link
        href={`/${player?.username}`}
        className={`flex items-center gap-2 p-2 rounded-lg ${
          ((gameStatus === "active" && currentTurn === playerIndex) ||
          (gameStatus === "gameover" && winner === player._id)
            ? "bg-yellow-50 dark:bg-yellow-900/20"
            : "bg-gray-50 dark:bg-gray-800/50",
          isTournament && "border border-amber-500/10")
        }`}
      >
        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
          <div className="relative">
            <Avatar className="w-8 h-8 border-2 border-background">
              <AvatarImage
                src={player?.profilePicture || "/default_profile.png"}
                alt={player?.username}
              />
              <AvatarFallback>{player?.username[0] || "A"}</AvatarFallback>
            </Avatar>
            {winner === player._id && (
              <img
                src="/king.png"
                alt="Winner"
                className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-6 h-6"
              />
            )}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-0">
            <span className="text-xs font-medium truncate dark:text-gray-200">
              {player.name}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
              @{player.username}
            </span>
          </div>
        </div>
        <div className="flex items-center">
          {player.winner ? (
            <Crown className="w-4 h-4 text-yellow-500" />
          ) : (
            getPlayerIndicator()
          )}
        </div>
      </Link>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="h-full"
    >
      <Card
        className={cn(
          "flex flex-col h-full bg-white dark:bg-gray-900 dark:border-gray-800"
        )}
      >
        {/* Header */}
        <div className="h-auto sm:h-16 p-2 sm:p-3 flex items-start gap-2 sm:gap-3 border-b dark:border-gray-800">
          <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
            <img
              // src={`https://api.dicebear.com/9.x/glass/svg?seed=${room._id}`}
              src={`https://api.dicebear.com/9.x/shapes/svg?seed=${room._id}`}
              alt="thumbnail"
              className="w-full h-full object-cover rounded-md"
            />
            {isTournamentMatch && (
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="absolute -bottom-1 -right-1 bg-amber-500 dark:bg-amber-400 
                             w-4 h-4 rounded-full flex items-center justify-center"
              >
                <Trophy className="w-2.5 h-2.5 text-white" />
              </motion.div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center gap-2">
              <h2 className="font-semibold text-sm sm:text-[15px] text-gray-900 dark:text-gray-100 truncate">
                {room.name}
              </h2>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex-shrink-0"
              >
                {room.timer ? (
                  <span className="text-xs bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 px-1.5 sm:px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Timer className="w-3 h-3" />
                    30s
                  </span>
                ) : (
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Casual
                  </span>
                )}
              </motion.div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 mt-1">
              <StatusBadge status={room.gameStatus} />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {room.duration}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full w-5 h-5 sm:w-6 sm:h-6 text-xs font-medium flex-shrink-0"
            >
              {maxPlayers}P
            </motion.div>
            {room.gameStatus === "waiting" && (
              <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1">
                {playerCount}/{maxPlayers}
              </span>
            )}
          </div>
        </div>

        {/* Scrollable area with custom scrollbar */}
        <div className="relative" style={{ height: "120px" }}>
          <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white dark:from-gray-900 to-transparent pointer-events-none z-10" />
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white dark:from-gray-900 to-transparent pointer-events-none z-10" />

          <ScrollArea className="h-[120px]">
            <div className="space-y-1">
              <AnimatePresence>
                {sortedPlayers.map((player, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    <PlayerRow
                      player={player}
                      gameStatus={room.gameStatus}
                      currentTurn={currentTurn}
                      playerIndex={index}
                      winner={room.winner}
                      isTournament={isTournamentMatch}
                    />
                  </motion.div>
                ))}

                {emptySlots.map((_, index) => (
                  <motion.div
                    key={`empty-${index}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <EmptyPlayerSlot />
                  </motion.div>
                ))}
              </AnimatePresence>

              {(room.tournament || room.league || room.single) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 flex justify-center"
                >
                  {room.tournamentId ? (
                    <GameContext
                      type="tournament"
                      //  name="tournament"
                      name={room.name}
                      roundText={tournamentInfo.roundText}
                    />
                  ) : (
                    <GameContext type="single" />
                  )}
                </motion.div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Footer */}
        <div className="p-2 sm:p-3 border-t dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between mb-2">
            <PotDisplay pot={room.pot} isTournament={isTournamentMatch} />
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex flex-wrap flex-1 justify-end">
              <Link href="/lobby" className="w-full sm:w-auto">
                <Button
                  variant="default"
                  size="sm"
                  className="w-full h-9 sm:h-10 text-sm font-medium flex items-center justify-center gap-2 px-6"
                >
                  <PlayCircle className="w-4 h-4" />
                  Play Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default GameCard;
