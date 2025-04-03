"use client";
import Link from "next/link";
import { useSelector } from "react-redux";

import { useShowcaseTournamentsHandler } from "@/lib/tournament";

import { Trophy, ArrowRight, RefreshCw } from "lucide-react";

import TournamentCard from "./TournamentCard";

const TournamentSkeleton = () => (
  <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4 h-[380px] animate-pulse">
    <div className="w-3/4 h-6 bg-gray-800 rounded mb-4"></div>
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="w-12 h-12 bg-gray-800 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-800 rounded w-1/2"></div>
          <div className="h-4 bg-gray-800 rounded w-1/4"></div>
        </div>
      </div>
      <div className="h-4 bg-gray-800 rounded w-3/4"></div>
      <div className="h-4 bg-gray-800 rounded w-2/3"></div>
    </div>
  </div>
);

const TournamentShowcase = () => {
  const userProfile = useSelector((state) => state.auth.profile);

  const {
    data: tournamentsData,
    error: tournamentsError,
    mutate: tournamentsMutate,
    isLoading: isLoadingTournaments,
  } = useShowcaseTournamentsHandler();

  if (tournamentsError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-gray-400 mb-4">Unable to load tournaments</p>
        <button
          onClick={() => tournamentsMutate()}
          className="text-indigo-400 hover:text-indigo-300 flex items-center gap-2"
        >
          Try Again. <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <section className="py-12">
      <div
        className="flex flex-col sm:flex-row justify-between items-start
       sm:items-center gap-3 sm:gap-6 mb-4 sm:mb-6 px-4 sm:px-0"
      >
        <div className="w-full sm:w-auto">
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
            Organize Your Tournament
          </h3>
          <p className="text-sm sm:text-base text-[#9f9f9f] max-w-[42ch]">
            Host sponsored or buy-in tournaments. Keep up to 93% of entry fees.
          </p>
        </div>

        <Link
          href={userProfile?.uuid ? `/${userProfile?.username}` : "/login"}
          className="w-full sm:w-auto group"
        >
          <button className="w-full sm:w-auto flex items-center justify-center sm:justify-start gap-2 px-4 py-2.5 sm:py-2 bg-indigo-500/20 hover:bg-indigo-500/30 rounded-lg border border-indigo-500/30 hover:border-indigo-500/50 transition-all duration-200">
            <Trophy className="w-4 h-4 text-indigo-400" />
            <span className="text-sm sm:text-base text-indigo-400 group-hover:text-indigo-300 whitespace-nowrap">
              Organize a Tournament
            </span>
            <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:text-indigo-300 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </Link>
      </div>

      <h2 className="text-3xl font-bold text-white mb-8 text-center">
        Upcoming Tournaments
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {isLoadingTournaments ? (
          Array(3)
            .fill(0)
            .map((_, i) => <TournamentSkeleton key={i} />)
        ) : tournamentsData?.length ? (
          tournamentsData.map((tournament, index) => (
            <TournamentCard key={tournament._id} tournament={tournament} />
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-400">No tournaments scheduled yet.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default TournamentShowcase;
