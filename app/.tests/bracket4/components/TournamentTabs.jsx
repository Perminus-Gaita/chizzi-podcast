import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { User2, Trophy, Medal } from 'lucide-react';

const TournamentTabs = ({ tournament }) => {
  // Generate 20 dummy participants with randomized scores.
  const dummyParticipants = Array.from({ length: 20 }, (_, index) => ({
    id: index + 1,
    name: `Player ${index + 1}`,
    score: Math.floor(Math.random() * 1000) + 500,
    matches: Math.floor(Math.random() * 10) + 5,
    wins: Math.floor(Math.random() * 8) + 1
  })).sort((a, b) => b.score - a.score);

  const getRankBadge = (index) => {
    switch (index) {
      case 0:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 1:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 2:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <Badge variant="outline">{index + 1}</Badge>;
    }
  };

  return (
    <div className="w-full overflow-x-auto">
      <Tabs defaultValue="participants" className="w-full min-w-[280px]">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="participants">Rankings</TabsTrigger>
          <TabsTrigger value="matches">Matches</TabsTrigger>
          <TabsTrigger value="sponsors">Sponsors</TabsTrigger>
        </TabsList>
        
        <TabsContent value="participants" className="mt-4">
          <div className="space-y-2">
            {dummyParticipants.map((participant, index) => (
              <Card key={participant.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getRankBadge(index)}
                    <div className="flex items-center space-x-2">
                      <User2 className="h-5 w-5 text-gray-500" />
                      <span className="font-medium">{participant.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-500">
                      Matches: {participant.matches} | Wins: {participant.wins}
                    </div>
                    <Badge variant="secondary" className="ml-2">
                      {participant.score} pts
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="matches" className="mt-4">
          <div className="text-center text-gray-500">Match schedule coming soon</div>
        </TabsContent>

        <TabsContent value="sponsors" className="mt-4">
          <div className="text-center text-gray-500">Sponsor information coming soon</div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TournamentTabs;