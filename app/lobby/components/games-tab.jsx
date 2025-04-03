import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Gamepad2, 
  Users, 
  Clock, 
  PlayCircle, 
  CheckCircle, 
  Trophy,
  MessageCircleMore,
  Swords,
  Share2,
  Timer
} from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

// Helper component for scrolling text
const ScrollingText = ({ text, className = "" }) => {
  const [shouldScroll, setShouldScroll] = useState(text.length > 20);
  
  const scrollingClass = shouldScroll ? "animate-scrollText" : "";

  return (
    <div className="relative max-w-[300px] overflow-hidden">
      <div
        className={`whitespace-nowrap ${scrollingClass} ${className}`}
        style={{
          animation: shouldScroll ? "scrollText 15s linear infinite" : "none",
          paddingRight: shouldScroll ? "50px" : "0",
        }}
      >
        {text}
        {shouldScroll && <span className="pl-10">{text}</span>}
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    active: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
    waiting: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
    gameover: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400",
  };

  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${styles[status]}`}>
      {status}
    </span>
  );
};

const ShareButton = ({ matchLink }) => {
  const [copied, setCopied] = useState(false);
  
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(matchLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="w-full sm:w-auto group hover:bg-primary/5"
      onClick={handleShare}
    >
      <Share2 className="h-4 w-4 mr-2 group-hover:text-primary" />
      {copied ? "Copied" : "Share"}
    </Button>
  );
};

// Dummy data for games
const dummyGames = [
  {
    _id: "g1",
    name: "Kadi Championship Finals",
    gameStatus: "active",
    currentTurn: 0,
    maxPlayers: 2,
    timer: true,
    duration: "5m 32s",
    isPrivate: false,
    isComputerPlay: false,
    pot: 500,
    players: [
      {
        _id: "p1",
        name: "John Smith",
        username: "johnsmith",
        profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
        checkedIn: true
      },
      {
        _id: "p2",
        name: "Jane Doe",
        username: "janedoe",
        profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=jane",
        checkedIn: true
      }
    ],
    winner: null,
    creator: "p1"
  },
  {
    _id: "g2",
    name: "Casual Practice Room",
    gameStatus: "waiting",
    currentTurn: null,
    maxPlayers: 4,
    timer: false,
    duration: "0m 0s",
    isPrivate: false,
    isComputerPlay: false,
    pot: 0,
    players: [
      {
        _id: "p3",
        name: "David Johnson",
        username: "davidj",
        profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=david",
        checkedIn: true
      },
      {
        _id: "p4",
        name: "Sarah Wilson",
        username: "sarahw",
        profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
        checkedIn: false
      }
    ],
    winner: null,
    creator: "p3"
  },
  {
    _id: "g3",
    name: "Tournament Qualifier Round 2",
    gameStatus: "gameover",
    currentTurn: null,
    maxPlayers: 2,
    timer: true,
    duration: "12m 45s",
    isPrivate: false,
    isComputerPlay: false,
    pot: 1000,
    tournamentId: "t1",
    players: [
      {
        _id: "p5",
        name: "Michael Brown",
        username: "mikeb",
        profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=michael",
        checkedIn: true,
        winner: true
      },
      {
        _id: "p6",
        name: "Emily Davis",
        username: "emilyd",
        profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=emily",
        checkedIn: true
      }
    ],
    winner: "p5",
    creator: "p5"
  },
  {
    _id: "g4",
    name: "Private Ranked Match",
    gameStatus: "waiting",
    currentTurn: null,
    maxPlayers: 2,
    timer: true,
    duration: "0m 0s",
    isPrivate: true,
    isComputerPlay: false,
    pot: 200,
    players: [
      {
        _id: "p7",
        name: "Robert Taylor",
        username: "robertt",
        profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=robert",
        checkedIn: true
      }
    ],
    winner: null,
    creator: "p7"
  },
  {
    _id: "g5",
    name: "Computer Practice",
    gameStatus: "active",
    currentTurn: 0,
    maxPlayers: 2,
    timer: false,
    duration: "3m 18s",
    isPrivate: false,
    isComputerPlay: true,
    pot: 0,
    players: [
      {
        _id: "p8",
        name: "Amanda Wilson",
        username: "amandaw",
        profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=amanda",
        checkedIn: true
      },
      {
        _id: "ai",
        name: "AI Opponent",
        username: "ai_player",
        profilePicture: "https://api.dicebear.com/7.x/bottts/svg?seed=ai",
        checkedIn: true
      }
    ],
    winner: null,
    creator: "p8"
  },
  {
    _id: "g6",
    name: "Weekend Tournament Final",
    gameStatus: "active",
    currentTurn: 1,
    maxPlayers: 2,
    timer: true,
    duration: "8m 22s",
    isPrivate: false,
    isComputerPlay: false,
    pot: 2000,
    tournamentId: "t2",
    players: [
      {
        _id: "p9",
        name: "James Wilson",
        username: "jamesw",
        profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=james",
        checkedIn: true
      },
      {
        _id: "p10",
        name: "Lisa Johnson",
        username: "lisaj",
        profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=lisa",
        checkedIn: true
      }
    ],
    winner: null,
    creator: "p9"
  }
];

const PlayerRow = ({ player, gameStatus, currentTurn, playerIndex, winner }) => {
  const isTournamentMatch = false; // Set this based on your data
  
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

      return player.checkedIn ? (
        <Badge
          variant="outline"
          className={`
            h-6 px-2 flex items-center gap-1.5
            transition-colors duration-150
            ${statusStyles.ready.base}
          `}
        >
          <CheckCircle className={`w-3 h-3 ${statusStyles.ready.icon}`} />
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
          <Clock className={`w-3 h-3 ${statusStyles.waiting.icon} animate-pulse`} />
          <span className="text-xs font-medium">Waiting</span>
        </Badge>
      );
    }
    return null;
  };

  return (
    <Link
      href={`/${player?.username}`}
      className={`flex items-center gap-2 p-2 rounded-lg ${
        ((gameStatus === "active" && currentTurn === playerIndex) ||
        (gameStatus === "gameover" && winner === player._id)
          ? "bg-yellow-50 dark:bg-yellow-900/20"
          : "bg-gray-50 dark:bg-gray-800/50")
      } ${isTournamentMatch ? "border border-amber-500/10" : ""}`}
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
          <Trophy className="w-4 h-4 text-yellow-500" />
        ) : (
          getPlayerIndicator()
        )}
      </div>
    </Link>
  );
};

const EmptyPlayerSlot = () => (
  <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 animate-pulse">
    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
      <Users className="w-4 h-4 text-gray-400 dark:text-gray-500" />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-1.5">
        <span className="text-sm text-gray-400 dark:text-gray-500">
          Waiting for player...
        </span>
      </div>
    </div>
  </div>
);

const GameCard = ({ room, loading = [], index = 0, handleOpenDeleteRoom = () => {} }) => {
  const userProfile = { uuid: "p1" }; // Dummy user profile for demo
  
  const playerCount = room.players.length;
  const maxPlayers = room.maxPlayers || playerCount;
  const currentTurn = room.gameStatus === "active" ? room.currentTurn || 0 : null;

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
      return 0;
    }
    return 0;
  });

  const emptySlots = room.gameStatus === "waiting"
    ? Array(maxPlayers - playerCount).fill(null)
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="h-full"
    >
      <Card className={cn("flex flex-col h-full bg-white dark:bg-gray-900 dark:border-gray-800")}>
        {/* Header */}
        <div className="h-auto sm:h-16 p-2 sm:p-3 flex items-start gap-2 sm:gap-3 border-b dark:border-gray-800 relative">
          <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
            <img
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
              <ScrollingText
                text={room.name}
                className="text-sm sm:text-base font-medium"
              />

              {room?.isPrivate && (
                <div className="w-4 h-4 text-gray-500 dark:text-gray-400">🔒</div>
              )}

              <motion.div whileHover={{ scale: 1.05 }} className="flex-shrink-0">
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

        {/* Players area */}
        <div className="relative" style={{ height: "120px" }}>
          <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white dark:from-gray-900 to-transparent pointer-events-none z-10" />
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white dark:from-gray-900 to-transparent pointer-events-none z-10" />

          <ScrollArea className="h-[120px]">
            <div className="px-2 space-y-1">
              {/* Players */}
              {sortedPlayers.map((player, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2, delay: idx * 0.05 }}
                >
                  <PlayerRow
                    player={player}
                    gameStatus={room.gameStatus}
                    currentTurn={currentTurn}
                    playerIndex={idx}
                    winner={room.winner}
                  />
                </motion.div>
              ))}

              {/* Empty slots */}
              {emptySlots.map((_, idx) => (
                <motion.div
                  key={`empty-${idx}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <EmptyPlayerSlot />
                </motion.div>
              ))}

              {/* Tournament info */}
              {isTournamentMatch && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 flex justify-center"
                >
                  <div className="inline-flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-amber-50 dark:bg-amber-900/20">
                    <Trophy className="w-3 h-3 text-amber-500" />
                    <span className="text-xs font-medium">Tournament: {tournamentInfo.roundText}</span>
                  </div>
                </motion.div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Footer */}
        <div className="p-2 sm:p-3 border-t dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between mb-2">
            {room.pot > 0 && (
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  Pot:
                </span>
                <span className="flex items-center gap-1 text-sm font-medium text-green-600 dark:text-green-400 truncate">
                  <Trophy className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">KES {room.pot}</span>
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2">
              {/* Join/Resume button */}
              {room.players.some(player => player._id === userProfile?.uuid && room.gameStatus !== "gameover") && (
                <Link href={room.isComputerPlay ? `/kadi/${room?.name}` : `/kadi/play/${room?.name}`} className="flex-1 sm:flex-none">
                  <Button variant="default" size="sm" disabled={loading[index]} className="w-full h-9 text-sm">
                    <PlayCircle className="w-4 h-4 mr-2" />
                    {loading[index] ? "..." : "Resume"}
                  </Button>
                </Link>
              )}

              {/* Join button for non-full games */}
              {room.players.length < room.maxPlayers && !room.players.some(player => player._id === userProfile?.uuid) && (
                <Link href={`/kadi/play/${room.name}`}>
                  <Button variant="default" size="sm" className="flex-1 sm:flex-none h-9 text-sm">
                    <PlayCircle className="w-4 h-4 mr-2" />
                    {loading[index] ? "..." : "Join"}
                  </Button>
                </Link>
              )}

              {/* Watch button for full games */}
              {room.players.length === room.maxPlayers && room.gameStatus !== "gameover" && !room.players.some(player => player._id === userProfile?.uuid) && (
                <Button variant="secondary" size="sm" className="w-full h-9 text-sm flex-1 sm:flex-none">
                  <PlayCircle className="w-4 h-4 mr-2" />
                  {loading[index] ? "..." : "Watch"}
                </Button>
              )}

              {/* Replay button for completed games */}
              {room.gameStatus === "gameover" && (
                <Link href={`/kadi/replay/${room?.name}`} className="flex-1 sm:flex-none">
                  <Button variant="secondary" size="sm" disabled={loading[index]} className="w-full h-9 text-sm">
                    <PlayCircle className="w-4 h-4 mr-2" />
                    {loading[index] ? "..." : "Replay"}
                  </Button>
                </Link>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Delete button for game creator */}
              {room.creator === userProfile?.uuid && room.players.length < room.maxPlayers && (
                <Button variant="destructive" size="sm" onClick={() => handleOpenDeleteRoom(room?._id)} className="h-9 text-sm">
                  <span className="sr-only">Delete</span>
                  🗑️
                </Button>
              )}

              {/* Share button */}
              <ShareButton matchLink={`kadi/play/${room?.name}`} />
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

const GamesTab = ({ games = dummyGames }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {games.map((game, index) => (
        <GameCard key={game._id} room={game} index={index} />
      ))}
    </div>
  );
};

export default GamesTab;