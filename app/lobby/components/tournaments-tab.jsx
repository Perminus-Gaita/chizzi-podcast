import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Trophy, Coins, Gift, Users, Clock, CheckCircle, PlayCircle, Gamepad2, Share2, Braces, Users2, Swords } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

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

// Dummy data for tournaments
const dummyTournaments = [
  {
    _id: "t1",
    name: "Weekly Kadi Championship",
    slug: "weekly-kadi-championship",
    customBannerImage: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2071&auto=format&fit=crop",
    status: "in-progress",
    game: "kadi",
    currentParticipants: 14,
    numberOfParticipants: 16,
    type: "paid",
    buyIn: {
      entryFee: 500,
    },
    prizeDistribution: {
      first: 70,
      second: 20,
      third: 10
    },
    creatorDetails: {
      name: "John Smith",
      username: "johnsmith",
      profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
    }
  },
  {
    _id: "t2",
    name: "Sponsored Tournament by GamersHub",
    slug: "sponsored-tournament-gamershub",
    customBannerImage: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?q=80&w=2070&auto=format&fit=crop",
    status: "ready",
    game: "kadi",
    currentParticipants: 24,
    numberOfParticipants: 32,
    type: "sponsored",
    sponsorshipDetails: {
      currentAmount: 15000,
      targetAmount: 20000,
    },
    creatorDetails: {
      name: "GamersHub",
      username: "gamershub",
      profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=gamershub",
    }
  },
  {
    _id: "t3",
    name: "Pro Kadi League Finals",
    slug: "pro-kadi-league-finals",
    customBannerImage: "https://images.unsplash.com/photo-1605979257913-1704eb7b6246?q=80&w=2070&auto=format&fit=crop",
    status: "completed",
    game: "kadi",
    currentParticipants: 8,
    numberOfParticipants: 8,
    type: "paid",
    buyIn: {
      entryFee: 1000,
    },
    prizeDistribution: {
      first: 100,
    },
    winners: {
      first: {
        name: "Jane Doe",
        username: "janedoe",
        profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=jane",
      }
    },
    creatorDetails: {
      name: "Kadi League",
      username: "kadileague",
      profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=kadileague",
    }
  },
  {
    _id: "t4",
    name: "Beginner-Friendly Tournament",
    slug: "beginner-friendly-tournament",
    customBannerImage: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?q=80&w=1974&auto=format&fit=crop",
    status: "ready",
    game: "kadi",
    currentParticipants: 12,
    numberOfParticipants: 16,
    type: "paid",
    buyIn: {
      entryFee: 100,
    },
    creatorDetails: {
      name: "Mary Johnson",
      username: "maryjohnson",
      profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=mary",
    }
  },
  {
    _id: "t5",
    name: "Charity Tournament for Education",
    slug: "charity-tournament-education",
    customBannerImage: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2070&auto=format&fit=crop",
    status: "setup",
    game: "kadi",
    currentParticipants: 20,
    numberOfParticipants: 64,
    type: "sponsored",
    sponsorshipDetails: {
      currentAmount: 5000,
      targetAmount: 50000,
    },
    creatorDetails: {
      name: "Education Fund",
      username: "educationfund",
      profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=education",
    }
  },
  {
    _id: "t6",
    name: "International Kadi Showdown",
    slug: "international-kadi-showdown",
    customBannerImage: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop",
    status: "in-progress",
    game: "kadi",
    currentParticipants: 32,
    numberOfParticipants: 32,
    type: "paid",
    buyIn: {
      entryFee: 750,
    },
    creatorDetails: {
      name: "Global Gaming",
      username: "globalgaming",
      profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=global",
    }
  }
];

const TournamentCard = ({ tournament }) => {
  const router = useRouter();
  const [showBracket, setShowBracket] = useState(false);
  const isMobile = window.innerWidth < 768;

  // Helper function for status style with dark mode support
  const getStatusStyle = (status) => {
    const styles = {
      draft: "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400",
      setup: "bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400",
      ready: "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400",
      "in-progress": "bg-amber-50 dark:bg-amber-900/30 text-amber-500 dark:text-amber-400",
      completed: "bg-purple-50 dark:bg-purple-900/30 text-purple-500 dark:text-purple-400",
    };
    return styles[status] || "bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400";
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
        setShowBracket(!showBracket);
      },
    },
  ];

  const paidCurrentPrizePool = tournament.currentParticipants * (tournament.buyIn?.entryFee || 0);
  const paidMaxPrizePool = tournament.numberOfParticipants * (tournament.buyIn?.entryFee || 0);
  const paidProgress = (paidCurrentPrizePool / paidMaxPrizePool) * 100;

  // Determine if tournament is winner takes all
  const isWinnerTakeAll = tournament.prizeDistribution?.first === 100;

  return (
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
    </motion.div>
  );
};

const TournamentTab = ({ tournaments = dummyTournaments }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {tournaments.map((tournament) => (
        <TournamentCard key={tournament._id} tournament={tournament} />
      ))}
    </div>
  );
};

export default TournamentTab;