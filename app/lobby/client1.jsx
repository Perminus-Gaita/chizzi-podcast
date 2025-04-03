"use client";
import React, { useState, useEffect } from "react";
import {
  Gamepad2,
  Trophy,
  Medal,
  Star,
  Users,
  Clock,
  CircleDollarSign,
  Search,
  Filter,
  SortAsc,
  Gift,
  MessageCircle,
  Share2,
  Crown,
  Swords,
  TrendingUp,
  ChevronRight,
  ChevronLeft,
  Eye,
  Calendar,
  FlameIcon,
  BarChart,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const FEATURED_TOURNAMENTS = [
  {
    id: 1,
    name: "Master Championship 2024",
    prizePool: 10000,
    participants: { current: 64, max: 64 },
    startsIn: "2d 4h",
    type: "buy-in",
    image: "/tournament1.jpg",
  },
  {
    id: 2,
    name: "Community Cup Series",
    prizePool: 5000,
    participants: { current: 48, max: 64 },
    startsIn: "5d",
    type: "sponsored",
    sponsorshipProgress: 75,
    image: "/tournament2.jpg",
  },
  {
    id: 3,
    name: "Pro League Finals",
    prizePool: 15000,
    participants: { current: 32, max: 32 },
    startsIn: "1d 12h",
    type: "buy-in",
    image: "/tournament3.jpg",
  },
];

const FEATURED_GAMES = [
  {
    id: 1,
    name: "High Stakes Final",
    type: "tournament-match",
    tournament: "Master Championship 2024",
    players: [
      { name: "ProPlayer1", rating: 2400 },
      { name: "ProPlayer2", rating: 2380 },
    ],
    pot: 1000,
    viewers: 1200,
    round: "Semi-Finals",
  },
  {
    id: 2,
    name: "Top Rank Battle",
    type: "high-stakes",
    players: [
      { name: "TopRank1", rating: 2600 },
      { name: "TopRank2", rating: 2590 },
    ],
    pot: 800,
    viewers: 850,
  },
  {
    id: 3,
    name: "Trending Match",
    type: "trending",
    players: [
      { name: "Rising1", rating: 2200 },
      { name: "Rising2", rating: 2180 },
    ],
    pot: 500,
    viewers: 2000,
  },
];

const FeaturedTournament = ({ tournament }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) =>
      prev === FEATURED_TOURNAMENTS.length - 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? FEATURED_TOURNAMENTS.length - 1 : prev - 1
    );
  };

  const featuredTournament = FEATURED_TOURNAMENTS[currentSlide];

  return (
    <div className="relative w-full h-[300px] rounded-lg overflow-hidden bg-gradient-to-r from-primary/20 to-primary/10 mb-6">
      <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />

      <div className="absolute inset-0 flex items-center justify-between z-20 px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={prevSlide}
          className="h-8 w-8 rounded-full bg-background/80 backdrop-blur"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={nextSlide}
          className="h-8 w-8 rounded-full bg-background/80 backdrop-blur"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-background to-transparent">
        <h3 className="text-2xl font-bold mb-4">{featuredTournament.name}</h3>

        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="secondary" className="bg-background/80 backdrop-blur">
            <CircleDollarSign className="w-4 h-4 mr-1" />$
            {featuredTournament.prizePool} Prize Pool
          </Badge>

          <Badge variant="secondary" className="bg-background/80 backdrop-blur">
            <Users className="w-4 h-4 mr-1" />
            {featuredTournament.participants.current}/
            {featuredTournament.participants.max}
          </Badge>

          <Badge variant="secondary" className="bg-background/80 backdrop-blur">
            <Clock className="w-4 h-4 mr-1" />
            Starts in {featuredTournament.startsIn}
          </Badge>

          {featuredTournament.type === "sponsored" && (
            <Badge className="bg-amber-500/10 text-amber-500">
              Sponsored Tournament
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

const LiveMatchesSection = ({ matches }) => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <FlameIcon className="w-5 h-5 text-red-500" />
        Live Matches
      </h3>
      <Button variant="ghost">View All</Button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {matches.map((match) => (
        <Card key={match.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {match.type === "tournament" && (
                    <Trophy className="w-4 h-4 text-primary" />
                  )}
                  {match.name}
                </CardTitle>
                {match.tournament && (
                  <p className="text-sm text-muted-foreground">
                    {match.tournament}
                  </p>
                )}
              </div>
              <Badge variant="secondary" className="flex items-center">
                <Eye className="w-3 h-3 mr-1" />
                {match.viewers}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              {match.players.map((player, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage src={player.avatar} />
                    <AvatarFallback>{player.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{player.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Rating: {player.rating}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <span className="text-sm font-medium">Pot: ${match.pot}</span>
            <Button>Watch Now</Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  </div>
);

const QuickStatsSection = ({ stats }) => (
  <div className="space-y-4">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart className="w-5 h-5 text-primary" />
          Quick Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="text-sm font-medium mb-2">Top Players</h4>
          <div className="space-y-2">
            {[1, 2, 3].map((player, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  {idx === 0 ? (
                    <Crown className="w-3 h-3 text-yellow-500" />
                  ) : (
                    idx + 1
                  )}
                </div>
                {/* <Avatar className="h-6 w-6">
                  <AvatarImage src={player.avatar} />
                  <AvatarFallback>{player.name[0]}</AvatarFallback>
                </Avatar> */}
                avr
                <span className="text-sm font-medium">player{idx}</span>
                <span className="text-sm text-muted-foreground ml-auto">
                  {/* {player.rating} */}rt
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
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
        </div>
      </CardContent>
    </Card>
  </div>
);

const TournamentSection = ({ tournaments }) => (
  <div className="space-y-4">
    <Tabs defaultValue="in-progress">
      <TabsList>
        <TabsTrigger value="in-progress">In Progress</TabsTrigger>
        <TabsTrigger value="upcoming">Registration Open</TabsTrigger>
        <TabsTrigger value="completed">Completed</TabsTrigger>
      </TabsList>

      <TabsContent value="in-progress">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tournaments.inProgress.map((tournament) => (
            <TournamentCard key={tournament.id} tournament={tournament} />
          ))}
        </div>
      </TabsContent>

      {/* Similar structure for other tabs */}
    </Tabs>
  </div>
);

const TournamentCard = ({ tournament }) => (
  <Card>
    <CardHeader>
      <div className="flex justify-between">
        <div>
          <CardTitle>{tournament.name}</CardTitle>
          <div className="flex items-center gap-2 mt-1">
            {/* <Avatar className="h-5 w-5">
              <AvatarImage src={tournament.creator.avatar} />
              <AvatarFallback>{tournament.creator.name[0]}</AvatarFallback>
            </Avatar> */}
            avr
            <span className="text-sm text-muted-foreground">
              {/* {tournament.creator.name} */}\creatpor
            </span>
          </div>
        </div>
        <Badge>{tournament.status}</Badge>
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Participants</div>
            <div className="flex items-center gap-1 mt-1">
              <Users className="w-4 h-4" />
              <span>
                {tournament.participants.current}/{tournament.participants.max}
              </span>
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Prize Pool</div>
            <div className="flex items-center gap-1 mt-1">
              <Trophy className="w-4 h-4" />
              <span>${tournament.prizePool}</span>
            </div>
          </div>
        </div>
        {tournament.type === "sponsored" && (
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Sponsorship Progress</span>
              <span>{tournament.sponsorshipProgress}%</span>
            </div>
            <Progress value={tournament.sponsorshipProgress} />
          </div>
        )}
      </div>
    </CardContent>
    <CardFooter className="justify-between">
      <Button variant="outline" size="sm">
        <Share2 className="w-4 h-4 mr-2" />
        Share
      </Button>
      <Button size="sm">
        {tournament.type === "buy-in" ? (
          <>Join ${tournament.buyIn}</>
        ) : (
          <>Sponsor</>
        )}
      </Button>
    </CardFooter>
  </Card>
);

const Lobby = () => {
  // State for active sections and filters
  const [activeView, setActiveView] = useState("featured");

  // Demo data would be here
  const featuredTournament = {
    name: "Master Championship 2024",
    prizePool: 10000,
    participants: { current: 64, max: 64 },
    startsIn: "2d 4h",
  };

  const getTypeIcon = (game) => {
    switch (game.type) {
      case "tournament-match":
        return <Swords className="w-4 h-4 text-primary" />;
      case "high-stakes":
        return <CircleDollarSign className="w-4 h-4 text-green-500" />;
      case "trending":
        return <TrendingUp className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Navigation */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto p-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-4">
              <Button
                variant={activeView === "featured" ? "default" : "outline"}
                onClick={() => setActiveView("featured")}
              >
                <Star className="w-4 h-4 mr-2" />
                Featured
              </Button>
              <Button
                variant={activeView === "tournaments" ? "default" : "outline"}
                onClick={() => setActiveView("tournaments")}
              >
                <Trophy className="w-4 h-4 mr-2" />
                Tournaments
              </Button>
              <Button
                variant={activeView === "games" ? "default" : "outline"}
                onClick={() => setActiveView("games")}
              >
                <Gamepad2 className="w-4 h-4 mr-2" />
                Games
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-9 w-[200px]" />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <SortAsc className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-6 space-y-6">
        {/* Featured Banner */}
        <FeaturedTournament tournament={featuredTournament} />

        {/* Primary Content Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Live Matches Section */}
          <div className="lg:col-span-2">
            <LiveMatchesSection matches={FEATURED_GAMES} />
          </div>

          {/* Quick Stats Section */}
          <div className="lg:col-span-1">
            <QuickStatsSection
              stats={{
                topPlayers: [],
                activeTournaments: 5,
                totalPrizePool: "$25,000",
              }}
            />
          </div>
        </div>

        {/* Tournament Section */}
        <TournamentSection
          tournaments={{
            inProgress: FEATURED_TOURNAMENTS,
            upcoming: FEATURED_TOURNAMENTS,
            completed: FEATURED_TOURNAMENTS,
          }}
        />

        {/* [Games Section]
    - Tournament Matches
    - Ranked Games
    - Casual Games */}

        <div className="space-y-6 p-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Featured Games</h2>
              <Button variant="ghost">View All</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURED_GAMES.map((game) => (
                <Card key={game.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {getTypeIcon(game)}
                          {game.name}
                        </CardTitle>
                        {game.tournament && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {game.tournament} {game.round}
                          </p>
                        )}
                      </div>
                      <Badge variant="secondary" className="flex items-center">
                        <Eye className="w-3 h-3 mr-1" />
                        {game.viewers}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-4">
                        {game.players.map((player, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Avatar>
                              <AvatarFallback>{player.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{player.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {player.rating} Rating
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Pot: ${game.pot}
                        </span>
                        <Button>Watch Now</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lobby;
