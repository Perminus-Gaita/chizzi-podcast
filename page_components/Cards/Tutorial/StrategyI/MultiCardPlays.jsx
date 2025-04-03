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
  suitCombinationStrategies: {
    title: "Suit Combination Strategies",
    description: "Master playing multiple cards across suits",
    points: 2,
    scenarios: [
      {
        id: "basic-suit-shift",
        title: "Changing Game Suit",
        description: "Learn how to transform the game's current suit",
        setup: {
          topCard: "5H",
          playerHand: ["5H", "5D", "5S", "4C"],
          opponentCards: [4, 4],
          validMoves: [
            ["5H", "5D"],
            ["5H", "5S"],
          ],
          optimalMove: ["5H", "5D"],
          hint: "Playing multiple 5s lets you change the game's suit strategically",
          explanation:
            "Multiple cards of the same rank can shift the game's suit, giving you more control",
          teachingPoints: [
            "Multiple same-rank cards can change the game suit",
            "First card played determines initial suit matching",
          ],
        },
      },
      {
        id: "complex-suit-management",
        title: "Strategic Suit Control",
        description: "Analyze advanced suit transformation techniques",
        setup: {
          topCard: "7C",
          playerHand: ["7H", "7D", "7S", "AH"],
          opponentCards: [3, 3],
          validMoves: [
            ["7H", "7D"],
            ["7H", "7S"],
          ],
          optimalMove: ["7H", "7D"],
          hint: "Consider how changing suits can disrupt opponent strategies",
          explanation:
            "Strategically changing suits can create advantageous game states",
          teachingPoints: [
            "Suit changes can block opponent's potential plays",
            "Multiple card plays offer strategic flexibility",
          ],
        },
      },
    ],
  },
  efficiencyMaximization: {
    title: "Efficiency Maximization",
    description: "Optimize your card plays for maximum impact",
    points: 2,
    scenarios: [
      {
        id: "hand-reduction",
        title: "Efficient Hand Management",
        description: "Reduce hand size strategically",
        setup: {
          topCard: "4H",
          playerHand: ["4H", "4D", "4S", "QC", "8H"],
          opponentCards: [2, 2],
          validMoves: [
            ["4H", "4D"],
            ["4H", "4S"],
          ],
          optimalMove: ["4H", "4D", "4S"],
          hint: "Look for opportunities to play multiple cards and reduce your hand size",
          explanation:
            "Playing multiple cards can dramatically reduce your hand while maintaining strategic control",
          drawPileSize: 15,
          efficiencyMetrics: {
            handReduction: 0.7,
            strategicValue: 0.6,
            opponentPressure: 0.5,
          },
        },
      },
      {
        id: "strategic-combination",
        title: "Powerful Card Combinations",
        description: "Create impactful multi-card plays",
        setup: {
          topCard: "6H",
          playerHand: ["6H", "6D", "QH", "8H", "AH"],
          opponentCards: [3, 3],
          validMoves: [
            ["6H", "6D"],
            ["6H", "QH"],
          ],
          optimalMove: ["6H", "6D"],
          hint: "Balance immediate advantage with future play potential",
          explanation:
            "Sometimes playing fewer cards can set up more powerful future moves",
          drawPileSize: 12,
          efficiencyMetrics: {
            handReduction: 0.5,
            strategicValue: 0.8,
            opponentPressure: 0.6,
          },
        },
      },
    ],
  },
};

// Efficiency metrics visualization
const EfficiencyMeter = ({ metrics }) => {
  const metricLabels = {
    handReduction: "Hand Reduction",
    strategicValue: "Strategic Value",
    opponentPressure: "Opponent Pressure",
  };

  return (
    <div className="absolute top-4 right-4 bg-gray-800/90 rounded-lg p-4 space-y-2">
      {Object.entries(metrics).map(([key, value]) => (
        <div key={key} className="flex items-center justify-between gap-4">
          <span className="text-sm text-gray-400">{metricLabels[key]}</span>
          <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${value * 100}%` }}
              className={`h-full ${
                key === "handReduction"
                  ? "bg-blue-500"
                  : key === "strategicValue"
                  ? "bg-green-500"
                  : "bg-yellow-500"
              }`}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

const MultiCardPlays = ({ onComplete, gameRef }) => {
  const [currentLesson, setCurrentLesson] = useState(
    "suitCombinationStrategies"
  );
  const [currentScenario, setCurrentScenario] = useState(0);
  const [selectedCards, setSelectedCards] = useState([]);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showEfficiencyMetrics, setShowEfficiencyMetrics] = useState(false);

  const lesson = LESSON_CONFIGS[currentLesson];
  const scenario = lesson.scenarios[currentScenario];

  const handleCardClick = (card) => {
    if (isAnimating) return;

    // Toggle card selection
    const isCardSelected = selectedCards.includes(card);
    let newSelectedCards;

    if (isCardSelected) {
      // Remove the card if already selected
      newSelectedCards = selectedCards.filter((c) => c !== card);
    } else {
      // Add the card, ensuring only same-rank cards are selected
      const rankToMatch = card[0];
      newSelectedCards = isCardSelected
        ? selectedCards.filter((c) => c !== card)
        : [...selectedCards.filter((c) => c[0] === rankToMatch), card];
    }

    setSelectedCards(newSelectedCards);
    setFeedback(null);
  };

  const handlePlayCards = async () => {
    if (selectedCards.length < 2 || isAnimating) return;
    setIsAnimating(true);

    try {
      // Validate the play
      const isValid = scenario.setup.validMoves.some(
        (validMove) =>
          validMove.length === selectedCards.length &&
          validMove.every((card) => selectedCards.includes(card))
      );

      const isOptimal =
        JSON.stringify(selectedCards.sort()) ===
        JSON.stringify(scenario.setup.optimalMove.sort());

      if (!isValid) {
        setFeedback({
          type: "error",
          message: "Invalid card combination. Cards must be of the same rank.",
        });
        return;
      }

      // Animate card play
      if (gameRef.current) {
        await gameRef.current.playCards(selectedCards);
      }

      // Calculate points
      const pointsEarned = isOptimal
        ? lesson.points / lesson.scenarios.length
        : (lesson.points / lesson.scenarios.length) * 0.7;

      setScore((prev) => prev + pointsEarned);
      setFeedback({
        type: "success",
        message: isOptimal
          ? "Perfect multi-card play!"
          : "Valid card combination",
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
    setShowEfficiencyMetrics(false);
    if (gameRef.current) {
      gameRef.current.resetScenario(scenario.setup);
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

          {/* Efficiency Metrics */}
          {scenario.setup.efficiencyMetrics && showEfficiencyMetrics && (
            <EfficiencyMeter metrics={scenario.setup.efficiencyMetrics} />
          )}

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
                  <span>{scenario.explanation}</span>
                </div>

                {scenario.teachingPoints &&
                  scenario.teachingPoints.map((point, index) => (
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

                {scenario.setup.efficiencyMetrics && (
                  <button
                    onClick={() =>
                      setShowEfficiencyMetrics(!showEfficiencyMetrics)
                    }
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                             bg-gray-700 hover:bg-gray-600 text-gray-300
                             hover:text-white transition-colors text-sm"
                  >
                    <Info className="w-4 h-4" />
                    {showEfficiencyMetrics ? "Hide" : "Show"} Metrics
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="text-white font-medium">
                {score.toFixed(1)} / 7 points
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
                {scenario.hint}
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
            disabled={selectedCards.length < 2 || isAnimating}
            className="px-6 py-2 rounded-lg bg-primary hover:bg-primary/90
                     text-white font-medium disabled:opacity-50
                     disabled:cursor-not-allowed transition-colors"
          >
            Play Cards
          </button>
        </div>

        {/* Category Progress Indicators */}
        <div className="fixed bottom-4 left-4 right-4 flex justify-center gap-2">
          {Object.keys(LESSON_CONFIGS).map((lessonKey) => (
            <div
              key={lessonKey}
              className={`h-1 rounded-full transition-all duration-300 ${
                lessonKey === currentLesson
                  ? "w-8 bg-primary"
                  : lessonKey < currentLesson
                  ? "w-4 bg-primary/80"
                  : "w-4 bg-gray-700"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MultiCardPlays;
