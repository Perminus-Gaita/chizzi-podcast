"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ChevronLeft,
  Star,
  Trophy,
  Brain,
  ArrowRight,
} from "lucide-react";

const LESSONS = {
  queenSequences: {
    title: "Queen→Queen Sequences",
    description: "Learn how Queens connect across any suits",
    points: 2,
    scenarios: [
      {
        id: "basic-queens",
        title: "Basic Queen Connection",
        description: "Connect Queens of different suits",
        setup: {
          playerHand: ["QH", "QD", "4H", "5D"],
          topCard: "4H",
          opponentCards: [4, 4],
          validSequences: [["QH", "QD"]],
          optimalPlay: ["QH", "QD"],
          hint: "Queens can connect regardless of suit!",
          teachingPoints: [
            "Queens connect across any suits",
            "Playing multiple Queens increases pressure",
          ],
        },
      },
      {
        id: "triple-queens",
        title: "Triple Queen Chain",
        setup: {
          playerHand: ["QH", "QD", "QS", "4H"],
          topCard: "4H",
          opponentCards: [4, 4],
          validSequences: [["QH", "QD", "QS"]],
          optimalPlay: ["QH", "QD", "QS"],
          hint: "Try chaining all three Queens together!",
        },
      },
    ],
  },
  eightSequences: {
    title: "Eight→Eight Sequences",
    description: "Master connecting Eights across suits",
    points: 2,
    scenarios: [
      {
        id: "basic-eights",
        title: "Basic Eight Chain",
        setup: {
          playerHand: ["8H", "8D", "4H", "5D"],
          topCard: "4H",
          opponentCards: [4, 4],
          validSequences: [["8H", "8D"]],
          optimalPlay: ["8H", "8D"],
          hint: "Eights follow the same connection rules as Queens",
        },
      },
    ],
  },
  mixedSequences: {
    title: "Mixed Q→8 Same-Suit Sequences",
    description: "Learn suit-matching requirements",
    points: 2,
    scenarios: [
      {
        id: "basic-mixed",
        title: "Same Suit Q→8",
        setup: {
          playerHand: ["QH", "8H", "QD", "8S"],
          topCard: "4H",
          opponentCards: [4, 4],
          validSequences: [["QH", "8H"]],
          optimalPlay: ["QH", "8H"],
          hint: "Q→8 sequences must match suits!",
        },
      },
    ],
  },
  masterChallenge: {
    title: "Sequence Master Challenge",
    description: "Test your sequence mastery",
    points: 1,
    scenarios: [
      {
        id: "spot-sequence",
        title: "Spot the Sequence",
        setup: {
          playerHand: ["QH", "QD", "8H", "8D", "QS"],
          topCard: "4H",
          opponentCards: [2, 2],
          validSequences: [
            ["QH", "QD", "QS"],
            ["8H", "8D"],
            ["QH", "8H"],
          ],
          optimalPlay: ["QH", "QD", "QS"],
          hint: "Find the longest valid sequence",
        },
      },
    ],
  },
};

// Renders the visual connection line between sequence cards
const SequenceLine = ({ startCard, endCard, isValid, animate }) => {
  return (
    <svg className="absolute inset-0 pointer-events-none z-10">
      <motion.path
        initial={animate ? { pathLength: 0 } : { pathLength: 1 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5 }}
        d={`M ${startCard.x} ${startCard.y} L ${endCard.x} ${endCard.y}`}
        stroke={isValid ? "#4ade80" : "#ef4444"}
        strokeWidth="2"
        fill="none"
        strokeDasharray="4"
      />
    </svg>
  );
};

const SimpleCardSequences = ({ onComplete, gameRef }) => {
  const [currentLesson, setCurrentLesson] = useState("queenSequences");
  const [currentScenario, setCurrentScenario] = useState(0);
  const [selectedCards, setSelectedCards] = useState([]);
  const [points, setPoints] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [connections, setConnections] = useState([]);

  const lesson = LESSONS[currentLesson];
  const scenario = lesson.scenarios[currentScenario];

  const handleCardClick = (card) => {
    if (selectedCards.includes(card)) {
      setSelectedCards((prev) => prev.filter((c) => c !== card));
    } else {
      const newSelection = [...selectedCards, card];
      setSelectedCards(newSelection);

      // Update visual connections
      if (newSelection.length >= 2) {
        const isValid = validateSequence(newSelection);
        setConnections((prev) => [
          ...prev,
          {
            start: newSelection[newSelection.length - 2],
            end: newSelection[newSelection.length - 1],
            valid: isValid,
          },
        ]);
      }
    }
  };

  const validateSequence = (cards) => {
    return scenario.setup.validSequences.some(
      (validSeq) =>
        cards.length === validSeq.length &&
        cards.every((card, i) => card === validSeq[i])
    );
  };

  const handlePlaySequence = async () => {
    if (!selectedCards.length) return;

    const isValid = validateSequence(selectedCards);
    const isOptimal =
      JSON.stringify(selectedCards) ===
      JSON.stringify(scenario.setup.optimalPlay);

    if (!isValid) {
      setFeedback({
        type: "error",
        message: "Invalid sequence. Check the connection rules.",
      });
      return;
    }

    try {
      // Animate sequence play
      if (gameRef.current) {
        await gameRef.current.playSequence(selectedCards);
      }

      // Award points
      const earnedPoints = isOptimal
        ? lesson.points / lesson.scenarios.length
        : (lesson.points / lesson.scenarios.length) * 0.7;

      setPoints((prev) => prev + earnedPoints);
      setFeedback({
        type: "success",
        message: isOptimal ? "Perfect sequence!" : "Valid sequence!",
        points: earnedPoints,
      });

      // Progress
      setTimeout(() => {
        if (currentScenario < lesson.scenarios.length - 1) {
          setCurrentScenario((prev) => prev + 1);
        } else {
          const lessons = Object.keys(LESSONS);
          const currentIndex = lessons.indexOf(currentLesson);
          if (currentIndex < lessons.length - 1) {
            setCurrentLesson(lessons[currentIndex + 1]);
            setCurrentScenario(0);
          } else {
            onComplete(points + earnedPoints);
          }
        }
        resetState();
      }, 1500);
    } catch (error) {
      setFeedback({
        type: "error",
        message: "Error playing sequence",
      });
    }
  };

  const resetState = () => {
    setSelectedCards([]);
    setConnections([]);
    setShowHint(false);
    setFeedback(null);
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Progress Header */}
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

          {/* Connection Lines */}
          {connections.map((connection, index) => (
            <SequenceLine
              key={index}
              startCard={connection.start}
              endCard={connection.end}
              isValid={connection.valid}
              animate={true}
            />
          ))}

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
                    <ArrowRight className="w-4 h-4 text-primary" />
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
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="text-white font-medium">
                {points.toFixed(1)} / 7 points
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
            onClick={resetState}
            className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600
                     text-gray-300 hover:text-white transition-colors"
          >
            Reset
          </button>

          <button
            onClick={handlePlaySequence}
            disabled={selectedCards.length < 2}
            className="px-6 py-2 rounded-lg bg-primary hover:bg-primary/90
                     text-white font-medium disabled:opacity-50
                     disabled:cursor-not-allowed transition-colors"
          >
            Play Sequence
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleCardSequences;
