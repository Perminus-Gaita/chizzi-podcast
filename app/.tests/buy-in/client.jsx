"use client";
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from "@/lib/utils";
import { 
  Users2, 
  User2,
  Ticket,
  Gamepad2,
  Gift,
  Share2,
  Settings,
  Trophy,
  UserSquare2
} from 'lucide-react';

const tabConfig = {
  participants: {
    icon: (isSelected) => <UserSquare2 className={cn(
      "w-4 h-4",
      isSelected ? "text-blue-500" : "text-muted-foreground"
    )} />,
    label: 'Participants',
    brandColor: 'text-blue-500',
    bgColor: 'bg-blue-500/10 dark:bg-blue-500/20'
  },
  matches: {
    icon: (isSelected) => <Trophy className={cn(
      "w-4 h-4",
      isSelected ? "text-green-500" : "text-muted-foreground"
    )} />,
    label: 'Matches',
    brandColor: 'text-green-500',
    bgColor: 'bg-green-500/10 dark:bg-green-500/20'
  },
  settings: {
    icon: (isSelected) => <Settings className={cn(
      "w-4 h-4",
      isSelected ? "text-amber-500" : "text-muted-foreground"
    )} />,
    label: 'Settings',
    brandColor: 'text-amber-500',
    bgColor: 'bg-amber-500/10 dark:bg-amber-500/20'
  }
};

const TournamentPage = () => {
  const [selectedTab, setSelectedTab] = React.useState('participants');

  const tournament = {
    name: "Summer Kadi Championship 2024",
    participants: 6,
    numberOfParticipants: 8,
    creator: {
      name: "Alex Thompson",
      username: "@alexthompson"
    },
    buyIn: 50,
    game: 'kadi',
    format: 'single elimination',
    status: 'ready',
    players: [
      { id: 1, name: "John Doe", username: "@johndoe", status: "joined" },
      { id: 2, name: "Jane Smith", username: "@janesmith", status: "joined" },
      { id: 3, name: "Mike Johnson", username: "@mikej", status: "joined" },
      { id: 4, name: "Sarah Wilson", username: "@sarahw", status: "joined" },
      { id: 5, name: "Tom Brown", username: "@tombrown", status: "joined" },
      { id: 6, name: "Lisa Anderson", username: "@lisaa", status: "joined" }
    ]
  };

  const seatsPercentage = (tournament.participants / tournament.numberOfParticipants) * 100;
  const prizePool = tournament.buyIn * tournament.participants;

  const renderContent = () => {
    switch (selectedTab) {
      case 'participants':
        return (
          <div>
            <div className="p-4">
              <Button 
                className="bg-[#FFD700] hover:bg-[#FFC700] text-black w-full"
                onClick={() => console.log('Join tournament')}
              >
                Join Tournament
              </Button>
            </div>
            <div className="divide-y">
              {tournament.players.map((player) => (
                <div 
                  key={player.id}
                  className="flex items-center px-6 py-4 hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <User2 className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="flex flex-col">
                      <p className="font-medium text-sm">{player.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {player.username}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'matches':
        return (
          <div className="px-6 py-8 text-center text-muted-foreground">
            No matches scheduled yet
          </div>
        );
      case 'settings':
        return (
          <div className="px-6 py-4 space-y-4">
            <div className="grid gap-2">
              <h3 className="font-medium">Tournament Settings</h3>
              <p className="text-sm text-muted-foreground">
                Configure tournament rules, schedule, and other settings
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container max-w-4xl mx-auto p-4 px-0" style={{marginTop:"-35px", maxWidth:"700px"}}>
      <Card className="w-full">
        {/* Tournament Info Section */}
        <CardContent className="pt-6 px-6 pb-2">
          <div className="flex items-start gap-3 mb-4">
            <div className="flex-shrink-0 w-12 h-12">
              <div className="w-full h-full rounded-md bg-gradient-to-br from-yellow-400 to-purple-600" />
            </div>
            <div className="flex-1 min-w-0 flex items-center h-12">
              <h2 className="font-semibold text-[15px] line-clamp-2">
                {tournament.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <Badge 
              variant="secondary" 
              className="bg-green-500/10 text-green-500 text-[11px]"
            >
              Paid Entry
            </Badge>
            <Badge 
              variant="secondary" 
              className="bg-primary/10 text-primary text-[11px] capitalize"
            >
              {tournament.status}
            </Badge>
            <Badge 
              variant="outline" 
              className="text-[11px] font-mono"
            >
              #{tournament.format.replace(' ', '')}
            </Badge>
          </div>

          <div className="space-y-3">
            {/* Creator Info */}
            <div className="flex items-center gap-3 pb-4 border-b">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <User2 className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">
                  {tournament.creator.name}
                </p>
                <p className="text-xs text-muted-foreground font-mono truncate">
                  {tournament.creator.username}
                </p>
              </div>
            </div>

            {/* Game & Buy-in */}
            <div className="flex items-center justify-between pb-3 border-b">
              <div className="flex items-center gap-1.5">
                <Gamepad2 className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm capitalize">
                  {tournament.game}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Ticket className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-green-600">
                  Buy-in: KSH {tournament.buyIn}
                </span>
              </div>
            </div>

            {/* Prize Pool & Seats Progress */}
            <div className="pb-3 border-b">
              <div className="flex items-center gap-2 mb-2">
                <Gift className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  Prize Pool: <span className="text-amber-500">KSH {prizePool}</span>
                </span>
              </div>
              <div className="space-y-1.5">
                <Progress value={seatsPercentage} className="h-2" />
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>{seatsPercentage}% Seats Filled</span>
                  <span>{tournament.participants} of {tournament.numberOfParticipants} Players</span>
                </div>
              </div>
            </div>

            {/* Current Players */}
            <div className="pb-3 border-b">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  Current Players:
                </span>
                <div className="flex -space-x-3">
                  {tournament.players.slice(0, 4).map((player) => (
                    <div
                      key={player.id}
                      className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center"
                      title={player.name}
                    >
                      <User2 className="w-4 h-4 text-muted-foreground" />
                    </div>
                  ))}
                  {tournament.players.length > 4 && (
                    <div className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center">
                      <span className="text-xs">
                        +{tournament.players.length - 4}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
              
            {/* Participants Count and Share Button */}
            <div className="flex items-center justify-between h-[40px]">
              <div className="flex items-center gap-1.5">
                <Users2 className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {tournament.participants}/{tournament.numberOfParticipants}
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-primary"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>

        {/* Divider */}
        <div className="h-px bg-border" />

        {/* New Tab Navigation */}
        <div className="w-full">
          <div className="border-b border-border">
            <div className="flex justify-between items-center">
              <div className="flex overflow-x-auto scrollbar-hide">
                {Object.entries(tabConfig).map(([tab, { icon, label, brandColor, bgColor }]) => (
                  <button
                    key={tab}
                    onClick={() => setSelectedTab(tab)}
                    className={cn(
                      "flex items-center px-6 py-3 flex-shrink-0",
                      "transition-all duration-200",
                      selectedTab === tab ? bgColor : "hover:bg-muted/50"
                    )}
                  >
                    <div className="mr-2">{icon(selectedTab === tab)}</div>
                    <span className={cn(
                      "text-sm font-medium whitespace-nowrap",
                      selectedTab === tab ? brandColor : "text-muted-foreground"
                    )}>
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tab Content. */}
          <div className="p-0">
            {renderContent()}
          </div>
        </div>

        <style jsx global>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </Card>
    </div>
  );
};

export default TournamentPage;