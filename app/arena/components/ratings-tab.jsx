import React, { useState } from 'react';
import { 
  Trophy, 
  Medal, 
  Star, 
  Users, 
  BarChart, 
  Crown, 
  Clock,
  FlameIcon
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

const TierBadge = ({ tier }) => {
  const colors = {
    BRONZE: "bg-amber-700/20 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
    SILVER: "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    GOLD: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
    PLATINUM: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400",
    DIAMOND: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  };

  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${colors[tier]}`}>
      {tier}
    </span>
  );
};

const StatBox = ({ label, value }) => (
  <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
    <div className="text-xs text-muted-foreground">{label}</div>
    <div className="font-medium">{value}</div>
  </div>
);

// Loading state component
const LeaderboardSkeleton = () => (
  <div className="space-y-4 p-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[150px]" />
        </div>
        <Skeleton className="h-4 w-[100px] ml-auto" />
      </div>
    ))}
  </div>
);

// Empty state component
const EmptyLeaderboard = ({ type }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
    <h3 className="font-medium mb-2">No Rankings Yet</h3>
    <p className="text-sm text-muted-foreground">
      {type === "competitive"
        ? "Start playing ranked games to appear on the leaderboard"
        : "Master special moves and sequences to rank up"}
    </p>
  </div>
);

// Skill stats rendering
const RenderSkillStats = ({ player, category }) => {
  if (category === "sequences") {
    return (
      <>
        <StatBox label="Total Sequences" value={player?.totalSequences} />
        <StatBox label="Longest Chain" value={player?.longestSequence} />
        <StatBox label="Win Rate" value={`${player?.winRate}%`} />
        <StatBox label="Perfect Games" value={player?.perfectGames} />
      </>
    );
  }

  if (category === "special") {
    return (
      <>
        <StatBox label="Ace Controls" value={player?.aceControls} />
        <StatBox label="Jump Chains" value={player?.jumpChains} />
        <StatBox label="Successful Kickbacks" value={player?.successfulKickbacks} />
        <StatBox label="Penalty Avoidances" value={player?.penaltyAvoidances} />
        <StatBox label="Moves/Game" value={player.specialMovesPerGame?.toFixed(1) || 0} />
      </>
    );
  }

  // Efficiency stats
  return (
    <>
      <StatBox label="Move Time" value={`${player?.averageMoveTime}s`} />
      <StatBox label="Card Efficiency" value={`${(player?.cardEfficiency * 100).toFixed(1)}%`} />
      <StatBox label="Perfect Games" value={player?.perfectGames} />
      <StatBox label="Efficiency Score" value={player?.efficiencyScore.toFixed(1)} />
    </>
  );
};

// Table row rendering
const RenderTableRow = ({ player, index, type, category }) => {
  if (type === "competitive") {
    return (
      <>
        <td className="p-3">{index + 1}</td>
        <td className="p-3">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={player.profilePicture} />
              <AvatarFallback>{player.username[0]}</AvatarFallback>
            </Avatar>
            <span className="font-medium">{player.username}</span>
          </div>
        </td>
        <td className="p-3">{player?.rating}</td>
        <td className="p-3">
          <TierBadge tier={player?.rankingTier} />
        </td>
        <td className="p-3">{player?.totalGames}</td>
        <td className="p-3">{player?.winRate?.toFixed(1) || 0}%</td>
        <td className="p-3">{player?.seasonScore}</td>
      </>
    );
  }

  // Skills table row
  if (type === "skills") {
    return (
      <>
        <td className="p-3">{index + 1}</td>
        <td className="p-3">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={player.profilePicture} />
              <AvatarFallback>{player.username[0]}</AvatarFallback>
            </Avatar>
            <span className="font-medium">{player.username}</span>
          </div>
        </td>
        {category === "sequences" && (
          <>
            <td className="p-3">{player?.totalSequences}</td>
            <td className="p-3">{player?.longestSequence}</td>
            <td className="p-3">{player?.winRate}%</td>
            <td className="p-3">{player?.perfectGames}</td>
          </>
        )}
        {category === "special" && (
          <>
            <td className="p-3">{player?.aceControls}</td>
            <td className="p-3">{player?.jumpChains}</td>
            <td className="p-3">{player?.successfulKickbacks}</td>
            <td className="p-3">{player?.penaltyAvoidances}</td>
            <td className="p-3">{player?.specialMovesPerGame?.toFixed(1) || 0}</td>
          </>
        )}
        {category === "efficiency" && (
          <>
            <td className="p-3">{player?.averageMoveTime}s</td>
            <td className="p-3">{(player?.cardEfficiency * 100).toFixed(1)}%</td>
            <td className="p-3">{player?.perfectGames}</td>
            <td className="p-3">{player?.efficiencyScore.toFixed(1)}</td>
          </>
        )}
      </>
    );
  }
};

const LeaderboardTable = ({ data, type, category, columns, isMobile = false }) => {
  if (isMobile) {
    return (
      <ScrollArea className="h-[400px] w-full rounded-md border">
        <div className="p-3 space-y-3">
          {data?.map((player, index) => (
            <Card key={index} className="p-3 dark:bg-gray-800">
              <div className="flex items-center gap-3 mb-2">
                <div className="min-w-[24px] text-center font-medium">
                  #{index + 1}
                </div>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={player.profilePicture} />
                  <AvatarFallback>{player.username[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {player.username}
                  </div>
                  {type === "competitive" ? (
                    <TierBadge tier={player.rankingTier} />
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      Rating: {player.rating}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2">
                {type === "competitive" ? (
                  <>
                    <StatBox label="Rating" value={player.rating} />
                    <StatBox label="Win Rate" value={`${player.winRate?.toFixed(1) || 0}%`} />
                  </>
                ) : (
                  <>
                    {/* Skills stats */}
                    <RenderSkillStats player={player} category={category} />
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea className="h-[400px] w-full rounded-md border">
      <div className="p-4">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="text-left border-b dark:border-gray-700">
              {columns.map((column, index) => (
                <th key={index} className="pb-2 px-3 font-medium">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data?.map((player, index) => (
              <tr
                key={index}
                className="border-b last:border-b-0 dark:border-gray-700
                         hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <RenderTableRow
                  player={player}
                  index={index}
                  type={type}
                  category={category}
                />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ScrollArea>
  );
};

// Dummy data for leaderboards
const dummyLeaderboardData = {
  competitive: {
    global: [
      {
        username: "johnsmith",
        name: "John Smith",
        profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
        rating: 1850,
        rankingTier: "DIAMOND",
        totalGames: 156,
        winRate: 78.5,
        seasonScore: 12500
      },
      {
        username: "janedoe",
        name: "Jane Doe",
        profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=jane",
        rating: 1790,
        rankingTier: "PLATINUM",
        totalGames: 132,
        winRate: 72.3,
        seasonScore: 11200
      },
      {
        username: "mikeb",
        name: "Michael Brown",
        profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=michael",
        rating: 1685,
        rankingTier: "PLATINUM",
        totalGames: 98,
        winRate: 68.7,
        seasonScore: 9800
      },
      {
        username: "sarahw",
        name: "Sarah Wilson",
        profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
        rating: 1620,
        rankingTier: "GOLD",
        totalGames: 110,
        winRate: 65.4,
        seasonScore: 8500
      },
      {
        username: "davidj",
        name: "David Johnson",
        profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=david",
        rating: 1540,
        rankingTier: "GOLD",
        totalGames: 85,
        winRate: 60.1,
        seasonScore: 7200
      }
    ],
    seasonal: [
      {
        username: "janedoe",
        name: "Jane Doe",
        profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=jane",
        rating: 1790,
        peakRating: 1820,
        totalGames: 48,
        ratingGain: 120,
        seasonScore: 11200
      },
      {
        username: "johnsmith",
        name: "John Smith",
        profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
        rating: 1850,
        peakRating: 1850,
        totalGames: 52,
        ratingGain: 85,
        seasonScore: 12500
      },
      {
        username: "mikeb",
        name: "Michael Brown",
        profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=michael",
        rating: 1685,
        peakRating: 1710,
        totalGames: 39,
        ratingGain: 75,
        seasonScore: 9800
      },
      {
        username: "sarahw",
        name: "Sarah Wilson",
        profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
        rating: 1620,
        peakRating: 1650,
        totalGames: 41,
        ratingGain: 60,
        seasonScore: 8500
      },
      {
        username: "lisaj",
        name: "Lisa Johnson",
        profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=lisa",
        rating: 1510,
        peakRating: 1580,
        totalGames: 35,
        ratingGain: 55,
        seasonScore: 6800
      }
    ],
    tournament: [
      {
        username: "johnsmith",
        name: "John Smith",
        profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
        rating: 1850,
        tournaments: 12,
        victories: 5,
        winRate: 41.7,
        earnings: 25000
      },
      {
        username: "mikeb",
        name: "Michael Brown",
        profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=michael",
        rating: 1685,
        tournaments: 9,
        victories: 3,
        winRate: 33.3,
        earnings: 18000
      },
      {
        username: "janedoe",
        name: "Jane Doe",
        profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=jane",
        rating: 1790,
        tournaments: 10,
        victories: 2,
        winRate: 20.0,
        earnings: 12000
      },
      {
        username: "robertt",
        name: "Robert Taylor",
        profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=robert",
        rating: 1580,
        tournaments: 7,
        victories: 1,
        winRate: 14.3,
        earnings: 8000
      },
      {
        username: "amandaw",
        name: "Amanda Wilson",
        profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=amanda",
        rating: 1610,
        tournaments: 8,
        victories: 1,
        winRate: 12.5,
        earnings: 7500
      }
    ]
  },
  skills: {
    sequences: [
      {
        username: "janedoe",
        name: "Jane Doe",
        profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=jane",
        rating: 1790,
        totalSequences: 438,
        longestSequence: 12,
        winRate: 85,
        perfectGames: 14
      },
      {
        username: "davidj",
        name: "David Johnson",
        profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=david",
        rating: 1540,
        totalSequences: 384,
        longestSequence: 10,
        winRate: 78,
        perfectGames: 11
      },
      {
        username: "mikeb",
        name: "Michael Brown",
        profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=michael",
        rating: 1685,
        totalSequences: 356,
        longestSequence: 9,
        winRate: 72,
        perfectGames: 9
      },
      {
        username: "sarahw",
        name: "Sarah Wilson",
        profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
        rating: 1620,
        totalSequences: 325,
        longestSequence: 8,
        winRate: 68,
        perfectGames: 8
      },
      {
        username: "jamesw",
        name: "James Wilson",
        profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=james",
        rating: 1490,
        totalSequences: 287,
        longestSequence: 7,
        winRate: 64,
        perfectGames: 6
      }
    ],
    specialCards: [
      {
        username: "johnsmith",
        name: "John Smith",
        profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
        rating: 1850,
        aceControls: 142,
        jumpChains: 89,
        successfulKickbacks: 118,
        penaltyAvoidances: 95,
        specialMovesPerGame: 3.8
      },
      {
        username: "lisaj",
        name: "Lisa Johnson",
        profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=lisa",
        rating: 1510,
        aceControls: 124,
        jumpChains: 81,
        successfulKickbacks: 102,
        penaltyAvoidances: 88,
        specialMovesPerGame: 3.4
      },
      {
        username: "mikeb",
        name: "Michael Brown",
        profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=michael",
        rating: 1685,
        aceControls: 120,
        jumpChains: 75,
        successfulKickbacks: 95,
        penaltyAvoidances: 82,
        specialMovesPerGame: 3.2
      },
      {
        username: "janedoe",
        name: "Jane Doe",
        profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=jane",
        rating: 1790,
        aceControls: 112,
        jumpChains: 68,
        successfulKickbacks: 92,
        penaltyAvoidances: 78,
        specialMovesPerGame: 3.0
      },
      {
        username: "amandaw",
        name: "Amanda Wilson",
        profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=amanda",
        rating: 1610,
        aceControls: 98,
        jumpChains: 62,
        successfulKickbacks: 85,
        penaltyAvoidances: 72,
        specialMovesPerGame: 2.7
      }
    ],
    efficiency: [
      {
        username: "mikeb",
        name: "Michael Brown",
        profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=michael",
        rating: 1685,
        averageMoveTime: 2.3,
        cardEfficiency: 0.92,
        perfectGames: 22,
        efficiencyScore: 9.4
      },
      {
        username: "johnsmith",
        name: "John Smith",
        profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
        rating: 1850,
        averageMoveTime: 2.5,
        cardEfficiency: 0.90,
        perfectGames: 25,
        efficiencyScore: 9.2
      },
      {
        username: "sarahw",
        name: "Sarah Wilson",
        profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
        rating: 1620,
        averageMoveTime: 2.7,
        cardEfficiency: 0.88,
        perfectGames: 18,
        efficiencyScore: 8.9
      },
      {
        username: "janedoe",
        name: "Jane Doe",
        profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=jane",
        rating: 1790,
        averageMoveTime: 2.9,
        cardEfficiency: 0.87,
        perfectGames: 20,
        efficiencyScore: 8.7
      },
      {
        username: "robertt",
        name: "Robert Taylor",
        profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=robert",
        rating: 1580,
        averageMoveTime: 3.1,
        cardEfficiency: 0.85,
        perfectGames: 15,
        efficiencyScore: 8.4
      }
    ]
  }
};

const RatingsTab = () => {
  const [activeCategory, setActiveCategory] = useState("competitive");
  const [activeType, setActiveType] = useState("global");
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Simulating data fetching with dummy data
  const leaderboardsData = dummyLeaderboardData;

  // Handle category change
  const handleCategoryChange = (newCategory) => {
    setActiveCategory(newCategory);
    setActiveType(newCategory === "competitive" ? "global" : "sequences"); // Reset type when category changes
  };

  // Handle type change
  const handleTypeChange = (newType) => {
    setActiveType(newType);
  };

  return (
    <div className="w-full max-w-4xl mx-auto sm:px-4">
      <Tabs defaultValue="competitive" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto overflow-y-hidden">
          <TabsTrigger
            value="competitive"
            className="text-sm sm:text-base"
            onClick={() => handleCategoryChange("competitive")}
          >
            Competitive
          </TabsTrigger>
          <TabsTrigger
            value="skills"
            className="text-sm sm:text-base"
            onClick={() => handleCategoryChange("skills")}
          >
            Skill Mastery
          </TabsTrigger>
        </TabsList>

        {isLoading ? (
          <LeaderboardSkeleton />
        ) : (
          <TabsContent value="competitive">
            <Tabs defaultValue="global">
              <TabsList>
                <TabsTrigger 
                  value="global"
                  onClick={() => handleTypeChange("global")}
                >
                  Global
                </TabsTrigger>
                <TabsTrigger 
                  value="seasonal"
                  onClick={() => handleTypeChange("seasonal")}
                >
                  Seasonal
                </TabsTrigger>
                <TabsTrigger 
                  value="tournament"
                  onClick={() => handleTypeChange("tournament")}
                >
                  Tournament
                </TabsTrigger>
              </TabsList>

              <TabsContent value="global">
                <LeaderboardTable
                  data={leaderboardsData?.competitive?.global}
                  type="competitive"
                  isMobile={isMobile}
                  columns={[
                    "Rank",
                    "Player",
                    "Rating",
                    "Division",
                    "Games",
                    "Win Rate",
                    "Top Score",
                  ]}
                />
              </TabsContent>

              <TabsContent value="seasonal">
                <LeaderboardTable
                  data={leaderboardsData?.competitive?.seasonal}
                  type="competitive"
                  isMobile={isMobile}
                  columns={[
                    "Rank",
                    "Player",
                    "Current Rating",
                    "Peak Rating",
                    "Games",
                    "Rating Gain",
                    "Score",
                  ]}
                />
              </TabsContent>

              <TabsContent value="tournament">
                <LeaderboardTable
                  data={leaderboardsData?.competitive?.tournament}
                  type="competitive"
                  isMobile={isMobile}
                  columns={[
                    "Rank",
                    "Player",
                    "Rating",
                    "Tournaments",
                    "Victories",
                    "Win Rate",
                    "Earnings",
                  ]}
                />
              </TabsContent>
            </Tabs>
          </TabsContent>
        )}

        {isLoading ? (
          <LeaderboardSkeleton />
        ) : (
          <TabsContent value="skills">
            <Tabs defaultValue="sequences">
              <TabsList className="w-full flex flex-nowrap overflow-x-auto gap-1 sm:gap-2">
                <TabsTrigger
                  value="sequences"
                  className="flex-shrink-0 text-xs sm:text-sm whitespace-nowrap px-2 sm:px-4"
                  onClick={() => handleTypeChange("sequences")}
                >
                  Question Sequences
                </TabsTrigger>
                <TabsTrigger
                  value="special"
                  className="flex-shrink-0 text-xs sm:text-sm whitespace-nowrap px-2 sm:px-4"
                  onClick={() => handleTypeChange("special")}
                >
                  Special Cards
                </TabsTrigger>
                <TabsTrigger
                  value="efficiency"
                  className="flex-shrink-0 text-xs sm:text-sm whitespace-nowrap px-2 sm:px-4"
                  onClick={() => handleTypeChange("efficiency")}
                >
                  Efficiency
                </TabsTrigger>
              </TabsList>

              <TabsContent value="sequences">
                <LeaderboardTable
                  data={leaderboardsData?.skills?.sequences}
                  type="skills"
                  category="sequences"
                  isMobile={isMobile}
                  columns={[
                    "Rank",
                    "Player",
                    "Total Sequences",
                    "Longest Chain",
                    "Sequence Win Rate",
                    "Perfect Games",
                  ]}
                />
              </TabsContent>

              <TabsContent value="special">
                <LeaderboardTable
                  data={leaderboardsData?.skills?.specialCards}
                  type="skills"
                  category="special"
                  isMobile={isMobile}
                  columns={[
                    "Rank",
                    "Player",
                    "Ace Controls",
                    "Jump Chains",
                    "Successful Kickbacks",
                    "Penalty Avoids",
                    "Moves/Game",
                  ]}
                />
              </TabsContent>

              <TabsContent value="efficiency">
                <LeaderboardTable
                  data={leaderboardsData?.skills?.efficiency}
                  type="skills"
                  category="efficiency"
                  isMobile={isMobile}
                  columns={[
                    "Rank",
                    "Player",
                    "Avg Move Time",
                    "Card Efficiency",
                    "Perfect Games",
                    "Efficiency Score",
                  ]}
                />
              </TabsContent>
            </Tabs>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default RatingsTab;