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
} from "lucide-react";

const LESSON_CONFIGS = {
  questionBasics: {
    title: "Understanding Question Cards",
    description: "Learn how Queens and Eights work with Answer cards",
    points: 2,
    scenarios: [
      {
        id: "queen-basic",
        title: "Queen + Answer Pairing",
        instruction: "Try to play the Queen of Hearts",
        setup: {
          topCard: "5H",
          playerHand: ["QH", "7H", "4S", "6D"],
          opponentCards: [4, 4],
          validPairs: [["QH", "7H"]],
          optimalPair: ["QH", "7H"],
          invalidAttempts: {
            QH: "Queens must be played with a matching Answer card!",
            "4S": "Must match the suit or rank of the top card",
          },
        },
      },
      {
        id: "eight-basic",
        title: "Eight + Answer Pairing",
        instruction: "Practice pairing an Eight with an Answer card",
        setup: {
          topCard: "6S",
          playerHand: ["8S", "7S", "QH", "6D"],
          opponentCards: [4, 4],
          validPairs: [["8S", "7S"]],
          optimalPair: ["8S", "7S"],
          tip: "Eights follow the same suit-matching rules as Queens",
        },
      },
    ],
  },
  suitMatching: {
    title: "Suit Matching Rules",
    description: "Master the suit requirements for Question-Answer pairs",
    points: 2,
    scenarios: [
      {
        id: "queen-suit-match",
        title: "Queen Suit Matching",
        instruction: "Match the Queen with a same-suit Answer card",
        setup: {
          topCard: "QH",
          playerHand: ["7H", "7S", "7D", "7C"],
          opponentCards: [4, 4],
          validPairs: [["QH", "7H"]],
          optimalPair: ["QH", "7H"],
          tip: "Only Hearts cards can match with a Hearts Queen",
        },
      },
      {
        id: "eight-suit-match",
        title: "Eight Suit Matching",
        instruction: "Find the correct Answer card for the Eight",
        setup: {
          topCard: "8S",
          playerHand: ["AS", "7H", "7D", "7C"],
          opponentCards: [4, 4],
          validPairs: [["8S", "AS"]],
          optimalPair: ["8S", "AS"],
          tip: "Eights must pair with an Answer card of the same suit",
        },
      },
    ],
  },
  strategy: {
    title: "Strategic Pair Selection",
    description: "Learn when and how to use your pairs effectively",
    points: 2,
    scenarios: [
      {
        id: "optimal-timing",
        title: "Timing Your Pairs",
        instruction: "Choose between multiple valid pairs",
        setup: {
          topCard: "5H",
          playerHand: ["QH", "7H", "8H", "AH"],
          opponentCards: [2, 2],
          validPairs: [
            ["QH", "7H"],
            ["8H", "AH"],
          ],
          optimalPair: ["8H", "AH"],
          tip: "Consider saving stronger pairs when opponents are low on cards",
        },
      },
      {
        id: "card-economy",
        title: "Card Economy",
        instruction: "Make the most efficient pair choice",
        setup: {
          topCard: "4S",
          playerHand: ["QS", "9S", "8S", "5S"],
          opponentCards: [4, 4],
          validPairs: [
            ["QS", "9S"],
            ["QS", "5S"],
            ["8S", "9S"],
            ["8S", "5S"],
          ],
          optimalPair: ["8S", "5S"],
          tip: "Use lower value Answer cards when possible",
        },
      },
    ],
  },
  pairMaster: {
    title: "Pair Master Challenge",
    description: "Test your Question-Answer pairing mastery",
    points: 1,
    scenarios: [
      {
        id: "master-challenge-1",
        title: "Challenge 1: Basic Pairing",
        instruction: "Make the most strategic pair play",
        setup: {
          topCard: "6H",
          playerHand: ["QH", "8H", "7H", "AH"],
          opponentCards: [3, 3],
          validPairs: [
            ["QH", "7H"],
            ["QH", "AH"],
            ["8H", "7H"],
            ["8H", "AH"],
          ],
          optimalPair: ["8H", "7H"],
          explanation: "Save the Queen and Ace for a more critical moment",
        },
      },
    ],
  },
};

const QuestionAnswerPairs = ({ onComplete, gameRef }) => {
  const [currentLesson, setCurrentLesson] = useState("questionBasics");
  const [currentScenario, setCurrentScenario] = useState(0);
  const [selectedCards, setSelectedCards] = useState([]);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [completedScenarios, setCompletedScenarios] = useState(new Set());
  const [isAnimating, setIsAnimating] = useState(false);

  const lesson = LESSON_CONFIGS[currentLesson];
  const scenario = lesson.scenarios[currentScenario];

  const handleCardClick = (card) => {
    if (isAnimating) return;

    // Handle Question card selection
    if (card.startsWith("Q") || card.startsWith("8")) {
      if (selectedCards.includes(card)) {
        setSelectedCards([]);
      } else {
        setSelectedCards([card]);
      }
      return;
    }

    // Handle Answer card selection
    if (
      selectedCards.length === 1 &&
      (selectedCards[0].startsWith("Q") || selectedCards[0].startsWith("8"))
    ) {
      if (selectedCards.includes(card)) {
        setSelectedCards([selectedCards[0]]);
      } else {
        setSelectedCards([selectedCards[0], card]);
      }
    } else {
      setSelectedCards([card]);
    }

    setFeedback(null);
  };

  const validatePair = (cards) => {
    // Check if it's a valid Question-Answer pair
    if (cards.length !== 2) return false;

    const [question, answer] = cards;
    if (!question.startsWith("Q") && !question.startsWith("8")) return false;

    // Check suit matching
    return question[1] === answer[1];
  };

  const handlePlayCards = async () => {
    if (selectedCards.length === 0 || isAnimating) return;
    setIsAnimating(true);

    try {
      // Handle single card invalid attempts
      if (selectedCards.length === 1) {
        const invalidMessage =
          scenario.setup.invalidAttempts?.[selectedCards[0]];
        if (invalidMessage) {
          setFeedback({
            type: "error",
            message: invalidMessage,
          });
          return;
        }
      }

      // Validate pair
      const isValidPair = scenario.setup.validPairs.some(
        (pair) =>
          pair.every((card) => selectedCards.includes(card)) &&
          selectedCards.every((card) => pair.includes(card))
      );

      const isOptimalPair = scenario.setup.optimalPair.every((card) =>
        selectedCards.includes(card)
      );

      if (!isValidPair) {
        setFeedback({
          type: "error",
          message: validatePair(selectedCards)
            ? "Invalid play for the current situation"
            : "Invalid Question-Answer pair",
        });
        return;
      }

      // Animate card play
      if (gameRef.current) {
        await gameRef.current.playCards(selectedCards);
      }

      // Award points and provide feedback
      let pointsEarned = 0;
      if (isOptimalPair) {
        pointsEarned = lesson.points / lesson.scenarios.length;
        setScore((prev) => prev + pointsEarned);
        setFeedback({
          type: "success",
          message: "Perfect pair! Optimal choice.",
          points: pointsEarned,
        });
      } else {
        pointsEarned = (lesson.points / lesson.scenarios.length) * 0.5;
        setScore((prev) => prev + pointsEarned);
        setFeedback({
          type: "warning",
          message:
            scenario.setup.explanation ||
            "Valid pair, but a better combination was possible.",
          points: pointsEarned,
        });
      }

      // Track completion
      setCompletedScenarios((prev) => new Set([...prev, scenario.id]));

      // Progress after delay
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
        <div className="flex items-center justify-between mb-8">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold text-white">{lesson.title}</h2>
            <p className="text-gray-400 text-sm">{scenario.title}</p>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            <span className="text-white font-medium">
              {score.toFixed(1)} / 7 points
            </span>
          </div>
        </div>

        {/* Game Area */}
        <div className="relative aspect-video bg-gray-800/50 rounded-xl overflow-hidden mb-8">
          {/* Game canvas renders here */}
          <h1>Canvas Here</h1>

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
                  {feedback.type === "error" && (
                    <AlertCircle className="w-4 h-4" />
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
              <p className="text-white">{scenario.instruction}</p>
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

            {scenario.setup.tip && (
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                           bg-blue-500/20 text-blue-300 text-sm"
              >
                <Info className="w-4 h-4" />
                <span>Strategy Tip</span>
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
                {scenario.setup.tip ||
                  "Remember: Question cards (Q/8) must be paired with Answer cards of the same suit to play"}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Connection Lines for Valid Pairs */}
        <div className="relative h-20 mb-8">
          {selectedCards.length === 1 &&
            (selectedCards[0].startsWith("Q") ||
              selectedCards[0].startsWith("8")) && (
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-primary text-sm text-center px-4 py-2 rounded-lg bg-primary/10"
                >
                  Select an Answer card of the same suit to complete the pair
                </motion.div>
              </div>
            )}
        </div>

        {/* Action Area */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => onComplete(score)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg
                       bg-gray-700 hover:bg-gray-600 text-gray-300
                       hover:text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
              Skip Lesson
            </button>

            {completedScenarios.size > 0 && (
              <span className="text-sm text-gray-400">
                {completedScenarios.size} / {scenario.setup.validPairs.length}{" "}
                pairs mastered
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            {selectedCards.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-700 text-gray-300">
                <span className="text-sm">
                  {selectedCards.length === 1
                    ? "Select Answer card"
                    : "Ready to play pair"}
                </span>
              </div>
            )}

            <button
              onClick={handlePlayCards}
              disabled={selectedCards.length === 0 || isAnimating}
              className="px-6 py-2 rounded-lg bg-primary hover:bg-primary/90
                       text-white font-medium disabled:opacity-50
                       disabled:cursor-not-allowed transition-colors"
            >
              Play {selectedCards.length === 2 ? "Pair" : "Card"}
            </button>
          </div>
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

export default QuestionAnswerPairs;
