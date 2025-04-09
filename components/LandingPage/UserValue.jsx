"use client";
import Link from "next/link";
import { useSelector } from "react-redux";

import {
  Trophy,
  Users,
  Wallet,
  Gamepad,
  BarChart,
  Store,
  ArrowRight,
} from "lucide-react";

const UserValue = () => {
  const userProfile = useSelector((state) => state.auth.profile);

  return (
    <section className="py-24 relative">
      {/* <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-900/10 to-transparent" /> */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-900/10 to-transparent -z-10" />

      <div className="max-w-7xl mx-auto px-4 space-y-20">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Where Skill Meets Opportunity
          </h2>
          <p className="text-xl text-[#9f9f9f]">
            Choose your path in competitive Kadi
          </p>
        </div>

        {/* Players Section */}
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6 md:pr-8">
            <div className="inline-flex items-center gap-2 bg-indigo-900/30 rounded-full px-4 py-2">
              <Trophy className="w-5 h-5 text-indigo-400" />
              <span className="text-indigo-400 font-semibold">For Players</span>
            </div>

            <h3 className="text-3xl md:text-4xl font-bold text-white leading-tight">
              Turn Your Kadi Skills Into <br />
              Real Rewards
            </h3>

            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <Gamepad className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <p className="text-[#9f9f9f]">
                  Join 4-player matches with strategic gameplay using Jump
                  Cards, Question Cards, and more
                </p>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <Trophy className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <p className="text-[#9f9f9f]">
                  Compete in tournaments with real cash prizes and growing prize
                  pools
                </p>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <BarChart className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <p className="text-[#9f9f9f]">
                  Track your progress on weekly and monthly leaderboards
                </p>
              </div>
            </div>

            <Link
              href={userProfile?.uuid ? "/arena" : "/login"}
              className="inline-block"
            >
              <button className="group flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg transition-all duration-300">
                <span className="font-semibold">Start Playing</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/30 to-purple-500/30 rounded-2xl blur-2xl" />
            <img
              src="/tournament-action.png"
              alt="Tournament Action"
              className="relative rounded-2xl w-full shadow-2xl"
            />
          </div>
        </div>

        {/* Organizers Section */}
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="order-2 md:order-1 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/30 to-orange-500/30 rounded-2xl blur-2xl" />
            <img
              src="/tournament-management.png"
              alt="Tournament Management"
              className="relative rounded-2xl w-full shadow-2xl"
            />
          </div>

          <div className="space-y-6 md:pl-8 order-1 md:order-2">
            <div className="inline-flex items-center gap-2 bg-amber-900/30 rounded-full px-4 py-2">
              <Wallet className="w-5 h-5 text-amber-400" />
              <span className="text-amber-400 font-semibold">
                For Organizers
              </span>
            </div>

            <h3 className="text-3xl md:text-4xl font-bold text-white leading-tight">
              Build Your Own <br />
              Tournament Empire
            </h3>

            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <p className="text-[#9f9f9f]">
                  Choose between sponsored tournaments or buy-in events with
                  flexible prize structures
                </p>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <Store className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <p className="text-[#9f9f9f]">
                  Generate revenue through tournament fees and merchandise sales
                </p>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <p className="text-[#9f9f9f]">
                  Access detailed analytics and tools to grow your community
                </p>
              </div>
            </div>

            <Link
              href={userProfile?.uuid ? "/arena" : "/login"}
              className="group inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white px-6 py-3 rounded-lg transition-all duration-300"
            >
              <span className="font-semibold">Create Tournament</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserValue;
