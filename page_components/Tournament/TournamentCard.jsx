"use client";
import Link from "next/link";

import { motion, AnimatePresence } from "framer-motion";

import { useState, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";

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

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

import {
  Gamepad2,
  Medal,
  Clock,
  PlayCircle,
  CheckCircle,
  Coins,
  Trophy,
  Users2,
  Share2,
  ChevronRight,
  Loader2,
  Gift,
} from "lucide-react";

import { useIsMobile } from "@/hooks/useIsMobile";
import { useTournamentBracketHandler } from "@/lib/tournament";

import { createNotification } from "@/app/store/notificationSlice";

import CustomMatchBracket from "@/page_components/Tournament/CustomMatchBracket";

const ScrollingText = ({ text }) => {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const [shouldScroll, setShouldScroll] = useState(false);

  const keyframes = `
  @keyframes scrollText {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-50%);
    }
  }
`;

  useEffect(() => {
    if (containerRef.current && textRef.current) {
      const shouldAnimate =
        textRef.current.scrollWidth > containerRef.current.clientWidth;
      setShouldScroll(shouldAnimate);
    }
  }, [text]);

  return (
    <>
      <style>{keyframes}</style>

      <div
        ref={containerRef}
        style={{
          position: "relative",
          maxWidth: "200px",
          overflow: "hidden",
        }}
      >
        <div
          ref={textRef}
          style={{
            animation: shouldScroll ? "scrollText 15s linear infinite" : "none",
            paddingRight: shouldScroll ? "50px" : "0",
          }}
        >
          {text}
          {shouldScroll && <span style={{ paddingLeft: "40px" }}>{text}</span>}
        </div>
      </div>
    </>
  );
};

const TournamentCard = ({ tournament }) => {
  const dispatch = useDispatch();
  const isMobile = useIsMobile();

  const [isHovered, setIsHovered] = useState(false);

  const [showBracketModal, setShowBracketModal] = useState(false);
  const [showBracket, setShowBracket] = useState(false);

  const { data: bracketData, isLoading: isLoadingBracket } =
    useTournamentBracketHandler(
      showBracketModal || showBracket ? tournament._id : null
    );

  const paidCurrentPrizePool =
    tournament.currentParticipants * tournament.buyIn?.entryFee;
  const paidMaxPrizePool =
    tournament.numberOfParticipants * tournament.buyIn?.entryFee;
  const paidProgress = (paidCurrentPrizePool / paidMaxPrizePool) * 100;

  const getEntryTypeDisplay = () => {
    switch (tournament.type) {
      case "paid":
        return (
          <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
            <Coins className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span>
              Buy-in: KSH {tournament.buyIn?.entryFee?.toLocaleString() || 0}
            </span>
          </Badge>
        );
      case "sponsored":
        return (
          <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
            <Gift className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span>
              Target: KSH{" "}
              {(
                tournament.sponsorshipDetails?.targetAmount / 100
              )?.toLocaleString() || 0}
            </span>
          </Badge>
        );
      default:
        return null;
    }
  };

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

  // Format prize money with theme-aware gold color
  const formatPrize = (prize) => {
    return prize.replace(
      /(\$[\d,]+)/g,
      '<span class="text-amber-500 dark:text-amber-400">$1</span>'
    );
  };

  const shareTournament = (tournament) => {
    navigator.clipboard
      .writeText(
        `Check out this tournament: https://www.wufwuf.io/${tournament.creatorDetails.username}/${tournament.slug}`
      )
      .then(() =>
        dispatch(
          createNotification({
            open: true,
            type: "info",
            message: "Link Copied!",
          })
        )
      )
      .catch((err) => console.error("Failed to copy: ", err));
  };

  const TournamentStatus = () => (
    <div className="flex items-center gap-2">
      <Badge
        className={`${getStatusStyle(
          tournament.status
        )} capitalize text-xs sm:text-sm flex items-center gap-1.5`}
      >
        {tournament.status === "in-progress" && (
          <PlayCircle className="h-3 w-3" />
        )}
        {tournament.status === "completed" && (
          <CheckCircle className="h-3 w-3" />
        )}
        {tournament.status === "ready" && <Clock className="h-3 w-3" />}
        {tournament.status}
      </Badge>
      {tournament.startDate && tournament.status !== "completed" && (
        <Badge variant="outline" className="text-xs">
          {new Date(tournament.startDate).toLocaleDateString()}
        </Badge>
      )}
    </div>
  );

  const PrizePoolInfo = () => {
    const calculatePrizeDetails = () => {
      if (tournament.type === "paid") {
        const totalPrize =
          tournament.buyIn?.prizePool ||
          tournament.buyIn?.entryFee * tournament.numberOfParticipants ||
          0;
        return {
          total: totalPrize,
          breakdown: {
            first:
              Math.floor(
                totalPrize * (tournament.buyIn?.distribution?.first / 100)
              ) || 0,
            second:
              Math.floor(
                totalPrize * (tournament.buyIn?.distribution?.second / 100)
              ) || 0,
            third:
              Math.floor(
                totalPrize * (tournament.buyIn?.distribution?.third / 100)
              ) || 0,
          },
        };
      }

      if (tournament.type === "sponsored") {
        return {
          total: tournament.prizePool?.totalValue,
          targetAmount: tournament.sponsorshipDetails?.targetAmount,
          currentAmount: tournament.sponsorshipDetails?.currentAmount,
          products: tournament.prizePool?.products,
        };
      }

      return null;
    };

    const prizeDetails = calculatePrizeDetails();

    if (!prizeDetails) return null;

    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1.5">
          <Trophy className="w-4 h-4 text-amber-500" />
          <span className="text-xs sm:text-sm font-medium">
            Prize Pool: KSH {(prizeDetails.total / 100)?.toLocaleString() || 0}
          </span>
        </div>

        {tournament.type === "paid" &&
          (tournament.buyIn?.distribution?.first === 100 ? (
            <div className="flex items-center justify-between text-xs text-amber-500">
              <span className="flex items-center gap-1">
                <Trophy className="h-3 w-3" />
                Winner Takes All
              </span>
              <span>KSH {prizeDetails.total?.toLocaleString()}</span>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
              {prizeDetails.breakdown.first > 0 && (
                <div>
                  <span className="text-amber-500">
                    1st ({tournament.buyIn?.distribution?.first}%):
                  </span>{" "}
                  KSH {prizeDetails.breakdown.first?.toLocaleString()}
                </div>
              )}
              {prizeDetails.breakdown.second > 0 && (
                <div>
                  <span className="text-slate-400">
                    2nd ({tournament.buyIn?.distribution?.second}%):
                  </span>{" "}
                  KSH {prizeDetails.breakdown.second?.toLocaleString()}
                </div>
              )}
              {prizeDetails.breakdown.third > 0 && (
                <div>
                  <span className="text-orange-400">
                    3rd ({tournament.buyIn?.distribution?.third}%):
                  </span>{" "}
                  KSH {prizeDetails.breakdown.third?.toLocaleString()}
                </div>
              )}
            </div>
          ))}

        {/* {tournament.type === "paid" && prizeDetails.breakdown && (
            <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
              <div>
                <span className="text-amber-500">1st:</span>{" "}
                {prizeDetails.breakdown.first > 0
                  ? `KSH ${(
                      prizeDetails.breakdown.first / 100
                    )?.toLocaleString()}`
                  : "-"}
              </div>
              <div>
                <span className="text-slate-400">2nd:</span>{" "}
                {prizeDetails.breakdown.second > 0
                  ? `KSH ${(
                      prizeDetails.breakdown.second / 100
                    )?.toLocaleString()}`
                  : "-"}
              </div>
  
              <div>
                <span className="text-orange-400">3rd:</span>{" "}
                {prizeDetails.breakdown.third > 0
                  ? `KSH ${(
                      prizeDetails.breakdown.third / 100
                    )?.toLocaleString()}`
                  : "-"}
              </div>
            </div>
          )} */}

        {tournament.type === "sponsored" && (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">
              {prizeDetails.products?.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <span>
                    {item.quantity}x {item.product.name}
                  </span>
                  <span>KSH {item.value?.toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Funding Progress</span>
                <span>
                  {Math.round(
                    (prizeDetails.currentAmount / prizeDetails.targetAmount) *
                      100
                  )}
                  %
                </span>
              </div>
              <Progress
                value={
                  (prizeDetails.currentAmount / prizeDetails.targetAmount) * 100
                }
                className="h-1.5"
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    // <motion.div
    //   initial={{ opacity: 0, y: 20 }}
    //   animate={{ opacity: 1, y: 0 }}
    //   whileHover={{ y: -4 }}
    //   onHoverStart={() => setIsHovered(true)}
    //   onHoverEnd={() => setIsHovered(false)}
    //   className="w-full h-full"
    // >
    //   <Card
    //     className="bg-white dark:bg-gray-900 dark:border-gray-800 w-full
    //     h-full flex flex-col shadow-md hover:shadow-xl transition-shadow duration-300"
    //   >
    //     <CardContent className="p-4 sm:p-6 flex flex-col h-full">
    //       <div className="flex items-start sm:items-center gap-4 w-full">
    //         <Avatar className="w-16 h-16 rounded-lg border-2 border-primary">
    //           <AvatarImage
    //             src={`https://api.dicebear.com/9.x/rings/svg?seed=${tournament._id}`}
    //             alt={tournament.name}
    //           />
    //           <AvatarFallback>{tournament.name[0]}</AvatarFallback>
    //         </Avatar>
    //         <div className="flex-1 min-w-0 space-y-2">
    //           <ScrollingText
    //             text={tournament.name}
    //             className={`text-lg sm:text-xl font-bold text-foreground`}
    //           />
    //           <div className="flex items-center gap-2">
    //             <span className="text-xs text-muted-foreground">by</span>
    //             <Avatar className="w-6 h-6">
    //               <AvatarImage
    //                 src={tournament.creatorDetails.profilePicture}
    //                 alt={tournament.creatorDetails.name}
    //               />
    //               <AvatarFallback>
    //                 {tournament.creatorDetails.name[0]}
    //               </AvatarFallback>
    //             </Avatar>
    //             <Link
    //               href={`/${tournament.creatorDetails.username}`}
    //               className="flex flex-col hover:opacity-80"
    //             >
    //               <span className="text-sm font-medium text-foreground">
    //                 {tournament.creatorDetails.name}
    //               </span>
    //               <span className="text-xs text-muted-foreground">
    //                 @{tournament.creatorDetails.username}
    //               </span>
    //             </Link>
    //           </div>
    //         </div>
    //       </div>

    //       <div className="flex flex-wrap gap-2 my-2">
    //         <TournamentStatus />
    //         {getEntryTypeDisplay()}
    //       </div>

    //       <div className="grid grid-cols-2 gap-3 mb-4">
    //         <div className="col-span-2">
    //           <PrizePoolInfo />
    //         </div>
    //         <div className="flex items-center gap-1.5">
    //           <Users2 className="w-4 h-4 text-primary" />
    //           <span className="text-xs sm:text-sm">
    //             {tournament.currentParticipants}/
    //             {tournament.numberOfParticipants}
    //             <span className="text-muted-foreground ml-1">players</span>
    //           </span>
    //         </div>
    //         <div className="flex items-center gap-1 sm:gap-2">
    //           <Gamepad2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
    //           <span className="text-xs sm:text-sm font-medium">
    //             {tournament.game}
    //           </span>
    //         </div>
    //         <div className="flex items-center gap-1.5">
    //           <Medal className="w-4 h-4 text-primary" />
    //           <span className="text-xs sm:text-sm capitalize">
    //             {tournament.format}
    //           </span>
    //         </div>
    //       </div>

    //       {/* <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-4 sm:mb-6">
    //         <div className="flex items-center gap-1 sm:gap-2">
    //           <Gamepad2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
    //           <span className="text-xs sm:text-sm font-medium">
    //             {tournament.game}
    //           </span>
    //         </div>
    //         <div className="flex items-center gap-1 sm:gap-2">
    //           <Users2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
    //           <span className="text-xs sm:text-sm font-medium">
    //             {tournament.currentParticipants}/
    //             {tournament.numberOfParticipants}
    //           </span>
    //         </div>
    //         <div className="flex items-center gap-1 sm:gap-2">
    //           <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
    //           <span className="text-xs sm:text-sm font-medium">
    //             {tournament.prize}
    //           </span>
    //         </div>
    //         <div className="flex items-center gap-1 sm:gap-2">
    //           <Badge variant="outline" className="text-xs font-normal">
    //             {tournament.format}
    //           </Badge>
    //         </div>
    //       </div> */}

    //       {/* {isMobile && (
    //         <AnimatePresence>
    //           {showBracket && (
    //             <motion.div
    //               initial={{ opacity: 0, height: 0 }}
    //               animate={{ opacity: 1, height: "auto" }}
    //               exit={{ opacity: 0, height: 0 }}
    //               transition={{ duration: 0.3 }}
    //               className="overflow-hidden mb-2 sm:mb-4"
    //             >
    //               {isLoadingBracket ? (
    //                 <div className="flex justify-center py-8">
    //                   <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    //                 </div>
    //               ) : bracketData?.matches ? (
    //                 <div className="overflow-x-auto">
    //                   <div className="min-w-[300px]">
    //                     <CustomMatchBracket matches={bracketData?.matches} />
    //                   </div>
    //                 </div>
    //               ) : null}
    //             </motion.div>
    //           )}
    //         </AnimatePresence>
    //       )} */}

    //       {/* <div className="mt-auto space-y-2 sm:space-y-4"> */}
    //       {/* {isMobile ? (
    //           <Button
    //             onClick={() => setShowBracket(!showBracket)}
    //             variant="outline"
    //             className="w-full text-xs sm:text-sm py-1 sm:py-2"
    //           >
    //             <motion.div
    //               animate={{ rotate: showBracket ? -90 : 0 }}
    //               transition={{ duration: 0.2 }}
    //               className="mr-2"
    //             >
    //               <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
    //             </motion.div>
    //             {showBracket ? "Hide Bracket" : "View Bracket"}
    //           </Button>
    //         ) : (
    //           <Button
    //             onClick={() => setShowBracketModal(true)}
    //             variant="outline"
    //             className="w-full text-xs sm:text-sm py-1 sm:py-2"
    //           >
    //             {showBracketModal ? "Hide Bracket" : "View Bracket"}
    //           </Button>
    //         )} */}

    //       <div className="mt-auto flex gap-2">
    //         <Link
    //           href={`/${tournament.creatorDetails.username}/${tournament.slug}`}
    //           className="flex-1"
    //         >
    //           <Button className="w-full text-xs sm:text-sm py-1 sm:py-2">
    //             View Tournament
    //           </Button>
    //         </Link>
    //         <Button
    //           variant="outline"
    //           onClick={() => shareTournament(tournament)}
    //           className="px-2 sm:px-3"
    //         >
    //           <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
    //         </Button>
    //       </div>
    //       {/* </div> */}
    //     </CardContent>
    //   </Card>

    //   <Dialog open={showBracketModal} onOpenChange={setShowBracketModal}>
    //     <DialogContent className="max-w-3xl bg-light dark:bg-dark">
    //       <DialogHeader>
    //         <DialogTitle>Tournament Bracket - {tournament.name}</DialogTitle>
    //       </DialogHeader>
    //       {isLoadingBracket ? (
    //         <div className="flex justify-center py-8">
    //           <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    //         </div>
    //       ) : bracketData?.matches ? (
    //         <div className="overflow-x-auto">
    //           <div className="min-w-[600px]">
    //             <CustomMatchBracket matches={bracketData?.matches} />
    //           </div>
    //         </div>
    //       ) : null}
    //     </DialogContent>
    //   </Dialog>
    // </motion.div>
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
                      Buy-in: KSH {tournament.buyIn?.entryFee?.toLocaleString()}
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
                  <span>Maximum: KSH {paidMaxPrizePool?.toLocaleString()}</span>
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
                            <CustomMatchBracket matches={bracketData.matches} />
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

        <CardFooter className="px-2 flex gap-2">
          <Link
            href={`/${tournament.creatorDetails.username}/${tournament.slug}`}
            className="flex-1"
          >
            <Button className="w-full text-xs sm:text-sm py-1 sm:py-2">
              View Tournament
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={() => shareTournament(tournament)}
            className="px-2 sm:px-3"
          >
            <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
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
  );
};

export default TournamentCard;
