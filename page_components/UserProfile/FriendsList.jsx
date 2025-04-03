"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import axios from "axios";

import { useState } from "react";
import { useSelector } from "react-redux";

import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Trophy,
  Users,
  Clock,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Swords,
  UserPlus,
  Calendar,
} from "lucide-react";

import { useFriends } from "@/lib/user";

// Stats Overview Component
const StatsOverview = ({ statistics }) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-6">
    {[
      { icon: Users, label: "Total Friends", value: statistics?.totalFriends },
      {
        icon: Swords,
        label: "Active Friends",
        value: statistics?.activeFriends,
      },
      {
        icon: Trophy,
        label: "Tournament Friends",
        value: statistics?.tournamentParticipation,
      },
      {
        icon: Calendar,
        label: "Avg Games/Friend",
        value: Math.round(statistics?.averageGamesPerFriend) || 0,
      },
    ].map(({ icon: Icon, label, value }) => (
      <Card key={label} className="bg-background">
        <CardContent className="p-3 md:p-4">
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-muted-foreground" />
            <div className="min-w-0">
              <p className="text-xs md:text-sm text-muted-foreground truncate">
                {label}
              </p>
              <p className="text-base md:text-lg font-semibold">{value}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

// Friend Card Component
const FriendCard = ({ friend, index }) => {
  const [loading, setLoading] = useState(false);
  const userProfile = useSelector((state) => state.auth.profile);

  const lastPlayedDate = new Date(friend.lastPlayed).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );

  // const handleChallenge = async () => {
  //   if (friend?.telegram?.userId) {
  //     try {
  //       await challengePlayer({
  //         telegramUserId: friend.telegram.userId,
  //         challengerName: userProfile.username, // or username
  //         opponentName: friend.username, // or username
  //       });

  //       console.log("Challenge sent successfully!");
  //     } catch (error) {
  //       console.error("Error sending challenge:", error);
  //     }
  //   }
  // };

  const handleChallenge = async () => {
    setLoading(true);
    if (friend?.telegram?.userId) {
      try {
        const response = await axios.post("/api/challenge", {
          telegramUserId: friend.telegram.userId,
          challengerName: userProfile.name,
          opponentName: friend.name,
        });

        console.log("Challenge sent successfully!");
        setLoading(false);
      } catch (error) {
        console.error("Error sending challenge:", error);
        setLoading(false);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className="mb-3 md:mb-4 bg-background">
        <CardContent className="p-3 md:p-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Avatar className="h-10 w-10 md:h-12 md:w-12">
                <AvatarImage src={friend?.profilePicture} />
                <AvatarFallback>{friend?.username[0]}</AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {/* <h3 className="font-medium truncate">{friend.username}</h3> */}
                  <div className="min-w-0">
                    <h3 className="font-medium text-base leading-5 truncate">
                      {friend?.displayName || friend?.username}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">
                      @{friend?.username}
                    </p>
                  </div>

                  {friend?.tournamentGames > 0 && (
                    <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs md:text-sm text-muted-foreground">
                  <span className="truncate">Last played {lastPlayedDate}</span>
                  <span className="hidden md:inline">•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {Math.round(friend?.averageGameDuration / 60)}m avg
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between md:justify-end gap-2 mt-2 md:mt-0">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="gap-1">
                  <Users className="w-3 h-3" />
                  {friend.gamesPlayed}
                </Badge>
                <Badge
                  variant={friend?.winRate >= 50 ? "default" : "secondary"}
                  className="gap-1"
                >
                  {Math.round(friend?.winRate)}% WR
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3 md:mt-4">
            {userProfile && (
              <Button
                variant="secondary"
                size="sm"
                className="flex-1"
                disabled={!friend.telegram}
                onClick={() => handleChallenge()}
              >
                {loading && <Swords className="w-5 h-4 animate-spin" />}
                {loading ? "Sending..." : `Challenge`}
              </Button>
            )}

            <Link href={`/${friend?.username}`}>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 md:flex-none"
              >
                View Profile
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Empty State Component
const EmptyState = ({ filter, isOwner }) => (
  <div className="text-center py-6 md:py-8">
    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
      <Users className="w-6 h-6 text-muted-foreground" />
    </div>
    <h3 className="font-semibold mb-1">
      {isOwner ? "No Friends Yet" : "Nothing Yet!"}
    </h3>
    <p className="text-sm text-muted-foreground px-4">
      {isOwner
        ? filter === "frequent"
          ? "You haven't played many matches with other players yet."
          : filter === "recent"
          ? "You haven't played with anyone in the last 30 days."
          : "Start playing kadi matches to connect with other players!"
        : "This player has not played any matches yet."}
    </p>
  </div>
);

// Main Friends List Component
const FriendsList = ({ username }) => {
  const pathname = usePathname();

  const userProfile = useSelector((state) => state.auth.profile);

  const {
    data,
    error,
    isLoading,
    handleFilterChange,
    handlePageChange,
    currentFilter,
  } = useFriends(username);

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        Error loading friends list
      </div>
    );
  }

  const { friends, statistics, pagination } = data || {};

  return (
    <div className="space-y-4 md:space-y-6 p-3 md:p-4">
      <StatsOverview statistics={statistics} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Select value={currentFilter} onValueChange={handleFilterChange}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter friends" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Friends</SelectItem>
            <SelectItem value="frequent">Frequent Players</SelectItem>
            <SelectItem value="recent">Recent Players</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm" className="w-full sm:w-auto">
          <UserPlus className="w-4 h-4 mr-2" />
          Find Players
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : friends?.length > 0 ? (
          <div className="space-y-3 md:space-y-4">
            {friends.map((friend, index) => (
              <FriendCard key={friend.playerId} friend={friend} index={index} />
            ))}
          </div>
        ) : (
          <EmptyState
            filter={currentFilter}
            isOwner={pathname === `/${userProfile?.username}`}
          />
        )}
      </AnimatePresence>

      {pagination?.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={!pagination.hasPreviousPage}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={!pagination.hasNextPage}
          >
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default FriendsList;
