"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Brain,
  RotateCcw,
  ArrowRight,
  Zap,
  AlertTriangle,
  BarChart3,
  Eye,
} from "lucide-react";

const LESSONS = {
  organization: {
    title: "Hand Organization",
    description: "Learn optimal card arrangement strategies",
    points: 1,
    scenarios: [
      {
        id: "suit-organization",
        title: "Sort by Suit",
        setup: {
          playerHand: ["4H", "QS", "8H", "5D", "KH", "6H", "QH"],
          opponentCards: [5, 5],
          validArrangements: [
            // Hearts together
            ["4H", "8H", "6H", "KH", "QH", "QS", "5D"],
          ],
          potentialCombos: {
            sequences: [["QH", "QS"]],
            suitGroups: [["4H", "8H", "6H", "KH", "QH"]],
            questionAnswers: [
              ["QH", "4H"],
              ["QH", "6H"],
              ["QH", "8H"],
            ],
          },
          hint: "Group your Hearts together for easier suit matching",
        },
      },
      {
        id: "type-organization",
        title: "Sort by Card Type",
        setup: {
          playerHand: ["4H", "QS", "8H", "QD", "KH", "QH", "8S"],
          opponentCards: [5, 5],
          validArrangements: [
            // Questions together, then Answers
            ["QS", "QD", "QH", "8H", "8S", "4H", "KH"],
          ],
          potentialCombos: {
            sequences: [
              ["QS", "QD", "QH"],
              ["8H", "8S"],
            ],
            questionAnswers: [["QH", "4H"]],
          },
          hint: "Group Questions and Eights together to see sequence opportunities",
        },
      },
    ],
  },
  holdVsPlay: {
    title: "Strategic Hold vs Play",
    description: "Learn when to hold cards for better opportunities",
    points: 2,
    scenarios: [
      {
        id: "save-for-combo",
        title: "Building Combinations",
        setup: {
          playerHand: ["4H", "QH", "5D", "QD", "6H", "8H"],
          topCard: "4D",
          opponentCards: [6, 6],
          validPlays: ["4H", "QH", "QD"],
          optimalPlay: null, // Better to hold
          explanation:
            "Hold your Queens - opponent has many cards, no immediate pressure",
          hint: "Consider building a stronger sequence instead of playing immediately",
        },
      },
      {
        id: "pressure-play",
        title: "Playing Under Pressure",
        setup: {
          playerHand: ["4H", "QH", "5D", "QD", "6H", "8H"],
          topCard: "4D",
          opponentCards: [2, 2],
          validPlays: ["4H", "QH", "QD"],
          optimalPlay: ["QH", "QD"],
          explanation:
            "Opponents are close to winning - time to use your strong cards",
          hint: "Opponent card counts suggest immediate action needed",
        },
      },
    ],
  },
  drawVsPlay: {
    title: "Draw vs Play Decisions",
    description: "Master when to build your hand vs play cards",
    points: 1,
    scenarios: [
      {
        id: "build-hand",
        title: "Building a Stronger Hand",
        setup: {
          playerHand: ["4H", "5D", "6H", "QH"],
          topCard: "8D",
          opponentCards: [7, 7],
          drawPileSize: 20,
          recommendation: "draw",
          explanation:
            "Large draw pile and no pressure - good time to improve hand",
          hint: "Look for opportunities to build sequences with your Question card",
        },
      },
    ],
  },
  efficiency: {
    title: "Hand Efficiency Challenge",
    description: "Optimize your hand for maximum effectiveness",
    points: 1,
    scenarios: [
      {
        id: "efficiency-master",
        title: "Complete Hand Management",
        setup: {
          playerHand: ["4H", "QH", "5D", "QD", "6H", "8H", "KS", "3D"],
          topCard: "4D",
          opponentCards: [3, 4],
          drawPileSize: 12,
          validPlays: ["4H", "QH", "QD"],
          efficiencyMetrics: {
            sequencePotential: 0.7,
            counterPlayOptions: 0.3,
            suitCoverage: 0.5,
          },
          hint: "Balance immediate plays against future opportunities",
        },
      },
    ],
  },
};

// Visualizes potential card combinations
const ComboHighlight = ({ cards, type }) => {
  const colors = {
    sequence: "rgb(59, 130, 246)", // Blue
    suitGroup: "rgb(16, 185, 129)", // Green
    questionAnswer: "rgb(245, 158, 11)", // Yellow
  };

  return (
    <svg className="absolute inset-0 pointer-events-none z-10">
      <motion.path
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.6 }}
        transition={{ duration: 0.5 }}
        // d={/* Generate path between card positions */}
        stroke={colors[type]}
        strokeWidth="2"
        fill="none"
        strokeDasharray="4"
      />
    </svg>
  );
};

// Displays efficiency metrics
const EfficiencyMeter = ({ metrics }) => (
  <div className="absolute top-4 right-4 bg-gray-800/90 rounded-lg p-4 space-y-2">
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-gray-400">Sequence Potential</span>
      <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${metrics.sequencePotential * 100}%` }}
          className="h-full bg-blue-500"
        />
      </div>
    </div>
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-gray-400">Counter Options</span>
      <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${metrics.counterPlayOptions * 100}%` }}
          className="h-full bg-green-500"
        />
      </div>
    </div>
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-gray-400">Suit Coverage</span>
      <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${metrics.suitCoverage * 100}%` }}
          className="h-full bg-yellow-500"
        />
      </div>
    </div>
  </div>
);

const HandManagement = ({ onComplete, gameRef }) => {
  const [currentLesson, setCurrentLesson] = useState("organization");
  const [currentScenario, setCurrentScenario] = useState(0);
  const [handArrangement, setHandArrangement] = useState([]);
  const [selectedAction, setSelectedAction] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [points, setPoints] = useState(0);
  const [showEfficiencyMetrics, setShowEfficiencyMetrics] = useState(false);

  const lesson = LESSONS[currentLesson];
  const scenario = lesson.scenarios[currentScenario];

  // Handle card dragging for organization
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(handArrangement);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setHandArrangement(items);
    validateArrangement(items);
  };

  // Validate current hand arrangement
  const validateArrangement = (arrangement) => {
    if (
      scenario.setup.validArrangements.some(
        (valid) => JSON.stringify(arrangement) === JSON.stringify(valid)
      )
    ) {
      setFeedback({
        type: "success",
        message: "Perfect organization!",
        points: lesson.points / lesson.scenarios.length,
      });
      progressTutorial();
    }
  };

  // Handle strategic decisions
  const handleDecision = async (action) => {
    setSelectedAction(action);

    if (currentLesson === "holdVsPlay") {
      const isOptimal = action === scenario.setup.optimalPlay;
      handleResult(isOptimal);
    } else if (currentLesson === "drawVsPlay") {
      const isOptimal = action === scenario.setup.recommendation;
      handleResult(isOptimal);
    }
  };

  const handleResult = (isOptimal) => {
    const pointsEarned = isOptimal
      ? lesson.points / lesson.scenarios.length
      : (lesson.points / lesson.scenarios.length) * 0.5;

    setPoints((prev) => prev + pointsEarned);
    setFeedback({
      type: isOptimal ? "success" : "warning",
      message: isOptimal
        ? "Perfect decision!"
        : "Good attempt, but there was a better play",
      points: pointsEarned,
    });

    setTimeout(progressTutorial, 1500);
  };

  const progressTutorial = () => {
    if (currentScenario < lesson.scenarios.length - 1) {
      setCurrentScenario((prev) => prev + 1);
    } else {
      const lessons = Object.keys(LESSONS);
      const currentIndex = lessons.indexOf(currentLesson);
      if (currentIndex < lessons.length - 1) {
        setCurrentLesson(lessons[currentIndex + 1]);
        setCurrentScenario(0);
      } else {
        onComplete(points);
      }
    }
    resetState();
  };

  const resetState = () => {
    setHandArrangement(scenario.setup.playerHand);
    setSelectedAction(null);
    setShowHint(false);
    setFeedback(null);
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Progress Tracker */}
        <div className="grid grid-cols-4 gap-2 mb-8">
          {Object.entries(LESSONS).map(([key, value]) => (
            <div key={key} className="relative">
              <div
                className={`h-2 rounded-full transition-colors duration-300 ${
                  key === currentLesson
                    ? "bg-primary animate-pulse"
                    : Object.keys(LESSONS).indexOf(key) <
                      Object.keys(LESSONS).indexOf(currentLesson)
                    ? "bg-primary/80"
                    : "bg-gray-700"
                }`}
              />
              <div className="flex items-center justify-between px-1 mt-2">
                <span className="text-xs text-gray-400">{value.title}</span>
                <span className="text-xs text-primary">{value.points}p</span>
              </div>
            </div>
          ))}
        </div>

        {/* Lesson Header */}
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-2xl font-bold text-white">{scenario.title}</h2>
          <p className="text-gray-400">{scenario.description}</p>
        </div>

        {/* Game Area */}
        <div className="relative aspect-video bg-gray-800/50 rounded-xl overflow-hidden mb-8">
          {/* Game canvas renders here */}

          {/* Combo Highlights */}
          {scenario.setup.potentialCombos?.sequences.map((seq, i) => (
            <ComboHighlight key={`seq-${i}`} cards={seq} type="sequence" />
          ))}

          {/* Efficiency Metrics */}
          {showEfficiencyMetrics && scenario.setup.efficiencyMetrics && (
            <EfficiencyMeter metrics={scenario.setup.efficiencyMetrics} />
          )}

          {/* Feedback Display */}
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
                              : feedback.type === "warning"
                              ? "bg-yellow-500"
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

        {/* Action Area */}
        <div className="bg-gray-800/50 rounded-xl p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-4">
              {/* Teaching Points */}
              {scenario.setup.explanation && (
                <div className="flex items-center gap-2 text-gray-300">
                  <Brain className="w-4 h-4 text-primary" />
                  <span>{scenario.setup.explanation}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {currentLesson === "organization" && (
                  <button
                    onClick={() =>
                      setShowEfficiencyMetrics(!showEfficiencyMetrics)
                    }
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                             bg-gray-700 hover:bg-gray-600 text-gray-300
                             hover:text-white transition-colors text-sm"
                  >
                    <BarChart3 className="w-4 h-4" />
                    {showEfficiencyMetrics ? "Hide" : "Show"} Metrics
                  </button>
                )}

                {currentLesson === "holdVsPlay" && (
                  <>
                    <button
                      onClick={() => handleDecision("hold")}
                      disabled={selectedAction}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg
                               bg-blue-500/20 hover:bg-blue-500/30 text-blue-300
                               disabled:opacity-50 disabled:cursor-not-allowed
                               transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Hold Cards
                    </button>
                    <button
                      onClick={() => handleDecision("play")}
                      disabled={selectedAction}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg
                               bg-green-500/20 hover:bg-green-500/30 text-green-300
                               disabled:opacity-50 disabled:cursor-not-allowed
                               transition-colors"
                    >
                      <Zap className="w-4 h-4" />
                      Play Now
                    </button>
                  </>
                )}

                {currentLesson === "drawVsPlay" && (
                  <>
                    <button
                      onClick={() => handleDecision("draw")}
                      disabled={selectedAction}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg
                               bg-blue-500/20 hover:bg-blue-500/30 text-blue-300
                               disabled:opacity-50 disabled:cursor-not-allowed
                               transition-colors"
                    >
                      <ArrowRight className="w-4 h-4" />
                      Draw Card
                    </button>
                    <button
                      onClick={() => handleDecision("play")}
                      disabled={selectedAction}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg
                               bg-green-500/20 hover:bg-green-500/30 text-green-300
                               disabled:opacity-50 disabled:cursor-not-allowed
                               transition-colors"
                    >
                      <Zap className="w-4 h-4" />
                      Play Card
                    </button>
                  </>
                )}

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
                  onClick={resetState}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                           bg-gray-700 hover:bg-gray-600 text-gray-300
                           hover:text-white transition-colors text-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              </div>

              {/* Hint Display */}
              <AnimatePresence>
                {showHint && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="p-4 bg-gray-700 rounded-lg text-sm text-gray-300"
                  >
                    {scenario.setup.hint}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Points Display */}
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="text-white font-medium">
                {points.toFixed(1)} / 5 points
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={() => onComplete(points)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg
                     bg-gray-700 hover:bg-gray-600 text-gray-300
                     hover:text-white transition-colors"
          >
            Skip Tutorial
          </button>

          {currentLesson === "organization" && (
            <button
              onClick={() =>
                handleDragEnd({
                  source: { index: 0 },
                  destination: { index: 1 },
                })
              }
              className="px-6 py-2 rounded-lg bg-primary hover:bg-primary/90
                       text-white font-medium disabled:opacity-50
                       disabled:cursor-not-allowed transition-colors"
            >
              Validate Arrangement
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HandManagement;
