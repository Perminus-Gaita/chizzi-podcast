"use client";
import { Suspense } from "react";
import { useSelector } from "react-redux";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PublicTournaments from "@/page_components/UserProfile/PublicTournaments";
import TournamentProducts from "@/page_components/Tournament/TournamentProducts";
import { GameHistory, GameHistorySkeleton } from "./GameHistory";
import FriendsList from "./FriendsList";
import StrategyLab from "./StrategyLab";

const TournamentsSkeleton = () => (
  <div className="p-4 animate-pulse">
    {[1, 2, 3].map((i) => (
      <div key={i} className="mb-4 border rounded-lg overflow-hidden">
        <div className="p-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4" />
          <div className="flex justify-between">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const ProductsSkeleton = () => (
  <div className="space-y-6">
    <Card className="border rounded-lg overflow-hidden min-h-[400px] animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center p-4 border-b">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div className="space-y-2">
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        </div>
      ))}
    </Card>
  </div>
);

const FriendsListSkeleton = () => (
  <div className="p-4 space-y-4">
    {/* Stats Grid */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      ))}
    </div>

    {/* Friend Cards */}
    {[1, 2, 3].map((i) => (
      <div key={i} className="p-4 border rounded-lg space-y-4 animate-pulse">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const ProfileTabs = ({ username, tournaments, products }) => {
  const userProfile = useSelector((state) => state.auth.profile);

  // const tabs = [
  //   { value: "tournaments", label: "Tournaments" },
  //   { value: "products", label: "Products" },
  //   { value: "friends", label: "Friends" },
  //   ...(userProfile?.username === username
  //     ? [{ value: "history", label: "History" }]
  //     : []),
  //   // ...(userProfile?.username === username
  //   //   ? [{ value: "lab", label: "Lab" }]
  //   //   : []),
  // ].sort((a, b) => a.label.localeCompare(b.label));

  const tabs = [
    ...(tournaments?.length > 0
      ? [{ value: "tournaments", label: "Tournaments" }]
      : []),
    ...(products?.length > 0 ? [{ value: "products", label: "Products" }] : []),
    { value: "friends", label: "Friends" },
    ...(userProfile?.username === username
      ? [{ value: "history", label: "History" }]
      : []),
    // ...(userProfile?.username === username
    //   ? [{ value: "lab", label: "Lab" }]
    //   : []),
  ].sort((a, b) => a.label.localeCompare(b.label));

  return (
    <>
      <Tabs defaultValue="friends" className="mt-4">
        <TabsList
          className="w-full min-w-0 overflow-x-auto flex-nowrap
         justify-start border-b rounded-none bg-transparent h-auto p-0 scrollbar-hide"
        >
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex-none whitespace-nowrap min-w-[80px]
              rounded-none border-b-2 border-transparent
               data-[state=active]:border-blue-500 data-[state=active]:bg-transparent 
               px-2 md:px-4 py-2"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {userProfile && (
          <TabsContent value="history" className="border-none p-0 mt-0">
            <Suspense fallback={<GameHistorySkeleton />}>
              <GameHistory username={username} />
            </Suspense>
          </TabsContent>
        )}

        {tournaments?.length > 0 && (
          <TabsContent value="tournaments" className="border-none p-0 mt-0">
            <Suspense fallback={<TournamentsSkeleton />}>
              <PublicTournaments
                username={username}
                tournaments={tournaments}
              />
            </Suspense>
          </TabsContent>
        )}

        {products?.length > 0 && (
          <TabsContent value="products" className="border-none m-0">
            <Suspense fallback={<ProductsSkeleton />}>
              <TournamentProducts products={products} />
            </Suspense>
          </TabsContent>
        )}

        <TabsContent value="friends" className="border-none m-0">
          <Suspense fallback={<FriendsListSkeleton />}>
            <FriendsList username={username} />
          </Suspense>
        </TabsContent>

        <TabsContent value="lab" className="border-none m-0">
          <Suspense fallback={<FriendsListSkeleton />}>
            <StrategyLab username={username} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </>
  );
};

export default ProfileTabs;
