"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Gamepad,
  ArrowRight,
  Loader2,
} from "lucide-react";
import GameCard from "./GameCard";
import { useShowcaseCardsRoomsHandler } from "@/lib/cards";
import { useGame } from "@/hooks/useGame";

const GameCardSkeleton = () => (
  <div className="w-full h-[420px] rounded-xl border border-gray-800 bg-gray-900/50 p-4 animate-pulse">
    <div className="flex gap-4 mb-4">
      <div className="w-12 h-12 bg-gray-800 rounded-lg"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-800 rounded w-3/4"></div>
        <div className="h-4 bg-gray-800 rounded w-1/2"></div>
      </div>
    </div>
    <div className="space-y-3 mt-4">
      <div className="h-24 bg-gray-800 rounded"></div>
      <div className="h-4 bg-gray-800 rounded w-2/3"></div>
      <div className="h-4 bg-gray-800 rounded w-1/2"></div>
    </div>
  </div>
);

const CardGamesShowcase = () => {
  const { loading, handleQuickMatch } = useGame();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const {
    data: roomsData,
    error: roomsError,
    mutate: roomsMutate,
    isLoading: roomsLoading,
    isOffline: roomsOffline,
  } = useShowcaseCardsRoomsHandler();

  const joinGame = () => {
    return;
  };

  useEffect(() => {
    if (!roomsData || isHovering || roomsLoading) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) =>
        prev + 1 >= (roomsData?.length || 0) ? 0 : prev + 1
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [roomsData, isHovering, roomsLoading]);

  if (roomsError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-gray-400 mb-4">Unable to load active games</p>
        <button
          onClick={() => roomsMutate()}
          className="text-indigo-400 hover:text-indigo-300 flex items-center gap-2"
        >
          Try Again <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const visibleRooms = roomsData?.slice(activeIndex, activeIndex + 3);

  return (
    <section className="py-12">
      <div
        className="flex flex-col sm:flex-row justify-between items-start 
      sm:items-center gap-3 sm:gap-6 mb-4 sm:mb-6 px-4 sm:px-00"
      >
        <div className="w-full sm:w-auto">
          <div className="flex items-center gap-2 mb-1 sm:mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              Live Kadi Rooms
            </h3>
          </div>
          <p className="text-sm sm:text-base text-[#9f9f9f] max-w-[42ch]">
            Join a 2 to 4-player room or start your own match
          </p>
        </div>

        <button
          onClick={handleQuickMatch}
          disabled={loading}
          className={`group w-full sm:w-auto flex items-center justify-center sm:justify-start gap-2
          px-4 py-2.5 sm:py-2 bg-indigo-500/20 hover:bg-indigo-500/30 rounded-lg
          border border-indigo-500/30 hover:border-indigo-500/50
          transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Gamepad className="w-4 h-4 text-indigo-400" />
              <span className="text-sm sm:text-base text-indigo-400 group-hover:text-indigo-300 whitespace-nowrap">
                Quick Match
              </span>
              <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:text-indigo-300 group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </button>
      </div>

      <h2 className="text-3xl font-bold text-white mb-8 text-center">
        Featured Matches
      </h2>

      <div
        className="relative max-w-[1400px] mx-auto px-4"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {roomsLoading ? (
          <div className="flex gap-4">
            {[...Array(3)].map((_, i) => (
              <GameCardSkeleton key={i} />
            ))}
          </div>
        ) : roomsData?.length ? (
          <>
            {roomsData?.length > 3 && (
              <>
                <button
                  onClick={() =>
                    setActiveIndex((prev) =>
                      prev === 0 ? roomsData.length - 1 : prev - 1
                    )
                  }
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <button
                  onClick={() =>
                    setActiveIndex((prev) =>
                      prev + 1 >= roomsData.length ? 0 : prev + 1
                    )
                  }
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
              </>
            )}

            <div className="overflow-hidden px-8">
              <div className="flex gap-4">
                <AnimatePresence mode="popLayout">
                  {visibleRooms?.map((room, index) => (
                    <motion.div
                      key={room._id}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.3 }}
                      className="w-full"
                    >
                      <GameCard
                        room={room}
                        joinGame={joinGame}
                        loading={loading}
                        index={index}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {roomsData?.length > 3 && (
              <div className="flex justify-center gap-2 mt-4">
                {roomsData.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      idx === activeIndex ? "bg-white" : "bg-white/30"
                    }`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400">No active games right now</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default CardGamesShowcase;
