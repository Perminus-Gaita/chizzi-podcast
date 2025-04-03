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
  penaltyBasics: {
    title: "Penalty Card Basics",
    description: "Learn how Penalty Cards work",
    points: 2,
    scenarios: [
      {
        id: "two-card-intro",
        title: "Understanding 2 Card Penalties",
        description: "Learn how 2 cards trigger penalties",
        setup: {
          topCard: "2H",
          playerHand: ["4S", "6D", "9C", "AH"],
          opponentCards: [4, 4],
          penaltyType: "two",
          validMoves: ["AH"],
          optimalMove: "AH",
          hint: "A 2 card forces the next player to draw 2 cards",
          explanation: "2 cards are Penalty Cards that require the next player to draw 2 cards",
          consequences: {
            cardsToDraw: 2,
            preventionOptions: ["Another 2 card", "Joker", "Ace"]
          }
        }
      },
      {
        id: "three-card-intro",
        title: "Three Card Penalties",
        description: "Explore how 3 cards work",
        setup: {
          topCard: "3D",
          playerHand: ["4S", "6D", "9C", "AH"],
          opponentCards: [4, 4],
          penaltyType: "three",
          validMoves: ["AH"],
          optimalMove: "AH",
          hint: "A 3 card forces the next player to draw 3 cards",
          explanation: "3 cards are Penalty Cards that require the next player to draw 3 cards",
          consequences: {
            cardsToDraw: 3,
            preventionOptions: ["Another 3 card", "Joker", "Ace"]
          }
        }
      }
    ]
  },
  penaltyMitigation: {
    title: "Penalty Mitigation Strategies",
    description: "Learn to defend against and forward penalties",
    points: 2,
    scenarios: [
      {
        id: "forward-penalty",
        title: "Forwarding Penalties",
        description: "Learn to pass penalties to other players",
        setup: {
          topCard: "2H",
          playerHand: ["2D", "4S", "6D", "9C"],
          opponentCards: [3, 3],
          penaltyType: "two",
          validMoves: ["2D"],
          optimalMove: "2D",
          hint: "You can forward a 2 card penalty to the next player",
          explanation: "Matching Penalty Cards can forward the penalty to the next player",
          consequences: {
            cardsToDraw: 2,
            forwardPossible: true
          }
        }
      },
      {
        id: "joker-forward",
        title: "Joker Penalty Forwarding",
        description: "Use Jokers to manage penalties",
        setup: {
          topCard: "2H",
          playerHand: ["JOK", "4S", "6D", "9C"],
          opponentCards: [3, 3],
          penaltyType: "two",
          validMoves: ["JOK"],
          optimalMove: "JOK",
          hint: "Jokers can forward penalties to the next player",
          explanation: "Jokers provide a powerful way to forward penalties",
          consequences: {
            cardsToDraw: 5,
            forwardPossible: true
          }
        }
      }
    ]
  },
  advancedPenaltyManagement: {
    title: "Advanced Penalty Management",
    description: "Master complex penalty scenarios",
    points: 2,
    scenarios: [
      {
        id: "multi-penalty-challenge",
        title: "Multi-Penalty Scenario",
        description: "Manage multiple penalty risks",
        setup: {
          topCard: "2H",
          playerHand: ["2D", "3S", "JOK", "AH"],
          opponentCards: [2, 2],
          penaltyType: "multiple",
          validMoves: ["AH", "2D", "3S", "JOK"],
          optimalMove: "AH",
          hint: "Consider the best way to minimize your card draw",
          explanation: "Strategic card selection can help you avoid or minimize penalties",
          consequences: {
            potentialCardsToDraw: 10,
            preventionOptions: ["Ace", "Matching Penalty Cards", "Joker"]
          }
        }
      },
      {
        id: "high-stakes-penalty",
        title: "High-Stakes Penalty Management",
        description: "Navigate a complex penalty situation",
        setup: {
          topCard: "3H",
          playerHand: ["2D", "JOK", "AS", "7H"],
          opponentCards: [1, 1],
          penaltyType: "high-stakes",
          validMoves: ["AS", "JOK"],
          optimalMove: "AS",
          hint: "Choose wisely to minimize your disadvantage",
          explanation: "Sometimes blocking a penalty is more important than playing offensively",
          consequences: {
            potentialCardsToDraw: 5,
            gameStateImportance: "Critical"
          }
        }
      }
    ]
  }
};

const PenaltyCardDefense = ({ onComplete, gameRef }) => {
  const [currentLesson, setCurrentLesson] = useState("penaltyBasics");
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
      setSelectedCards(selectedCards.filter(c => c !== card));
    } else {
      // For this lesson, typically select single card
      setSelectedCards([card]);
    }
    setFeedback(null);
  };

  const handlePlayCards = async () => {
    if (selectedCards.length === 0 || isAnimating) return;
    setIsAnimating(true);

    try {
      // Validate the play
      const isValid = selectedCards.every(card => 
        scenario.setup.validMoves.includes(card)
      );

      const isOptimal = 
        JSON.stringify(selectedCards.sort()) === 
        JSON.stringify(scenario.setup.optimalMove.sort());

      if (!isValid) {
        setFeedback({
          type: "error",
          message: "Invalid card play for this penalty scenario",
        });
        return;
      }

      // Animate card play
      if (gameRef.current) {
        await gameRef.current.playPenaltyCards(selectedCards, scenario.setup);
      }

      // Calculate points
      const pointsEarned = isOptimal
        ? lesson.points / lesson.scenarios.length
        : (lesson.points / lesson.scenarios.length) * 0.7;

      setScore(prev => prev + pointsEarned);
      setFeedback({
        type: "success",
        message: isOptimal 
          ? "Perfect penalty management!" 
          : "Valid penalty strategy",
        points: pointsEarned,
      });

      // Progress to next scenario
      setTimeout(() => {
        if (currentScenario < lesson.scenarios.length - 1) {
          setCurrentScenario(prev => prev + 1);
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

          {/* Penalty Consequences Overlay */}
          <div className="absolute bottom-4 left-4 bg-red-500/20 rounded-lg p-4 text-red-300">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>
                {scenario.setup.consequences?.cardsToDraw 
                  ? `Penalty: Draw ${scenario.setup.consequences.cardsToDraw} cards`
                  : scenario.setup.consequences?.potentialCardsToDraw
                  ? `Potential Penalty: Up to ${scenario.setup.consequences.potentialCardsToDraw} cards`
                  : "Penalty Scenario"}
              </span>
            </div>
            {scenario.setup.consequences?.preventionOptions && (
              <div className="mt-2 text-sm">
                Prevention Options: {scenario.setup.consequences.preventionOptions.join(", ")}
              </div>
            )}
          </div>

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
            Play Card{selectedCards.length > 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PenaltyCardDefense;