"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Trophy,
  Timer,
  Star,
  BarChart,
  Eye,
  Check,
  Crown,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

const SCENARIOS = {
  probabilityCalculation: {
    id: "probability",
    title: "The Perfect Setup",
    description: "Calculate winning probabilities and track played cards",
    points: 2,
    phases: [
      {
        id: "hand-analysis",
        title: "Winning Hand Analysis",
        setup: {
          playerHand: ["QS", "QH", "7S", "8H"],
          playedCards: {
            answers: ["4H", "5H", "6H", "7H", "9H", "10H"],
            questions: ["QC", "8C"],
            jumps: ["JH", "JS"],
            kickbacks: ["KH"],
            penalties: ["2H", "3H", "JOK1"],
          },
          botProfiles: [
            { id: 1, behavior: "drawing", cards: 6 },
            { id: 2, behavior: "ace-control", cards: 4 },
          ],
          requiredCards: ["7H", "8S"],
          announcement: false,
          probability: 0.35,
        },
      },
      {
        id: "false-dawn",
        title: "The False Dawn",
        setup: {
          playerHand: ["QS", "QH", "7S", "7H"],
          playedCards: {
            answers: ["4H", "5H", "6H", "9H", "10H"],
            questions: ["QC", "8C"],
            jumps: ["JH", "JS"],
            kickbacks: [], // Hidden trap - untracked Kickbacks
            penalties: ["2H", "3H"],
          },
          botProfiles: [
            { id: 1, behavior: "defensive", cards: 3 },
            { id: 2, behavior: "aggressive", cards: 2 },
          ],
          announcement: false,
          probability: 0.15,
        },
      },
      {
        id: "perfect-timing",
        title: "Perfect Timing",
        setup: {
          playerHand: ["QS", "QH", "7S", "7H", "8S"],
          playedCards: {
            answers: ["4H", "5H", "6H", "9H", "10H"],
            questions: ["QC", "8C", "QD"],
            jumps: ["JH", "JS", "JC"],
            kickbacks: ["KH", "KS"],
            penalties: ["2H", "3H", "JOK1", "JOK2"],
          },
          botProfiles: [
            { id: 1, behavior: "predictable", cards: 2 },
            { id: 2, behavior: "defensive", cards: 3 },
          ],
          announcement: true,
          probability: 0.85,
        },
      },
    ],
  },
  finalChallenge: {
    id: "grandmaster",
    title: "The Grand Master",
    description: "Execute a perfect winning strategy",
    points: 1,
    bonusPoints: {
      perfectTiming: 1,
      speed: 1,
      style: 0.5,
      flawless: 0.5,
    },
    setup: {
      playerHand: ["AS", "AH", "QC", "QD", "7S"],
      timeLimit: 120,
      requirements: {
        doubleAce: false,
        sequence: false,
        handReading: false,
        announcement: false,
      },
    },
  },
};

const HandReadingMatrix = ({ playedCards, remainingCards }) => {
  const categories = [
    { name: "Answers", key: "answers", color: "blue" },
    { name: "Questions", key: "questions", color: "purple" },
    { name: "Jumps", key: "jumps", color: "yellow" },
    { name: "Kickbacks", key: "kickbacks", color: "red" },
    { name: "Penalties", key: "penalties", color: "orange" },
  ];

  return (
    <div className="bg-gray-800/90 rounded-xl p-4 space-y-3">
      <h3 className="text-sm font-medium text-gray-300">
        Card Tracking Matrix
      </h3>
      <div className="space-y-2">
        {categories.map(({ name, key, color }) => (
          <div key={key} className="flex items-center gap-3">
            <span className="text-xs text-gray-400 w-20">{name}</span>
            <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${
                    (playedCards[key].length /
                      (playedCards[key].length + remainingCards[key])) *
                    100
                  }%`,
                }}
                className={`h-full bg-${color}-500`}
              />
            </div>
            <span className="text-xs text-gray-400 w-12">
              {remainingCards[key]} left
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ProbabilityIndicator = ({ value, size = "md" }) => {
  const radius = size === "sm" ? 20 : 30;
  const strokeWidth = size === "sm" ? 4 : 6;

  return (
    <div className="relative">
      <svg
        className="transform -rotate-90"
        width={radius * 2}
        height={radius * 2}
      >
        <circle
          cx={radius}
          cy={radius}
          r={radius - strokeWidth}
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="none"
          className="text-gray-700"
        />
        <circle
          cx={radius}
          cy={radius}
          r={radius - strokeWidth}
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="none"
          className="text-primary"
          strokeDasharray={2 * Math.PI * (radius - strokeWidth)}
          strokeDashoffset={2 * Math.PI * (radius - strokeWidth) * (1 - value)}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={`font-medium ${size === "sm" ? "text-xs" : "text-sm"}`}
        >
          {Math.round(value * 100)}%
        </span>
      </div>
    </div>
  );
};

const SettingUpNikoKadi = ({ onComplete, gameRef }) => {
  const [currentScenario, setCurrentScenario] = useState(
    "probabilityCalculation"
  );
  const [currentPhase, setCurrentPhase] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [announcement, setAnnouncement] = useState(false);
  const [showMatrix, setShowMatrix] = useState(false);
  const [activeBonuses, setActiveBonuses] = useState(new Set());
  const [mistakes, setMistakes] = useState(0);

  const scenario = SCENARIOS[currentScenario];
  const phase =
    currentScenario === "probabilityCalculation"
      ? scenario.phases[currentPhase]
      : scenario;

  const handleAnnouncement = () => {
    if (phase.setup.probability < 0.7) {
      setMistakes((prev) => prev + 1);
      // Show error feedback
      return;
    }

    setAnnouncement(true);
    if (phase.setup.announcement) {
      // Award points
      setScore((prev) => prev + scenario.points / scenario.phases.length);

      // Progress to next phase/scenario
      if (currentPhase < scenario.phases.length - 1) {
        setCurrentPhase((prev) => prev + 1);
      } else {
        setCurrentScenario("finalChallenge");
      }
    }
  };

  const handleFinalChallenge = () => {
    // Calculate bonuses
    const newBonuses = new Set();

    if (mistakes === 0) newBonuses.add("flawless");
    if (timeLeft > 60) newBonuses.add("speed");
    if (announcement) newBonuses.add("perfectTiming");

    setActiveBonuses(newBonuses);

    // Calculate final score
    const bonusPoints = Array.from(newBonuses).reduce(
      (sum, bonus) => sum + scenario.bonusPoints[bonus],
      0
    );

    const finalScore = score + scenario.points + bonusPoints;
    onComplete(finalScore);
  };

  useEffect(() => {
    if (currentScenario === "finalChallenge" && timeLeft === null) {
      setTimeLeft(scenario.setup.timeLimit);
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentScenario, timeLeft]);

  return (
    <div className="w-full h-full min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">{phase.title}</h2>
            <p className="text-gray-400">{phase.description}</p>
          </div>
          <div className="flex items-center gap-4">
            {timeLeft !== null && (
              <div className="flex items-center gap-2">
                <Timer className="w-5 h-5 text-primary" />
                <span className="font-mono text-xl text-white">
                  {Math.floor(timeLeft / 60)}:
                  {(timeLeft % 60).toString().padStart(2, "0")}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="font-medium text-white">
                {score.toFixed(1)} / 3 points
              </span>
            </div>
          </div>
        </div>

        {/* Game Area */}
        <div className="relative aspect-video bg-gray-800/50 rounded-xl overflow-hidden">
          {/* Your game canvas renders here */}

          {/* Hand Reading Matrix Toggle */}
          <button
            onClick={() => setShowMatrix(!showMatrix)}
            className="absolute top-4 left-4 p-2 rounded-lg bg-gray-800/90 
                     text-gray-300 hover:text-white transition-colors"
          >
            <BarChart className="w-5 h-5" />
          </button>

          {/* Probability Display */}
          <div className="absolute top-4 right-4">
            <ProbabilityIndicator value={phase.setup.probability} />
          </div>

          {/* Matrix Overlay */}
          <AnimatePresence>
            {showMatrix && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute left-4 top-16"
              >
                <HandReadingMatrix
                  playedCards={phase.setup.playedCards}
                  remainingCards={{
                    answers: 24,
                    questions: 8,
                    jumps: 4,
                    kickbacks: 4,
                    penalties: 7,
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Control Panel */}
        <div className="bg-gray-800/50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {/* Action Buttons */}
                <button
                  onClick={() => setShowMatrix(!showMatrix)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg
                           bg-gray-700 hover:bg-gray-600 text-gray-300
                           transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  {showMatrix ? "Hide" : "Show"} Analysis
                </button>

                <button
                  onClick={handleAnnouncement}
                  disabled={announcement}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg
                           bg-primary hover:bg-primary/90 text-white
                           disabled:opacity-50 disabled:cursor-not-allowed
                           transition-colors"
                >
                  <Crown className="w-4 h-4" />
                  Announce "Niko Kadi"
                </button>
              </div>

              {/* Active Bonuses */}
              {currentScenario === "finalChallenge" && (
                <div className="flex gap-2">
                  {Array.from(activeBonuses).map((bonus) => (
                    <div
                      key={bonus}
                      className="flex items-center gap-1 px-2 py-1 rounded-md
                               bg-primary/20 text-primary text-sm"
                    >
                      <Check className="w-3 h-3" />
                      {bonus}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Challenge Progress */}
            {currentScenario === "finalChallenge" && (
              <div className="flex items-center gap-6">
                {Object.entries(phase.setup.requirements).map(
                  ([req, completed]) => (
                    <div
                      key={req}
                      className={`flex items-center gap-2 ${
                        completed ? "text-primary" : "text-gray-500"
                      }`}
                    >
                      <Check className="w-4 h-4" />
                      <span className="text-sm">{req}</span>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* Tutorial Guidance */}
          <AnimatePresence>
            {!announcement && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="mt-6 p-4 bg-gray-700/50 rounded-lg"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-gray-300">
                      {currentScenario === "probabilityCalculation"
                        ? "Analyze the game state carefully. Consider played cards, opponent behavior, and winning probability before announcing."
                        : "Execute your winning strategy perfectly. Remember to time your announcement and handle any defensive plays."}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Brain className="w-4 h-4" />
                      <span>
                        Tip:{" "}
                        {phase.setup.probability >= 0.7
                          ? "Conditions look favorable for an announcement!"
                          : "Keep tracking cards and wait for better odds."}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        <div className="fixed bottom-4 left-4 right-4">
          <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
            {/* Progress Pills */}
            <div className="flex gap-2">
              {currentScenario === "probabilityCalculation" &&
                scenario.phases.map((p, index) => (
                  <div
                    key={p.id}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      index === currentPhase
                        ? "w-8 bg-primary"
                        : index < currentPhase
                        ? "w-4 bg-primary/80"
                        : "w-4 bg-gray-700"
                    }`}
                  />
                ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4">
              {currentScenario === "finalChallenge" ? (
                <button
                  onClick={handleFinalChallenge}
                  disabled={
                    !Object.values(phase.setup.requirements).every(Boolean)
                  }
                  className="flex items-center gap-2 px-6 py-2 rounded-lg
                           bg-primary hover:bg-primary/90 text-white font-medium
                           disabled:opacity-50 disabled:cursor-not-allowed
                           transition-colors"
                >
                  <Trophy className="w-4 h-4" />
                  Complete Challenge
                </button>
              ) : (
                <button
                  onClick={() => setCurrentScenario("finalChallenge")}
                  className="flex items-center gap-2 px-6 py-2 rounded-lg
                           bg-gray-700 hover:bg-gray-600 text-gray-300
                           hover:text-white transition-colors"
                >
                  Skip to Challenge
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingUpNikoKadi;
