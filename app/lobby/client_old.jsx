"use client";
import Link from "next/link";
import axios from "axios";

import { motion, AnimatePresence } from "framer-motion";

import { useRouter, useSearchParams } from "next/navigation";

import { useState, useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import { useTheme, useMediaQuery, Drawer } from "@mui/material";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
//   DropdownMenuSeparator,
// } from "@/components/ui/dropdown-menu";

import {
  RefreshCw,
  Info,
  CirclePlus,
  MessageCircleMore,
  // MessageCircle,
  Trash2,
  Gamepad2,
  GamepadIcon,
  Medal,
  User,
  Clock,
  Timer,
  PlayCircle,
  CheckCircle,
  Crown,
  Coins,
  Trophy,
  Ticket,
  Users2,
  Plus,
  CheckCircle2,
  WifiOff,
  Share2,
  // Copy,
  // Twitter,
  // Facebook,
  // PhoneIcon as WhatsApp,
  // Check,
  // ChevronDown,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Gift,
  Star,
  Lock,
  Braces,
  // Home,
  Swords,
  GraduationCap,
  // CircleDollarSign,
  FlameIcon,
  BarChart,
  Users,
  // TrendingUp,
  // Eye,
  // Search,
  // Filter,
  // SortAsc,
  PlaySquare,
  Video as VideoCamera,
  Play,
  Pause,
} from "lucide-react";

import CreateRoomModal from "@/page_components/Cards/CreateRoomModal";
import DeleteRoomModal from "@/page_components/Cards/DeleteRoomModal";
import CreateTournamentModal from "@/page_components/Tournament/CreateTournamentModal";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useLobbyChatHandler, useCardsLeaderboards } from "@/lib/cards";
import {
  useTournamentBracketHandler,
  useTournamentsHandler,
} from "@/lib/tournament";
import { useCardsRoomsHandler } from "@/lib/cards";
import MiniLoader from "@/components/Loader/MiniLoader";
import { createNotification } from "@/app/store/notificationSlice";
import { init_page } from "@/app/store/pageSlice";
import LobbyChatContainer from "../../page_components/Cards/LobbyChatContainer";
import { useWalletHandler } from "@/lib/user";
import { cn } from "@/lib/utils";

import CustomMatchBracket from "@/page_components/Tournament/CustomMatchBracket";
import GOD from "@/page_components/Lobby/GOD";

import "./styles.css";
// const MAX_RETRIES = 5;
// const BASE_DELAY = 1000; // 1 second

const StatusBadge = ({ status }) => {
  const styles = {
    active:
      "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
    waiting: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
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

const ShareButton = ({ matchLink }) => {
  const dispatch = useDispatch();
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const shareUrl = `https://wufwuf.io/${matchLink}`;

  const shareText = "";

  const handleShare = async (platform) => {
    setIsSharing(true);
    try {
      switch (platform) {
        case "copy":
          await navigator.clipboard.writeText(shareUrl);
          setCopied(true);
          dispatch(
            createNotification({
              open: true,
              type: "info",
              message: "Link Copied!",
            })
          );
          setTimeout(() => setCopied(false), 2000);
          break;
        case "twitter":
          window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(
              shareText
            )}&url=${encodeURIComponent(shareUrl)}`
          );
          break;
        case "facebook":
          window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
              shareUrl
            )}`
          );
          break;
        case "whatsapp":
          window.open(
            `https://wa.me/?text=${encodeURIComponent(
              `${shareText} ${shareUrl}`
            )}`
          );
          break;
      }
    } catch (error) {
      console.log("Failed to share:", error);
    }
    setIsSharing(false);
  };

  return (
    // <div className="mt-2 sm:mt-0 w-full sm:w-auto flex justify-end">
    <Button
      variant="outline"
      size="sm"
      className="w-full sm:w-auto group hover:bg-primary/5"
      // disabled={isSharing}
      onClick={() => handleShare("copy")}
    >
      <Share2 className="h-4 w-4 mr-2 group-hover:text-primary" />
      {/* {isSharing && "..."} */}
    </Button>
    //   {/* <DropdownMenu>
    //     <DropdownMenuTrigger asChild>
    //       <Button
    //         variant="outline"
    //         size="sm"
    //         className="w-full sm:w-auto group hover:bg-primary/5"
    //         disabled={isSharing}
    //       >
    //         <Share2 className="h-4 w-4 mr-2 group-hover:text-primary" />
    //         {isSharing && "..."}
    //       </Button>
    //     </DropdownMenuTrigger>
    //     <DropdownMenuContent align="end" className="w-56">
    //       <DropdownMenuItem
    //         onClick={() => handleShare("copy")}
    //         className="flex items-center"
    //       >
    //         {copied ? (
    //           <>
    //             <Check className="mr-2 h-4 w-4 text-green-500" />
    //             <span className="text-green-500">Copied!</span>
    //           </>
    //         ) : (
    //           <>
    //             <Copy className="mr-2 h-4 w-4" />
    //             Copy Link
    //           </>
    //         )}
    //       </DropdownMenuItem>
    //       <DropdownMenuSeparator />
    //       <DropdownMenuItem
    //         onClick={() => handleShare("whatsapp")}
    //         className="flex items-center"
    //       >
    //         <div className="mr-2 h-4 w-4 text-[#25D366]">
    //           <WhatsApp className="h-4 w-4" />
    //         </div>
    //         Share on WhatsApp
    //       </DropdownMenuItem>
    //       <DropdownMenuItem
    //         onClick={() => handleShare("twitter")}
    //         className="flex items-center"
    //       >
    //         <div className="mr-2 h-4 w-4 text-[#1DA1F2]">
    //           <Twitter className="h-4 w-4" />
    //         </div>
    //         Share on Twitter
    //       </DropdownMenuItem>
    //       <DropdownMenuItem
    //         onClick={() => handleShare("facebook")}
    //         className="flex items-center"
    //       >
    //         <div className="mr-2 h-4 w-4 text-[#4267B2]">
    //           <Facebook className="h-4 w-4" />
    //         </div>
    //         Share on Facebook
    //       </DropdownMenuItem>
    //     </DropdownMenuContent>
    //   </DropdownMenu> */}
    // // </div>
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

const GameCard = ({ room, loading, index, handleOpenDeleteRoom }) => {
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
                <Lock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              )}

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

          {isTournamentMatch && (
            <div className="absolute top-4 right-2 w-16 h-16">
              <Trophy className="h-12 w-12 text-yellow-500/20 rotate-12 translate-x-4 -translate-y-4" />
            </div>
          )}
        </div>

        {/* Scrollable area with custom scrollbar */}
        <div className="relative" style={{ height: "120px" }}>
          <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white dark:from-gray-900 to-transparent pointer-events-none z-10" />
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white dark:from-gray-900 to-transparent pointer-events-none z-10" />

          <ScrollArea className="h-[120px]">
            <div className="px-2 space-y-1">
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
            {isTournamentMatch && (
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  Pot:
                </span>
                <span className="flex items-center gap-1 text-sm font-medium text-green-600 dark:text-green-400 truncate">
                  <Coins className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">KES{room.pot / 100}</span>
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2">
              {room.players.some(
                (player) =>
                  player._id === userProfile?.uuid &&
                  room.gameStatus !== "gameover"
              ) && (
                <Link
                  href={
                    room.isComputerPlay
                      ? `/kadi/${room?.name}`
                      : `/kadi/play/${room?.name}`
                  }
                  className="flex-1 sm:flex-none"
                >
                  <Button
                    variant="default"
                    size="sm"
                    disabled={loading[index]}
                    className="w-full h-9 text-sm"
                  >
                    <PlayCircle className="w-4 h-4 mr-2" />
                    {loading[index] ? "..." : "Resume"}
                  </Button>
                </Link>
              )}

              {room.players.length < room.maxPlayers &&
                !room.players.some(
                  (player) => player._id === userProfile?.uuid
                ) && (
                  <Link href={`/kadi/play/${room.name}`}>
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1 sm:flex-none h-9 text-sm"
                    >
                      <PlayCircle className="w-4 h-4 mr-2" />
                      {loading[index] ? "..." : "Join"}
                    </Button>
                  </Link>
                )}

              {room.players.length === room.maxPlayers &&
                room.gameStatus !== "gameover" &&
                !room.players.some(
                  (player) => player._id === userProfile?.uuid
                ) && (
                  // Remove direct Link component to handle auth
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={loading[index]}
                    className="w-full h-9 text-sm flex-1 sm:flex-none"
                    onClick={() => {
                      if (!userProfile) {
                        const gameUrl = room.isComputerPlay
                          ? `/kadi/${room?.name}`
                          : `/kadi/play/${room?.name}`;
                        router.push(
                          "/login?redirect=" + encodeURIComponent(gameUrl)
                        );
                        return;
                      }
                      // If authenticated, navigate to game
                      router.push(
                        room.isComputerPlay
                          ? `/kadi/${room?.name}`
                          : `/kadi/play/${room?.name}`
                      );
                    }}
                  >
                    {!userProfile ? (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        {loading[index] ? "..." : "Login to Watch"}
                      </>
                    ) : (
                      <>
                        <PlayCircle className="w-4 h-4 mr-2" />
                        {loading[index] ? "..." : "Watch"}
                      </>
                    )}
                  </Button>
                )}

              {room.gameStatus === "gameover" && (
                <Link
                  href={`/kadi/replay/${room?.name}`}
                  className="flex-1 sm:flex-none"
                >
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={loading[index]}
                    className="w-full h-9 text-sm"
                  >
                    <PlayCircle className="w-4 h-4 mr-2" />
                    {loading[index] ? "..." : "Replay"}
                  </Button>
                </Link>
              )}
            </div>

            <div className="flex items-center gap-2">
              {room?.maxPlayers !== room?.players?.length &&
                room.creator === userProfile?.uuid && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleOpenDeleteRoom(room?._id)}
                    className="h-9 text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}

              <ShareButton
                matchLink={
                  room.gameStatus === "waiting" || room.gameStatus === "active"
                    ? room.isComputerPlay
                      ? `kadi/${room?.name}`
                      : `kadi/play/${room?.name}`
                    : `kadi/replay/${room?.name}`
                }
              />
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pageNumbers = [];

  // Add page numbers with ellipsis
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
  } else {
    if (currentPage <= 3) {
      pageNumbers.push(1, 2, 3, "...", totalPages);
    } else if (currentPage >= totalPages - 2) {
      pageNumbers.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
    } else {
      pageNumbers.push(
        1,
        "...",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "...",
        totalPages
      );
    }
  }

  return (
    <div className="flex items-center justify-center space-x-2 mt-6 mb-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-1 md:p-2 rounded-lg border dark:border-gray-600 disabled:opacity-50 
                 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {pageNumbers.map((number, index) => (
        <button
          key={index}
          onClick={() => typeof number === "number" && onPageChange(number)}
          className={`px-2 py-1 md:px-4 md:py-2 rounded-lg border dark:border-gray-600 
                    ${
                      currentPage === number
                        ? "bg-primary text-light dark:text-dark"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    } 
                    ${typeof number !== "number" ? "cursor-default" : ""}
                    transition-colors`}
        >
          {number}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg border dark:border-gray-600 disabled:opacity-50 
                 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
};

const initialFormData = {
  name: "",
  // description: "",
  slug: "",
  // game: "kadi",
  // format: "single elimination", // Default format
  numberOfParticipants: null, // No default size
  type: null, // No default type
  buyIn: {
    entryFee: 0,
  },
  sponsorshipDetails: {
    targetAmount: 0,
  },
};

const ScrollingText = ({ text, className = "" }) => {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const [shouldScroll, setShouldScroll] = useState(false);

  useEffect(() => {
    if (containerRef.current && textRef.current) {
      const shouldAnimate =
        textRef.current.scrollWidth > containerRef.current.clientWidth;
      setShouldScroll(shouldAnimate);
    }
  }, [text]);

  const scrollingClass = shouldScroll ? "animate-scrollText" : "";

  return (
    <div ref={containerRef} className="relative max-w-[300px] overflow-hidden">
      <div
        ref={textRef}
        // className={`text-md md:text-xl font-bold whitespace-nowrap ${scrollingClass}`}
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

const TournamentCard = ({ tournament }) => {
  const dispatch = useDispatch();
  const isMobile = useIsMobile();
  const router = useRouter();

  const userProfile = useSelector((state) => state.auth.profile);

  const [showBracketModal, setShowBracketModal] = useState(false);
  const [showBracket, setShowBracket] = useState(false);

  const maxDisplayedSponsors = 5;
  const sponsorCount = tournament.sponsorshipStats?.sponsorCount || 0;
  const additionalSponsors = Math.max(0, sponsorCount - maxDisplayedSponsors);

  const { data: bracketData, isLoading: isLoadingBracket } =
    useTournamentBracketHandler(
      showBracketModal || showBracket ? tournament._id : null
    );

  // // Determine if tournament is winner takes all
  const isWinnerTakeAll = tournament.prizeDistribution?.first === 100;

  const paidCurrentPrizePool =
    tournament.currentParticipants * tournament.buyIn?.entryFee;
  const paidMaxPrizePool =
    tournament.numberOfParticipants * tournament.buyIn?.entryFee;
  const paidProgress = (paidCurrentPrizePool / paidMaxPrizePool) * 100;

  // Helper function for status style with dark mode support
  const getStatusStyle = (status) => {
    const styles = {
      draft: "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400",
      setup: "bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400",
      ready:
        "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400",
      "in-progress":
        "bg-amber-50 dark:bg-amber-900/30 text-amber-500 dark:text-amber-400",
      completed:
        "bg-purple-50 dark:bg-purple-900/30 text-purple-500 dark:text-purple-400",
    };
    return (
      styles[status] ||
      "bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
    );
  };
  const navigationItems = [
    {
      label: "People",
      icon: Users2,
      tab: "participation",
    },
    {
      label: "Matches",
      icon: Swords,
      tab: "matches",
    },
    ...(tournament.type === "sponsored"
      ? [
          {
            label: "Sponsorships",
            icon: Gift,
            tab: "sponsorship",
          },
        ]
      : []),
    {
      label: "Bracket",
      icon: Braces,
      onClick: () => {
        if (isMobile) {
          setShowBracket(!showBracket);
        } else {
          setShowBracketModal(true);
        }
      },
    },
  ];

  return (
    <>
      {/* <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        <Card
          className="bg-white dark:bg-gray-900 dark:border-gray-800 w-full 
      h-full flex flex-col shadow-md hover:shadow-xl transition-shadow duration-300"
        >
          <Link
            href={`/${tournament.creatorDetails.username}/${tournament.slug}`}
            className="flex-1"
          >
            <div className="relative h-[200px] w-full rounded-t-xl overflow-hidden">
              {tournament.customBannerImage ? (
                <img
                  src={tournament.customBannerImage}
                  alt={`${tournament.name} Banner`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800" />
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/75" />

              <div className="absolute bottom-2 left-2 text-white w-full px-2 md:px-0">
                {" "}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                  {" "}
                  <div>
                    <ScrollingText
                      text={tournament.name}
                      className="text-md md:text-xl font-bold text-shadow-sm"
                    />
                    <div className="flex items-center gap-2 mt-1">
                      <Avatar className="h-6 w-6 ring-1 ring-white/30">
                        <AvatarImage
                          src={tournament.creatorDetails.profilePicture}
                        />
                        <AvatarFallback>
                          {tournament.creatorDetails.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {tournament.creatorDetails.name}
                        </span>
                        <span className="text-xs text-white/80">
                          @{tournament.creatorDetails.username}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 md:mt-0 justify-end">
                    {tournament.type === "paid" ? (
                      <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-600">
                        <Coins className="h-3 w-3 mr-1" />
                        Buy-in: KSH{" "}
                        {tournament.buyIn?.entryFee?.toLocaleString()}
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-600">
                        <Gift className="h-3 w-3 mr-1" />
                        Sponsored
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <CardHeader className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge className={getStatusStyle(tournament.status)}>
                  {tournament.status === "in-progress" && (
                    <PlayCircle className="h-3 w-3 mr-1" />
                  )}
                  {tournament.status === "completed" && (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  )}
                  {tournament.status === "ready" && (
                    <Clock className="h-3 w-3 mr-1" />
                  )}
                  {tournament.status}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  <Gamepad2 className="h-3 w-3 mr-1" />
                  {tournament.game}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      Participants
                    </div>
                    <div className="flex items-center gap-2">
                      <Users2 className="h-4 w-4 text-primary" />
                      <span className="text-lg font-semibold">
                        {tournament.currentParticipants}/
                        {tournament.numberOfParticipants}
                      </span>
                    </div>
                  </div>

                  {tournament.type === "paid" && (
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        Prize Pool
                      </div>
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-amber-500" />
                        <span className="text-lg font-semibold">
                          KES{" "}
                          {(
                            tournament.currentParticipants *
                            tournament.buyIn?.entryFee
                          )?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {tournament.type === "sponsored" && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Sponsorship Goal
                      </span>
                      <span className="font-semibold">
                        {Math.round(
                          (tournament.sponsorshipDetails?.currentAmount /
                            tournament.sponsorshipDetails?.targetAmount) *
                            100
                        )}
                        %
                      </span>
                    </div>
                    <Progress
                      value={
                        (tournament.sponsorshipDetails?.currentAmount /
                          tournament.sponsorshipDetails?.targetAmount) *
                        100
                      }
                      className="h-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>
                        Current: KSH{" "}
                        {(
                          tournament.sponsorshipDetails?.currentAmount / 100
                        )?.toLocaleString()}
                      </span>
                      <span>
                        Target: KSH{" "}
                        {(
                          tournament.sponsorshipDetails?.targetAmount / 100
                        )?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {isMobile && (
                <AnimatePresence>
                  {showBracket && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden mb-2 sm:mb-4"
                    >
                      {isLoadingBracket ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                      ) : bracketData?.matches ? (
                        <div className="overflow-x-auto">
                          <div className="min-w-[300px]">
                            <CustomMatchBracket
                              matches={bracketData?.matches}
                            />
                          </div>
                        </div>
                      ) : null}
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </CardContent>
          </Link>

          {tournament.status === "completed" && (
            <div className="px-4 space-y-2 pb-4">
              <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-500/10 to-transparent p-2 rounded-lg">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <div className="flex items-center gap-1.5">
                  <Avatar className="h-6 w-6">
                    <AvatarImage
                      src={tournament?.winners.first.profilePicture}
                    />
                    <AvatarFallback>
                      {tournament?.winners.first.name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">
                    {tournament?.winners.first.name}
                  </span>
                </div>
                <Badge className="ml-auto text-xs bg-yellow-500/10 text-yellow-500">
                  Champion
                </Badge>
              </div>

              {!isWinnerTakeAll && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="flex items-center gap-2 bg-gradient-to-r from-slate-500/10 to-transparent p-2 rounded-lg">
                    <div className="flex items-center gap-1.5">
                      <Avatar className="h-5 w-5">
                        <AvatarImage
                          src={tournament?.winners.second.profilePicture}
                        />
                        <AvatarFallback>
                          {tournament?.winners.second.name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium">
                        {tournament?.winners.second.name}
                      </span>
                    </div>
                    <Badge className="ml-auto text-xs" variant="secondary">
                      2nd
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          )}

          <CardFooter className="p-0 border-t">
            <div className="flex w-full">
              <Button
                variant="ghost"
                className={`flex-1 h-12 relative group transition-colors duration-200 hover:bg-muted/50 dark:hover:bg-muted/20`}
                onClick={() => {
                  router.push(
                    `/${tournament.creatorDetails.username}/${tournament?.slug}?tab=participation`
                  );
                }}
              >
                <div className="flex flex-col items-center gap-0.5">
                  <Users2 className="w-5 h-5 transition-colors duration-200" />
                  <span className="hidden md:block text-xs font-medium transition-opacity">
                    People
                  </span>
                </div>
              </Button>

              <Button
                variant="ghost"
                className="flex-1 h-12 relative group transition-colors duration-200 hover:bg-muted/50 dark:hover:bg-muted/20"
                onClick={() => {
                  router.push(
                    `/${tournament.creatorDetails.username}/${tournament?.slug}?tab=matches`
                  );
                }}
              >
                <div className="flex flex-col items-center gap-0.5">
                  <Swords className="w-5 h-5 transition-colors duration-200" />
                  <span className="hidden md:block text-xs font-medium transition-opacity">
                    Matches
                  </span>
                </div>
              </Button>

              {tournament.type === "sponsored" && (
                <Button
                  variant="ghost"
                  className={`flex-1 h-12 relative group transition-colors duration-200 hover:bg-muted/50 dark:hover:bg-muted/20`}
                  onClick={() => {
                    router.push(
                      `/${tournament.creatorDetails.username}/${tournament?.slug}?tab=sponsorship`
                    );
                  }}
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <Gift
                      className={`w-5 h-5 transition-colors duration-200`}
                    />
                    <span className="hidden md:block text-xs font-medium transition-opacity">
                      Sponsorships
                    </span>
                  </div>
                </Button>
              )}

              <Button
                variant="ghost"
                className={`flex-1 h-12 relative group transition-colors duration-200 hover:bg-muted/50 dark:hover:bg-muted/20`}
                onClick={() => {
                  if (isMobile) {
                    setShowBracket(!showBracket);
                  } else {
                    setShowBracketModal(true);
                    console.log("showing bracket ...");
                  }
                }}
              >
                <div className="flex flex-col items-center gap-0.5">
                  <Braces className="w-5 h-5 transition-colors duration-200" />
                  <span className="hidden md:block text-xs font-medium transition-opacity">
                    Bracket
                  </span>
                </div>
              </Button>
            </div>
          </CardFooter>
        </Card>

        <Dialog open={showBracketModal} onOpenChange={setShowBracketModal}>
          <DialogContent className="max-w-3xl bg-light dark:bg-dark">
            <DialogHeader>
              <DialogTitle>Tournament Bracket - {tournament.name}</DialogTitle>
            </DialogHeader>
            {isLoadingBracket ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : bracketData?.matches ? (
              <div className="overflow-x-auto">
                <div className="min-w-[600px]">
                  <CustomMatchBracket matches={bracketData?.matches} />
                </div>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      </motion.div> */}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        <Card className="bg-white dark:bg-gray-900 dark:border-gray-800 w-full h-full flex flex-col shadow-md hover:shadow-xl transition-shadow duration-300">
          <Link
            href={`/${tournament.creatorDetails.username}/${tournament.slug}`}
            className="flex-1"
          >
            <div className="relative h-48 w-full rounded-t-xl overflow-hidden">
              {/* Banner with gradient overlay */}
              {tournament.customBannerImage ? (
                <img
                  src={tournament.customBannerImage}
                  alt={`${tournament.name} banner`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800" />
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/75" />

              {/* Tournament info overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <div className="flex flex-col gap-3">
                  {/* Top row with title and participants */}
                  <div className="flex justify-between items-start">
                    <ScrollingText
                      text={tournament.name}
                      className="text-md md:text-xl font-bold text-shadow-sm"
                    />
                    <div className="flex items-center gap-1.5 bg-black/30 rounded-full px-3 py-1">
                      <Users2 className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {tournament.currentParticipants}/
                        {tournament.numberOfParticipants}
                      </span>
                    </div>
                  </div>

                  {/* Bottom row with creator info and tournament type */}
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6 ring-1 ring-white/30">
                        <AvatarImage
                          src={tournament.creatorDetails.profilePicture}
                        />
                        <AvatarFallback>
                          {tournament.creatorDetails.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {tournament.creatorDetails.name}
                        </span>
                        <span className="text-xs text-white/80">
                          @{tournament.creatorDetails.username}
                        </span>
                      </div>
                    </div>
                    {tournament.type === "paid" ? (
                      <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-600">
                        <Coins className="h-3 w-3 mr-1" />
                        Buy-in: KSH{" "}
                        {tournament.buyIn?.entryFee?.toLocaleString()}
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-600">
                        <Gift className="h-3 w-3 mr-1" />
                        Sponsored
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* <div className="relative h-48 w-full rounded-t-xl overflow-hidden">
              {tournament.customBannerImage ? (
                <img
                  src={tournament.customBannerImage}
                  alt={`${tournament.name} banner`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800" />
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/75" />

              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <div className="flex justify-between items-end">
                  <div className="space-y-2">
                    {/* <h3 className="text-xl font-bold truncate max-w-[80%]">
                      {tournament.name}
                    </h3> 
                    <ScrollingText
                      text={tournament.name}
                      className="text-md md:text-xl font-bold text-shadow-sm"
                    />
                    
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6 ring-1 ring-white/30">
                        <AvatarImage
                          src={tournament.creatorDetails.profilePicture}
                        />
                        <AvatarFallback>
                          {tournament.creatorDetails.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {tournament.creatorDetails.name}
                        </span>
                        <span className="text-xs text-white/80">
                          @{tournament.creatorDetails.username}
                        </span>
                      </div>
                    </div>
                  </div>
                  {tournament.type === "paid" ? (
                    <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-600">
                      <Coins className="h-3 w-3 mr-1" />
                      Buy-in: KSH {tournament.buyIn?.entryFee?.toLocaleString()}
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-600">
                      <Gift className="h-3 w-3 mr-1" />
                      Sponsored
                    </Badge>
                  )}{" "}
                </div>
              </div>
            </div> */}
            <CardHeader className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge className={getStatusStyle(tournament.status)}>
                  {tournament.status === "in-progress" && (
                    <PlayCircle className="h-3 w-3 mr-1" />
                  )}
                  {tournament.status === "completed" && (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  )}
                  {tournament.status === "ready" && (
                    <Clock className="h-3 w-3 mr-1" />
                  )}
                  {tournament.status}
                </Badge>{" "}
                <Badge variant="outline" className="capitalize">
                  <Gamepad2 className="h-3 w-3 mr-1" />
                  {tournament.game}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-4">
              {tournament.type === "paid" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Prize Pool</span>
                    <span className="font-semibold">
                      {Math.round(paidProgress)}%
                    </span>
                  </div>
                  <Progress value={paidProgress} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      Current: KSH {paidCurrentPrizePool?.toLocaleString()}
                    </span>
                    <span>
                      Maximum: KSH {paidMaxPrizePool?.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {tournament.type === "sponsored" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Sponsorship Goal
                    </span>
                    <span className="font-semibold">
                      {Math.round(
                        (tournament.sponsorshipDetails?.currentAmount /
                          tournament.sponsorshipDetails?.targetAmount) *
                          100
                      )}
                      %
                    </span>
                  </div>
                  <Progress
                    value={
                      (tournament.sponsorshipDetails?.currentAmount /
                        tournament.sponsorshipDetails?.targetAmount) *
                      100
                    }
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      Current: KSH{" "}
                      {(
                        tournament.sponsorshipDetails?.currentAmount / 100
                      )?.toLocaleString()}
                    </span>
                    <span>
                      Target: KSH{" "}
                      {(
                        tournament.sponsorshipDetails?.targetAmount / 100
                      )?.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {/* <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">
                    Participants
                  </span>
                  <div className="flex items-center gap-2">
                    <Users2 className="h-4 w-4 text-primary" />
                    <span className="text-lg font-semibold">
                      {tournament.currentParticipants}/
                      {tournament.numberOfParticipants}
                    </span>
                  </div>
                </div>

                {tournament.type === "paid" && (
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">
                      Prize Pool
                    </span>
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-amber-500" />
                      <span className="text-lg font-semibold">
                        KES{" "}
                        {(
                          tournament.currentParticipants *
                          tournament.buyIn?.entryFee
                        )?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {tournament.type === "sponsored" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Sponsorship Goal
                    </span>
                    <span className="font-semibold">
                      {Math.round(
                        (tournament.sponsorshipDetails?.currentAmount /
                          tournament.sponsorshipDetails?.targetAmount) *
                          100
                      )}
                      %
                    </span>
                  </div>
                  <Progress
                    value={
                      (tournament.sponsorshipDetails?.currentAmount /
                        tournament.sponsorshipDetails?.targetAmount) *
                      100
                    }
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      Current: KSH{" "}
                      {(
                        tournament.sponsorshipDetails?.currentAmount / 100
                      )?.toLocaleString()}
                    </span>
                    <span>
                      Target: KSH{" "}
                      {(
                        tournament.sponsorshipDetails?.targetAmount / 100
                      )?.toLocaleString()}
                    </span>
                  </div>
                </div>
              )} */}

              {/* Mobile Bracket View */}
              {isMobile && (
                <AnimatePresence>
                  {showBracket && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden mb-4"
                    >
                      {isLoadingBracket ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                      ) : (
                        bracketData?.matches && (
                          <div className="overflow-x-auto">
                            <div className="min-w-[300px]">
                              <CustomMatchBracket
                                matches={bracketData.matches}
                              />
                            </div>
                          </div>
                        )
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </CardContent>
          </Link>

          <CardFooter className="p-0 border-t">
            <div className="flex w-full">
              {navigationItems.map((item, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="flex-1 h-12 relative group transition-colors duration-200 hover:bg-muted/50 dark:hover:bg-muted/20"
                  onClick={() => {
                    if (item.onClick) {
                      item.onClick();
                    } else {
                      router.push(
                        `/${tournament.creatorDetails.username}/${tournament.slug}?tab=${item.tab}`
                      );
                    }
                  }}
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <item.icon className="w-5 h-5 transition-colors duration-200" />
                    <span className="hidden md:block text-xs font-medium">
                      {item.label}
                    </span>
                  </div>
                </Button>
              ))}
            </div>
          </CardFooter>
        </Card>

        {/* Bracket Modal */}
        <Dialog open={showBracketModal} onOpenChange={setShowBracketModal}>
          <DialogContent className="max-w-3xl bg-light dark:bg-dark">
            <DialogHeader>
              <DialogTitle>Tournament Bracket - {tournament.name}</DialogTitle>
            </DialogHeader>
            {isLoadingBracket ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              bracketData?.matches && (
                <div className="overflow-x-auto">
                  <div className="min-w-[600px]">
                    <CustomMatchBracket matches={bracketData.matches} />
                  </div>
                </div>
              )
            )}
          </DialogContent>
        </Dialog>
      </motion.div>
    </>
  );
};

const TierBadge = ({ tier }) => {
  const colors = {
    BRONZE:
      "bg-amber-700/20 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
    SILVER: "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    GOLD: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
    PLATINUM:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400",
    DIAMOND: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  };

  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs ${colors[tier]}`}
    >
      {tier}
    </span>
  );
};

const RenderSkillStats = ({ player, category }) => {
  if (category === "sequences") {
    return (
      <>
        <StatBox label="Total Sequences" value={player?.totalSequences} />
        <StatBox label="Longest Chain" value={player?.longestSequence} />
        <StatBox label="Win Rate" value={`${player?.winRate}%`} />
        <StatBox label="Perfect Games" value={`${player?.perfectGames}%`} />
      </>
    );
  }

  if (category === "special") {
    return (
      <>
        <StatBox label="Ace Controls" value={player?.aceControls} />
        <StatBox label="Jump Chains" value={player?.jumpChains} />
        <StatBox
          label="Successful Kickbacks"
          value={player?.successfulKickbacks}
        />
        <StatBox label="Penalty Avoidances" value={player?.penaltyAvoidances} />
        <StatBox
          label="Moves/Game"
          value={player.specialMovesPerGame?.toFixed(1) || 0}
        />
      </>
    );
  }

  // Efficiency stats
  return (
    <>
      <StatBox label="Move Time" value={`${player?.averageMoveTime}s`} />
      <StatBox
        label="Card Efficiency"
        value={`${(player?.cardEfficiency * 100).toFixed(1)}%`}
      />
      <StatBox label="Perfect Games" value={player?.perfectGames} />
      <StatBox
        label="Efficiency Score"
        value={player?.efficiencyScore.toFixed(1)}
      />
    </>
  );
};

const RenderTableRow = ({ player, index, type, category }) => {
  if (type === "competitive") {
    return (
      <>
        <td className="p-3">{index + 1}</td>
        <td className="p-3">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={player.profilePicture} />
              <AvatarFallback>{player.username[0]}</AvatarFallback>
            </Avatar>
            <span className="font-medium">{player.username}</span>
          </div>
        </td>
        <td className="p-3">{player?.rating}</td>
        <td className="p-3">
          <TierBadge tier={player?.rankingTier} />
        </td>
        <td className="p-3">{player?.totalGames}</td>
        <td className="p-3">{player?.winRate?.toFixed(1) || 0}%</td>
        <td className="p-3">{player?.seasonScore}</td>
      </>
    );
  }

  // Skills table row
  if (type === "skills") {
    return (
      <>
        <td className="p-3">{index + 1}</td>
        <td className="p-3">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={player.profilePicture} />
              <AvatarFallback>{player.username[0]}</AvatarFallback>
            </Avatar>
            <span className="font-medium">{player.username}</span>
          </div>
        </td>
        {category === "sequences" && (
          <>
            <td className="p-3">{player?.totalSequences}</td>
            <td className="p-3">{player?.longestSequence}</td>
            <td className="p-3">{player?.winRate}%</td>
            <td className="p-3">{player?.perfectGames}</td>
          </>
        )}
        {category === "special" && (
          <>
            <td className="p-3">{player?.aceControls}</td>
            <td className="p-3">{player?.jumpChains}</td>
            <td className="p-3">{player?.successfulKickbacks}</td>
            <td className="p-3">{player?.penaltyAvoidances}</td>
            <td className="p-3">
              {player?.specialMovesPerGame?.toFixed(1) || 0}
            </td>
          </>
        )}
        {category === "efficiency" && (
          <>
            <td className="p-3">{player?.averageMoveTime}s</td>
            <td className="p-3">
              {(player?.cardEfficiency * 100).toFixed(1)}%
            </td>
            <td className="p-3">{player?.perfectGames}</td>
            <td className="p-3">{player?.efficiencyScore.toFixed(1)}</td>
          </>
        )}
      </>
    );
  }
};

// Loading state component
const LeaderboardSkeleton = () => (
  <div className="space-y-4 p-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[150px]" />
        </div>
        <Skeleton className="h-4 w-[100px] ml-auto" />
      </div>
    ))}
  </div>
);

// Empty state component
const EmptyLeaderboard = ({ type }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
    <h3 className="font-medium mb-2">No Rankings Yet</h3>
    <p className="text-sm text-muted-foreground">
      {type === "competitive"
        ? "Start playing ranked games to appear on the leaderboard"
        : "Master special moves and sequences to rank up"}
    </p>
  </div>
);

const LeaderboardTable = ({ data, type, category, columns }) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <ScrollArea className="h-[400px] w-full rounded-md border">
        <div className="p-3 space-y-3">
          {data?.map((player, index) => (
            <Card key={index} className="p-3 dark:bg-gray-800">
              <div className="flex items-center gap-3 mb-2">
                <div className="min-w-[24px] text-center font-medium">
                  #{index + 1}
                </div>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={player.profilePicture} />
                  <AvatarFallback>{player.username[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {player.username}
                  </div>
                  {type === "competitive" ? (
                    <TierBadge tier={player.rankingTier} />
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      Rating: {player.rating}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2">
                {type === "competitive" ? (
                  <>
                    <StatBox label="Rating" value={player.rating} />
                    <StatBox
                      label="Win Rate"
                      value={`${player.winRate?.toFixed(1) || 0}%`}
                    />
                  </>
                ) : (
                  <>
                    {/* type === 'skills' */}
                    <RenderSkillStats player={player} category={category} />
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea className="h-[400px] w-full rounded-md border">
      <div className="p-4">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="text-left border-b dark:border-gray-700">
              {columns.map((column, index) => (
                <th key={index} className="pb-2 px-3 font-medium">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data?.map((player, index) => (
              <tr
                key={index}
                className="border-b last:border-b-0 dark:border-gray-700
                         hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <RenderTableRow
                  player={player}
                  index={index}
                  type={type}
                  category={category}
                />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ScrollArea>
  );
};

const StatBox = ({ label, value }) => (
  <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
    <div className="text-xs text-muted-foreground">{label}</div>
    <div className="font-medium">{value}</div>
  </div>
);

const Lobby = () => {
  // const socket = useRef(null);
  const isMobile = useIsMobile();

  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");

  const chatContainerRef = useRef(null);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

  const router = useRouter();
  const dispatch = useDispatch();

  // const mqttConnectUrl = useSelector(
  //   (state) => state.notification.mqttConnectUrl
  // );

  const [mqttConnectUrl, setMqttConnectUrl] = useState("");
  const [mqttClient, setMqttClient] = useState(null);

  const userProfile = useSelector((state) => state.auth.profile);

  const [openMobileChat, setOpenMobileChat] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const toggleMobileChat = (newOpen) => () => {
    setOpenMobileChat(newOpen);
  };

  const [loading, setLoading] = useState([]);

  const [loadingChat, setLoadingChat] = useState(false);

  const [selectedTab, setSelectedTab] = useState("featured");

  const [createRoomOpen, setCreateRoomOpen] = useState(false);
  const [deleteRoomOpen, setDeleteRoomOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);

  const [formData, setFormData] = useState(initialFormData);

  const [isCreateForm, setIsCreateForm] = useState(false);

  const handleOpenCreateForm = () => {
    // console.log("opening...");
    setIsCreateForm(true);
  };

  const handleCloseCreateForm = () => {
    setFormData(initialFormData);
    setIsCreateForm(false);
  };

  const [buyInOpen, setBuyInOpen] = useState(false);

  const [isConnected, setIsConnected] = useState(false);
  const [lobbyMembers, setLobbyMembers] = useState([]);

  const [chatMessage, setChatMessage] = useState("");

  const [counter, setCounter] = useState(0);

  const [connectionStatus, setConnectionStatus] = useState("disconnected");

  const [selectedLeaderboard, setSelectedLeaderboard] = useState("monthly");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleTimeout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post("/api/cards/timer");
      console.log("Timer completed:", response.data);
    } catch (err) {
      setError(err.message);
      console.error("Timer error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const {
    data: walletData,
    error: walletError,
    mutate: walletMutate,
  } = useWalletHandler();

  const {
    data: chatsData,
    isLoading: chatsLoading,
    error: chatsError,
    mutate: chatsMutate,
  } = useLobbyChatHandler();

  const {
    data: roomsData,
    pagination,
    error: roomsError,
    mutate: roomsMutate,
    isLoading: roomsLoading,
    isOffline: roomsOffline,
  } = useCardsRoomsHandler(currentPage);

  const {
    data: tournamentsData,
    error: tournamentsError,
    mutate: tournamentsMutate,
    isLoading: isLoadingTournaments,
  } = useTournamentsHandler();

  const [activeCategory, setActiveCategory] = useState("competitive");
  const [activeType, setActiveType] = useState("all");

  const {
    data: leaderboardsData,
    error: leaderboardsError,
    mutate: leaderboardsMutate,
    isLoading: isLoadingLeaderboards,
  } = useCardsLeaderboards(activeCategory, activeType);

  // Handle category change
  const handleCategoryChange = (newCategory) => {
    setActiveCategory(newCategory);
    setActiveType("all"); // Reset type when category changes
  };

  // Handle type change
  const handleTypeChange = (newType) => {
    setActiveType(newType);
  };

  const handleOpenCreateRoom = () => {
    // console.log("opening room");

    if (!chatOpen) {
      setChatOpen(true);
    }

    // console.log("## CHAT OPENzz ###");
    // console.log(chatOpen);

    setCreateRoomOpen(true);
  };

  const handleClick = () => {
    if (selectedTab === "tournaments") {
      handleOpenCreateForm();
    } else {
      // Default to create game for "games" tab or any other tab
      handleOpenCreateRoom();
    }
  };

  const handleCloseCreateRoom = () => {
    setCreateRoomOpen(false);

    setRoomToDelete(null);
  };

  const handleOpenDeleteRoom = (roomId) => {
    setRoomToDelete(roomId);
    setDeleteRoomOpen(true);
  };

  const handleCloseDeleteRoom = () => {
    setDeleteRoomOpen(false);
    setRoomToDelete(null);
  };

  const sendLobbyMessage = async () => {
    // console.log("### STARTED SENDING ###");
    setLoadingChat(true);
    try {
      // Define the message and payload
      const messagePayload = {
        payload: { message: chatMessage },
      };

      // Use axios to send a POST request to the backend API route
      const response = await axios.post("/api/cards/lobbychat", messagePayload);

      if (response.status === 200) {
        // console.log("Message sent successfully:", response.data);

        chatsMutate();

        setLoadingChat(false);
      } else {
        console.error("Failed to send message:", response.data);

        setLoadingChat(false);
      }

      setChatMessage("");
    } catch (err) {
      console.error("Error sending lobby message message", err);
      // console.log(err);
      setLoadingChat(false);
    } finally {
      setLoadingChat(false);
    }
  };

  useEffect(() => {
    if (tab === "games") {
      setSelectedTab("games");
    } else if (tab === "tournaments") {
      setSelectedTab("tournaments");
    } else if (tab === "leaderboard") {
      setSelectedTab("leaderboard");
    }
  }, [searchParams]);

  // scroll to bottom on message
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight - 80,
        behavior: "smooth",
      });
    }
  }, [chatsData?.messages]);

  // set page state
  useEffect(() => {
    dispatch(
      init_page({
        page_title: "Kadi Lobby",
        show_back: false,
        show_menu: true,
        route_to: "",
      })
    );
  }, []);

  return (
    <>
      <CreateRoomModal
        createRoomOpen={createRoomOpen}
        handleCloseCreateRoom={handleCloseCreateRoom}
      />

      <CreateTournamentModal
        isCreateForm={isCreateForm}
        handleCloseCreateForm={handleCloseCreateForm}
      />

      <DeleteRoomModal
        deleteRoomOpen={deleteRoomOpen}
        handleCloseDeleteRoom={handleCloseDeleteRoom}
        roomsMutate={roomsMutate}
        roomToDelete={roomToDelete}
      />

      <div className="relative flex flex-col" style={{ minHeight: "100vh" }}>
        {!isMobile && (
          <div className="fixed bottom-10 right-6 z-50 flex flex-col items-end gap-3">
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.1,
              }}
            >
              <Button
                onClick={() => setChatOpen(!chatOpen)}
                variant="outline"
                size="icon"
                className={`rounded-full p-3 h-12 w-12 shadow-md ${
                  chatOpen
                    ? "bg-blue-100 text-blue-600 border-blue-300 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700"
                    : "bg-white text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
                } hover:shadow-lg`}
                aria-label={chatOpen ? "Close chat" : "Open chat"}
              >
                <MessageCircleMore className="h-5 w-5" />
              </Button>
            </motion.div>
          </div>
        )}

        {isMobile && (
          <div className="fixed bottom-20 right-6 z-50 flex flex-col items-end gap-3">
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.1,
              }}
            >
              <Button
                onClick={() => setOpenMobileChat(true)}
                variant="outline"
                size="icon"
                className={`rounded-full p-3 h-12 w-12 shadow-md ${
                  chatOpen
                    ? "bg-blue-100 text-blue-600 border-blue-300 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700"
                    : "bg-white text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
                } hover:shadow-lg`}
                aria-label={chatOpen ? "Close chat" : "Open chat"}
              >
                <MessageCircleMore className="h-5 w-5" />
              </Button>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <Button
                onClick={handleClick}
                size="lg"
                className={`rounded-full p-4 shadow-lg 
                dark:bg-blue-600 hover:bg-blue-700 bg-blue-500 hover:bg-blue-600 text-white`}
                aria-label={
                  selectedTab === "tournaments"
                    ? "Create new tournament"
                    : "Create new game"
                }
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedTab}
                    initial={{ rotate: -45, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 45, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-2"
                  >
                    {selectedTab === "tournaments" ? (
                      <>
                        <Trophy className="h-5 w-5" />
                        <span className="hidden md:inline">New Tournament</span>
                      </>
                    ) : (
                      <>
                        <PlaySquare className="h-5 w-5" />
                        <span className="hidden md:inline">New Game</span>
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>
                <span className="md:hidden ml-1">
                  <Plus className="h-4 w-4" />
                </span>
              </Button>
            </motion.div>
          </div>
        )}

        <section
          // className="flex flex-col md:flex-row justify-between items-center"
          // style={{ height: "auto" }}
          className="flex justify-between items-center mb-4 w-full"
          style={{
            width:
              selectedTab === "games" && !chatOpen && !isSmallScreen
                ? "calc(100% - 300px)"
                : "100%",
          }}
        >
          {/* <div
            className="flex justify-between items-center w-full space-y-4 sm:space-y-0"
            style={{ backgroundColor: "red" }}
          >
            
          </div> */}

          <div className="flex items-center gap-2 p-1 md:p-2 bg-background rounded-lg border">
            <button
              onClick={() => setSelectedTab("featured")}
              className={`flex items-center gap-1 md:gap-2 px-2 md:px-3 py-2 rounded-md transition-all ${
                selectedTab === "featured"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              <Star className="w-4 h-4" />
              <span
                className={`${
                  selectedTab === "featured" ? "inline" : "hidden"
                } sm:inline text-sm font-medium`}
              >
                Featured
              </span>
            </button>

            <button
              onClick={() => setSelectedTab("tournaments")}
              className={`flex items-center gap-1 md:gap-2 px-2 md:px-3 py-2 rounded-md transition-all ${
                selectedTab === "tournaments"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span
                className={`${
                  selectedTab === "tournaments" ? "inline" : "hidden"
                } sm:inline text-sm font-medium`}
              >
                Tournaments
              </span>
            </button>

            <button
              onClick={() => setSelectedTab("games")}
              className={`flex items-center gap-1 md:gap-2 px-2 md:px-3 py-2 rounded-md transition-all ${
                selectedTab === "games"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
              <span
                className={`${
                  selectedTab === "games" ? "inline" : "hidden"
                } sm:inline text-sm font-medium`}
              >
                Games
              </span>
            </button>

            <button
              onClick={() => setSelectedTab("leaderboard")}
              className={`flex items-center gap-1 md:gap-2 px-2 md:px-3 py-2 rounded-md transition-all ${
                selectedTab === "leaderboard"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              <Medal className="w-4 h-4" />
              <span
                className={`${
                  selectedTab === "leaderboard" ? "inline" : "hidden"
                } sm:inline text-sm font-medium`}
              >
                Rankings
              </span>
            </button>
          </div>

          <div className="flex justify-end">
            {selectedTab === "featured" && (
              <div className="hidden md:block flex flex-wrap gap-2">
                <Button onClick={handleOpenCreateRoom}>
                  <CirclePlus className="h-4 w-4" />
                  <span className="text-xs md:text-md">New Game</span>
                </Button>
              </div>
            )}

            {selectedTab === "games" && (
              <>
                <Button
                  onClick={handleOpenCreateRoom}
                  className="hidden md:flex"
                >
                  <CirclePlus className="h-4 w-4" />
                  <span className="text-xs md:text-md">New Game</span>
                </Button>

                <Button
                  asChild
                  variant="secondary"
                  className="bg-primary/10 hover:bg-primary/20 mx-0 md:ml-2"
                >
                  <Link href="/kadi/learn">
                    <GraduationCap className="h-4 w-4" />
                    <span className="text-xs md:text-md hidden md:inline">
                      Learn
                    </span>
                  </Link>
                </Button>

                {/* {!isMobile && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        if (isSmallScreen) {
                          setOpenMobileChat(true);
                          // console.log("toggling...", openMobileChat);
                        } else {
                          setChatOpen(!chatOpen);
                        }
                      }}
                    >
                      <MessageCircleMore className="h-4 w-4" />
                    </Button>
                  )} */}
              </>
            )}

            {selectedTab === "tournaments" && (
              <Button
                onClick={handleOpenCreateForm}
                className="hidden md:inline"
              >
                <Plus className="h-4 w-4" /> New Tournament
              </Button>
            )}
          </div>
        </section>

        {selectedTab === "featured" && (
          <>
            {isLoadingTournaments && (
              <div className="flex justify-center">
                <MiniLoader />
              </div>
            )}

            {/* Error state */}
            {tournamentsError && (
              <div>
                <p className="text-primaryRed font-medium">
                  No tournaments yet
                </p>
              </div>
            )}

            {tournamentsData && !tournamentsError && (
              <div className="container mx-auto p-0 md:p-6 space-y-6">
                <FeaturedTournament
                  featuredTournaments={tournamentsData?.tournaments?.slice(
                    0,
                    3
                  )}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <LiveMatchesSection
                      matches={roomsData?.slice(0, 3)}
                      loading={loading}
                      handleOpenDeleteRoom={handleOpenDeleteRoom}
                      setSelectedTab={setSelectedTab}
                    />
                  </div>

                  <div className="lg:col-span-1">
                    <QuickStatsSection
                      topPlayers={leaderboardsData?.competitive?.global?.slice(
                        0,
                        3
                      )}
                      stats={{
                        topPlayers: [],
                        activeTournaments: 5,
                        totalPrizePool: "$25,000",
                      }}
                    />

                    {/* <GOD /> */}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {selectedTab === "games" && (
          <>
            {/* Connection error state */}
            {roomsOffline && (
              <div className="flex flex-col items-center justify-center p-8 space-y-4">
                <div className="flex items-center gap-2 text-primaryRed">
                  <WifiOff className="h-5 w-5" />
                  <p className="font-medium">Connection lost</p>
                </div>
                {/* <Button
                  variant="outline"
                  size="sm"
                  onClick={() => roomsMutate()}
                  className="mt-2"
                >
                  Try Again
                </Button> */}
              </div>
            )}

            {/* Loading state */}
            {roomsLoading && !roomsOffline && (
              <div className="flex flex-col items-center justify-center p-8 space-y-4">
                <MiniLoader />
                <p className="text-sm text-muted-foreground">
                  Loading games...
                </p>
              </div>
            )}

            {/* Error state */}
            {/* {roomsError && !roomsLoading && !roomsOffline && (
              <div className="flex flex-col items-center justify-center p-8">
                <p className="text-primaryRed font-medium">
                  Unable to load games
                </p>
              </div>
            )} */}

            {roomsData && !roomsError && (
              <section
                className="relative flex gap-2"
                style={{
                  width:
                    !chatOpen && !isSmallScreen ? "calc(100% - 300px)" : "100%",
                }}
              >
                <div className="flex-1 overflow-auto transition-all ease-in duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <AnimatePresence>
                      {roomsData?.map((room, index) => (
                        <GameCard
                          key={index}
                          room={room}
                          userProfile={userProfile}
                          loading={loading}
                          index={index}
                          handleOpenDeleteRoom={handleOpenDeleteRoom}
                        />
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* pagination */}
                  {pagination && pagination.totalPages > 1 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={pagination.totalPages}
                      onPageChange={handlePageChange}
                    />
                  )}
                </div>
              </section>
            )}
          </>
        )}

        <>
          {!isSmallScreen && (
            <LobbyChatContainer
              chatOpen={chatOpen}
              setChatOpen={setChatOpen}
              isSmallScreen={isSmallScreen}
              toggleMobileChat={toggleMobileChat}
              chatContainerRef={chatContainerRef}
              lobbyMembers={lobbyMembers}
              setCounter={setCounter}
              counter={counter}
              setChatMessage={setChatMessage}
              chatMessage={chatMessage}
              sendLobbyMessage={sendLobbyMessage}
              chatsData={chatsData}
              chatsLoading={chatsLoading}
              chatsError={chatsError}
              loadingChat={loadingChat}
              connectionStatus={connectionStatus}
            />
          )}

          {isSmallScreen && (
            <Drawer
              open={openMobileChat}
              anchor="right"
              onClose={toggleMobileChat(false)}
              PaperProps={{
                style: {
                  backgroundColor: "transparent",
                  width: "100%",
                  height: "100vh",
                  overflow: "hidden",
                  display: "flex",
                  justifyItems: "center",
                },
              }}
            >
              <LobbyChatContainer
                chatOpen={chatOpen}
                setChatOpen={setChatOpen}
                isSmallScreen={isSmallScreen}
                toggleMobileChat={toggleMobileChat}
                chatContainerRef={chatContainerRef}
                lobbyMembers={lobbyMembers}
                setCounter={setCounter}
                counter={counter}
                setChatMessage={setChatMessage}
                chatMessage={chatMessage}
                sendLobbyMessage={sendLobbyMessage}
                chatsData={chatsData}
                chatsLoading={chatsLoading}
                chatsError={chatsError}
                loadingChat={loadingChat}
                connectionStatus={connectionStatus}
              />
            </Drawer>
          )}
        </>

        {selectedTab === "tournaments" && (
          <>
            {/* Loading state */}
            {isLoadingTournaments && (
              <div className="flex justify-center">
                <MiniLoader />
              </div>
            )}

            {/* Error state */}
            {tournamentsError && (
              <div>
                <p className="text-primaryRed font-medium">
                  No tournaments yet
                </p>
              </div>
            )}

            {tournamentsData && !tournamentsError && (
              <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2
              xl:grid-cols-3 2xl:grid-cols-3 gap-4 sm:gap-6"
              >
                {tournamentsData?.tournaments?.map((tournament, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="w-full min-w-[300px] sm:min-w-0"
                  >
                    <TournamentCard tournament={tournament} />
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {selectedTab === "leaderboard" && (
          <div className="w-full max-w-4xl mx-auto sm:px-4">
            <Tabs defaultValue="competitive" className="w-full">
              <TabsList className="w-full justify-start overflow-x-auto overflow-y-hidden">
                <TabsTrigger
                  value="competitive"
                  className="text-sm sm:text-base"
                  onClick={() => handleCategoryChange("competitive")}
                >
                  Competitive
                </TabsTrigger>
                <TabsTrigger
                  value="skills"
                  className="text-sm sm:text-base"
                  onClick={() => handleCategoryChange("skills")}
                >
                  Skill Mastery
                </TabsTrigger>
              </TabsList>

              {isLoadingLeaderboards ? (
                <LeaderboardSkeleton />
              ) : (
                <TabsContent value="competitive">
                  <Tabs defaultValue="global">
                    <TabsList>
                      <TabsTrigger value="global">Global</TabsTrigger>
                      <TabsTrigger value="seasonal">Seasonal</TabsTrigger>
                      <TabsTrigger value="tournament">Tournament</TabsTrigger>
                    </TabsList>

                    <TabsContent value="global">
                      <LeaderboardTable
                        data={leaderboardsData?.competitive?.global}
                        type="competitive"
                        columns={[
                          "Rank",
                          "Player",
                          "Rating",
                          "Division",
                          "Games",
                          "Win Rate",
                          "Top Score",
                        ]}
                      />
                    </TabsContent>

                    <TabsContent value="seasonal">
                      <LeaderboardTable
                        data={leaderboardsData?.competitive?.seasonal}
                        type="competitive"
                        columns={[
                          "Rank",
                          "Player",
                          "Current Rating",
                          "Peak Rating",
                          "Games",
                          "Rating Gain",
                          "Score",
                        ]}
                      />
                    </TabsContent>

                    <TabsContent value="tournament">
                      <LeaderboardTable
                        data={leaderboardsData?.competitive?.tournament}
                        type="competitive"
                        columns={[
                          "Rank",
                          "Player",
                          "Rating",
                          "Tournaments",
                          "Victories",
                          "Win Rate",
                          "Earnings",
                        ]}
                      />
                    </TabsContent>
                  </Tabs>
                </TabsContent>
              )}

              {isLoadingLeaderboards ? (
                <LeaderboardSkeleton />
              ) : (
                <TabsContent value="skills">
                  <Tabs defaultValue="sequences">
                    <TabsList className="w-full flex flex-nowrap overflow-x-auto gap-1 sm:gap-2">
                      <TabsTrigger
                        value="sequences"
                        className="flex-shrink-0 text-xs sm:text-sm whitespace-nowrap px-2 sm:px-4"
                      >
                        Question Sequences
                      </TabsTrigger>
                      <TabsTrigger
                        value="special"
                        className="flex-shrink-0 text-xs sm:text-sm whitespace-nowrap px-2 sm:px-4"
                      >
                        Special Cards
                      </TabsTrigger>
                      <TabsTrigger
                        value="efficiency"
                        className="flex-shrink-0 text-xs sm:text-sm whitespace-nowrap px-2 sm:px-4"
                      >
                        Efficiency
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="sequences">
                      <LeaderboardTable
                        data={leaderboardsData?.skills?.sequences}
                        type="skills"
                        category="sequences"
                        columns={[
                          "Rank",
                          "Player",
                          "Total Sequences",
                          "Longest Chain",
                          "Sequence Win Rate",
                          "Perfect Games",
                        ]}
                      />
                    </TabsContent>

                    <TabsContent value="special">
                      <LeaderboardTable
                        data={leaderboardsData?.skills?.specialCards}
                        type="skills"
                        category="special"
                        columns={[
                          "Rank",
                          "Player",
                          "Ace Controls",
                          "Jump Chains",
                          "Successful Kickbacks",
                          "Penalty Avoids",
                          "Moves/Game",
                        ]}
                      />
                    </TabsContent>

                    <TabsContent value="efficiency">
                      <LeaderboardTable
                        data={leaderboardsData?.skills?.efficiency}
                        type="skills"
                        category="efficiency"
                        columns={[
                          "Rank",
                          "Player",
                          "Avg Move Time",
                          "Card Efficiency",
                          "Perfect Games",
                          "Efficiency Score",
                        ]}
                      />
                    </TabsContent>
                  </Tabs>
                </TabsContent>
              )}
            </Tabs>
          </div>
        )}
      </div>
      {/* 
      <div className="space-y-4">
        <button
          onClick={handleTimeout}
          disabled={isLoading}
          className={`px-4 py-2 rounded ${
            isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          } text-white transition-colors`}
        >
          {isLoading ? "Processing..." : "Start 30s Timer"}
        </button>

        {error && <p className="text-red-500">Error: {error}</p>}
      </div> */}

      {/* <button onClick={() => console.log(walletData)}>soundIII</button> */}

      {/* <button onClick={() => console.log(chatsData)}>KLICKED HERE</button> */}
      {/* <button onClick={() => console.log(tournamentsData)}>sound</button> */}
      {/* <button onClick={() => console.log(leaderboardsData)}>LEADERBOARD</button> */}
      {/* <br />
       */}

      {/* <br />  <br /> <br />
      <br />
      */}
      {/* <button onClick={() => console.log(roomsData)}>soundIII</button>
      <button
        onClick={() => console.log(leaderboardsData?.competitive?.global)}
      >
        ENGINE
      </button> */}
    </>
  );
};

// NEW LOBBY COMPONENTS

const LiveMatchesSection = ({
  matches,
  loading,
  handleOpenDeleteRoom,
  setSelectedTab,
}) => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <FlameIcon className="w-5 h-5 text-red-500" />
        Live Matches
      </h3>
      <Button variant="ghost" onClick={() => setSelectedTab("games")}>
        View All
      </Button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {matches?.map((match, index) => (
        <GameCard
          key={index}
          room={match}
          loading={loading}
          index={index}
          handleOpenDeleteRoom={handleOpenDeleteRoom}
        />
      ))}
    </div>
  </div>
);

const QuickStatsSection = ({ stats, topPlayers }) => (
  <div className="space-y-4">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart className="w-5 h-5 text-primary" />
          Highlights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="text-sm font-medium mb-2">Top Players</h4>
          <div className="space-y-2">
            {topPlayers?.map((player, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  {idx === 0 ? (
                    <Crown className="w-3 h-3 text-yellow-500" />
                  ) : (
                    idx + 1
                  )}
                </div>
                <Avatar className="h-6 w-6">
                  <AvatarImage src={player.profilePicture} />
                  <AvatarFallback>{player.username[0]}</AvatarFallback>
                </Avatar>

                <div>
                  <Link
                    href={`/${player.username}`}
                    className="text-sm font-medium hover:underline"
                  >
                    {player.name || player.username}{" "}
                  </Link>
                  {player.name && (
                    <span className="text-[10px] text-muted-foreground block">
                      @{player.username}
                    </span>
                  )}
                </div>

                {/* <span className="text-sm font-medium">{player.username}</span> */}
                <span className="text-sm text-muted-foreground ml-auto">
                  {player.rating}RP
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* <div>
          <h4 className="text-sm font-medium mb-2">Today&apos;s Activity</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-2xl font-bold">
                {stats.activeTournaments}
              </div>
              <div className="text-sm text-muted-foreground">
                Active Tournaments
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold">{stats.totalPrizePool}</div>
              <div className="text-sm text-muted-foreground">
                Total Prize Pool
              </div>
            </div>
          </div>
        </div> */}
      </CardContent>
    </Card>
  </div>
);

const FeaturedTournament = ({ featuredTournaments }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loadedImages, setLoadedImages] = useState({}); // Track loaded images
  const sliderRef = useRef(null);

  const nextSlide = () => {
    setCurrentSlide((prev) =>
      prev === featuredTournaments.length - 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? featuredTournaments.length - 1 : prev - 1
    );
  };

  useEffect(() => {
    const intervalId = setInterval(nextSlide, 5000);
    return () => clearInterval(intervalId);
  }, [featuredTournaments]);

  const featuredTournament = featuredTournaments[currentSlide];

  const handleImageLoad = (index) => {
    setLoadedImages((prev) => ({ ...prev, [index]: true }));
  };

  return (
    <div
      className="relative w-full h-[300px] rounded-lg overflow-hidden group"
      style={{
        backgroundSize: "cover",
        backgroundPosition: "center",
        cursor: "pointer",
        transition: "background-image 0.5s ease-in-out",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent opacity-90" />

      <div
        className="absolute inset-0"
        style={{
          backgroundImage: loadedImages[currentSlide]
            ? `url(${featuredTournament.customBannerImage})`
            : "linear-gradient(to right, rgb(var(--primary) / 0.2), rgb(var(--primary) / 0.1)), linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.5))",
          transition: "opacity 0.5s ease-in-out",
          opacity: loadedImages[currentSlide] ? 1 : 0,
        }}
      >
        {!loadedImages[currentSlide] && ( // loader
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>{" "}
          </div>
        )}
        <img
          src={featuredTournament.customBannerImage}
          alt={featuredTournament.name}
          className="absolute inset-0 object-cover w-full h-full"
          style={{ display: "none" }} // Hide the actual image, use it for preloading
          onLoad={() => handleImageLoad(currentSlide)}
        />
      </div>

      <div className="absolute inset-0 flex items-center justify-between z-20 px-4 transition-opacity duration-300 opacity-0 group-hover:opacity-100">
        <button
          onClick={(e) => {
            e.stopPropagation();
            prevSlide();
          }}
          className="h-10 w-10 rounded-full bg-background/60 backdrop-blur transition-colors duration-300 hover:bg-background/80 flex items-center justify-center"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="h-5 w-5 text-white" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            nextSlide();
          }}
          className="h-10 w-10 rounded-full bg-background/60 backdrop-blur transition-colors duration-300 hover:bg-background/80 flex items-center justify-center"
          aria-label="Next Slide"
        >
          <ChevronRight className="h-5 w-5 text-white" />
        </button>
      </div>

      <div className="absolute bottom-2 md:bottom-6 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
        {featuredTournaments.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${
              index === currentSlide
                ? "bg-white"
                : "bg-gray-400/50 dark:bg-gray-600/50"
            } transition-colors duration-300`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      <div className="absolute bottom-0 inset-x-0 px-2 md:px-6 py-6 bg-gradient-to-t from-background to-transparent">
        <Link
          href={`/${featuredTournament.creatorDetails.username}/${featuredTournament.slug}`}
          passHref
          legacyBehavior
        >
          <h3
            className="text-lg md:text-2xl font-bold mb-2 md:mb-4 text-gray-200 capitalize 
            text-shadow-sm cursor-pointer relative z-20 w-full md:w-6/12"
            aria-label={`Go to tournament page for ${featuredTournament.name}`}
          >
            {featuredTournament.name}
          </h3>
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          {featuredTournament.type === "paid" ? (
            <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-600">
              <Coins className="h-3 w-3 mr-1" />
              Buy-in: KSH {featuredTournament.buyIn?.entryFee?.toLocaleString()}
            </Badge>
          ) : (
            <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-600">
              <Gift className="h-3 w-3 mr-1" />
              Sponsored
            </Badge>
          )}

          <Badge
            variant="secondary"
            className="bg-background/80 backdrop-blur text-gray-400"
          >
            <Users className="w-4 h-4 mr-1" />
            {featuredTournament.currentParticipants}/
            {featuredTournament.numberOfParticipants}
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default Lobby;
