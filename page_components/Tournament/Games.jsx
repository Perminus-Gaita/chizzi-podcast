import Link from "next/link";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { motion, AnimatePresence } from "framer-motion";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import {
  Trophy,
  Clock,
  Shield,
  PlayCircle,
  AlertCircle,
  Share2,
  Copy,
  Twitter,
  Facebook,
  PhoneIcon as WhatsApp,
  Check,
  Loader2,
  CheckCircle2,
} from "lucide-react";

import { createNotification } from "@/app/store/notificationSlice";
import { cn } from "@/lib/utils";

const GameCard = ({ index, match }) => {
  const dispatch = useDispatch();
  const userProfile = useSelector((state) => state.auth.profile);
  const [isHovered, setIsHovered] = useState(false);
  const [copied, setCopied] = useState(false);

  const isPlayerTurn =
    userProfile?.uuid && match.gameRoomDetails?.turn === userProfile?.uuid;

  const needsCheckIn =
    match.gameRoomDetails?.gameStatus === "waiting" &&
    match.participants?.some(
      (p) => p.userId === userProfile?.uuid && !p.checkedIn
    );

  const shareUrl = `https://wufwuf.io/kadi/play/${match.gameRoomDetails.name}`;

  const handleShare = async () => {
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
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="group relative"
      >
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br rounded-lg transition-all duration-300 opacity-0 group-hover:opacity-100",
            isPlayerTurn
              ? "from-primary/20 via-primary/10 to-transparent"
              : "from-muted/20 via-muted/10 to-transparent",
            "dark:from-primary/10 dark:via-primary/5 dark:to-transparent"
          )}
        />

        <Card
          className={cn(
            "backdrop-blur-sm border-2 transition-all duration-300",
            isPlayerTurn ? "border-primary/50" : "border-muted",
            "hover:border-primary hover:shadow-lg",
            "dark:bg-background/80 dark:border-muted/20",
            "max-w-full overflow-hidden"
          )}
        >
          <CardHeader className="p-3 sm:p-4 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant={
                    match.gameRoomDetails?.gameStatus === "active"
                      ? "default"
                      : "secondary"
                  }
                  className="max-w-[120px] sm:max-w-[180px] text-xs sm:text-sm whitespace-normal break-words"
                >
                  {match?.name}
                </Badge>
                {isPlayerTurn && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <Badge
                      variant="destructive"
                      className="text-xs sm:text-sm whitespace-nowrap"
                    >
                      Your Turn!
                    </Badge>
                  </motion.div>
                )}
              </div>
              {match.pot > 0 && (
                <Badge
                  variant="outline"
                  className="font-mono text-xs sm:text-sm whitespace-nowrap"
                >
                  <Trophy className="w-3 h-3 mr-1 text-yellow-500" />
                  {match.pot} KSH
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-3 sm:p-4">
            <div className="grid grid-cols-2 gap-4 justify-items-center">
              {match.participants?.map((participant, idx) => (
                <motion.div
                  key={idx}
                  className={cn(
                    "flex flex-col items-center p-2 rounded-lg transition-all w-full",
                    participant.userId === userProfile?.uuid &&
                      "bg-primary/5 dark:bg-primary/10"
                  )}
                >
                  <div className="relative">
                    <Avatar
                      className={cn(
                        "h-12 w-12 sm:h-14 sm:w-14 ring-2 transition-all",
                        participant.checkedIn ? "ring-green-500" : "ring-muted",
                        "hover:ring-primary"
                      )}
                    >
                      <AvatarImage
                        src={
                          participant?.profilePicture ||
                          `https://api.dicebear.com/6.x/initials/svg?seed=${participant.name}`
                        }
                      />
                      <AvatarFallback>
                        {participant.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    {participant.checkedIn && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -bottom-1 -right-1"
                      >
                        <Badge variant="success" className="px-1 text-xs">
                          ✓
                        </Badge>
                      </motion.div>
                    )}
                  </div>

                  <div className="mt-2 text-center w-full">
                    <p className="font-medium text-xs sm:text-sm truncate max-w-[120px] sm:max-w-[150px]">
                      @{participant.name}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {!needsCheckIn &&
              match.gameRoomDetails?.gameStatus === "waiting" && (
                <div className="mt-4 flex flex-col items-center space-y-2 p-3 rounded-lg bg-yellow-500/10 dark:bg-yellow-400/10">
                  <div className="flex items-center text-yellow-600 dark:text-yellow-400">
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                    <span className="text-sm sm:text-base font-medium">
                      Waiting for opponents
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {match.participants.filter((p) => !p.checkedIn).length}{" "}
                    players need to check in
                  </p>
                </div>
              )}
          </CardContent>

          <CardFooter className="p-3 sm:p-4 gap-2">
            <Link
              href={
                match.gameRoomDetails?.gameStatus === "gameover"
                  ? `/kadi/replay/${match.gameRoomDetails.name}`
                  : `/kadi/play/${match.gameRoomDetails.name}`
              }
            >
              <Button
                variant={
                  needsCheckIn
                    ? "destructive"
                    : match.gameRoomDetails?.gameStatus === "active"
                    ? "default"
                    : "secondary"
                }
                size="sm"
                className={cn(
                  "flex-1 transition-all text-xs sm:text-sm h-8 sm:h-10",
                  isPlayerTurn &&
                    "animate-pulse bg-primary text-primary-foreground"
                )}
              >
                <PlayCircle className="w-4 h-4 mr-2" />
                {needsCheckIn && "Check In"}
                {!needsCheckIn &&
                  match.gameRoomDetails?.gameStatus === "waiting" &&
                  match.participants?.some(
                    (p) => p.userId !== userProfile?.uuid
                  ) &&
                  "View Game"}
                {match.gameRoomDetails?.gameStatus === "active" &&
                  (match.participants?.some(
                    (p) => p.userId === userProfile?.uuid
                  )
                    ? "Open Game"
                    : "Watch Live")}
                {match.gameRoomDetails?.gameStatus === "gameover" &&
                  "Watch Replay"}
              </Button>
            </Link>

            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto group hover:bg-primary/5"
              onClick={() => handleShare("copy")}
            >
              <Share2 className="h-4 w-4 mr-2 group-hover:text-primary" />
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </>
  );
};

// const Games = ({ matches, tournamentStatus, tournamentSlug }) => {
//   // Group matches by their status
//   const groupMatches = (matches) => {
//     return {
//       waiting: matches.filter(
//         (m) => m.gameRoomDetails?.gameStatus === "waiting"
//       ),
//       active: matches.filter((m) => m.gameRoomDetails?.gameStatus === "active"),
//       inactive: matches.filter(
//         (m) => m.gameRoomDetails?.gameStatus === "inactive"
//       ),
//       completed: matches.filter((m) =>
//         ["closed", "gameover"].includes(m.gameRoomDetails?.gameStatus)
//       ),
//     };
//   };

//   const groupedMatches = groupMatches(matches.filter((m) => m.gameRoomDetails));

//   // Determine default active tab based on match status
//   const getDefaultTab = () => {
//     if (groupedMatches?.active?.length > 0) return "active";
//     if (groupedMatches?.waiting?.length > 0) return "current";
//     if (groupedMatches?.completed?.length > 0) return "completed";
//     return "current"; // Fallback to current if no matches exist
//   };

//   const handleCheckIn = async (matchId) => {
//     try {
//       // Implement your check-in logic here
//       await checkInToMatch(matchId);
//     } catch (error) {
//       console.error("Failed to check in:", error);
//     }
//   };

//   // If tournament is completed, show a different view
//   if (tournamentStatus === "completed") {
//     return (
//       <div className="space-y-6">
//         <div className="space-y-4">
//           <div className="flex items-center justify-between">
//             <h3 className="text-lg font-semibold">Tournament Matches</h3>
//             <Badge variant="secondary">
//               {groupedMatches.completed.length} Matches
//             </Badge>
//           </div>

//           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//             {groupedMatches.completed.map((match, index) => (
//               <GameCard
//                 key={match._id}
//                 index={index}
//                 match={match}
//                 tournamentSlug={tournamentSlug}
//               />
//             ))}
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <>
//       <div className="space-y-6">
//         {/* Tournament Status Banner */}
//         {tournamentStatus === "in-progress" && (
//           <Tabs defaultValue={getDefaultTab()} className="w-full">
//             <TabsList className="grid w-full grid-cols-3 p-1">
//               <TabsTrigger
//                 value="current"
//                 className="px-2 md:px-4"
//                 disabled={!groupedMatches?.waiting?.length}
//               >
//                 {" "}
//                 <span className="hidden md:inline">Current Round</span>
//                 <span className="md:hidden">Current</span>
//                 {groupedMatches?.waiting?.length > 0 && (
//                   <Badge variant="destructive" className="ml-1 md:ml-2 text-xs">
//                     {groupedMatches.waiting.length}
//                   </Badge>
//                 )}
//               </TabsTrigger>

//               <TabsTrigger
//                 value="active"
//                 className="px-2 md:px-4"
//                 disabled={!groupedMatches?.active?.length}
//               >
//                 {" "}
//                 <span className="hidden md:inline">In Progress</span>
//                 <span className="md:hidden">Live</span>
//                 {groupedMatches?.active?.length > 0 && (
//                   <Badge variant="default" className="ml-1 md:ml-2 text-xs">
//                     {groupedMatches.active.length}
//                   </Badge>
//                 )}
//               </TabsTrigger>

//               <TabsTrigger
//                 value="completed"
//                 className="px-2 md:px-4"
//                 disabled={!groupedMatches?.completed?.length}
//               >
//                 {" "}
//                 <span className="hidden md:inline">Completed</span>
//                 <span className="md:hidden">Done</span>
//                 {groupedMatches?.completed?.length > 0 && (
//                   <Badge variant="secondary" className="ml-1 md:ml-2 text-xs">
//                     {groupedMatches.completed.length}
//                   </Badge>
//                 )}
//               </TabsTrigger>
//             </TabsList>

//             <TabsContent value="current" className="mt-4">
//               <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//                 {groupedMatches?.waiting?.map((match, index) => (
//                   <GameCard
//                     key={match._id}
//                     index={index}
//                     match={match}
//                     tournamentSlug={tournamentSlug}
//                     onCheckIn={handleCheckIn}
//                   />
//                 ))}
//               </div>
//             </TabsContent>

//             <TabsContent value="active" className="mt-4">
//               <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//                 {groupedMatches?.active?.map((match, index) => (
//                   <GameCard
//                     key={match._id}
//                     index={index}
//                     match={match}
//                     tournamentSlug={tournamentSlug}
//                   />
//                 ))}
//               </div>
//             </TabsContent>

//             <TabsContent value="completed" className="mt-4">
//               <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//                 {groupedMatches?.completed?.map((match, index) => (
//                   <GameCard
//                     key={match._id}
//                     index={index}
//                     match={match}
//                     tournamentSlug={tournamentSlug}
//                   />
//                 ))}
//               </div>
//             </TabsContent>
//           </Tabs>
//         )}

//         {/* Empty State */}
//         {!groupedMatches?.waiting?.length &&
//           !groupedMatches?.active?.length &&
//           !groupedMatches?.completed?.length && (
//             <Card className="py-8">
//               <CardContent className="flex flex-col items-center text-center">
//                 <Shield className="h-12 w-12 text-muted-foreground mb-4" />
//                 <h3 className="font-semibold mb-2">No Active Matches</h3>
//                 <p className="text-sm text-muted-foreground">
//                   Live matches will appear here once they begin
//                 </p>
//               </CardContent>
//             </Card>
//           )}
//       </div>

//       {/* <button onClick={() => console.log(matches)}>
//         THERE HERE {matches?.length}
//       </button>

//       <button onClick={() => console.log(groupedMatches)}>
//         AND HERE {groupedMatches?.length}
//       </button> */}
//     </>
//   );
// };

const Games = ({ matches, tournamentStatus, tournamentSlug }) => {
  // Group matches by their status
  const groupMatches = (matches) => {
    return {
      waiting: matches.filter(
        (m) => m.gameRoomDetails?.gameStatus === "waiting"
      ),
      active: matches.filter((m) => m.gameRoomDetails?.gameStatus === "active"),
      inactive: matches.filter(
        (m) => m.gameRoomDetails?.gameStatus === "inactive"
      ),
      completed: matches.filter((m) =>
        ["closed", "gameover"].includes(m.gameRoomDetails?.gameStatus)
      ),
    };
  };

  const groupedMatches = groupMatches(matches.filter((m) => m.gameRoomDetails));

  // Determine default active tab based on match status
  const getDefaultTab = () => {
    if (groupedMatches?.active?.length > 0) return "active";
    if (groupedMatches?.waiting?.length > 0) return "current";
    if (groupedMatches?.completed?.length > 0) return "completed";
    return "current"; // Fallback to current if no matches exist
  };

  const handleCheckIn = async (matchId) => {
    try {
      await checkInToMatch(matchId);
    } catch (error) {
      console.error("Failed to check in:", error);
    }
  };

  // If tournament is completed, show a different view
  if (tournamentStatus === "completed") {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Tournament Results
            </h3>
            <Badge variant="secondary">
              {groupedMatches.completed.length} Matches Played
            </Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {groupedMatches.completed.map((match, index) => (
              <GameCard
                key={match._id}
                index={index}
                match={match}
                tournamentSlug={tournamentSlug}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {tournamentStatus === "in-progress" ? (
        <Tabs defaultValue={getDefaultTab()} className="w-full">
          <TabsList className="grid w-full grid-cols-3 p-1">
            <TabsTrigger
              value="current"
              className="px-2 md:px-4"
              disabled={!groupedMatches?.waiting?.length}
            >
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span className="hidden md:inline">Current Round</span>
                <span className="md:hidden">Current</span>
                {groupedMatches?.waiting?.length > 0 && (
                  <Badge variant="destructive" className="ml-1 md:ml-2 text-xs">
                    {groupedMatches.waiting.length}
                  </Badge>
                )}
              </div>
            </TabsTrigger>

            <TabsTrigger
              value="active"
              className="px-2 md:px-4"
              disabled={!groupedMatches?.active?.length}
            >
              <div className="flex items-center gap-1">
                <PlayCircle className="h-4 w-4" />
                <span className="hidden md:inline">In Progress</span>
                <span className="md:hidden">Live</span>
                {groupedMatches?.active?.length > 0 && (
                  <Badge
                    variant="default"
                    className="ml-1 md:ml-2 text-xs animate-pulse"
                  >
                    {groupedMatches.active.length}
                  </Badge>
                )}
              </div>
            </TabsTrigger>

            <TabsTrigger
              value="completed"
              className="px-2 md:px-4"
              disabled={!groupedMatches?.completed?.length}
            >
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" />
                <span className="hidden md:inline">Completed</span>
                <span className="md:hidden">Done</span>
                {groupedMatches?.completed?.length > 0 && (
                  <Badge variant="secondary" className="ml-1 md:ml-2 text-xs">
                    {groupedMatches.completed.length}
                  </Badge>
                )}
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="mt-4">
            {groupedMatches?.waiting?.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {groupedMatches.waiting.map((match, index) => (
                  <GameCard
                    key={match._id}
                    index={index}
                    match={match}
                    tournamentSlug={tournamentSlug}
                    onCheckIn={handleCheckIn}
                  />
                ))}
              </div>
            ) : (
              <Card className="py-8">
                <CardContent className="flex flex-col items-center text-center">
                  <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No Current Matches</h3>
                  <p className="text-sm text-muted-foreground">
                    Matches for the current round will appear here
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="active" className="mt-4">
            {groupedMatches?.active?.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {groupedMatches.active.map((match, index) => (
                  <GameCard
                    key={match._id}
                    index={index}
                    match={match}
                    tournamentSlug={tournamentSlug}
                  />
                ))}
              </div>
            ) : (
              <Card className="py-8">
                <CardContent className="flex flex-col items-center text-center">
                  <PlayCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No Active Games</h3>
                  <p className="text-sm text-muted-foreground">
                    Live matches will appear here once they begin
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-4">
            {groupedMatches?.completed?.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {groupedMatches.completed.map((match, index) => (
                  <GameCard
                    key={match._id}
                    index={index}
                    match={match}
                    tournamentSlug={tournamentSlug}
                  />
                ))}
              </div>
            ) : (
              <Card className="py-8">
                <CardContent className="flex flex-col items-center text-center">
                  <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No Completed Matches</h3>
                  <p className="text-sm text-muted-foreground">
                    Finished matches will appear here
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      ) : (
        <Card className="py-8">
          <CardContent className="flex flex-col items-center text-center">
            <Shield className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">Tournament Not Started</h3>
            <p className="text-sm text-muted-foreground">
              Matches will appear here once the tournament begins
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Games;
