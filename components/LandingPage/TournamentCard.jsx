"use client";
import Link from "next/link";

import { motion, AnimatePresence } from "framer-motion";

import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Progress } from "@/components/ui/progress";
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

import {
  Gamepad2,
  Medal,
  Clock,
  PlayCircle,
  CheckCircle,
  Coins,
  Trophy,
  Users2,
  Gift,
} from "lucide-react";

import { useIsMobile } from "@/hooks/useIsMobile";

const TournamentCard = ({ tournament }) => {
  const [isHovered, setIsHovered] = useState(false);

  const getEntryTypeDisplay = () => {
    switch (tournament.type) {
      case "paid":
        return (
          <Badge className="bg-purple-900/30 text-purple-400 flex items-center gap-1.5">
            <Coins className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span>
              Buy-in: KSH {tournament.buyIn?.entryFee?.toLocaleString() || 0}
            </span>
          </Badge>
        );
      case "sponsored":
        return (
          <Badge className="bg-amber-900/30 text-amber-400 flex items-center gap-1.5">
            <Gift className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span>
              Target: KSH{" "}
              {tournament.sponsorshipDetails?.targetAmount?.toLocaleString() ||
                0}
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
      draft: "bg-slate-800 text-slate-400",
      setup: "bg-blue-900/30 text-blue-400",
      ready: "bg-green-900/30 text-green-400",
      "in-progress": "bg-amber-900/30 text-amber-400",
      completed: "bg-purple-900/30 text-purple-400",
    };
    return styles[status] || "bg-gray-800 text-gray-400";
  };

  // Format prize money with theme-aware gold color
  const formatPrize = (prize) => {
    return prize.replace(
      /(\$[\d,]+)/g,
      '<span class="text-amber-500 dark:text-amber-400">$1</span>'
    );
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
          // tournament.buyIn?.prizePool ||
          tournament.buyIn?.entryFee * tournament.currentAmount || 0;
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
          <span className="text-xs sm:text-sm font-medium text-gray-700">
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="w-full h-full"
    >
      {/* <Card
        className="bg-white w-full 
      h-full flex flex-col shadow-md hover:shadow-xl transition-shadow duration-300"
      >
        <CardContent className="p-4 sm:p-6 flex flex-col h-full">
          <div className="flex items-start sm:items-center gap-4">
            <Avatar className="w-16 h-16 rounded-lg border-2 border-primary">
              <AvatarImage
                src={`https://api.dicebear.com/9.x/rings/svg?seed=${tournament._id}`}
                alt={tournament.name}
              />
              <AvatarFallback>{tournament.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 space-y-2">
              <h2 className="text-dark text-lg sm:text-xl font-bold text-foreground truncate">
                {tournament.name}
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">by</span>
                <Avatar className="w-6 h-6">
                  <AvatarImage
                    src={tournament.creatorDetails.profilePicture}
                    alt={tournament.creatorDetails.name}
                  />
                  <AvatarFallback>
                    {tournament.creatorDetails.name[0]}
                  </AvatarFallback>
                </Avatar>
                <Link
                  href={`/${tournament.creatorDetails.username}`}
                  className="flex flex-col hover:opacity-80"
                >
                  <span className="text-sm font-medium text-foreground">
                    {tournament.creatorDetails.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    @{tournament.creatorDetails.username}
                  </span>
                </Link>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 my-2">
            <TournamentStatus />
            {getEntryTypeDisplay()}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="col-span-2">
              <PrizePoolInfo />
            </div>
            <div className="flex items-center gap-1.5">
              <Users2 className="w-4 h-4 text-primary" />
              <span className="text-xs sm:text-sm">
                {tournament.currentParticipants}/
                {tournament.numberOfParticipants}
                <span className="text-muted-foreground ml-1">players</span>
              </span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <Gamepad2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <span className="text-xs sm:text-sm font-medium">
                {tournament.game}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Medal className="w-4 h-4 text-primary" />
              <span className="text-xs sm:text-sm capitalize">
                {tournament.format}
              </span>
            </div>
          </div>

          <div className="mt-auto space-y-2 sm:space-y-4">
            <div className="flex gap-2">
              <Link
                href={`/${tournament.creatorDetails.username}/${tournament.slug}`}
                className="flex-1"
              >
                <Button className="w-full text-xs sm:text-sm py-1 sm:py-2">
                  View Tournament
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card> */}

      <Card
        className="bg-white w-full h-full flex flex-col shadow-md hover:shadow-xl 
  transition-shadow duration-300 rounded-lg"
      >
        <CardContent className="p-4 sm:p-6 flex flex-col h-full">
          <div className="flex items-start sm:items-center gap-4">
            <Avatar className="w-16 h-16 rounded-lg border-2 border-indigo-500">
              <AvatarImage
                src={`https://api.dicebear.com/9.x/rings/svg?seed=${tournament._id}`}
                alt={tournament.name}
              />
              <AvatarFallback>{tournament.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 space-y-2">
              <h2 className="text-gray-900 text-lg sm:text-xl font-bold truncate">
                {tournament.name}
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">by</span>
                <Avatar className="w-6 h-6">
                  <AvatarImage
                    src={tournament.creatorDetails.profilePicture}
                    alt={tournament.creatorDetails.name}
                  />
                  <AvatarFallback>
                    {tournament.creatorDetails.name[0]}
                  </AvatarFallback>
                </Avatar>
                <Link
                  href={`/${tournament.creatorDetails.username}`}
                  className="flex flex-col hover:opacity-80"
                >
                  <span className="text-sm font-medium text-gray-900">
                    {tournament.creatorDetails.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    @{tournament.creatorDetails.username}
                  </span>
                </Link>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 my-2">
            <TournamentStatus />
            {getEntryTypeDisplay()}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="col-span-2">
              <PrizePoolInfo />
            </div>
            <div className="flex items-center gap-1.5">
              <Users2 className="w-4 h-4 text-indigo-500" />
              <span className="text-xs sm:text-sm text-gray-700">
                {tournament.currentParticipants}/
                {tournament.numberOfParticipants}
                <span className="text-gray-500 ml-1">players</span>
              </span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <Gamepad2 className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />
              <span className="text-xs sm:text-sm font-medium text-gray-700">
                {tournament.game}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Medal className="w-4 h-4 text-indigo-500" />
              <span className="text-xs sm:text-sm capitalize text-gray-700">
                {tournament.format}
              </span>
            </div>
          </div>

          <div className="mt-auto space-y-2 sm:space-y-4">
            <div className="flex gap-2">
              <Link
                href={`/${tournament.creatorDetails.username}/${tournament.slug}`}
                className="flex-1"
              >
                <Button className="w-full text-xs sm:text-sm py-1 sm:py-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                  View Tournament
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TournamentCard;
