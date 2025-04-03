"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Trophy,
  Timer,
  ArrowLeft,
  ArrowRight,
  Users,
  Loader2,
  Clock,
  Share2,
  PlayCircle,
} from "lucide-react";
import { useGameHistory } from "@/lib/user";

// Stats Card Component
const StatsCard = ({ title, value, icon: Icon, className }) => (
  <Card className="bg-background border">
    <CardContent className="p-3 md:p-4">
      <div className="flex items-center gap-2 md:gap-3">
        <div className="p-1.5 md:p-2 bg-primary/10 rounded-lg shrink-0">
          <Icon className="w-4 h-4 md:w-5 md:h-5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-xs md:text-sm text-muted-foreground truncate">
            {title}
          </p>
          <p className="text-lg md:text-2xl font-bold truncate">{value}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

// History Game Card Component

const HistoryGameCard = ({ game, index }) => {
  const formattedDate = new Date(game.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className="mb-3 md:mb-4 bg-background">
        <CardContent className="p-3 md:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <img
                  src={`https://api.dicebear.com/9.x/shapes/svg?seed=${game._id}`}
                  alt="Game"
                  className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-muted"
                />
                {game.tournament && (
                  <div className="absolute -bottom-1 -right-1 bg-amber-500 w-4 h-4 rounded-full flex items-center justify-center">
                    <Trophy className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <h3 className="font-medium truncate">{game.name}</h3>
                <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                  <span className="truncate">{formattedDate}</span>
                  {game.matchDuration && (
                    <>
                      <span className="hidden sm:inline">•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {Math.floor(game.matchDuration / 60)}m
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <Badge
              variant={game.isWinner ? "default" : "secondary"}
              className="self-start sm:self-center"
            >
              {game.isWinner ? "Won" : "Lost"}
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-2 md:gap-4 mb-4 text-center">
            <div>
              <p className="text-xs md:text-sm text-muted-foreground">
                Rating Change
              </p>
              <p
                className={`text-sm md:text-base font-medium ${
                  game.ratingChange >= 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {game.ratingChange >= 0 ? "+" : ""}
                {game.ratingChange}
              </p>
            </div>
            <div>
              <p className="text-xs md:text-sm text-muted-foreground">
                Special Moves
              </p>
              <p className="text-sm md:text-base font-medium">
                {game.specialMovesCount}
              </p>
            </div>
            <div>
              <p className="text-xs md:text-sm text-muted-foreground">
                Avg Move Time
              </p>
              <p className="text-sm md:text-base font-medium">
                {game.averageMoveTime}s
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" className="flex-1">
              <PlayCircle className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Watch </span>Replay
            </Button>
            <Button variant="outline" size="sm" className="px-2 sm:px-3">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const GameHistorySkeleton = () => {
  return (
    <div className="space-y-6 p-4 animate-pulse">
      {/* Stats Overview Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-muted rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-muted-foreground/15 rounded-lg" />
              <div className="space-y-2">
                <div className="h-4 w-20 bg-muted-foreground/15 rounded" />
                <div className="h-6 w-16 bg-muted-foreground/15 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Skeleton */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-2">
          <div className="w-[150px] h-10 bg-muted rounded" />
          <div className="w-[150px] h-10 bg-muted rounded" />
        </div>
      </div>

      {/* Game Cards Skeleton */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card rounded-lg border p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-muted rounded-lg" />
                <div className="space-y-2">
                  <div className="h-5 w-32 bg-muted rounded" />
                  <div className="h-4 w-24 bg-muted rounded" />
                </div>
              </div>
              <div className="w-16 h-6 bg-muted rounded-full" />
            </div>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((j) => (
                <div key={j} className="text-center space-y-1">
                  <div className="h-4 w-20 bg-muted rounded mx-auto" />
                  <div className="h-5 w-12 bg-muted rounded mx-auto" />
                </div>
              ))}
            </div>

            {/* Action Buttons Skeleton */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-9 bg-muted rounded" />
              <div className="w-9 h-9 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="flex items-center justify-center gap-2">
        <div className="w-9 h-9 bg-muted rounded" />
        <div className="w-20 h-9 bg-muted rounded" />
        <div className="w-9 h-9 bg-muted rounded" />
      </div>
    </div>
  );
};

// Main Game History Component
export const GameHistory = ({ username }) => {
  const {
    data,
    error,
    isLoading,
    handleFilterChange,
    handleSortChange,
    handlePageChange,
    currentFilter,
    currentSort,
  } = useGameHistory(username);

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        Error loading game history
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 p-3 md:p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
        <StatsCard
          title="Total Games"
          value={data?.summary?.totalGames}
          icon={Users}
        />
        <StatsCard
          title="Games Won"
          value={data?.summary?.wins}
          icon={Trophy}
        />
        <StatsCard
          title="Rating Change"
          value={
            data?.summary?.totalRatingChange >= 0
              ? `+${data?.summary?.totalRatingChange}`
              : data?.summary?.totalRatingChange
          }
          icon={Timer}
        />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <div className="flex flex-1 items-center gap-2">
          <Select value={currentFilter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Filter games" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Games</SelectItem>
              <SelectItem value="tournament">Tournament</SelectItem>
              <SelectItem value="casual">Casual</SelectItem>
            </SelectContent>
          </Select>

          <Select value={currentSort} onValueChange={handleSortChange}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="rating-change">Rating Change</SelectItem>
              <SelectItem value="duration">Duration</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <div className="space-y-3 md:space-y-4">
            {data?.games?.map((game, index) => (
              <HistoryGameCard key={game._id} game={game} index={index} />
            ))}
          </div>
        )}
      </AnimatePresence>

      {data?.pagination?.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(data.pagination.currentPage - 1)}
            disabled={!data.pagination.hasPreviousPage}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm">
            Page {data.pagination.currentPage} of {data.pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(data.pagination.currentPage + 1)}
            disabled={!data.pagination.hasNextPage}
          >
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default GameHistory;
