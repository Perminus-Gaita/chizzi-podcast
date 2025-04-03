"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from "next/image";
import Link from "next/link";

import Features from "@/components/LandingPage/Features";
import UserValue from "@/components/LandingPage/UserValue";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { BottomCTA, CTA, HeroSection } from "@/components/LandingPage/CTA";
import OnboardingStatus from "@/components/LandingPage/OnboardingStatus";
import LandingPageHeader from "@/components/Navigation/LandingPageHeader";
import TournamentShowcase from "@/components/LandingPage/TournamentShowcase";
import CardGamesShowcase from "@/components/LandingPage/CardGamesShowcase";

import {
  Trophy,
  Users,
  Wallet,
  Gamepad,
  BarChart,
  Store,
  ArrowRight,
} from "lucide-react";
import TwentyFortyEight from "./4028/client";


export default function Index() {
  const [isWobbling, setIsWobbling] = useState(false);

  const wobbleAnimation = {
    rotate: [0, -10, 10, -10, 10, 0],
    transition: { duration: 0.6 },
  };

  const handleWobble = () => {
    setIsWobbling(true);
    setTimeout(() => setIsWobbling(false), 600);
  };

  return (
    <>
      <div className="container max-w-3xl mx-auto p-4 text-center relative">
        <header>
          <h1 className="text-4xl font-bold mb-2">Andrew Kibe</h1>
          <p className="text-lg text-gray-600">All day erry day. Including the ...</p>
        </header>
        <motion.img
          src="/kifeee.png" // Replace with your cropped hat image
          alt="Wobble Hat"
          className="w-32 cursor-pointer absolute right-0 top-1/2 transform -translate-y-1/2"
          animate={isWobbling ? wobbleAnimation : {}}
          onClick={handleWobble}
        />
      </div>

      {/* Nganuthia Game UI (non-functional) */}
      <TwentyFortyEight/>


      <div className="my-12 relative">
  {/* CSS to hide scrollbar */}
  <style jsx global>{`
    .no-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .no-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  `}</style>

  {/* The key fix: make the container a fixed width with overflow-x-scroll */}
  <div className="mx-auto max-w-full px-4">
    <div className="overflow-x-scroll no-scrollbar pb-4">
      <div className="flex gap-6 py-4" style={{ width: "max-content" }}>
        {/* Card 1 - Kenya Unveiled (Full Image) */}
        <div className="flex-shrink-0 w-64 h-80 bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-700 overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="h-full w-full relative">
            <img 
              src="/kifeedesign.png" 
              alt="Kenya Unveiled" 
              className="w-full h-full object-cover" 
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <p className="text-xl font-bold text-white">Late Night Show</p>
            </div>
          </div>
        </div>
        
        {/* Card 2 - Nganuthia Leaderboard */}
        <div className="flex-shrink-0 w-64 h-80 bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-700 p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="font-bold text-center mb-3 dark:text-gray-100">Nganuthia Leaderboard</h3>
          <div className="space-y-2">
            {[
              { avatar: "https://randomuser.me/api/portraits/men/32.jpg", name: "IQ Watson", username: "@IQ_Watson", points: 132 },
              { avatar: "https://randomuser.me/api/portraits/women/44.jpg", name: "Gift Kaswende", username: "@GiftDarel", points: 87 },
              { avatar: "https://randomuser.me/api/portraits/men/55.jpg", name: "Samuel Osiro", username: "@SamuelOsiro", points: 65 },
              { avatar: "https://randomuser.me/api/portraits/women/67.jpg", name: "Cg the artist", username: "@Cg_the_artist", points: 52 },
              { avatar: "https://randomuser.me/api/portraits/men/78.jpg", name: "Mburu", username: "@Mburu", points: 44 }
            ].map((player, index) => (
              <div key={index} className="flex items-center justify-between py-1 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center">
                  <span className="mr-2 text-sm dark:text-gray-300">{index + 1}.</span>
                  <div className="w-6 h-6 rounded-full overflow-hidden mr-2">
                    <img src={player.avatar} alt={`${player.name}'s avatar`} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="text-sm font-medium dark:text-gray-200">{player.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{player.username}</div>
                  </div>
                </div>
                <div className="text-sm font-bold dark:text-gray-300">{player.points}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Card 3 - Safari Diaries (Full Image) */}
        <div className="flex-shrink-0 w-64 h-80 bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-700 overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="h-full w-full relative">
            <img 
              src="/kifeee2.jpeg" 
              alt="Breakfast Show" 
              className="w-full h-full object-cover" 
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <p className="text-xl font-bold text-white">Breakfast Show</p>
            </div>
          </div>
        </div>
        
        {/* Card 4 - Vinuthias Leaderboard */}
        <div className="flex-shrink-0 w-64 h-80 bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-700 p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="font-bold text-center mb-3 dark:text-gray-100">Vinuthias Leaderboard</h3>
          <div className="space-y-2">
            {[
              { avatar: "https://randomuser.me/api/portraits/men/12.jpg", name: "Jimmys", username: "@Jimmys", points: 142 },
              { avatar: "https://randomuser.me/api/portraits/women/22.jpg", name: "P_Mwangi", username: "@P_Mwangi", points: 133 },
              { avatar: "https://randomuser.me/api/portraits/men/33.jpg", name: "Omar Khalid", username: "@KhalidOmar", points: 108 },
              { avatar: "https://randomuser.me/api/portraits/women/45.jpg", name: "Kamori", username: "@AntonyKamori", points: 88 },
              { avatar: "https://randomuser.me/api/portraits/men/56.jpg", name: "Sam One", username: "@Sam1", points: 77 }
            ].map((team, index) => (
              <div key={index} className="flex items-center justify-between py-1 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center">
                  <span className="mr-2 text-sm dark:text-gray-300">{index + 1}.</span>
                  <div className="w-6 h-6 rounded-full overflow-hidden mr-2">
                    <img src={team.avatar} alt={`${team.name}'s avatar`} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="text-sm font-medium dark:text-gray-200">{team.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{team.username}</div>
                  </div>
                </div>
                <div className="text-sm font-bold dark:text-gray-300">{team.points}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Card 5 - The Red Book (Full Image) */}
        <div className="flex-shrink-0 w-64 h-80 bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-700 overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="h-full w-full relative">
            <img 
              src="/puny2beast.png" 
              alt="From Puny to Beast: E-book" 
              className="w-full h-full object-cover" 
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <p className="text-xl font-bold text-white">From Puny to Beast: E-book</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  {/* Scroll indicator arrows - making them interactive with scroll functionality */}
  <div className="hidden md:flex justify-between absolute top-1/2 left-4 right-4 transform -translate-y-1/2">
    <button onClick={() => document.querySelector('.overflow-x-scroll').scrollBy({left: -300, behavior: 'smooth'})} 
      className="bg-white dark:bg-gray-800 rounded-full p-2 shadow-md opacity-70 hover:opacity-100 focus:outline-none">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
    </button>
    <button onClick={() => document.querySelector('.overflow-x-scroll').scrollBy({left: 300, behavior: 'smooth'})} 
      className="bg-white dark:bg-gray-800 rounded-full p-2 shadow-md opacity-70 hover:opacity-100 focus:outline-none">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  </div>
</div>
    </>
  );
}