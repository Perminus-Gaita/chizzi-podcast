"use client";
import Link from "next/link";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Users,
  Activity,
  Gift,
  Filter,
  Plus,
  Search,
  AlertTriangle,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import CreateTournamentModal from "@/page_components/Tournament/CreateTournamentModal";
import TournamentCard from "../Tournament/TournamentCard";

const PublicTournaments = ({ username, tournaments, tournamentsMutate }) => {
  const dispatch = useDispatch();
  const userProfile = useSelector((state) => state.auth.profile);
  const [isCreateForm, setIsCreateForm] = useState(false);

  const handleOpenCreateForm = () => {
    setIsCreateForm(true);
  };

  const handleCloseCreateForm = () => {
    setIsCreateForm(false);
  };

  return (
    <>
      <CreateTournamentModal
        isCreateForm={isCreateForm}
        handleCloseCreateForm={handleCloseCreateForm}
      />

      <div
        className="flex w-full justify-center"
        style={{ minHeight: "100vh" }}
      >
        {tournaments.length > 0 && (
          <div className="w-full flex flex-col gap-2">
            <header className="space-y-2 mb-8">
              <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center">
                <div className="space-y-1">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                    {username === userProfile?.username
                      ? "Your Tournaments"
                      : `${username}'s Tournaments`}
                  </h1>
                </div>
                <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      disabled
                      className="shrink-0"
                    >
                      <Filter className="h-4 w-4" />
                      <span className="sr-only">Filter tournaments</span>
                    </Button>
                    <div className="relative w-full sm:w-[250px]">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search tournaments..."
                        className="pl-8"
                      />
                    </div>
                  </div>
                  {tournaments?.length > 0 &&
                    username === userProfile?.username && (
                      <Button
                        onClick={handleOpenCreateForm}
                        className="w-full sm:w-auto"
                      >
                        <Plus className="mr-2 h-4 w-4" /> New Tournament
                      </Button>
                    )}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Trophy className="mr-1 h-4 w-4" />
                  <span>{tournaments.length} Tournaments</span>
                </div>
                <div>Updated {new Date().toLocaleDateString()}</div>
              </div>
            </header>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
              {tournaments?.map((tournament, index) => (
                <TournamentCard key={index} tournament={tournament} />
              ))}
            </div>
          </div>
        )}

        {tournaments.length === 0 && username === userProfile?.username && (
          <div style={{ minHeight: "70vh" }}>
            <Card className="w-11/12 md:w-8/12 max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-3xl font-extrabold text-center text-gray-800 dark:text-gray-300">
                  Let the Games Begin!
                </CardTitle>
                <CardDescription className="text-lg text-center text-gray-600 dark:text-gray-100 mt-2">
                  Transform your social media challenges into thrilling
                  tournaments. Engage your audience like never before with
                  custom brackets, exciting card games, and tantalizing prizes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {[
                    { icon: Users, text: "Manage participants with ease" },
                    { icon: Activity, text: "Track progress in real-time" },
                    {
                      icon: Gift,
                      text: "Distribute prizes fairly and transparently",
                    },
                  ].map((item, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <item.icon className="w-6 h-6 text-green-500" />
                      <span className="text-gray-700 dark:text-gray-200">
                        {item.text}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-200 mt-6 text-center">
                  Ready to revolutionize your giveaways and boost engagement?
                </p>
              </CardContent>
              <CardFooter className="flex flex-col items-center">
                <Button
                  onClick={() => handleOpenCreateForm(true)}
                  className="w-full max-w-md"
                  size="lg"
                >
                  <Trophy className="mr-2 h-5 w-5" />
                  Create Your First Tournament
                </Button>
                <p className="text-sm text-gray-500 italic mt-4 text-center">
                  Unlock the power of gamified social media contests and watch
                  your community thrive!
                </p>
              </CardFooter>
            </Card>
          </div>
        )}

        {tournaments.length === 0 && username !== userProfile?.username && (
          <div className="w-full flex flex-col items-center justify-center p-8">
            <AlertTriangle className="text-yellow-500 dark:text-yellow-400 mb-4 h-12 w-12" />

            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
              No Tournaments Found
            </h2>

            <p className="text-gray-600 dark:text-gray-400 mb-6 text-center max-w-xs">
              {username} hasn&apos;t created any tournaments yet. Check back
              later or explore existing tournaments.
            </p>

            <Link href="/arena">
              <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                Browse Other Tournaments
              </button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default PublicTournaments;
