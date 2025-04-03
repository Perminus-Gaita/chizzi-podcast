"use client";

import { useState } from "react";
import { IconButton } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { motion, AnimatePresence } from "framer-motion";

import {
  Trophy,
  Users,
  Wallet,
  Gamepad,
  BarChart,
  Store,
  ArrowRight,
  WalletCards,
  Medal,
  LayoutDashboard,
  ChevronDown,
} from "lucide-react";

const Features = () => {
  const [expanded, setExpanded] = useState(null);

  const featureData = [
    {
      number: 1,
      title: "Strategic Card Gameplay",
      content:
        "Experience intense 4-player Kadi matches featuring Jump Cards, Question Cards, and Kickbacks. Master the art of card combinations and strategic timing to outplay your opponents.",
      icon: <WalletCards className="w-6 h-6 text-indigo-400" />,
      image: "/gameplay-showcase.png",
    },
    {
      number: 2,
      title: "Tournament Ecosystem",
      content:
        "Two powerful tournament models: Buy-in events with prize pools up to KES 100,000, and sponsored tournaments where organizers can sell merchandise to fund prizes. Complete tournament management with brackets and real-time updates.",
      icon: <Trophy className="w-6 h-6 text-indigo-400" />,
      image: "/tournament-ecosystem.png",
    },
    {
      number: 3,
      title: "Competitive Rankings",
      content:
        "Climb the global leaderboards through weekly and monthly rankings. Track your performance across casual games and tournaments. Earn recognition and unlock opportunities as you rise through the ranks.",
      icon: <Medal className="w-6 h-6 text-indigo-400" />,
      image: "/rankings-showcase.png",
    },
    {
      number: 4,
      title: "Organizer Tools",
      content:
        "Comprehensive suite for tournament organizers including custom branding, merchandise integration, sponsorship management, and detailed analytics. Build and monetize your gaming community.",
      icon: <LayoutDashboard className="w-6 h-6 text-indigo-400" />,
      image: "/organizer-tools.png",
    },
  ];

  return (
    <div className="relative py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 via-indigo-900/5 to-transparent" />

      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Complete Kadi Esports Platform
          </h2>
          <p className="text-xl text-[#9f9f9f] max-w-2xl mx-auto">
            Everything you need to play, compete, and organize in one place
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            {featureData.map((feature, index) => (
              <motion.div
                key={feature.number}
                initial={false}
                animate={{
                  backgroundColor:
                    expanded === feature.number
                      ? "rgba(99, 102, 241, 0.1)"
                      : "transparent",
                }}
                className="rounded-xl p-6 cursor-pointer"
                onClick={() =>
                  setExpanded(
                    expanded === feature.number ? null : feature.number
                  )
                }
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 p-2 bg-indigo-900/30 rounded-lg">
                    {feature.icon}
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-xl font-semibold text-white">
                        {feature.title}
                      </h3>
                      <ChevronDown
                        className={`w-5 h-5 text-indigo-400 transition-transform ${
                          expanded === feature.number ? "rotate-180" : ""
                        }`}
                      />
                    </div>

                    <AnimatePresence>
                      {expanded === feature.number && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <p className="text-[#9f9f9f] mb-4">
                            {feature.content}
                          </p>
                          <button className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors">
                            <span>Learn more</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="relative hidden md:block">
            <div className="sticky top-8">
              <AnimatePresence mode="wait">
                {expanded && (
                  <motion.div
                    key={expanded}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="rounded-xl overflow-hidden aspect-video"
                  >
                    <img
                      src={featureData[expanded - 1].image}
                      alt={featureData[expanded - 1].title}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;
