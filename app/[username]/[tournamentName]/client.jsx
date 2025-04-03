"use client";
"use client";
import Link from "next/link";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import { useState, useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

import { init_page } from "@/app/store/pageSlice";

import {
  Gamepad2,
  Users2,
  AlertTriangle,
  Coins,
  Gift,
  Trophy,
  Calendar,
  Medal,
  Check,
  Sparkles,
  Users,
  Star,
  Braces,
  ArrowRight,
  MessageCircle,
  Heart,
  Share2,
  Bookmark,
  Home,
  Loader2,
  Settings as SettingsIcon,
  PlayCircle,
  Clock,
  Plus,
  AlertCircle,
  MessageCircleMore,
} from "lucide-react";

import Settings from "@/page_components/Tournament/Settings";
import Overview from "@/page_components/Tournament/Overview";
import Participation from "@/page_components/Tournament/Participation";
import Games from "@/page_components/Tournament/Games";
import Sponsorship from "@/page_components/Tournament/Sponsorship";
import TournamentComments from "@/page_components/Tournament/Comments.jsx";

import VerifyParticipants from "@/page_components/Tournament/VerifyParticipants";

import CustomMatchBracket from "@/page_components/Tournament/CustomMatchBracket.jsx";

import { createNotification } from "@/app/store/notificationSlice";
import { useMpesaDeposit } from "@/hooks/usePayments";
import { useWalletHandler } from "@/lib/user";
import { useProductsHandler } from "@/lib/tournament";
import { useTelegram } from "@/hooks/useTelegram";
import { useIsMobile } from "@/hooks/useIsMobile";
import { cn } from "@/lib/utils";

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

  return (
    <div ref={containerRef} className="relative overflow-hidden">
      <div
        ref={textRef}
        className={`whitespace-nowrap ${className}`}
        style={{
          display: "inline-block",
          transform: shouldScroll ? "translateX(0)" : "none",
          animation: shouldScroll ? "scrolling 15s linear infinite" : "none",
          paddingRight: shouldScroll ? "50px" : "0",
          maxWidth: "280px",
        }}
      >
        {text}
        {shouldScroll && <span style={{ marginLeft: "50px" }}>{text}</span>}
      </div>

      <style jsx>{`
        @keyframes scrolling {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
};

// const EnterTournamentModal = ({
//   isOpenEntry,
//   setIsOpenEntry,
//   tournament,
//   organizer,
//   onPaymentSubmitted,
//   transactionId,
//   setTransactionId,
// }) => {
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const handleSubmit = async () => {
//     setIsLoading(true);
//     setError(null);

//     try {
//       await new Promise((resolve) => setTimeout(resolve, 2000)); // 2-second delay

//       onPaymentSubmitted();
//       setIsOpenEntry(false);
//     } catch (err) {
//       setError("Payment submission failed. Please try again.");
//       console.error(err);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <Dialog open={isOpenEntry} onOpenChange={setIsOpenEntry}>
//       <DialogContent className="sm:max-w-[425px] dark:bg-zinc-900 bg-white">
//         <DialogHeader>
//           <DialogTitle className="font-bold text-lg">
//             {tournament?.name}
//           </DialogTitle>
//           <DialogDescription className="text-sm">
//             Entry Fee: KSH {tournament?.buyIn.entryFee}
//           </DialogDescription>
//         </DialogHeader>
//         <div className="mt-4">
//           <p className="text-sm">Send KSH {tournament?.buyIn?.entryFee} to:</p>
//           <p className="font-medium">
//             {tournament?.paymentInformation?.type === "phoneNumber" && (
//               <span>
//                 Phone Number: {tournament.paymentInformation?.details}
//               </span>
//             )}
//             {tournament?.paymentInformation?.type === "mpesaPaybill" && (
//               <span>Paybill: {tournament?.paymentInformation?.details}</span>
//             )}
//             {tournament?.paymentInformation?.type === "lipaNaMpesa" && (
//               <span>
//                 Till/Business Number: {tournament?.paymentInformation?.details}
//               </span>
//             )}
//           </p>

//           {tournament?.paymentInformation.type === "paybill" && (
//             <p className="text-sm mt-2">
//               Use your Kadi username as the reference/payment note.
//             </p>
//           )}

//           <div className="mt-4">
//             <label
//               htmlFor="transactionId"
//               className="block text-sm font-medium mb-1"
//             >
//               Transaction ID/Confirmation Code
//             </label>
//             <input
//               type="text"
//               id="transactionId"
//               className="w-full border rounded px-3 py-2 dark:bg-zinc-800 bg-gray-100 dark:border-zinc-700 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               placeholder="Enter transaction ID"
//               value={transactionId}
//               onChange={(e) => setTransactionId(e.target.value)}
//             />
//             {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
//           </div>

//           <div className="mt-6 flex justify-end">
//             <Button
//               // className="px-4 py-2 rounded bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 mr-2"
//               onClick={() => setIsOpenEntry(false)}
//             >
//               Cancel
//             </Button>
//             <Button
//               // className={`px-4 py-2 rounded text-white ${
//               //   isLoading
//               //     ? "bg-gray-400 cursor-not-allowed"
//               //     : "bg-blue-500 hover:bg-blue-600"
//               // }`}
//               onClick={handleSubmit}
//               disabled={isLoading}
//             >
//               {isLoading ? "Submitting..." : "Submit Payment"}
//             </Button>
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// };

const UserTournament = ({ tournament, creator }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const isMobile = useIsMobile();

  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const { loading: loadingDeposit, initiateDeposit } = useMpesaDeposit();

  const {
    data: walletData,
    error: walletError,
    isLoading: walletLoading,
  } = useWalletHandler();

  const {
    data: productsData,
    loading: productsLoading,
    error: productsError,
    mutate: productsMutate,
  } = useProductsHandler(tournament?._id);

  const { loadingTelegram, isGroupMember, checkTelegramGroupMembershipStatus } =
    useTelegram();

  const uniqueUnverifiedParticipants = useMemo(() => {
    const unverified = tournament.matches
      .flatMap((match) => match.participants)
      .filter((participant) => !participant.buyInDetails?.verified);

    return [
      ...new Map(
        unverified.map((participant) => [
          participant.userId.toString(),
          participant,
        ])
      ).values(),
    ];
  }, [tournament.matches]);

  const hasInsufficientBalance =
    tournament.type === "paid" &&
    walletData?.balances?.KES / 100 < tournament.buyIn?.entryFee;

  const userProfile = useSelector((state) => state.auth.profile);

  const [isOpenEntry, setIsOpenEntry] = useState(false);
  const [transactionId, setTransactionId] = useState("");

  const [currentTab, setCurrentTab] = useState(0);
  const [showBracket, setShowBracket] = useState(
    tournament.status === "completed" ? true : false
  );

  const [pendingCheckins, setPendingCheckins] = useState(0);
  const [loadingTournament, setLoadingTournament] = useState(false);

  const [showVerification, setShowVerification] = useState(null);

  const [isLoadingTelegram, setLoadingTelegram] = useState(false);

  const isWinnerTakeAll = tournament.prizeDistribution?.first === 100;

  const navItems = [
    { icon: Home, label: "Overview", index: 0 },
    { icon: Users, label: "People", index: 1 },
    {
      icon: Trophy,
      label: "Matches",
      index: 2,
      showBadge: true,
      badgeContent: pendingCheckins,
    },
    { icon: MessageCircle, label: "Discussion", index: 3 },
  ];

  // Conditionally add Sponsors button for sponsored tournaments
  if (tournament?.type === "sponsored") {
    navItems.push({ icon: Gift, label: "Sponsors", index: 4 });
  }

  // // Always add Settings as the last item if user is creator
  if (tournament?.creator?._id === userProfile?.uuid && !isMobile) {
    navItems.push({
      icon: SettingsIcon,
      label: "Settings",
      index: navItems.length,
    });
  }

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
        username: champion?.username?.toLowerCase(),
        profilePicture: champion?.profilePicture,
        userId: champion?.userId,
      },
      second: {
        name: runnerUp?.name,
        username: runnerUp?.username?.toLowerCase(),
        profilePicture: runnerUp?.profilePicture,
        userId: runnerUp?.userId,
      },
      third: {
        name: thirdPlace?.name,
        username: thirdPlace?.username?.toLowerCase(),
        profilePicture: thirdPlace?.profilePicture,
        userId: thirdPlace?.userId,
      },
    };
  };

  const winners = getWinners(tournament.matches);

  const totalPrize =
    tournament.buyIn?.entryFee * tournament.numberOfParticipants;

  const toggleBracket = () => {
    setShowBracket(!showBracket);
  };

  const tournamentParticipants = [
    ...new Map(
      tournament.matches
        .flatMap((match) => match.participants)
        .map((participant) => [participant.userId.toString(), participant])
    ).values(),
  ];

  const isParticipant = tournamentParticipants?.some(
    (p) => p.userId === userProfile?.uuid
  );

  const verifiedParticipantsCount = useMemo(() => {
    return tournament.matches
      .flatMap((match) => match.participants)
      .filter((participant) => participant.buyInDetails?.verified).length;
  }, [tournament.matches]);

  const calculatedPrizePool = useMemo(() => {
    if (tournament.buyIn?.entryFee && verifiedParticipantsCount > 0) {
      return tournament.buyIn.entryFee * verifiedParticipantsCount;
    }
    return 0; // Or a default value like the original prize pool if you prefer
  }, [tournament.buyIn?.entryFee, verifiedParticipantsCount]);

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

  const handleTabChange = (index) => {
    // Generate tab names dynamically based on the actual navItems
    const tabNames = navItems.map((item) => {
      switch (item.label.toLowerCase()) {
        case "overview":
          return "overview";
        case "people":
          return "participation";
        case "matches":
          return "matches";
        case "discussion":
          return "discussion";
        case "sponsors":
          return "sponsorship";
        case "settings":
          return "settings";
        default:
          return item.label.toLowerCase();
      }
    });

    const selectedTab = tabNames[index];

    setCurrentTab(index);
    router.push(
      `/${tournament.creator.username}/${tournament?.slug}?tab=${selectedTab}`
    );

    // router.replace(
    //   `/${tournament.creator.username}/${tournament.slug}?tab=${tab}`,
    //   undefined,
    //   { shallow: true }
    // );

    setShowBracket(false);
  };

  const handleJoinTelegramGroup = async () => {
    setLoadingTelegram(true);
    // setTelegramError(null);

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
      // setTelegramError(
      //   "Failed to fetch Telegram invite link. Please try again."
      // );
      console.log("error fetching invite link");
    } finally {
      setLoadingTelegram(false);
    }
  };

  const joinTournament = async () => {
    setLoadingTournament(true);

    // if (tournament?.buyIn?.entryFee > walletData?.balances.KES / 100) {
    //   dispatch(
    //     createNotification({
    //       open: true,
    //       type: "error",
    //       message: "Insufficient Balance.",
    //     })
    //   );

    //   setLoadingTournament(false);

    //   return;
    // }

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
        referenceNote: transactionId,
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
        setCurrentTab(1);

        router.refresh();

        // console.log("Player added successfully:", response.data);
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

  // Function to get pending check-ins for a participant
  const getPendingCheckins = (matches) => {
    if (!matches) return 0;

    return matches.filter((match) => {
      // Find player in the match's players array
      const playerInMatch = match.participants?.find(
        (p) =>
          p.userId.toString() === userProfile?.uuid &&
          !p.checkedIn &&
          match?.gameRoomDetails?.gameStatus === "waiting"
      );

      // console.log("THE PLAYER IN MACTH");
      // console.log(playerInMatch);

      return playerInMatch;
    }).length;
  };

  useEffect(() => {
    // if (["in-progress"].includes(tournament?.status) && tournament?.matches) {
    const pending = getPendingCheckins(tournament.matches);
    setPendingCheckins(pending);
    // }
  }, [tournament?.matches, userProfile]);

  useEffect(() => {
    const checkMembership = async () => {
      if (userProfile && tournament?.telegramGroupId) {
        try {
          await checkTelegramGroupMembershipStatus(tournament?.telegramGroupId);
          // Handle the result
        } catch (error) {
          // Handle any errors
          console.error("Error checking Telegram group membership:", error);
        }
      }
    };

    checkMembership();
  }, [userProfile, tournament?.telegramGroupId]);

  useEffect(() => {
    if (tab === "overview") {
      setCurrentTab(0);
    } else if (tab === "participation") {
      setCurrentTab(1);
    } else if (tab === "matches") {
      setCurrentTab(2);
    } else if (tab === "discussion") {
      setCurrentTab(3);
    } else if (tab === "sponsorship") {
      setCurrentTab(4);
    } else if (tab === "settings") {
      setCurrentTab(5);
    }
  }, [searchParams]);

  // set page state
  useEffect(() => {
    dispatch(
      init_page({
        // page_title: `${
        //   tournament.name.charAt(0).toUpperCase() + tournament.name.slice(1)
        // } ${
        //   tournament.game.charAt(0).toUpperCase() + tournament.game.slice(1)
        // } Tournament`,
        page_title: `Kadi Tournament`,
        show_back: true,
        show_menu: false,
        route_to: `/lobby?tab=tournaments`,
      })
    );
  }, []);

  return (
    <>
      {/* {tournament.type === "paid" && (
        <EnterTournamentModal
          isOpenEntry={isOpenEntry}
          setIsOpenEntry={setIsOpenEntry}
          tournament={tournament}
          organizer={null}
          onPaymentSubmitted={joinTournament}
          transactionId={transactionId}
          setTransactionId={setTransactionId}
        />
      )} */}

      <div
        className="w-full max-w-3xl mx-auto flex flex-col gap-4 md:gap-8"
        style={{ minHeight: "100vh" }}
      >
        <Card className="bg-gradient-to-b from-background to-background/80 border-0 shadow-xl">
          <div className="relative h-[30vh] rounded-t-xl overflow-hidden">
            {/* Banner Background */}
            <div className="absolute inset-0">
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
              {/* Overlay gradient - darker at bottom for text legibility */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/75" />
            </div>

            {/* Settings Button - Mobile Only */}
            {tournament?.creator?._id === userProfile?.uuid && (
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden absolute top-2 right-2 z-10"
                onClick={() => {
                  setCurrentTab(5);
                  router.push(
                    `/${tournament.creator.username}/${tournament?.slug}?tab=settings`
                  );
                }}
              >
                <SettingsIcon className="h-5 w-5 text-white" />
              </Button>
            )}

            {/* Content Container */}
            <div className="absolute inset-0 flex flex-col justify-end p-3 md:p-4">
              {/* Tournament Info */}
              <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-3 text-white">
                {/* Left Section */}
                <div className="space-y-2 w-full md:w-8/12">
                  <ScrollingText
                    text={tournament.name}
                    className="text-xl md:text-2xl font-bold text-shadow-sm"
                  />

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/${tournament.creator.username}`}
                      className="flex items-center gap-2 group"
                    >
                      <Avatar className="h-8 w-8 ring-2 ring-white/20">
                        <AvatarImage src={tournament.creator.profilePicture} />
                        <AvatarFallback>
                          {tournament.creator.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col text-sm">
                        <div className="flex items-center gap-1 group-hover:underline">
                          <span className="font-medium">
                            {tournament.creator.name}
                          </span>
                          <span className="text-white/80">
                            @{tournament.creator.username}
                          </span>
                        </div>
                        <span className="text-white/60 text-xs">
                          Created{" "}
                          {new Date(tournament.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </Link>
                  </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-3 w-full md:w-4/12 justify-start md:justify-end">
                  <div className="flex items-center gap-2 text-sm bg-black/30 px-2 py-1 rounded-md">
                    <Users2 className="h-4 w-4 text-white/70" />
                    <span className="font-semibold">
                      {tournament.currentParticipants}
                    </span>
                    <span className="text-white/70">
                      / {tournament.numberOfParticipants}
                    </span>
                  </div>

                  <Badge
                    variant="outline"
                    className="bg-black/30 text-white border-white/20"
                  >
                    <Gamepad2 className="w-4 h-4 mr-1.5" />
                    {tournament.game.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Tournament Content - Below the header */}
          <div className="p-4 space-y-3 rounded-b-lg">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 space-y-2">
                {/* Primary Status */}
                <div className="flex items-center gap-2">
                  <Badge
                    className={`${getStatusStyle(
                      tournament.status
                    )} py-1.5 px-3`}
                    size="lg"
                  >
                    {tournament.status === "completed" ? (
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-purple-500" />
                        <span>Champion:</span>
                        <Link
                          href={`/${winners.first.username}`}
                          className="hover:text-primary transition-colors"
                        >
                          @{winners.first.username}
                        </Link>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {tournament.status === "in-progress" && (
                          <PlayCircle className="h-4 w-4" />
                        )}
                        {tournament.status === "ready" && (
                          <Clock className="h-4 w-4" />
                        )}
                        {tournament.status}
                      </div>
                    )}
                  </Badge>
                </div>

                {/* Tournament Info */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="capitalize">
                    <Trophy className="w-4 h-4 mr-1.5" />
                    {tournament.format}
                  </Badge>
                  {/*<Badge variant="outline">
    <Gamepad2 className="w-4 h-4 mr-1.5" />
    {tournament.game.toUpperCase()}
  </Badge>*/}
                </div>
              </div>

              {/* Prize Info */}
              <div className="flex-1">
                {tournament.type === "paid" ? (
                  <div className="space-y-2">
                    <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                      <Coins className="h-4 w-4 mr-1.5" />
                      Entry: KSH {tournament.buyIn?.entryFee?.toLocaleString()}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium">
                        Prize Pool: KSH {calculatedPrizePool}
                      </span>
                    </div>
                  </div>
                ) : (
                  <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                    <Gift className="h-4 w-4 mr-1.5" />
                    Sponsored Tournament
                  </Badge>
                )}
              </div>
            </div>

            {tournament.type === "paid" ? (
              <div className="space-y-4 w-full">
                {/* Prize Distribution */}
                {isWinnerTakeAll ? (
                  <div className="bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/10 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 md:gap-3">
                        <div className="p-2 rounded-full bg-yellow-500/20">
                          <Trophy className="w-4 h-4 md:h-6 md:w-6 text-yellow-500" />
                        </div>
                        <div>
                          <div className="text-xs md:text-sm font-medium">
                            Winner Takes All
                          </div>
                          <div className="text-xs text-muted-foreground">
                            First Place Prize
                          </div>
                        </div>
                      </div>
                      <div className="text-lg md:text-xl font-bold text-yellow-500">
                        KSH {totalPrize?.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between gap-1 md:gap-3">
                    <div className="relative overflow-hidden rounded-lg bg-gradient-to-b from-yellow-500/10 to-transparent p-3">
                      <div className="absolute top-0 right-0 w-16 h-16">
                        <Trophy className="h-12 w-12 text-yellow-500/20 rotate-12 translate-x-4 -translate-y-4" />
                      </div>
                      <div className="text-xs text-muted-foreground mb-1">
                        1st Place ({tournament.prizeDistribution?.first}%)
                      </div>
                      <div className="text-sm font-bold text-yellow-500">
                        KSH{" "}
                        {(
                          (totalPrize * tournament.prizeDistribution?.first) /
                          100
                        )?.toLocaleString()}
                      </div>
                    </div>

                    <div className="relative overflow-hidden rounded-lg bg-gradient-to-b from-slate-500/10 to-transparent p-3">
                      <div className="absolute top-0 right-0 w-16 h-16">
                        <Trophy className="h-10 w-10 text-slate-500/20 rotate-12 translate-x-4 -translate-y-4" />
                      </div>
                      <div className="text-xs text-muted-foreground mb-1">
                        2nd Place ({tournament.prizeDistribution?.second}%)
                      </div>
                      <div className="text-sm font-bold text-slate-500">
                        KSH{" "}
                        {(
                          (totalPrize * tournament.prizeDistribution?.second) /
                          100
                        )?.toLocaleString()}
                      </div>
                    </div>

                    <div className="relative overflow-hidden rounded-lg bg-gradient-to-b from-orange-500/10 to-transparent p-3">
                      <div className="absolute top-0 right-0 w-16 h-16">
                        <Trophy className="h-8 w-8 text-orange-500/20 rotate-12 translate-x-4 -translate-y-4" />
                      </div>
                      <div className="text-xs text-muted-foreground mb-1">
                        3rd Place ({tournament.prizeDistribution?.third}%)
                      </div>
                      <div className="text-sm font-bold text-orange-500">
                        KSH{" "}
                        {(
                          (totalPrize * tournament.prizeDistribution?.third) /
                          100
                        )?.toLocaleString()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                {tournament.sponsorshipDetails?.currentAmount <
                tournament.sponsorshipDetails?.targetAmount ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3 sm:space-y-4"
                  >
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                        <h3 className="text-sm sm:text-base font-semibold flex items-center gap-2 relative pr-32 sm:pr-0">
                          <Gift className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
                          Sponsorship Goal
                          <span className="text-lg sm:text-xl font-bold absolute right-0 top-0 sm:hidden">
                            KSH{" "}
                            {(
                              tournament.sponsorshipDetails?.targetAmount / 100
                            )?.toLocaleString()}
                          </span>
                        </h3>
                        <span className="hidden sm:block text-lg sm:text-xl font-bold">
                          KSH{" "}
                          {(
                            tournament.sponsorshipDetails?.targetAmount / 100
                          )?.toLocaleString()}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="relative">
                          <Progress
                            value={
                              (tournament.sponsorshipDetails?.currentAmount /
                                tournament.sponsorshipDetails?.targetAmount) *
                              100
                            }
                            className="h-1.5 sm:h-2 bg-slate-100 dark:bg-slate-800"
                          />
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-primary/50 to-primary-foreground/50 opacity-50 h-1.5 sm:h-2 rounded-full"
                            animate={{ opacity: [0.3, 0.6, 0.3] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        </div>

                        <div className="flex flex-col sm:flex-row justify-between text-xs sm:text-sm text-muted-foreground gap-1 sm:gap-0">
                          <span>
                            Current: KSH{" "}
                            {(
                              tournament.sponsorshipDetails?.currentAmount / 100
                            )?.toLocaleString()}
                          </span>
                          <span>
                            {Math.round(
                              (tournament.sponsorshipDetails?.currentAmount /
                                tournament.sponsorshipDetails?.targetAmount) *
                                100
                            )}
                            %
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3 sm:space-y-4"
                  >
                    <Card className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border-amber-500/20">
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 sm:justify-between mb-4">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                              <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
                            </div>
                            <div>
                              <h3 className="text-sm sm:text-base font-semibold text-amber-600 dark:text-amber-400">
                                Target Reached!
                              </h3>
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                Tournament is now live
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant="secondary"
                            className="w-fit text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                          >
                            100% Funded
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                          <div className="space-y-1">
                            <div className="text-xs sm:text-sm text-muted-foreground">
                              Prize Pool
                            </div>
                            <div className="text-base sm:text-lg font-bold">
                              KSH{" "}
                              {(
                                (tournament.sponsorshipDetails?.targetAmount *
                                  0.25) /
                                100
                              ).toLocaleString()}
                            </div>
                            <div className="text-[10px] sm:text-xs text-muted-foreground">
                              25% of total raised
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs sm:text-sm text-muted-foreground">
                              Total Raised
                            </div>
                            <div className="text-base sm:text-lg font-bold">
                              KSH{" "}
                              {(
                                tournament.sponsorshipDetails?.targetAmount /
                                100
                              ).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </>
            )}

            {/* Join CTA */}
            {/* {userProfile ? (
              <>
                {!isParticipant && (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loadingTelegram ? (
                      <Button disabled className="w-full">
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Checking requirements...
                      </Button>
                    ) : !userProfile?.telegramUserId ? (
                      <Button
                        onClick={() =>
                          router.push(
                            "/settings?tab=accountSettings&section=SignInMethods"
                          )
                        }
                        className="w-full bg-[#0088cc] hover:bg-[#0088cc]/90 text-white font-medium transition-all duration-200 gap-2"
                      >
                        <svg
                          className="h-5 w-5"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M9.78 18.65L10.06 14.42L17.74 7.5C18.08 7.19 17.67 7.04 17.22 7.31L7.74 13.3L3.64 12C2.76 11.75 2.75 11.14 3.84 10.7L19.81 4.54C20.54 4.21 21.24 4.72 20.96 5.84L18.24 18.65C18.05 19.56 17.5 19.78 16.74 19.36L12.6 16.3L10.61 18.23C10.38 18.46 10.19 18.65 9.78 18.65Z" />
                        </svg>
                        Connect Telegram Account
                      </Button>
                    ) : !isGroupMember ? (
                      <Button
                        onClick={() =>
                          window.open(
                            tournament.telegramGroup.inviteLink,
                            "_blank"
                          )
                        }
                        className="w-full bg-[#05090b] hover:bg-[#0088cc]/90 text-white font-medium transition-all duration-200 gap-2"
                      >
                        <Users className="h-5 w-5" />
                        Join Tournament Group
                      </Button>
                    ) : (
                      <Button
                        // onClick={() => joinTournament()}
                        onClick={() => setIsOpenEntry(true)}
                        className="w-full text-sm gap-2"
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
              </>
            ) : (
              <>
                {["draft", "setup", "ready"].includes(tournament?.status) && (
                  <Button asChild className="w-full text-sm">
                    <Link href="/login">Login to Join</Link>
                  </Button>
                )}
              </>
            )} */}

            {userProfile ? (
              <>
                {!isParticipant && (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loadingTelegram ? (
                      <Button disabled className="w-full">
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Checking requirements...
                      </Button>
                    ) : tournament?.requireTelegram &&
                      !userProfile?.telegramUserId ? (
                      <Button
                        onClick={() =>
                          router.push(
                            "/settings?tab=accountSettings&section=SignInMethods"
                          )
                        }
                        className="w-full bg-[#0088cc] hover:bg-[#0088cc]/90 text-white font-medium transition-all duration-200 gap-2"
                      >
                        <svg
                          className="h-5 w-5"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M9.78 18.65L10.06 14.42L17.74 7.5C18.08 7.19 17.67 7.04 17.22 7.31L7.74 13.3L3.64 12C2.76 11.75 2.75 11.14 3.84 10.7L19.81 4.54C20.54 4.21 21.24 4.72 20.96 5.84L18.24 18.65C18.05 19.56 17.5 19.78 16.74 19.36L12.6 16.3L10.61 18.23C10.38 18.46 10.19 18.65 9.78 18.65Z" />
                        </svg>
                        Connect Telegram Account
                      </Button>
                    ) : tournament?.requireTelegram && !isGroupMember ? (
                      <Button
                        disabled={isLoadingTelegram}
                        onClick={() => handleJoinTelegramGroup()}
                        className="w-full bg-[#05090b] hover:bg-[#0088cc]/90 text-white font-medium transition-all duration-200 gap-2"
                      >
                        {isLoadingTelegram ? (
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        ) : (
                          <>
                            <Users className="h-5 w-5" />
                            Join Tournament Group
                          </>
                        )}
                      </Button>
                    ) : tournament.type === "paid" && hasInsufficientBalance ? (
                      <div className="flex flex-col sm:flex-row gap-2 w-full">
                        <Button
                          variant="default"
                          className="w-full"
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
                    ) : (
                      <Button
                        onClick={() => joinTournament()}
                        className="w-full text-sm gap-2"
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
              </>
            ) : (
              <>
                {["draft", "setup", "ready"].includes(tournament?.status) && (
                  <Button asChild className="w-full text-sm">
                    <Link href="/login">Login to Join</Link>
                  </Button>
                )}
              </>
            )}
          </div>

          <div
            // className="w-full bg-background/80 backdrop-blur-md border-t dark:border-slate-800 z-50"
            className="w-full bg-background/80 backdrop-blur-md border-t dark:border-slate-800 z-50 rounded-b-xl"
          >
            {" "}
            <div className="max-w-3xl mx-auto">
              <div
                className="grid"
                style={{
                  gridTemplateColumns: `repeat(${navItems.length}, minmax(0, 1fr))`,
                }}
              >
                {navItems.map(
                  ({ icon: Icon, label, index, showBadge, badgeContent }) => (
                    <Button
                      key={label}
                      variant="ghost"
                      className={`
                h-14 relative group transition-colors duration-200 px-0.5
                hover:bg-muted/50 dark:hover:bg-muted/20
                ${
                  currentTab === index
                    ? "text-primary dark:text-primary"
                    : "text-muted-foreground"
                }
              `}
                      onClick={() => handleTabChange(index)}
                    >
                      <div className="flex flex-col items-center gap-0.5">
                        <Icon
                          className={`w-4 h-4 ${
                            currentTab === index
                              ? "text-primary"
                              : "text-muted-foreground"
                          }`}
                        />
                        <span className="text-[10px] font-medium truncate w-full text-center">
                          {label}
                        </span>
                      </div>
                      {showBadge && badgeContent > 0 && (
                        <Badge
                          variant="destructive"
                          className="absolute -top-1 right-[20%] scale-75 px-1.5 py-0 text-[10px] min-w-[18px] h-[18px] flex items-center justify-center"
                        >
                          {badgeContent}
                        </Badge>
                      )}
                    </Button>
                  )
                )}
              </div>
            </div>
          </div>
        </Card>

        {showBracket ? (
          <>
            <Button onClick={toggleBracket} variant="outline">
              <Trophy className="w-4 h-4" />
              Hide Bracket
            </Button>

            <Card>
              <CardHeader className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                <CardTitle className="text-xl md:text-2xl">Bracket</CardTitle>

                {(tournament?.status === "draft" ||
                  tournament?.status === "setup") && (
                  <Alert
                    variant="warning"
                    className="w-full sm:w-auto p-2 sm:p-3"
                  >
                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                      <AlertTriangle className="h-4 w-4 flex-shrink-0 text-amber-500" />
                      <AlertTitle className="text-sm sm:text-base text-amber-800 dark:text-amber-200">
                        <span className="hidden sm:inline">
                          Bracket subject to change
                        </span>
                        <span className="sm:hidden">
                          Changes possible before start
                        </span>
                      </AlertTitle>
                    </div>
                  </Alert>
                )}
              </CardHeader>

              <CardContent className="overflow-x-auto px-0 sm:px-4">
                <CustomMatchBracket matches={tournament?.matches} />
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {currentTab === 0 && (
              <>
                <Button onClick={toggleBracket} variant="outline">
                  <Trophy className="w-4 h-4" />
                  View Bracket
                </Button>

                <Overview
                  tournament={tournament}
                  creatorId={tournament?.creator?._id}
                  tournamentId={tournament._id}
                  matches={tournament?.matches}
                  tournamentStatus={tournament?.status}
                />
              </>
            )}

            {currentTab === 1 && !showVerification && (
              <>
                <Participation
                  tournament={tournament}
                  setShowVerification={setShowVerification}
                  setIsOpenEntry={setIsOpenEntry}
                />
              </>
            )}

            {currentTab === 2 && (
              <>
                <Games
                  matches={tournament.matches}
                  tournamentStatus={tournament?.status}
                  tournamentSlug={tournament.slug}
                />
              </>
            )}

            {currentTab === 3 && (
              <>
                <TournamentComments
                  tournamentId={tournament._id}
                  isCreator={tournament?.creator?._id === userProfile?.uuid}
                />
              </>
            )}

            {currentTab === 4 && tournament?.type === "sponsored" && (
              <>
                <Sponsorship
                  tournamentId={tournament._id}
                  tournamentName={tournament.name}
                  tournamentSlug={tournament.slug}
                  sponsorshipDetails={tournament.sponsorshipDetails}
                  sponsors={tournament.sponsors}
                  tournamentCreator={tournament.creator}
                  handleTabChange={handleTabChange}
                  tournamentStatus={tournament.status}
                  products={productsData?.products || []}
                  paymentInformation={tournament.paymentInformation}
                />
              </>
            )}

            {((currentTab === 4 && tournament?.type === "paid") ||
              currentTab === 5) && (
              <Settings
                tournament={tournament}
                products={productsData?.products || []}
              />
            )}

            {showVerification && (
              <VerifyParticipants
                tournamentId={tournament?._id}
                unverifiedParticipants={uniqueUnverifiedParticipants}
                setShowVerification={setShowVerification}
              />
            )}
          </>
        )}
      </div>

      {/* <button onClick={() => console.log(tournament)}>THEE</button> */}
    </>
  );
};

export default UserTournament;
