"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Timer,
  Brain,
  ChevronRight,
  ChevronLeft,
  Star,
  Trophy,
  RotateCcw,
  AlertCircle,
  Info,
} from "lucide-react";

const LESSON_CONFIGS = {
  maximumImpact: {
    title: "Maximum Impact Sequences",
    description: "Master building powerful Question Card sequences",
    points: 2,
    scenarios: [
      {
        id: "building-blocks",
        title: "Building Blocks",
        description: "Learn fundamental sequence construction",
        setup: {
          playerHand: ["QS", "QH", "8C", "8D", "KS", "7H"],
          visibleCards: ["QC", "8S"],
          opponentCards: 4,
          targetSequences: [
            ["QS", "QH", "8C", "8D"],
            ["QS", "8C", "QH", "8D"],
          ],
          optimalSequence: ["QS", "QH", "8C", "8D"],
          teachingPoints: [
            "Cross-suit sequences offer maximum flexibility",
            "Build sequences that maintain suit control",
            "Consider remaining cards in play",
          ],
        },
      },
      {
        id: "sequence-recognition",
        title: "Quick Recognition",
        description: "Identify valid sequences under pressure",
        timeLimit: 30,
        setup: {
          sequences: [
            {
              cards: ["QH", "8H", "QS", "8D"],
              valid: true,
              power: 0.8,
            },
            {
              cards: ["QH", "QS", "8H", "8S"],
              valid: true,
              power: 1.0,
            },
            {
              cards: ["8H", "8S", "QH", "QD"],
              valid: true,
              power: 0.7,
            },
          ],
        },
      },
    ],
  },
  sequenceTiming: {
    title: "Sequence Timing",
    description: "Master when to hold and when to play sequences",
    points: 2,
    scenarios: [
      {
        id: "hold-or-play",
        title: "Hold or Play",
        description: "Choose optimal timing for sequence execution",
        setup: {
          playerHand: ["QS", "QH", "8S", "8H", "AC", "7D"],
          gameState: "mid-game",
          opponentPatterns: [
            {
              style: "aggressive",
              description: "Plays sequences early",
            },
            {
              style: "conservative",
              description: "Holds sequences for late game",
            },
          ],
          decisionPoints: [
            {
              timing: "early",
              risk: 0.7,
              reward: 0.4,
            },
            {
              timing: "mid",
              risk: 0.5,
              reward: 0.6,
            },
            {
              timing: "late",
              risk: 0.3,
              reward: 0.8,
            },
          ],
        },
      },
      {
        id: "reading-game",
        title: "Reading Opponents",
        description: "Predict and counter opponent sequences",
        setup: {
          opponentHand: 5,
          playedCards: ["QH", "8H", "QD", "KS"],
          patterns: {
            suitPreference: "hearts",
            sequenceStyle: "aggressive",
            timing: "early-game",
          },
        },
      },
    ],
  },
};

// Sequence Visualization
const SequenceVisualizer = ({ sequence, isValid, power }) => {
  return (
    <div className="relative flex gap-2 items-center">
      {sequence.map((card, index) => (
        <motion.div
          key={card}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="relative"
        >
          <img
            src={`/cards/${card}.png`}
            alt={card}
            className={`w-24 h-36 object-contain rounded-lg 
                       ${isValid ? "border-2 border-green-500" : ""}`}
          />
          {index < sequence.length - 1 && (
            <ChevronRight className="absolute -right-4 top-1/2 -translate-y-1/2 text-white/50" />
          )}
        </motion.div>
      ))}
      {power && (
        <div className="absolute -top-8 left-0 right-0 flex justify-center">
          <div className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-300 text-sm">
            Power: {(power * 100).toFixed(0)}%
          </div>
        </div>
      )}
    </div>
  );
};

// Timer Component
const CountdownTimer = ({ seconds, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onComplete]);

  return (
    <div className="absolute top-4 right-4 flex items-center gap-2">
      <Timer className="w-5 h-5 text-red-400" />
      <span className="text-xl font-bold text-white">{timeLeft}s</span>
    </div>
  );
};

// Main Tutorial Component
const ComplexQuestionSequences = ({ onComplete, gameRef }) => {
  const [currentLesson, setCurrentLesson] = useState("maximumImpact");
  const [currentScenario, setCurrentScenario] = useState(0);
  const [selectedCards, setSelectedCards] = useState([]);
  const [sequence, setSequence] = useState([]);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [isTimerActive, setIsTimerActive] = useState(false);

  const lesson = LESSON_CONFIGS[currentLesson];
  const scenario = lesson.scenarios[currentScenario];

  // Sequence validation
  const validateSequence = (cards) => {
    // Basic sequence rules
    if (cards.length < 2) return false;

    // Check if all cards are Questions/Eights
    const isValidCardType = cards.every(
      (card) => card[0] === "Q" || card[0] === "8"
    );

    // Check suit matching for adjacent Q-8 pairs
    for (let i = 0; i < cards.length - 1; i++) {
      if (
        (cards[i][0] === "Q" && cards[i + 1][0] === "8") ||
        (cards[i][0] === "8" && cards[i + 1][0] === "Q")
      ) {
        if (cards[i][1] !== cards[i + 1][1]) return false;
      }
    }

    return isValidCardType;
  };

  // Handle card selection
  const handleCardClick = (card) => {
    if (selectedCards.includes(card)) {
      setSelectedCards((prev) => prev.filter((c) => c !== card));
    } else {
      setSelectedCards((prev) => [...prev, card]);
    }
  };

  // Handle sequence submission
  const handleSubmitSequence = async () => {
    if (!validateSequence(selectedCards)) {
      setFeedback({
        type: "error",
        message: "Invalid sequence. Check suit matching rules.",
      });
      return;
    }

    const isOptimal =
      scenario.setup.optimalSequence &&
      JSON.stringify(selectedCards.sort()) ===
        JSON.stringify(scenario.setup.optimalSequence.sort());

    // Calculate points
    const pointsEarned = isOptimal
      ? lesson.points / lesson.scenarios.length
      : (lesson.points / lesson.scenarios.length) * 0.7;

    setScore((prev) => prev + pointsEarned);

    // Animate sequence if game ref available
    if (gameRef?.current) {
      await gameRef.current.playSequence(selectedCards);
    }

    // Progress to next scenario
    setTimeout(() => {
      if (currentScenario < lesson.scenarios.length - 1) {
        setCurrentScenario((prev) => prev + 1);
      } else if (currentLesson === "maximumImpact") {
        setCurrentLesson("sequenceTiming");
        setCurrentScenario(0);
      } else {
        onComplete(score + pointsEarned);
      }
      setSelectedCards([]);
      setFeedback(null);
      setShowHint(false);
    }, 1500);
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Progress Indicator */}
        <div className="grid grid-cols-2 gap-2 mb-12">
          {Object.entries(LESSON_CONFIGS).map(([key, value]) => (
            <div key={key} className="space-y-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  key === currentLesson
                    ? "bg-primary animate-pulse"
                    : key === "maximumImpact" &&
                      currentLesson === "sequenceTiming"
                    ? "bg-primary/80"
                    : "bg-gray-700"
                }`}
              />
              <div className="flex justify-between items-center px-1">
                <span className="text-sm text-gray-400">{value.title}</span>
                <span className="text-sm text-primary">{value.points}p</span>
              </div>
            </div>
          ))}
        </div>

        {/* Scenario Content */}
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-white">{scenario.title}</h2>
            <p className="text-gray-400">{scenario.description}</p>
          </div>

          {/* Game Area */}
          <div className="relative aspect-video bg-gray-800/50 rounded-xl overflow-hidden">
            {isTimerActive && (
              <CountdownTimer
                seconds={scenario.timeLimit}
                onComplete={() => setIsTimerActive(false)}
              />
            )}

            {/* Sequence Visualization */}
            {selectedCards.length > 0 && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <SequenceVisualizer
                  sequence={selectedCards}
                  isValid={validateSequence(selectedCards)}
                  power={0.8} // Calculate based on sequence
                />
              </div>
            )}

            {/* Feedback */}
            <AnimatePresence>
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg ${
                    feedback.type === "success" ? "bg-green-500" : "bg-red-500"
                  } text-white shadow-lg`}
                >
                  {feedback.message}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Teaching Points */}
          <div className="bg-gray-800/50 rounded-xl p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-4">
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
                  {scenario.setup.hint ||
                    "Focus on building cross-suit sequences for maximum impact."}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action Area */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="text-white font-medium">
                {score.toFixed(1)} / 4 points
              </span>
            </div>

            <button
              onClick={handleSubmitSequence}
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
    </div>
  );
};

export default ComplexQuestionSequences;
