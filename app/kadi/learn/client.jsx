"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";

import {
  BookOpen,
  PlayCircle,
  Sparkles,
  Trophy,
  ChevronRight,
  Lock,
} from "lucide-react";

import { init_page, setCurrentTutorialModule } from "@/app/store/pageSlice";

const Learn = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const modules = [
    {
      id: "mastering-basics",
      title: "Mastering the Basics",
      description:
        "Learn the fundamentals of Kadi, from card types to basic gameplay",
      totalPoints: 30,
      earnedPoints: 0,
      subModules: [
        {
          name: "Meet Your Cards",
          points: 6,
          status: "available", // available, locked, completed
          icon: BookOpen,
          path: "meetYourCards",
        },
        {
          name: "Basic Game Flow",
          points: 7,
          status: "available",
          icon: PlayCircle,
          path: "basicGameFlow",
        },
        {
          name: "Card Powers",
          points: 12,
          status: "available",
          icon: Sparkles,
          path: "cardPowers",
        },
        {
          name: "First Game",
          points: 5,
          status: "available",
          icon: Trophy,
          path: "firstGame",
        },
      ],
    },
    // Add other main modules here (Fundamentals I, II, etc.)
  ];

  useEffect(() => {
    dispatch(
      init_page({
        page_title: "Learn Kadi",
        show_back: false,
        show_menu: true,
        route_to: "",
      })
    );
  }, []);

  return (
    <div className="w-full md:max-w-5xl mx-auto px-1 md:px-6 space-y-4 md:space-y-6 h-full">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Learn to Play Kadi</h1>
        <p className="text-muted-foreground">
          Master the game through interactive lessons and practice
        </p>
      </div>

      {/* <div className="bg-card rounded-lg p-2 md:p-4 shadow-sm">
        <div className="flex justify-between items-center mb-2 md:mb-4">
          <h2 className="text-lg font-semibold">Your Progress</h2>
          <div className="flex items-center gap-2 bg-primary/10 rounded-full px-2 md:px-4 py-1">
            <Trophy className="w-4 h-4" />
            <span className="text-xs md:text-sm font-medium">
              0 / 110 points
            </span>
          </div>
        </div>
      </div> */}

      <div className="space-y-6">
        {modules.map((module) => (
          <div
            key={module.id}
            className="bg-card rounded-lg p-4 md:p-6 shadow-sm"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm md:text-lg md:text-xl font-semibold">
                {module.title}
              </h3>

              <div className="flex items-center gap-2 bg-primary/10 rounded-full px-2 md:px-4 py-1">
                <Trophy className="w-4 h-4" />
                <span className="text-xs md:text-sm text-muted-foreground">
                  {module.earnedPoints} / {module.totalPoints} points
                </span>
              </div>
            </div>

            <p className="text-muted-foreground mb-6">{module.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {module.subModules.map((subModule) => (
                <button
                  key={subModule.name}
                  onClick={() => {
                    if (subModule.status === "available") {
                      dispatch(setCurrentTutorialModule(subModule.path));
                      router.push(`/kadi/learn/mastering-the-basics`);
                    }
                  }}
                  className={`
                    relative flex items-center p-4 rounded-lg border
                    ${
                      subModule.status === "available"
                        ? "hover:bg-accent cursor-pointer"
                        : subModule.status === "completed"
                        ? "bg-secondary/10"
                        : "opacity-50 cursor-not-allowed"
                    }
                  `}
                >
                  <div className="flex items-center flex-1 gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <subModule.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{subModule.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {subModule.points} points
                      </p>
                    </div>
                  </div>

                  {subModule.status === "available" ? (
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  ) : subModule.status === "locked" ? (
                    <Lock className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <ChevronRight className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Learn;
