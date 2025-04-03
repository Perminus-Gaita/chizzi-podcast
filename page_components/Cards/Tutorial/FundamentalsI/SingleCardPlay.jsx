"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Clock,
  Award,
  Brain,
  SkipForward,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";

const LESSON_CONFIGS = {
  basicMatching: {
    scenarios: [
      {
        id: "clear-match",
        title: "Clear Match",
        description: "Play a card matching the current suit",
        setup: {
          topCard: "5H",
          playerHand: ["7H", "4S", "6D", "9C"],
          opponentCards: [4, 4], // Number of cards for each opponent
          validMoves: ["7H"],
          optimalMove: "7H",
          hint: "Look for the Hearts card - suits must match!",
        },
      },
      {
        id: "multiple-valid",
        title: "Multiple Options",
        description: "Choose between multiple valid plays",
        setup: {
          topCard: "5H",
          playerHand: ["7H", "9H", "6D", "9C"],
          opponentCards: [4, 4],
          validMoves: ["7H", "9H"],
          optimalMove: "7H",
          hint: "Both Hearts cards are valid - which is more efficient?",
        },
      },
      {
        id: "suit-vs-rank",
        title: "Suit vs Rank",
        description: "Decide between matching suit or rank",
        setup: {
          topCard: "5H",
          playerHand: ["7H", "5S", "6D", "9C"],
          opponentCards: [4, 4],
          validMoves: ["7H", "5S"],
          optimalMove: "7H",
          hint: "You can match either the Hearts suit or the 5 rank",
        },
      },
    ],
    points: 2,
  },
  timing: {
    scenarios: [
      {
        id: "safe-play",
        title: "Safe Plays",
        description: "Practice playing when opponents have many cards",
        setup: {
          topCard: "5H",
          playerHand: ["7H", "5S", "6D", "9C"],
          opponentCards: [8, 7],
          validMoves: ["7H", "5S"],
          optimalMove: "7H",
          hint: "Opponents have many cards - less risk in playing good cards now",
        },
      },
      {
        id: "risky-play",
        title: "Risky Situation",
        description: "Learn when to hold cards with opponents near winning",
        setup: {
          topCard: "5H",
          playerHand: ["7H", "5S", "6D", "9C"],
          opponentCards: [2, 3],
          validMoves: ["7H", "5S"],
          optimalMove: "5S",
          hint: "Opponents are close to winning - save strong cards for later",
        },
      },
    ],
    points: 2,
  },
  quickDecision: {
    scenarios: [
      {
        id: "timed-choice",
        title: "Quick Decision Challenge",
        description: "Choose the best play under time pressure",
        setup: {
          topCard: "5H",
          playerHand: ["7H", "5S", "6H", "9H"],
          opponentCards: [3, 4],
          validMoves: ["7H", "5S", "6H", "9H"],
          optimalMove: "6H",
          timeLimit: 10,
          hint: "Consider both immediate impact and future possibilities",
        },
      },
    ],
    points: 1,
  },
  efficiency: {
    scenarios: [
      {
        id: "efficiency-1",
        title: "Efficiency Master Round 1",
        description: "Make the most efficient single card play",
        setup: {
          topCard: "5H",
          playerHand: ["7H", "5S", "6H", "9H"],
          opponentCards: [3, 4],
          validMoves: ["7H", "5S", "6H", "9H"],
          optimalMove: "6H",
          explanation:
            "The 6♥ is optimal as it keeps higher cards for later power plays",
          hint: "Think about the value of each card for future combinations",
        },
      },
      // Add more efficiency scenarios...
    ],
    points: 1,
  },
};

const SingleCardPlay = ({ onComplete, gameRef }) => {
  const [currentLesson, setCurrentLesson] = useState("basicMatching");
  const [currentScenario, setCurrentScenario] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedCard, setSelectedCard] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [timer, setTimer] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [completedScenarios, setCompletedScenarios] = useState(new Set());

  const lesson = LESSON_CONFIGS[currentLesson];
  const scenario = lesson.scenarios[currentScenario];

  // Timer hook for Quick Decision challenges
  useEffect(() => {
    if (scenario?.setup?.timeLimit && timer !== null) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            handleTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer, scenario]);

  const handleTimeout = () => {
    setFeedback({
      type: "error",
      message: "Time's up! Try again to beat the clock.",
    });
    resetScenario();
  };

  const handleCardClick = (card) => {
    if (isAnimating) return;
    setSelectedCard(card);
    setFeedback(null);
  };

  const handlePlayCard = async () => {
    if (!selectedCard || isAnimating) return;
    setIsAnimating(true);

    try {
      const isValid = scenario.setup.validMoves.includes(selectedCard);
      const isOptimal = selectedCard === scenario.setup.optimalMove;

      if (!isValid) {
        setFeedback({
          type: "error",
          message: "Invalid play! Try matching the suit or rank.",
        });
        return;
      }

      // Animate card play
      if (gameRef.current) {
        await gameRef.current.playCard(selectedCard);
      }

      // Update score and provide feedback
      let pointsEarned = 0;
      if (isOptimal) {
        pointsEarned = lesson.points / lesson.scenarios.length;
        setScore((prev) => prev + pointsEarned);
        setFeedback({
          type: "success",
          message: "Perfect play! Optimal choice.",
          points: pointsEarned,
        });
      } else {
        pointsEarned = (lesson.points / lesson.scenarios.length) * 0.5;
        setScore((prev) => prev + pointsEarned);
        setFeedback({
          type: "warning",
          message: `Good play, but ${scenario.setup.optimalMove} would have been optimal.`,
          points: pointsEarned,
        });
      }

      // Track completion
      setCompletedScenarios((prev) => new Set([...prev, scenario.id]));

      // Progress to next scenario or lesson
      setTimeout(() => {
        if (currentScenario < lesson.scenarios.length - 1) {
          setCurrentScenario((prev) => prev + 1);
        } else {
          // Progress to next lesson or complete tutorial
          const lessons = Object.keys(LESSON_CONFIGS);
          const currentIndex = lessons.indexOf(currentLesson);
          if (currentIndex < lessons.length - 1) {
            setCurrentLesson(lessons[currentIndex + 1]);
            setCurrentScenario(0);
          } else {
            onComplete(score + pointsEarned);
          }
        }
        setSelectedCard(null);
        setFeedback(null);
        setShowHint(false);
      }, 1500);
    } finally {
      setIsAnimating(false);
    }
  };

  const resetScenario = () => {
    setSelectedCard(null);
    setFeedback(null);
    setShowHint(false);
    if (scenario?.setup?.timeLimit) {
      setTimer(scenario.setup.timeLimit);
    }
    if (gameRef.current) {
      gameRef.current.resetScenario(scenario.setup);
    }
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Progress Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-white">{scenario.title}</h2>
            {scenario?.setup?.timeLimit && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-300">
                <Clock className="w-4 h-4" />
                <span>{timer}s</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            <span className="text-white font-medium">
              {score.toFixed(1)} / 6 points
            </span>
          </div>
        </div>

        {/* Game Area */}
        <div className="relative aspect-video bg-gray-800/50 rounded-xl overflow-hidden mb-8">
          {/* Your game canvas renders here */}
          <h1>canvas here</h1>

          {/* Tutorial Overlays */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg
                          ${
                            feedback.type === "success"
                              ? "bg-green-500/90"
                              : feedback.type === "warning"
                              ? "bg-yellow-500/90"
                              : "bg-red-500/90"
                          } text-white font-medium shadow-lg`}
              >
                <div className="flex items-center gap-2">
                  {feedback.type === "success" && (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>{feedback.message}</span>
                  {feedback.points && (
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-white/20">
                      +{feedback.points.toFixed(1)}p
                    </span>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Instruction Area */}
        <div className="bg-gray-800/50 rounded-xl p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-white">{scenario.description}</p>
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
            {scenario?.setup?.explanation && (
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                           bg-blue-500/20 text-blue-300 text-sm"
              >
                <Award className="w-4 h-4" />
                <span>Efficiency Tip</span>
              </div>
            )}
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
            onClick={handlePlayCard}
            disabled={!selectedCard || isAnimating}
            className="px-6 py-2 rounded-lg bg-primary hover:bg-primary/90
                     text-white font-medium disabled:opacity-50
                     disabled:cursor-not-allowed transition-colors"
          >
            Play Card
          </button>
        </div>
      </div>
    </div>
  );
};

export default SingleCardPlay;
