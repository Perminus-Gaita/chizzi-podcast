"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Timer,
  Brain,
  Star,
  ChevronRight,
  AlertCircle,
  RotateCcw,
  Info,
  Crown,
  Zap,
} from "lucide-react";

const LESSON_CONFIGS = {
  doubleAce: {
    title: "Double Ace Dominance",
    description: "Master the art of Double Ace plays for ultimate control",
    points: 2,
    scenarios: [
      {
        id: "basic-control",
        title: "Basic Control",
        description: "Force opponents to draw by making strategic demands",
        setup: {
          playerHand: ["AS", "AH", "7C", "8D"],
          bot1Hand: ["3C", "4C", "5C", "6C"],
          bot2Hand: ["2D", "4D", "5D", "7D"],
          validMoves: [["AS", "AH"]],
          validDemands: {
            suits: ["S", "H", "C", "D"],
            ranks: ["7", "8", "9", "10", "J", "Q", "K"],
          },
          optimalPlay: {
            cards: ["AS", "AH"],
            demand: { suit: "S", rank: "7" },
          },
          timer: 30,
          teachingPoints: [
            "Using two Aces lets you demand both suit AND rank",
            "Analyze opponent's visible cards to make optimal demands",
            "Force draws by demanding cards opponents likely don't have",
          ],
        },
      },
      {
        id: "timing-defense",
        title: "Timing is Everything",
        description: "Disrupt opponent's winning play with Double Ace",
        setup: {
          playerHand: ["AS", "AH", "QC", "KD"],
          bot1Hand: ["4C", "5C", "6C", "7C"],
          bot2Hand: ["4D", "5D", "6D", "7D", "8D"],
          opponentNikoKadi: true,
          validMoves: [["AS", "AH"]],
          validDemands: {
            suits: ["S", "H", "C", "D"],
            ranks: ["7", "8", "9", "10", "J", "Q", "K"],
          },
          optimalPlay: {
            cards: ["AS", "AH"],
            demand: { suit: "S", rank: "Q" },
          },
          timer: 30,
          teachingPoints: [
            "Time your Double Ace to disrupt winning plays",
            "Watch for 'Niko Kadi' announcements",
            "Use Double Ace defensively to force specific plays",
          ],
        },
      },
    ],
  },
  aceChains: {
    title: "Ace Chain Reactions",
    description: "Master penalty defense while maintaining control",
    points: 2,
    scenarios: [
      {
        id: "break-chain",
        title: "Breaking the Chain",
        description: "Stop penalty chains with strategic Ace plays",
        setup: {
          playerHand: ["AS", "7H", "8C", "JD"],
          penaltyChain: ["2S", "2H", "3C"],
          validMoves: [["AS"]],
          optimalPlay: {
            cards: ["AS"],
            demand: { suit: "H" },
          },
          timer: 15,
          teachingPoints: [
            "Single Ace blocks penalty chains",
            "Choose new suit strategically after blocking",
            "Watch your remaining hand composition",
          ],
        },
      },
      {
        id: "strategic-defense",
        title: "Strategic Defense",
        description: "Handle complex penalty situations",
        setup: {
          playerHand: ["AS", "AH", "QC", "5D"],
          penaltyChain: ["2S", "2H", "3C", "JOK1"],
          validMoves: [["AS"], ["AS", "AH"]],
          optimalPlay: {
            cards: ["AS"],
            demand: { suit: "C" },
          },
          timer: 15,
          teachingPoints: [
            "Don't waste both Aces on penalty defense",
            "Save one Ace for offensive plays",
            "Consider future penalty possibilities",
          ],
        },
      },
    ],
  },
};

// Timer component with visual countdown
const CountdownTimer = ({ seconds, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        if (newTime <= 5) setIsWarning(true);
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onComplete]);

  return (
    <div className="flex items-center gap-2">
      <Timer
        className={`w-5 h-5 ${
          isWarning ? "text-red-500 animate-pulse" : "text-gray-400"
        }`}
      />
      <span
        className={`font-mono ${isWarning ? "text-red-500" : "text-gray-400"}`}
      >
        {timeLeft}s
      </span>
    </div>
  );
};

// Demand Selection UI
const DemandSelector = ({ validDemands, onSelect, isVisible }) => {
  const [selectedSuit, setSelectedSuit] = useState(null);
  const [selectedRank, setSelectedRank] = useState(null);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-800/95 
                 backdrop-blur-sm rounded-xl p-4 shadow-xl border border-gray-700"
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-300">Select Suit</h3>
          <div className="flex gap-2">
            {validDemands.suits.map((suit) => (
              <button
                key={suit}
                onClick={() => setSelectedSuit(suit)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center
                         ${
                           selectedSuit === suit ? "bg-primary" : "bg-gray-700"
                         }`}
              >
                <img
                  src={`/cards/${suit.toLowerCase()}.png`}
                  alt={suit}
                  className="w-6 h-6"
                />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-300">Select Rank</h3>
          <div className="grid grid-cols-7 gap-2">
            {validDemands.ranks.map((rank) => (
              <button
                key={rank}
                onClick={() => setSelectedRank(rank)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center
                         text-white font-medium
                         ${
                           selectedRank === rank ? "bg-primary" : "bg-gray-700"
                         }`}
              >
                {rank}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => onSelect({ suit: selectedSuit, rank: selectedRank })}
          disabled={!selectedSuit || !selectedRank}
          className="w-full py-2 rounded-lg bg-primary text-white font-medium
                   disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Confirm Demand
        </button>
      </div>
    </motion.div>
  );
};

// Penalty Chain Visualization
const PenaltyChain = ({ chain }) => {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
      {chain.map((card, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.8, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="relative"
        >
          <img
            src={`/cards/${card}.png`}
            alt={card}
            className="w-16 h-24 object-contain"
          />
          {index < chain.length - 1 && (
            <ChevronRight className="absolute -right-4 top-1/2 -translate-y-1/2 text-primary" />
          )}
        </motion.div>
      ))}
    </div>
  );
};

const AdvancedAcePlays = ({ onComplete, gameRef }) => {
  const [currentLesson, setCurrentLesson] = useState("doubleAce");
  const [currentScenario, setCurrentScenario] = useState(0);
  const [selectedCards, setSelectedCards] = useState([]);
  const [showDemandSelector, setShowDemandSelector] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const lesson = LESSON_CONFIGS[currentLesson];
  const scenario = lesson.scenarios[currentScenario];

  const handleCardClick = (card) => {
    if (isAnimating) return;

    setSelectedCards((prev) => {
      const isSelected = prev.includes(card);
      if (isSelected) {
        return prev.filter((c) => c !== card);
      } else {
        // Only allow selecting Aces or penalty blocking moves
        if (
          card.includes("A") ||
          scenario.setup.validMoves.some((move) => move.includes(card))
        ) {
          return [...prev, card];
        }
        return prev;
      }
    });
  };

  const handlePlayMove = async (selectedDemand = null) => {
    if (selectedCards.length === 0 || isAnimating) return;
    setIsAnimating(true);

    try {
      const isValid = scenario.setup.validMoves.some(
        (validMove) =>
          validMove.length === selectedCards.length &&
          validMove.every((card) => selectedCards.includes(card))
      );

      if (!isValid) {
        setFeedback({
          type: "error",
          message: "Invalid card combination",
        });
        return;
      }

      // If playing Aces, show demand selector
      if (
        selectedCards.every((card) => card.includes("A")) &&
        !selectedDemand
      ) {
        setShowDemandSelector(true);
        return;
      }

      // Validate move with demand if applicable
      const isOptimal =
        JSON.stringify(selectedCards.sort()) ===
          JSON.stringify(scenario.setup.optimalPlay.cards) &&
        (!selectedDemand ||
          (selectedDemand.suit === scenario.setup.optimalPlay.demand.suit &&
            selectedDemand.rank === scenario.setup.optimalPlay.demand.rank));

      // Animate card play
      if (gameRef.current) {
        await gameRef.current.playCards(selectedCards, selectedDemand);
      }

      // Calculate points
      const pointsEarned = isOptimal
        ? lesson.points / lesson.scenarios.length
        : (lesson.points / lesson.scenarios.length) * 0.7;

      setScore((prev) => prev + pointsEarned);
      setFeedback({
        type: "success",
        message: isOptimal ? "Perfect play!" : "Valid play",
        points: pointsEarned,
      });

      // Progress to next scenario/lesson
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
        setShowDemandSelector(false);
      }, 1500);
    } finally {
      setIsAnimating(false);
    }
  };

  const handleTimeUp = () => {
    setFeedback({
      type: "error",
      message: "Time's up! Try again.",
    });
    // Reset scenario
    setSelectedCards([]);
    setShowDemandSelector(false);
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

        {/* Scenario Content */}
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-white">{scenario.title}</h2>
            <p className="text-gray-400">{scenario.description}</p>
          </div>

          {/* Game Area */}
          <div className="relative aspect-video bg-gray-800/50 rounded-xl overflow-hidden mb-8">
            {/* Your game canvas renders here */}
            <canvas id="gameCanvas" className="w-full h-full" />

            {/* Timer */}
            <div className="absolute top-4 right-4">
              <CountdownTimer
                seconds={scenario.setup.timer}
                onComplete={handleTimeUp}
              />
            </div>

            {/* Penalty Chain Display */}
            {scenario.setup.penaltyChain && (
              <PenaltyChain chain={scenario.setup.penaltyChain} />
            )}

            {/* Opponent "Niko Kadi" Indicator */}
            {scenario.setup.opponentNikoKadi && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5
                         bg-red-500/20 backdrop-blur-sm rounded-full"
              >
                <Crown className="w-4 h-4 text-red-400" />
                <span className="text-sm text-red-400">
                  Opponent announced "Niko Kadi"!
                </span>
              </motion.div>
            )}

            {/* Demand Selector */}
            <AnimatePresence>
              {showDemandSelector && (
                <DemandSelector
                  validDemands={scenario.setup.validDemands}
                  onSelect={handlePlayMove}
                  isVisible={showDemandSelector}
                />
              )}
            </AnimatePresence>

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
                               : "bg-red-500"
                           }
                           text-white shadow-lg`}
                >
                  <div className="flex items-center gap-2">
                    {feedback.type === "success" ? (
                      <Zap className="w-4 h-4" />
                    ) : (
                      <AlertCircle className="w-4 h-4" />
                    )}
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
                {scenario.setup.teachingPoints.map((point, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-gray-300"
                  >
                    <Info className="w-4 h-4 text-primary" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="text-white font-medium">
                  {score.toFixed(1)} / 4 points
                </span>
              </div>
            </div>

            {/* Hint Toggle */}
            <div className="mt-4 flex items-center gap-4">
              <button
                onClick={() => setShowHint(!showHint)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                         bg-gray-700 hover:bg-gray-600 text-gray-300
                         hover:text-white transition-colors text-sm"
              >
                <Brain className="w-4 h-4" />
                {showHint ? "Hide Hint" : "Show Hint"}
              </button>

              <button
                onClick={() => {
                  setSelectedCards([]);
                  setShowDemandSelector(false);
                  if (gameRef.current) {
                    gameRef.current.resetScenario(scenario.setup);
                  }
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                         bg-gray-700 hover:bg-gray-600 text-gray-300
                         hover:text-white transition-colors text-sm"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Scenario
              </button>
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
              Skip Tutorial
            </button>

            <button
              onClick={() => handlePlayMove()}
              disabled={
                selectedCards.length === 0 || isAnimating || showDemandSelector
              }
              className="px-6 py-2 rounded-lg bg-primary hover:bg-primary/90
                       text-white font-medium disabled:opacity-50
                       disabled:cursor-not-allowed transition-colors"
            >
              Play Cards
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAcePlays;
