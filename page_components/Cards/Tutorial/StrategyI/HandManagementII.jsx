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
  cardPreservation: {
    title: "Strategic Card Preservation",
    description: "Learn to hold key cards for critical moments",
    points: 2,
    scenarios: [
      {
        id: "critical-retention",
        title: "Critical Card Retention",
        description: "Identify and preserve game-changing cards",
        setup: {
          playerHand: ["JH", "QD", "8S", "2C", "AH"],
          opponentCards: [4, 3, 2],
          validMoves: [["JH"], ["QD"], ["8S"], ["2C"]],
          optimalMove: ["2C"],
          hint: "Consider which cards could be most impactful in future turns",
          explanation:
            "Retaining jump, question, and ace cards can provide strategic advantages",
          teachingPoints: [
            "Jump cards manipulate turn order",
            "Question cards enable powerful sequences",
            "Ace cards control suits and penalties",
          ],
        },
      },
      {
        id: "game-prediction",
        title: "Game Progression Prediction",
        description: "Anticipate opponent plays and game flow",
        setup: {
          playerHand: ["KH", "QD", "8S", "3C", "6H"],
          opponentCards: [1, 3, 2],
          validMoves: [["KH"], ["QD"], ["8S"], ["3C"], ["6H"]],
          optimalMove: ["3C"],
          hint: "Think about how each play could influence the game's direction",
          explanation:
            "Strategic card retention requires predicting likely game states",
          teachingPoints: [
            "Analyze opponent's card counts",
            "Consider potential upcoming opportunities",
            "Preserve cards for critical moments",
          ],
        },
      },
    ],
  },
  handEfficiency: {
    title: "Hand Efficiency Maximization",
    description: "Optimize your hand for maximum impact",
    points: 2,
    scenarios: [
      {
        id: "size-optimization",
        title: "Hand Size Optimization",
        description: "Reduce hand size efficiently",
        setup: {
          playerHand: ["5H", "5D", "5S", "8C", "3H"],
          opponentCards: [3, 3, 4],
          validMoves: [
            ["5H"],
            ["5D"],
            ["5S"],
            ["8C"],
            ["3H"],
            ["5H", "5D"],
            ["5H", "5S"],
            ["5D", "5S"],
            ["5H", "5D", "5S"],
          ],
          optimalMove: ["5H", "5D", "5S"],
          hint: "Look for opportunities to play multiple cards",
          explanation:
            "Reducing hand size while maintaining strategic control is crucial",
          teachingPoints: [
            "Identify cards that can be played together",
            "Balance immediate plays with future potential",
            "Create multiple future play opportunities",
          ],
        },
      },
      {
        id: "adaptive-strategy",
        title: "Adaptive Strategy",
        description: "Adjust your approach based on game dynamics",
        setup: {
          playerHand: ["7H", "7D", "QS", "8S", "2C"],
          opponentCards: [2, 1, 3],
          validMoves: [
            ["7H"],
            ["7D"],
            ["QS"],
            ["8S"],
            ["2C"],
            ["QS", "8S"],
            ["7H", "7D"],
          ],
          optimalMove: ["QS", "8S"],
          hint: "Consider how each play could impact your future options",
          explanation:
            "Flexible hand management is key in dynamic game situations",
          teachingPoints: [
            "Read and respond to changing game states",
            "Maximize play potential with limited resources",
            "Think multiple turns ahead",
          ],
        },
      },
    ],
  },
};

const HandManagementII = ({ onComplete, gameRef }) => {
  const [currentLesson, setCurrentLesson] = useState("cardPreservation");
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

    const newSelection = selectedCards.includes(card)
      ? selectedCards.filter((c) => c !== card)
      : [...selectedCards, card];

    setSelectedCards(newSelection);
    setFeedback(null);
  };

  const handlePlayCards = async () => {
    if (!selectedCards.length || isAnimating) return;
    setIsAnimating(true);

    try {
      const isValid = scenario.setup.validMoves.some(
        (move) =>
          move.length === selectedCards.length &&
          move.every((card) => selectedCards.includes(card))
      );

      const isOptimal =
        JSON.stringify(selectedCards.sort()) ===
        JSON.stringify(scenario.setup.optimalMove.sort());

      if (!isValid) {
        setFeedback({
          type: "error",
          message: "Invalid move. Please try again.",
        });
        return;
      }

      // Animate card play
      if (gameRef.current) {
        await gameRef.current.playCards(selectedCards);
      }

      const pointsEarned = isOptimal
        ? lesson.points / lesson.scenarios.length
        : (lesson.points / lesson.scenarios.length) * 0.5;

      setScore((prevScore) => prevScore + pointsEarned);
      setFeedback({
        type: "success",
        message: isOptimal ? "Optimal play!" : "Valid, but not optimal.",
        points: pointsEarned,
      });

      // Progress to next scenario or complete lesson
      setTimeout(() => {
        if (currentScenario < lesson.scenarios.length - 1) {
          setCurrentScenario((prevScenario) => prevScenario + 1);
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
      gameRef.current.resetScenario();
    }
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Progress Header */}
        <div className="grid grid-cols-2 gap-2 mb-8">
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
                {scenario.setup.teachingPoints?.map((point, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-gray-300"
                  >
                    <ChevronRight className="w-4 h-4 text-primary" />
                    <span>{point}</span>
                  </div>
                ))}
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
                {score.toFixed(1)} / 4 points
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
            disabled={!selectedCards.length || isAnimating}
            className="px-6 py-2 rounded-lg bg-primary hover:bg-primary/90
                     text-white font-medium disabled:opacity-50
                     disabled:cursor-not-allowed transition-colors"
          >
            Play Selected Card{selectedCards.length !== 1 && "s"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HandManagementII;
