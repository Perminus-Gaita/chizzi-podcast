"use client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";

import {
  TriangleAlert,
  Shield,
  Trophy,
  Users,
  Clock,
  Flag,
  Settings,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Pencil,
  CheckCircle,
  PlayCircle,
  Timer,
  Calendar,
  Info,
  Mail,
  Star,
  Gamepad2,
  Scroll,
  MessageCircle,
  Check,
  ExternalLink,
} from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
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

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { createNotification } from "@/app/store/notificationSlice";
import ConfirmAction from "@/components/Shared/ConfirmAction";

import { useTelegram } from "@/hooks/useTelegram";

const MatchSchedule = ({ matches }) => {
  return (
    <div className="space-y-3">
      {matches.map((match, index) => (
        <div
          key={index}
          className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
        >
          <div className="h-12 w-12 flex items-center justify-center rounded-full bg-primary/10">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-medium">{match.name}</h4>
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {match.timeUntil}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              {new Date(match.scheduledTime).toLocaleString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const GameRules = ({ tournament }) => {
  const modifiedRules = [
    {
      type: tournament.gameSettings?.timerEnabled ? "enabled" : "disabled",
      name: "Game Timer",
      description: tournament.gameSettings?.timerEnabled
        ? "30 second turn timer enabled"
        : "Asynchronous turns (no timer)",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3">
        {modifiedRules.map((rule, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
          >
            <div
              className={`h-10 w-10 flex items-center justify-center rounded-full 
              ${
                rule.type === "enabled" ? "bg-green-500/10" : "bg-orange-500/10"
              }`}
            >
              {rule.type === "enabled" ? (
                <Star className="h-4 w-4 text-green-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-sm">{rule.name}</h4>
              <p className="text-xs text-muted-foreground">
                {rule.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <Link
        href={`/kadi/rules`}
        className="text-primary hover:underline flex items-center gap-2"
      >
        <Scroll className="h-4 w-4" />
        View Default Game Rules
      </Link>
    </div>
  );
};

const ContactInfo = ({ hasJoined = false, onJoinGroup }) => {
  const userProfile = useSelector((state) => state.auth.profile);

  return (
    <div className="space-y-4">
      {userProfile ? (
        <>
          {hasJoined ? (
            <Button
              className="w-full mt-2 bg-[#0088cc] hover:bg-[#0088cc]/90 text-white"
              onClick={onJoinGroup}
              variant="secondary"
            >
              <span>Open Telegram Group</span>
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              className="w-full mt-2 bg-[#0088cc] hover:bg-[#0088cc]/90 text-white"
              onClick={onJoinGroup}
            >
              <span>Join Telegram Group</span>
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          )}
        </>
      ) : (
        <Button asChild className="w-full text-sm">
          <Link href="/login">Login to Join</Link>
        </Button>
      )}
    </div>
  );
};

const Overview = ({
  tournament,
  tournamentId,
  tournamentStatus,
  creatorId,
}) => {
  const dispatch = useDispatch();
  const router = useRouter();

  const { handleJoinTelegramGroup } = useTelegram(tournament?.telegramGroupId);

  const statuses = ["draft", "setup", "ready", "in-progress", "completed"];
  const currentIndex = statuses.indexOf(tournamentStatus);

  const statusConfig = {
    draft: {
      icon: Pencil,
      color: "text-slate-600 dark:text-slate-400",
      bg: "bg-slate-100 dark:bg-slate-800",
      title: "Prep",
      description: "Tournament setup active",
    },
    setup: {
      icon: Settings,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-100 dark:bg-blue-900/30",
      title: "Staging",
      description: "Finalizing brackets & rules",
    },
    ready: {
      icon: CheckCircle,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-100 dark:bg-green-900/30",
      title: "Ready",
      description: "Tournament ready to begin",
    },
    "in-progress": {
      icon: PlayCircle,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-100 dark:bg-amber-900/30",
      title: "Live",
      description: "Battle in progress",
    },
    completed: {
      icon: Trophy,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-100 dark:bg-purple-900/30",
      title: "Victory",
      description: "Champions crowned",
    },
  };
  const currentStatus = statusConfig[tournamentStatus];
  const CurrentIcon = currentStatus.icon;
  const progressPercent =
    ((Object.keys(statusConfig).indexOf(tournament.status) + 1) * 100) /
    Object.keys(statusConfig).length;

  const userProfile = useSelector((state) => state.auth.profile);
  const isCreator = creatorId === userProfile?.uuid;

  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [telegramLoading, setTelegramLoading] = useState(false);
  const [isTelegramGroupMember, setIsTelegramGroupMember] = useState(false);

  // Determine if tournament is winner takes all
  const isWinnerTakeAll = tournament.prizeDistribution?.first === 100;

  // Get winners
  const getWinners = (matches) => {
    // Final match will have the champion
    const finalMatch = matches.find((m) => m.name === "Final");
    const champion = finalMatch?.participants.find((p) => p.isWinner);

    // Runner up is the loser of the final
    const runnerUp = finalMatch?.participants.find((p) => !p.isWinner);

    // For third place, get the loser from the other semi-final
    // First find the winner's semi-final match
    const winnerSemiFinal = matches.find(
      (m) =>
        m.name.includes("Semi") &&
        m.participants.find((p) => p.userId === champion?.userId)
    );

    // The third place is the loser of the other semi-final
    const otherSemiFinal = matches.find(
      (m) => m.name.includes("Semi") && m._id !== winnerSemiFinal?._id
    );
    const thirdPlace = otherSemiFinal?.participants.find((p) => !p.isWinner);

    return {
      first: {
        name: champion?.name,
        username: champion?.name?.toLowerCase(),
        profilePicture: champion?.profilePicture,
        userId: champion?.userId,
      },
      second: {
        name: runnerUp?.name,
        username: runnerUp?.name?.toLowerCase(),
        profilePicture: runnerUp?.profilePicture,
        userId: runnerUp?.userId,
      },
      third: {
        name: thirdPlace?.name,
        username: thirdPlace?.name?.toLowerCase(),
        profilePicture: thirdPlace?.profilePicture,
        userId: thirdPlace?.userId,
      },
    };
  };

  const winners = getWinners(tournament.matches);

  const handleOpenConfirmModal = () => {
    setOpenConfirmModal(true);
  };

  const handleCloseConfirmModal = () => {
    setOpenConfirmModal(false);
  };

  const startTournament = async () => {
    setIsStarting(true);

    dispatch(
      createNotification({
        open: true,
        type: "info",
        message: "Starting tournament...",
      })
    );

    try {
      const response = await axios.post("/api/tournament/start", {
        tournamentId: tournamentId,
      });

      if (response.status === 200) {
        dispatch(
          createNotification({
            open: true,
            type: "success",
            message: response.data.message,
          })
        );

        setIsStarting(false);

        router.refresh();
      }
    } catch (error) {
      console.error("Error starting tournament:", error);
      const errorMessage =
        error.response?.data?.message ||
        "An error occurred. Please try again later.";

      // Handle error
      dispatch(
        createNotification({
          open: true,
          type: "error",
          message: errorMessage,
        })
      );
      setIsStarting(false);
    } finally {
      setIsStarting(false);
    }
  };

  useEffect(() => {
    const checkMemberStatus = async () => {
      if (!userProfile?.telegramUserId || !tournament?.telegramGroupId) {
        setTelegramLoading(false);
        return;
      }

      setTelegramLoading(true);

      try {
        const response = await axios.get(
          `/api/integrations/telegram/group/check-membership?userId=${userProfile?.telegramUserId}&groupId=${tournament?.telegramGroupId}`
        );

        setIsTelegramGroupMember(response.data.isMember);

        setTelegramLoading(false);
      } catch (err) {
        console.error("Error checking Telegram membership:", err);
        // setError(err);
      } finally {
        setTelegramLoading(false);
      }
    };

    checkMemberStatus();
  }, [userProfile, tournament]);

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {/* Status Header */}
          <div className={`${currentStatus.bg} p-4 sm:p-6 border-b`}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`rounded-lg p-2 ${currentStatus.bg} border border-current`}
                >
                  <currentStatus.icon
                    className={`h-5 w-5 ${currentStatus.color}`}
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold truncate flex items-center gap-2">
                    {currentStatus.title}
                    {tournament.status === "in-progress" && (
                      <Badge variant="success" className="animate-pulse">
                        Live
                      </Badge>
                    )}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {currentStatus.description}
                  </p>
                </div>
              </div>

              {isCreator && tournament.status === "ready" && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="default" size="sm">
                      {isStarting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Starting...
                        </>
                      ) : (
                        "Start Tournament"
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-light dark:bg-dark">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Start Tournament</AlertDialogTitle>
                      <AlertDialogDescription>
                        <p className="mb-4">
                          You are about to start "{tournament.name}". This
                          action will:
                        </p>
                        <ul className="space-y-2 mb-4">
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            Create game rooms for all first-round matches
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            Lock tournament settings and participants
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            Begin competitive timed matches
                          </li>
                        </ul>
                        {tournament.currentParticipants <
                          tournament.numberOfParticipants && (
                          <Badge
                            variant="warning"
                            className="w-full justify-center py-2"
                          >
                            Starting with {tournament.currentParticipants}/
                            {tournament.numberOfParticipants} players
                          </Badge>
                        )}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={isStarting}>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={startTournament}
                        disabled={isStarting}
                      >
                        Confirm & Start
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>

          {/* Progress Track */}
          <div className="p-4 sm:p-6">
            <div className="flex justify-between mb-2">
              {Object.entries(statusConfig).map(([status, config], index) => (
                <motion.div
                  key={status}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative flex flex-col items-center ${
                    index <=
                    Object.keys(statusConfig).indexOf(tournament.status)
                      ? config.color
                      : "text-muted-foreground"
                  }`}
                >
                  <config.icon className="h-4 w-4 sm:h-5 sm:w-5 mb-1.5" />
                  <span className="absolute -bottom-6 text-xs font-medium whitespace-nowrap">
                    {config.title}
                  </span>
                </motion.div>
              ))}
            </div>

            <div className="h-2 bg-muted rounded-full mt-8">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>

          {tournament.status === "completed" && (
            <div className="mt-6 p-4 sm:p-6 border-t">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Tournament Champion{!isWinnerTakeAll && "s"}
              </h3>

              <div className="flex flex-col sm:flex-row gap-4 justify-between">
                {/* First Place */}
                <div className="flex-1 relative bg-gradient-to-br from-yellow-500/10 to-amber-500/10 rounded-lg p-4 border border-yellow-500/20">
                  <div className="absolute top-2 right-2">
                    <Trophy className="h-12 w-12 text-yellow-500/20" />
                  </div>
                  <Badge className="bg-yellow-500 text-white mb-2">
                    Champion
                  </Badge>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-yellow-500">
                      <AvatarImage src={winners.first?.profilePicture} />
                      <AvatarFallback>
                        {winners.first?.name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold text-yellow-500">
                        {winners?.first?.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        @{winners?.first?.username}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Runners Up (if not winner takes all) */}
                {!isWinnerTakeAll && (
                  <>
                    <div className="flex-1 bg-gradient-to-br from-slate-500/10 to-slate-400/10 rounded-lg p-4 border border-slate-500/20">
                      <Badge variant="secondary" className="mb-2">
                        Runner Up
                      </Badge>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 border-2 border-yellow-500">
                          <AvatarImage src={winners.second?.profilePicture} />
                          <AvatarFallback>
                            {winners.second?.name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold text-yellow-500">
                            {winners?.second?.name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            @{winners?.second?.username}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 bg-gradient-to-br from-orange-500/10 to-orange-400/10 rounded-lg p-4 border border-orange-500/20">
                      <Badge variant="secondary" className="mb-2">
                        Third Place
                      </Badge>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 border-2 border-yellow-500">
                          <AvatarImage src={winners.third?.profilePicture} />
                          <AvatarFallback>
                            {winners.third?.name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold text-yellow-500">
                            {winners?.third?.name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            @{winners?.third?.username}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* About Section */}
      {tournament.description && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Info className="h-5 w-5" />
              About Tournament
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tournament.description ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="text-muted-foreground">
                  {tournament.description}
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-center py-8 px-4 border-2 border-dashed rounded-lg">
                <p className="text-sm text-muted-foreground">
                  No description provided
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Schedule Section */}
      {tournament.matchSchedule?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5" />
              Match Schedule
            </CardTitle>
            <CardDescription>
              All matches are scheduled in your local time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MatchSchedule matches={tournament.matches} />
          </CardContent>
        </Card>
      )}

      {/* Game Rules Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Gamepad2 className="h-5 w-5" />
            Game Settings & Rules
          </CardTitle>
          <CardDescription>
            Modified rules and game settings for this tournament
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GameRules tournament={tournament} />
        </CardContent>
      </Card>

      {/* Contact Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Mail className="h-5 w-5" />
            Contact
          </CardTitle>
          <CardDescription>
            Get live tournament updates and connect with participants. Our
            Telegram group is your hub for match announcements, deck
            discussions, and tournament logistics.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ContactInfo
            organizer={tournament.creator}
            telegramGroupId={tournament?.telegramGroupId}
            telegramUserId={userProfile?.telegram?.userId}
            hasJoined={isTelegramGroupMember}
            // telegramInviteLink={tournament.telegramInviteLink}
            telegramInviteLink={""}
            // onJoinGroup={() => {
            //   window.open(tournament.telegramInviteLink, '_blank');
            // }}
            onJoinGroup={handleJoinTelegramGroup}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Overview;
