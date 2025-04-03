"use client";
import axios from "axios";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Trash2,
  Shuffle,
  Users,
  Trophy,
  Crown,
  AlertCircle,
  Shield,
  Coins,
  Gift,
  Plus,
  Loader2,
} from "lucide-react";
import ConfirmDeletion from "@/components/Shared/ConfirmDeletion";
import { createNotification } from "@/app/store/notificationSlice";
import { useWalletHandler } from "@/lib/user";
import { useMpesaDeposit } from "@/hooks/usePayments";
import TelegramStatus from "./TelegramStatus";

const calculateStandings = (matches, participants) => {
  return participants
    .map((participant) => {
      const stats = matches.reduce(
        (acc, match) => {
          const playerMatch = match.participants.find(
            (p) => p.userId === participant.userId
          );
          if (playerMatch) {
            return {
              matches: acc.matches + 1,
              wins: acc.wins + (playerMatch.isWinner ? 1 : 0),
              progress: acc.progress + (match.state === "SCORE_DONE" ? 1 : 0),
              lastMatch: match.state === "SCORE_DONE" ? match : acc.lastMatch,
            };
          }
          return acc;
        },
        { matches: 0, wins: 0, progress: 0, lastMatch: null }
      );

      return {
        userId: participant.userId,
        name: participant.name,
        profilePicture: participant.profilePicture,
        stats,
        rank: 0, // Will be calculated after sorting
        status:
          stats.lastMatch?.state === "SCORE_DONE"
            ? stats.lastMatch.participants.find(
                (p) => p.userId === participant.userId
              ).isWinner
              ? "advanced"
              : "eliminated"
            : "active",
      };
    })
    .sort((a, b) => {
      // Sort by wins first, then progress
      if (b.stats.wins !== a.stats.wins) return b.stats.wins - a.stats.wins;
      return b.stats.progress - a.stats.progress;
    })
    .map((player, index) => ({ ...player, rank: index + 1 }));
};

const Participation = ({ tournament }) => {
  const dispatch = useDispatch();
  const router = useRouter();

  const { loading: loadingDeposit, initiateDeposit } = useMpesaDeposit();

  const [loading, setLoading] = useState(false);
  const [shuffleLoading, setShuffleLoading] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState({});
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [loadingParticipant, setLoadingParticipant] = useState(false);
  const [loadingTournament, setLoadingTournament] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [view, setView] = useState(
    tournament.status === "completed" ? "standings" : "list"
  ); // 'list' or 'standings'
  const [loadingTelegram, setLoadingTelegram] = useState(false); // State for loading
  const [telegramError, setTelegramError] = useState(null); // State for error handling

  const handleCloseConfirmModal = () => {
    setOpenConfirmModal(false);
    setSelectedParticipant({});
  };

  const {
    data: walletData,
    error: walletError,
    isLoading: walletLoading,
  } = useWalletHandler();

  const hasInsufficientBalance =
    tournament.type === "paid" &&
    walletData?.balances?.KES / 100 < tournament.buyIn?.entryFee;

  const userProfile = useSelector((state) => state.auth.profile);

  const tournamentParticipants = [
    ...new Map(
      tournament.matches
        .flatMap((match) => match.participants)
        .map((participant) => [participant.userId.toString(), participant])
    ).values(),
  ];

  const standings = useMemo(
    () => calculateStandings(tournament.matches, tournamentParticipants),
    [tournament.matches, tournamentParticipants]
  );

  const fillPercentage = Math.round(
    (tournamentParticipants?.length / tournament?.numberOfParticipants) * 100
  );

  const isCreator = tournament?.creator?._id === userProfile?.uuid;
  const isParticipant = tournamentParticipants?.some(
    (p) => p.userId === userProfile?.uuid
  );
  const isFull =
    tournamentParticipants?.length === tournament?.numberOfParticipants;

  // Handler for the "Join Telegram Group" button
  const handleJoinTelegramGroup = async () => {
    setLoadingTelegram(true);
    setTelegramError(null);

    try {
      const response = await axios.post(
        "/api/integrations/telegram/group/invite-link",
        { groupId: tournament.telegramGroupId }
      );

      if (response.data.inviteLink) {
        window.open(response.data.inviteLink, "_blank");
      } else {
        throw new Error("Failed to fetch invite link");
      }
    } catch (error) {
      setTelegramError(
        "Failed to fetch Telegram invite link. Please try again."
      );
    } finally {
      setLoadingTelegram(false);
    }
  };

  // Handler for joining the tournament
  const joinTournament = async () => {
    setLoadingTournament(true);

    if (tournament?.buyIn?.entryFee > walletData?.balances.KES / 100) {
      dispatch(
        createNotification({
          open: true,
          type: "error",
          message: "Insufficient Balance.",
        })
      );

      setLoadingTournament(false);

      return;
    }

    dispatch(
      createNotification({
        open: true,
        type: "info",
        message: "Joining...",
      })
    );

    try {
      const response = await axios.post("/api/tournament/join", {
        tournamentId: tournament?._id,
        playerName: userProfile?.username,
      });

      if (response.status === 200) {
        dispatch(
          createNotification({
            open: true,
            type: "success",
            message: "You were added successfully.",
          })
        );
        setLoadingTournament(false);

        router.refresh();

        return;
      } else {
        dispatch(
          createNotification({
            open: true,
            type: "error",
            message: "Failed to join tournament",
          })
        );

        setLoadingTournament(false);

        console.error("Failed to join tournament:", response.data.message);
        return null;
      }
    } catch (error) {
      dispatch(
        createNotification({
          open: true,
          type: "error",
          message: "Error joining tournament",
        })
      );

      setLoadingTournament(false);
      console.error("Error joining tournament:", error);
      return null;
    } finally {
      setLoadingTournament(false);
      return;
    }
  };

  // Handler for shuffling seeds
  const shuffleSeeds = async () => {
    setShuffleLoading(true);
    dispatch(
      createNotification({
        open: true,
        type: "info",
        message: "Shuffling...",
      })
    );

    try {
      const response = await axios.post("/api/tournament/shuffle", {
        tournamentId: tournament?._id,
      });

      if (response.status === 200) {
        dispatch(
          createNotification({
            open: true,
            type: "success",
            message: "Seeds shuffled successfully.",
          })
        );
        setShuffleLoading(false);

        router.refresh();

        return;
      } else {
        dispatch(
          createNotification({
            open: true,
            type: "error",
            message: "Failed to shuffle seeds",
          })
        );

        setShuffleLoading(false);

        console.error("Failed to shuffle seeds:", response.data.message);
        return null;
      }
    } catch (error) {
      dispatch(
        createNotification({
          open: true,
          type: "error",
          message: "Error shuffling seeds",
        })
      );

      setShuffleLoading(false);
      console.error("Error shuffling seed:", error);
      return null;
    } finally {
      setShuffleLoading(false);
      return;
    }
  };

  // Handler for leaving the tournament
  const leaveTournament = async () => {
    setIsLeaving(true);
    dispatch(
      createNotification({
        open: true,
        type: "info",
        message: "Removing...",
      })
    );

    try {
      const response = await axios.post("/api/tournament/leave", {
        tournamentId: tournament?._id,
      });

      if (response.status === 200) {
        dispatch(
          createNotification({
            open: true,
            type: "success",
            message: "You were removed successfully.",
          })
        );
        setIsLeaving(false);

        router.refresh();

        return;
      } else {
        dispatch(
          createNotification({
            open: true,
            type: "error",
            message: "Failed to leave tournament",
          })
        );

        setIsLeaving(false);

        console.error("Failed to leave tournament:", response.data.message);
        return null;
      }
    } catch (error) {
      dispatch(
        createNotification({
          open: true,
          type: "error",
          message: "Error leaving tournament",
        })
      );

      setIsLeaving(false);
      console.error("Error leaving tournament:", error);
      return null;
    } finally {
      setIsLeaving(false);
      return;
    }
  };

  // Handler for removing a participant
  const removeParticipant = async (participantId) => {
    setLoadingParticipant(true);
    dispatch(
      createNotification({
        open: true,
        type: "info",
        message: "Removing...",
      })
    );

    try {
      const response = await axios.delete("/api/tournament/remove", {
        data: {
          tournamentId: tournament?._id,
          participantId,
        },
      });

      if (response.status === 200) {
        dispatch(
          createNotification({
            open: true,
            type: "success",
            message: "Participant removed successfully.",
          })
        );
        setLoadingParticipant(false);
        handleCloseConfirmModal();

        router.refresh();

        return;
      } else {
        dispatch(
          createNotification({
            open: true,
            type: "error",
            message: "Failed to remove Participant",
          })
        );

        setLoadingParticipant(false);
        handleCloseConfirmModal();

        console.error("Failed to remove participant:", response.data.message);
        return null;
      }
    } catch (error) {
      dispatch(
        createNotification({
          open: true,
          type: "error",
          message: "Error removing participant",
        })
      );

      setLoadingParticipant(false);

      handleCloseConfirmModal();

      console.error("Error removing participant:", error);
      return null;
    } finally {
      handleCloseConfirmModal();

      setLoadingParticipant(false);
      return;
    }
  };

  return (
    <>
      {/* Remove a participant modal */}
      <ConfirmDeletion
        openState={openConfirmModal}
        closeMethod={handleCloseConfirmModal}
        deleteMethod={removeParticipant}
        deletionCopy={`Remove ${selectedParticipant?.name} from tournament?`}
        loading={loadingParticipant}
      />

      <div className="space-y-4">
        {["draft", "setup", "ready"].includes(tournament?.status) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="border bg-muted/50">
              <CardContent className="p-3">
                {/* Players Count with Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Players</span>
                    </div>
                    <span className="text-sm font-bold">
                      {tournamentParticipants?.length || 0}/
                      {tournament?.numberOfParticipants}
                    </span>
                  </div>
                  <Progress value={fillPercentage} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Current</span>
                    <span>{fillPercentage}% Full</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Participants List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                  <CardTitle className="text-lg sm:text-xl">
                    {view === "list" ? "Participants" : "Tournament Standings"}
                  </CardTitle>
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-xs sm:text-sm">
                      {tournament?.numberOfParticipants -
                        tournamentParticipants?.length}{" "}
                      slots remaining
                    </CardDescription>
                    {/* Join Telegram Group Button */}
                    <Button
                      onClick={handleJoinTelegramGroup}
                      disabled={loadingTelegram}
                      className="ml-2 text-xs sm:text-sm float-right"
                      variant="outline"
                    >
                      {loadingTelegram ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Users className="h-4 w-4 mr-2" />
                      )}
                      Join Telegram Group
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {tournamentParticipants?.length > 0 && (
                    <div className="flex items-center border rounded-lg p-1 gap-1">
                      <Button
                        variant={view === "list" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setView("list")}
                        className="text-xs"
                      >
                        <Users className="h-4 w-4 mr-1" />
                        List
                      </Button>
                      <Button
                        variant={view === "standings" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setView("standings")}
                        className="text-xs"
                      >
                        <Trophy className="h-4 w-4 mr-1" />
                        Standings
                      </Button>
                    </div>
                  )}

                  {userProfile &&
                    !isParticipant &&
                    tournamentParticipants?.length > 0 && (
                      <Button
                        onClick={() => joinTournament()}
                        className="w-full sm:w-auto text-sm gap-2"
                        disabled={loadingTournament}
                      >
                        {loadingTournament && (
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        )}

                        {tournament.type === "paid" ? (
                          <>
                            {loadingTournament ? (
                              <>Securing spot...</>
                            ) : (
                              <>
                                <Coins className="h-4 w-4" />
                                Enter for KSH{" "}
                                {tournament.buyIn?.entryFee?.toLocaleString()}
                              </>
                            )}
                          </>
                        ) : (
                          <>
                            <Users className="h-4 w-4" />
                            Join Tournament
                          </>
                        )}
                      </Button>
                    )}

                  {["draft", "setup", "ready"].includes(tournament?.status) &&
                    isCreator &&
                    tournamentParticipants?.length > 2 && (
                      <Button
                        onClick={shuffleSeeds}
                        disabled={tournamentParticipants?.length < 3}
                        variant="outline"
                        className="text-xs sm:text-sm"
                      >
                        <Shuffle className="h-4 w-4" />
                        <span className="hidden sm:inline ml-2">
                          Shuffle Seeds
                        </span>
                      </Button>
                    )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6">
              {tournamentParticipants?.length === 0 ? (
                <motion.div
                  className="text-center py-6 sm:py-8"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    animate={{
                      y: [0, -5, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <Users className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-2 sm:mb-3" />
                  </motion.div>

                  <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2">
                    No Participants Yet
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 px-2">
                    Be the first to join this tournament!
                  </p>

                  {!userProfile && (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button asChild className="w-full sm:w-auto text-sm">
                        <Link href="/login">Login to Join</Link>
                      </Button>
                    </motion.div>
                  )}

                  {userProfile && (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {tournament.type === "paid" && hasInsufficientBalance ? (
                        <div className="w-full space-y-4">
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Insufficient Balance</AlertTitle>
                            <AlertDescription>
                              You need KES {tournament.buyIn?.entryFee} to join
                              this tournament. Current balance: KES{" "}
                              {walletData?.balances.KES / 100}
                            </AlertDescription>
                          </Alert>

                          <div className="flex flex-col sm:flex-row gap-2 w-full">
                            <Button
                              variant="default"
                              className="w-auto mx-auto"
                              onClick={() =>
                                initiateDeposit(tournament.buyIn?.entryFee)
                              }
                              disabled={loadingDeposit}
                            >
                              {loadingDeposit ? (
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              ) : (
                                <>
                                  {" "}
                                  <Plus className="mr-2 h-4 w-4" />
                                  Deposit KES{" "}
                                  {Math.ceil(
                                    ((tournament.buyIn?.entryFee -
                                      walletData?.balances.KES / 100) /
                                      10) *
                                      10
                                  )}
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          onClick={() => joinTournament()}
                          className="w-full sm:w-auto text-sm gap-2"
                          disabled={loadingTournament}
                        >
                          {loadingTournament && (
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          )}

                          {tournament.type === "paid" ? (
                            <>
                              {loadingTournament ? (
                                <>Securing spot...</>
                              ) : (
                                <>
                                  <Coins className="h-4 w-4" />
                                  Enter for KSH{" "}
                                  {tournament.buyIn?.entryFee?.toLocaleString()}
                                </>
                              )}
                            </>
                          ) : (
                            <>
                              <Users className="h-4 w-4" />
                              Join Tournament
                            </>
                          )}
                        </Button>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <div className="space-y-2">
                  {view === "list" ? (
                    <>
                      {tournamentParticipants?.map((participant, index) => (
                        <motion.div
                          key={participant.userId}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                          whileHover={{ scale: 1.01 }}
                          className="group"
                        >
                          <div className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border bg-card hover:bg-accent/50 transition-all">
                            {/* Number */}
                            <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium">
                              #{index + 1}
                            </div>

                            {/* Avatar and Name */}
                            <div className="flex items-center gap-2 min-w-0">
                              <motion.div whileHover={{ scale: 1.1 }}>
                                <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                                  <AvatarImage
                                    src={
                                      participant?.profilePicture ||
                                      `https://api.dicebear.com/6.x/initials/svg?seed=${participant?.name}`
                                    }
                                    alt={participant?.name}
                                  />
                                  <AvatarFallback>
                                    {participant?.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                              </motion.div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm sm:text-base truncate text-foreground">
                                    {participant?.name}
                                  </span>
                                  {participant.userId === userProfile?.uuid && (
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      transition={{
                                        type: "spring",
                                        stiffness: 500,
                                      }}
                                    >
                                      <Badge
                                        variant="secondary"
                                        className="flex-shrink-0 text-xs"
                                      >
                                        You
                                      </Badge>
                                    </motion.div>
                                  )}
                                </div>
                                <span className="text-xs text-muted-foreground truncate">
                                  @
                                  {participant?.username ||
                                    participant?.name
                                      .toLowerCase()
                                      .replace(/\s+/g, "")}
                                </span>
                              </div>
                            </div>
                            {/* Telegram Status */}
                            <TelegramStatus
                              telegramUserId={participant.telegramUserId}
                              telegramGroupId={tournament.telegramGroupId}
                            />

                            {/* Delete Button */}
                            {isCreator && (
                              <motion.div whileHover={{ scale: 1.1 }}>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 sm:h-8 sm:w-8 text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                  disabled={
                                    loadingParticipant ||
                                    tournament.status === "in-progress" ||
                                    tournament.status === "completed"
                                  }
                                  onClick={() =>
                                    handleOpenConfirmModal(
                                      participant,
                                      "remove"
                                    )
                                  }
                                >
                                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                </Button>
                              </motion.div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </>
                  ) : (
                    <div className="space-y-2">
                      {standings.map((player) => (
                        <motion.div
                          key={player.userId}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="relative overflow-hidden rounded-lg border bg-card hover:bg-accent/50 transition-all p-3"
                        >
                          <div className="grid grid-cols-[auto_1fr_auto] gap-3 items-center">
                            {/* Rank Indicator */}
                            <div
                              className={`
                flex items-center justify-center w-8 h-8 rounded-full font-medium
                ${
                  player.rank <= 3
                    ? `${
                        player.rank === 1
                          ? "bg-yellow-500/20 text-yellow-500"
                          : player.rank === 2
                          ? "bg-slate-500/20 text-slate-500"
                          : "bg-orange-500/20 text-orange-500"
                      }`
                    : "bg-primary/10 text-primary"
                }
              `}
                            >
                              #{player.rank}
                            </div>

                            {/* Player Info */}
                            <div className="flex items-center gap-3 min-w-0">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={player.profilePicture} />
                                <AvatarFallback>
                                  {player.name[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium truncate">
                                    {player.name}
                                  </span>
                                  {player.userId === userProfile?.uuid && (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      You
                                    </Badge>
                                  )}
                                  {player.status === "eliminated" && (
                                    <Badge
                                      variant="destructive"
                                      className="text-xs"
                                    >
                                      Eliminated
                                    </Badge>
                                  )}
                                  {player.status === "advanced" && (
                                    <Badge
                                      variant="success"
                                      className="text-xs"
                                    >
                                      Advanced
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Matches Won: {player.stats.wins}/
                                  {player.stats.matches}
                                </div>
                              </div>
                            </div>

                            {/* Tournament Progress */}
                            <div className="flex flex-col items-end gap-1">
                              {player.rank <= 3 &&
                                tournament.status === "completed" && (
                                  <Trophy
                                    className={`h-5 w-5 
                    ${
                      player.rank === 1
                        ? "text-yellow-500"
                        : player.rank === 2
                        ? "text-slate-400"
                        : "text-orange-500"
                    }`}
                                  />
                                )}
                              <span className="text-xs text-muted-foreground">
                                Progress:{" "}
                                {Math.round(
                                  (player.stats.progress /
                                    tournament.numberOfParticipants) *
                                    100
                                )}
                                %
                              </span>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="mt-2">
                            <Progress
                              value={
                                (player.stats.progress /
                                  tournament.numberOfParticipants) *
                                100
                              }
                              className="h-1"
                            />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Join/Leave Actions */}
                  {!isFull && userProfile && view === "list" && (
                    <motion.div
                      className="pt-3 sm:pt-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      {isParticipant && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              {isLeaving ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Leaving...
                                </>
                              ) : (
                                "Leave Tournament"
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-light dark:bg-dark w-11/12 rounded-lg">
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Leave Tournament?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                {tournament.type === "paid" ? (
                                  <>
                                    You will be removed from &quot;
                                    {tournament.name}&quot; and your buy-in of
                                    KSH{" "}
                                    {tournament.buyIn?.entryFee?.toLocaleString()}{" "}
                                    will be refunded to your wallet.
                                  </>
                                ) : (
                                  <>
                                    You will be removed from &quot;
                                    {tournament.name}&quot;. You can rejoin
                                    later if spots are available.
                                  </>
                                )}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel disabled={isLeaving}>
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => leaveTournament()}
                                className="bg-destructive hover:bg-destructive/90"
                                disabled={isLeaving}
                              >
                                Leave Tournament
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </motion.div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Tournament Full Message */}
        {isFull && !isParticipant && view === "list" && (
          <Card className="border-2 border-destructive/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                Tournament Full
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                This tournament has reached its participant limit. Check out
                other available tournaments!
              </p>
              <Button asChild className="w-full sm:w-auto">
                <Link href="/lobby">Browse Tournaments</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};

export default Participation;
