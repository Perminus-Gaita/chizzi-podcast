"use client"
// /client.jsx
import React from 'react';
import TournamentCard from './components/TournamentCard';
import TournamentTabs from './components/TournamentTabs';

const tournament = {
  name: "Summer Kadi Championship 2024",
  startDate: "2024-11-15",
  participants: 200,
  numberOfParticipants: 256,
  creator: {
    name: "Alex Thompson",
    username: "@alexthompson"
  },
  registrationType: 'free',
  game: 'kadi',
  format: 'single elimination',
  status: 'ready',
  prize: '$500 worth of Mic Cheque Merch',
  sponsors: [
    { id: 1, name: "Maria Garcia", role: "Tournament Organizer", contribution: "$1000" },
    { id: 2, name: "Tech Corp", role: "Technology Partner", contribution: "Equipment" },
    { id: 3, name: "David Lee", role: "Community Leader", contribution: "$500" },
    { id: 4, name: "Gaming Pro", role: "Prize Sponsor", contribution: "Gaming Gear" },
    { id: 5, name: "Sarah Wilson", role: "Marketing Partner", contribution: "Promotion" }
  ]
};

const Example2 = () => {
  return (
    <div className="w-full mx-auto" style={{ maxWidth: '640px', minWidth: '280px' }}>
      <div className="w-full mb-6">
        <TournamentCard tournament={tournament} />
      </div>
      <TournamentTabs tournament={tournament} />
    </div>
  );
};

export default Example2;
//
// import React, { useState } from 'react';
// import { Card, CardContent } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { 
//   Trophy, 
//   Users2, 
//   CalendarDays, 
//   User2,
//   Ticket,
//   Gamepad2,
//   Gift,
//   ArrowLeft,
//   ExternalLink
// } from 'lucide-react';

const Example = () => {
  const [showBracket, setShowBracket] = useState(false);
  
  const tournament = {
    name: "Summer Kadi Championship 2024 With a Very Long Name That Should Truncate",
    startDate: "2024-11-15",
    participants: 200,
    numberOfParticipants: 256,
    creator: {
      name: "Alex Thompson Long Name",
      username: "@alexthompsonwithalongusername"
    },
    registrationType: 'free',
    game: 'kadi',
    format: 'single elimination',
    status: 'ready',
    prize: '$500 worth of Mic Cheque Merch',
    sponsors: [
      { id: 1, name: "Maria Garcia", role: "Tournament Organizer", contribution: "$1000" },
      { id: 2, name: "Tech Corp", role: "Technology Partner", contribution: "Equipment" },
      { id: 3, name: "David Lee", role: "Community Leader", contribution: "$500" },
      { id: 4, name: "Gaming Pro", role: "Prize Sponsor", contribution: "Gaming Gear" },
      { id: 5, name: "Sarah Wilson", role: "Marketing Partner", contribution: "Promotion" }
    ]
  };

  const isTokenEntry = tournament.registrationType === 'paid';
  
  const formatPrize = (prize) => {
    return prize.replace(/(\$[\d,]+)/g, '<span class="text-amber-500">$1</span>');
  };

  return (
    <div className="w-full max-w-[640px] min-w-[280px] mx-auto p-4">
      <Card className="w-full hover:shadow-lg transition-shadow">
        {!showBracket ? (
          <>
            <div className="relative h-[64px] w-full p-3 flex items-start gap-3">
              <div className="flex-shrink-0 w-[48px] h-[48px]">
                <img
                  src="/api/placeholder/48/48"
                  alt="Tournament thumbnail"
                  className="w-full h-full object-cover rounded-md"
                />
              </div>
              <div className="flex-1 min-w-0 flex items-center h-[48px] overflow-hidden">
                <div className="w-full overflow-hidden">
                  <h2 className="font-semibold text-[15px] text-gray-900 line-clamp-2">
                    {tournament.name}
                  </h2>
                </div>
              </div>
              <div className="flex-shrink-0 mt-1">
                <Trophy className="w-5 h-5 text-yellow-500" />
              </div>
            </div>

            <CardContent className="px-4 pb-4">
              <div className="flex items-center gap-2 mb-1 mt-0">
                <Badge 
                  className="bg-green-50 text-green-600 text-[11px] px-2 py-0.5 normal-case font-normal"
                  variant="secondary"
                >
                  {tournament.status}
                </Badge>
                <Badge 
                  className="bg-gray-50 text-gray-500 text-[11px] px-2 py-0.5 normal-case font-normal font-mono"
                  variant="secondary"
                >
                  #{tournament.format.replace(' ', '')}
                </Badge>
              </div>

              <div className="flex items-center gap-3 py-2 border-b">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <User2 className="w-6 h-6 text-gray-600" />
                </div>
                <div className="min-w-0 h-10 flex flex-col justify-center">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {tournament.creator.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate font-mono">
                    {tournament.creator.username}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center gap-1.5">
                  <Gamepad2 className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600 capitalize">{tournament.game}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-gray-500" />
                  {isTokenEntry ? (
                    <span className="text-sm text-purple-600">
                      Paid Entry
                    </span>
                  ) : (
                    <span className="text-sm text-green-600">
                      Free Entry
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between py-3 border-b">
                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                  <CalendarDays className="w-4 h-4" />
                  {new Date(tournament.startDate).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1.5">
                  <Users2 className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {tournament.participants}/{tournament.numberOfParticipants}
                  </span>
                </div>
              </div>

              <div className="py-2 border-b">
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-900">
                    Prize: <span dangerouslySetInnerHTML={{ __html: formatPrize(tournament.prize) }} />
                  </span>
                </div>
              </div>

              <div className="py-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Sponsored by:</span>
                  <div className="flex -space-x-3">
                    {tournament.sponsors.slice(0, 4).map((sponsor, index) => (
                      <div
                        key={sponsor.id}
                        className="w-8 h-8 rounded-full border-2 border-white"
                        style={{
                          backgroundColor: `hsl(${index * 60}, 70%, 85%)`,
                          zIndex: tournament.sponsors.length - index
                        }}
                      >
                        <div className="w-full h-full rounded-full flex items-center justify-center bg-gray-100">
                          <User2 className="w-4 h-4 text-gray-600" />
                        </div>
                      </div>
                    ))}
                    {tournament.sponsors.length > 4 && (
                      <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center">
                        <span className="text-xs text-gray-600">
                          +{tournament.sponsors.length - 4}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Button 
                className="w-full h-8 text-xs"
                onClick={() => setShowBracket(true)}
              >
                View Tournament Bracket
              </Button>
            </CardContent>
          </>
        ) : (
          <div className="h-[380px]">
            <div className="border-b">
              <div className="pt-3 flex items-start justify-between gap-3">
                <div className="flex gap-3 min-w-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0 -ml-2"
                    onClick={() => setShowBracket(false)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-md bg-gray-100 flex-shrink-0">
                        <img
                          src="/api/placeholder/20/20"
                          alt="Tournament thumbnail"
                          className="w-full h-full object-cover rounded-md"
                        />
                      </div>
                      <h3 className="font-semibold text-[15px] text-gray-900 truncate">
                        {tournament.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 mt-1 mb-3 min-w-0">
                      <div className="w-5 h-5 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center">
                        <User2 className="w-3 h-3 text-gray-600" />
                      </div>
                      <div className="min-w-0 flex items-center gap-1">
                        <span className="text-sm text-gray-600 whitespace-nowrap">
                          {tournament.creator.name}
                        </span>
                        <span className="text-xs text-gray-500 font-mono truncate">
                          {tournament.creator.username}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="px-2.5 h-12 flex-col items-center justify-center mr-4 flex-shrink-0 -mt-0.5"
                >
                  <ExternalLink className="h-3.5 w-3.5 mb-0.5" />
                  <span className="text-[10px] leading-none">Full</span>
                  <span className="text-[10px] leading-none">View</span>
                </Button>
              </div>
            </div>
            <div className="h-[332px] bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-3 flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm">Tournament Bracket Preview</p>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

//export default Example;