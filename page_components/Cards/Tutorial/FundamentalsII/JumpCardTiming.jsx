"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Brain,
  RotateCcw,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Info,
  SkipForward,
} from "lucide-react";

const LESSON_CONFIGS = {
  basicJump: {
    title: "Jump Card Basics",
    description: "Learn how Jump Cards skip turns",
    points: 2,
    scenarios: [
      {
        id: "simple-skip",
        title: "Basic Turn Skip",
        description: "Use a Jump Card to skip the next player's turn",
        setup: {
          playerHand: ["JH", "4S", "6D", "9C"],
          turnOrder: ["Player1", "Player2", "Player3"],
          currentPlayer: "Player1",
          opponentCards: [4, 4],
          validMoves: ["JH"],
          optimalMove: "JH",
          hint: "Playing a Jump Card will skip the next player's turn",
          explanation:
            "Jump Cards allow you to strategically skip a player's turn",
        },
      },
      {
        id: "multiple-players",
        title: "Multiple Player Skip",
        description: "Skip multiple players in sequence",
        setup: {
          playerHand: ["JH", "JD", "4S", "6D"],
          turnOrder: ["Player1", "Player2", "Player3", "Player4"],
          currentPlayer: "Player1",
          opponentCards: [4, 4],
          validMoves: ["JH", "JD"],
          optimalMove: ["JH", "JD"],
          hint: "Multiple Jump Cards can skip multiple players in order",
          explanation:
            "Consecutive Jump Cards can create complex turn-skipping strategies",
        },
      },
    ],
  },
  counterJump: {
    title: "Counter-Jump Strategies",
    description: "Learn to defend against Jump Card plays",
    points: 2,
    scenarios: [
      {
        id: "jump-defense",
        title: "Blocking a Skip",
        description: "Counter a Jump Card with your own",
        setup: {
          playerHand: ["JH", "4S", "6D", "9C"],
          turnOrder: ["Player1", "Player2", "Player3"],
          currentPlayer: "Player1",
          opponentJumpCard: true,
          opponentCards: [4, 4],
          validMoves: ["JH"],
          optimalMove: "JH",
          hint: "Use your own Jump Card to prevent being skipped",
          explanation:
            "A player can counter a Jump Card by playing their own, maintaining their turn",
        },
      },
      {
        id: "strategic-counter",
        title: "Strategic Counter-Play",
        description: "Choose when to use your counter-Jump Card",
        setup: {
          playerHand: ["JH", "JD", "4S", "6D"],
          turnOrder: ["Player1", "Player2", "Player3", "Player4"],
          currentPlayer: "Player1",
          opponentJumpCard: true,
          opponentCards: [2, 2],
          validMoves: ["JH", "JD"],
          optimalMove: "JH",
          hint: "Consider the game state before using your counter-Jump Card",
          explanation:
            "Timing your counter-Jump is crucial for strategic advantage",
        },
      },
    ],
  },
  multiJumpTactics: {
    title: "Multi-Jump Tactics",
    description: "Master complex turn manipulation",
    points: 2,
    scenarios: [
      {
        id: "sequential-jumps",
        title: "Sequential Jump Plays",
        description: "Use multiple Jump Cards strategically",
        setup: {
          playerHand: ["JH", "JD", "JS", "4S"],
          turnOrder: ["Player1", "Player2", "Player3", "Player4", "Player5"],
          currentPlayer: "Player1",
          opponentCards: [3, 3],
          validMoves: ["JH", "JD", "JS"],
          optimalMove: ["JH", "JD"],
          hint: "You can play multiple Jump Cards to skip multiple players",
          explanation:
            "Carefully plan your Jump Card sequence to maximize strategic advantage",
        },
      },
      {
        id: "jump-timing",
        title: "Critical Jump Timing",
        description: "Choose the most impactful Jump Card play",
        setup: {
          playerHand: ["JH", "JD", "JS", "4S"],
          turnOrder: ["Player1", "Player2", "Player3", "Player4", "Player5"],
          currentPlayer: "Player1",
          opponentCards: [2, 2],
          validMoves: ["JH", "JD", "JS"],
          optimalMove: ["JH", "JD"],
          hint: "Consider the opponents' card counts when choosing Jump Cards",
          explanation:
            "Timing your Jump Cards can disrupt opponents' winning strategies",
        },
      },
    ],
  },
};

const JumpCardTiming = ({ onComplete, gameRef }) => {
  const [currentLesson, setCurrentLesson] = useState("basicJump");
  const [currentScenario, setCurrentScenario] = useState(0);
  const [selectedCards, setSelectedCards] = useState([]);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const lesson = LESSON_CONFIGS[currentLesson];
  const scenario = lesson.scenarios[currentScenario];

  const handleCardClick = (card) => {
    if (isAnimating) return;

    // Toggle card selection
    if (selectedCards.includes(card)) {
      setSelectedCards(selectedCards.filter((c) => c !== card));
    } else {
      // For this lesson, allow multiple Jump Card selection
      setSelectedCards([...selectedCards, card]);
    }
    setFeedback(null);
  };

  const handlePlayCards = async () => {
    if (selectedCards.length === 0 || isAnimating) return;
    setIsAnimating(true);

    try {
      // Validate the play
      const isValid = selectedCards.every((card) =>
        scenario.setup.validMoves.includes(card)
      );

      const isOptimal =
        JSON.stringify(selectedCards.sort()) ===
        JSON.stringify(scenario.setup.optimalMove.sort());

      if (!isValid) {
        setFeedback({
          type: "error",
          message: "Invalid Jump Card play",
        });
        return;
      }

      // Animate card play
      if (gameRef.current) {
        await gameRef.current.playJumpCards(selectedCards);
      }

      // Calculate points
      const pointsEarned = isOptimal
        ? lesson.points / lesson.scenarios.length
        : (lesson.points / lesson.scenarios.length) * 0.7;

      setScore((prev) => prev + pointsEarned);
      setFeedback({
        type: "success",
        message: isOptimal
          ? "Perfect Jump Card play!"
          : "Valid Jump Card strategy",
        points: pointsEarned,
      });

      // Progress to next scenario
      setTimeout(() => {
        if (currentScenario < lesson.scenarios.length - 1) {
          setCurrentScenario((prev) => prev + 1);
        } else {
          const lessons = Object.keys(LESSON_CONFIGS);
          const currentIndex = lessons.indexOf(currentLesson);
          if (currentIndex < lessons.length - 1) {
            setCurrentLesson(lessons[currentIndex + 1]);
            setCurrentScenario(0);
          } else {
            onComplete(score + pointsEarned);
          }
        }
        setSelectedCards([]);
        setFeedback(null);
        setShowHint(false);
      }, 1500);
    } finally {
      setIsAnimating(false);
    }
  };

  const resetScenario = () => {
    setSelectedCards([]);
    setFeedback(null);
    setShowHint(false);
    if (gameRef.current) {
      gameRef.current.resetScenario(scenario.setup);
    }
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Progress Header */}
        <div className="grid grid-cols-3 gap-2 mb-8">
          {Object.entries(LESSON_CONFIGS).map(([key, value]) => (
            <div key={key} className="relative">
              <div
                className={`h-2 rounded-full transition-colors duration-300 ${
                  key === currentLesson
                    ? "bg-primary animate-pulse"
                    : Object.keys(LESSON_CONFIGS).indexOf(key) <
                      Object.keys(LESSON_CONFIGS).indexOf(currentLesson)
                    ? "bg-primary/80"
                    : "bg-gray-700"
                }`}
              />
              <div className="absolute -bottom-6 w-full text-center">
                <span className="text-xs text-gray-400 font-medium">
                  {value.title}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Lesson Header */}
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-2xl font-bold text-white">{scenario.title}</h2>
          <p className="text-gray-400">{scenario.description}</p>
        </div>

        {/* Game Area */}
        <div className="relative aspect-video bg-gray-800/50 rounded-xl overflow-hidden mb-8">
          {/* Your game canvas renders here */}
          <h1>canvas here</h1>

          {/* Feedback Overlay */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg 
                          ${
                            feedback.type === "success"
                              ? "bg-green-500"
                              : "bg-red-500"
                          } 
                          text-white shadow-lg`}
              >
                <div className="flex items-center gap-2">
                  <span>{feedback.message}</span>
                  {feedback.points && (
                    <span className="px-2 py-0.5 bg-white/20 rounded-full text-sm">
                      +{feedback.points.toFixed(1)}p
                    </span>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Teaching Points */}
        <div className="bg-gray-800/50 rounded-xl p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-300">
                  <Info className="w-4 h-4 text-primary" />
                  <span>{scenario.setup.explanation}</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowHint(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                           bg-gray-700 hover:bg-gray-600 text-gray-300
                           hover:text-white transition-colors text-sm"
                >
                  <Brain className="w-4 h-4" />
                  Show Hint
                </button>
                <button
                  onClick={resetScenario}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                           bg-gray-700 hover:bg-gray-600 text-gray-300
                           hover:text-white transition-colors text-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="text-white font-medium">
                {score.toFixed(1)} / 6 points
              </span>
            </div>
          </div>

          {/* Hint Display */}
          <AnimatePresence>
            {showHint && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-4 p-4 bg-gray-700 rounded-lg text-sm text-gray-300"
              >
                {scenario.setup.hint}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Area */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => onComplete(score)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg
                     bg-gray-700 hover:bg-gray-600 text-gray-300
                     hover:text-white transition-colors"
          >
            <SkipForward className="w-4 h-4" />
            Skip Tutorial
          </button>

          <button
            onClick={handlePlayCards}
            disabled={selectedCards.length === 0 || isAnimating}
            className="px-6 py-2 rounded-lg bg-primary hover:bg-primary/90
                     text-white font-medium disabled:opacity-50
                     disabled:cursor-not-allowed transition-colors"
          >
            Play Jump Card{selectedCards.length > 1 ? "s" : ""}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JumpCardTiming;
