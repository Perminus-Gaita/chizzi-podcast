"use client";
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
  singleAceStrategies: {
    title: "Single Ace Strategies",
    description: "Master using a single Ace Card to control the game",
    points: 2,
    scenarios: [
      {
        id: "suit-demand",
        title: "Suit Demand Basics",
        description: "Choose the most strategic suit to demand",
        setup: {
          playerHand: ["AH", "4S", "6D", "9C"],
          topCard: "5H",
          opponentCards: [4, 4],
          penaltyCard: null,
          validMoves: ["AH"],
          optimalMove: {
            card: "AH",
            suit: "S", // Strategically chosen suit
          },
          hint: "Consider your hand and opponents' potential plays when choosing a suit",
          explanation:
            "A single Ace allows you to change the game's current suit strategically",
          strategicConsiderations: [
            "Suit coverage in your hand",
            "Opponents' likely card composition",
            "Blocking potential strong plays",
          ],
        },
      },
      {
        id: "penalty-block",
        title: "Blocking Penalties",
        description: "Use an Ace to neutralize penalty cards",
        setup: {
          playerHand: ["AH", "4S", "6D", "2C"],
          topCard: "5H",
          opponentCards: [2, 2],
          penaltyCard: "2D", // Penalty card in play
          validMoves: ["AH"],
          optimalMove: {
            card: "AH",
            action: "block-penalty",
          },
          hint: "An Ace can block penalty cards and reset the game state",
          explanation: "Strategically use Aces to avoid drawing penalty cards",
          strategicConsiderations: [
            "Avoid drawing multiple cards",
            "Reset game flow",
            "Maintain hand advantage",
          ],
        },
      },
    ],
  },
  doubleAceTechniques: {
    title: "Double Ace Strategies",
    description: "Master the powerful Ace of Spades (AS) techniques",
    points: 2,
    scenarios: [
      {
        id: "rank-suit-demand",
        title: "Precise Rank and Suit Demand",
        description: "Use two Aces to control both rank and suit",
        setup: {
          playerHand: ["AH", "AS", "4S", "6D"],
          topCard: "5H",
          opponentCards: [3, 3],
          validMoves: [["AH", "AS"]],
          optimalMove: {
            cards: ["AH", "AS"],
            rank: "7",
            suit: "S",
          },
          hint: "Double Aces let you demand both a specific rank and suit",
          explanation:
            "The Ace of Spades (AS) gives you ultimate control over the next play",
          strategicConsiderations: [
            "Force specific card play",
            "Limit opponents' options",
            "Create winning opportunities",
          ],
        },
      },
      {
        id: "winning-setup",
        title: "Winning Scenario Creation",
        description: "Use double Aces to set up a winning position",
        setup: {
          playerHand: ["AH", "AS", "4S", "6D", "7S"],
          topCard: "5H",
          opponentCards: [2, 2],
          validMoves: [["AH", "AS"]],
          optimalMove: {
            cards: ["AH", "AS"],
            rank: "7",
            suit: "S",
            winningPlay: "7S",
          },
          hint: "Carefully choose your double Ace demand to set up your winning move",
          explanation:
            "Strategic double Ace plays can create direct paths to victory",
          strategicConsiderations: [
            "Predict opponent's possible responses",
            "Create a clear path to playing winning cards",
            "Minimize opponent's counter-play options",
          ],
        },
      },
    ],
  },
  advancedInteractions: {
    title: "Advanced Ace Card Interactions",
    description: "Master complex Ace Card strategies",
    points: 3,
    scenarios: [
      {
        id: "penalty-interaction",
        title: "Complex Penalty Scenarios",
        description: "Navigate tricky penalty card interactions",
        setup: {
          playerHand: ["AH", "4S", "6D", "2C", "3D"],
          topCard: "5H",
          opponentCards: [2, 2],
          penaltyCard: "2D",
          validMoves: ["AH"],
          optimalMove: {
            card: "AH",
            action: "block-and-choose-suit",
          },
          hint: "Use your Ace strategically to block penalties and control the game flow",
          explanation:
            "Advanced Ace plays can neutralize penalties while maintaining strategic advantage",
          strategicConsiderations: [
            "Minimize card draws",
            "Choose optimal suit after blocking",
            "Disrupt opponent's strategy",
          ],
        },
      },
      {
        id: "demand-breaking",
        title: "Demand Breaking Techniques",
        description: "Learn to partially break or manipulate game demands",
        setup: {
          playerHand: ["AH", "4S", "6D", "7S"],
          topCard: "5H",
          opponentCards: [3, 3],
          activeDemand: {
            rank: "7",
            suit: "S",
          },
          validMoves: ["AH"],
          optimalMove: {
            card: "AH",
            action: "break-rank-demand",
          },
          hint: "An Ace can help you escape strict game demands",
          explanation:
            "Strategic Ace plays can provide flexibility in constrained game states",
          strategicConsiderations: [
            "Partially nullify opponent's demands",
            "Create new strategic opportunities",
            "Maintain hand flexibility",
          ],
        },
      },
    ],
  },
};

const AceCardControl = ({ onComplete, gameRef }) => {
  const [currentLesson, setCurrentLesson] = useState("singleAceStrategies");
  const [currentScenario, setCurrentScenario] = useState(0);
  const [selectedCards, setSelectedCards] = useState([]);
  const [demandedSuit, setDemandedSuit] = useState(null);
  const [demandedRank, setDemandedRank] = useState(null);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const lesson = LESSON_CONFIGS[currentLesson];
  const scenario = lesson.scenarios[currentScenario];

  // Card selection logic
  const handleCardClick = (card) => {
    if (isAnimating) return;

    // Toggle card selection
    const isSelected = selectedCards.includes(card);
    let newSelectedCards;

    if (currentLesson === "doubleAceTechniques") {
      // For double Ace scenarios, allow two Aces
      newSelectedCards = isSelected
        ? selectedCards.filter((c) => c !== card)
        : selectedCards.length < 2
        ? [...selectedCards, card]
        : selectedCards;
    } else {
      // For single Ace scenarios
      newSelectedCards = isSelected ? [] : [card];
    }

    setSelectedCards(newSelectedCards);
    setFeedback(null);
  };

  // Suit selection for single Ace scenarios
  const handleSuitSelect = (suit) => {
    setDemandedSuit(suit);
  };

  // Rank selection for double Ace scenarios
  const handleRankSelect = (rank) => {
    setDemandedRank(rank);
  };

  // Play cards logic
  const handlePlayCards = async () => {
    if (selectedCards.length === 0 || isAnimating) return;
    setIsAnimating(true);

    try {
      // Validate the play based on lesson type
      let isValid = false;
      let isOptimal = false;

      if (currentLesson === "singleAceStrategies") {
        // Single Ace validation
        isValid = scenario.setup.validMoves.includes(selectedCards[0]);
        isOptimal =
          selectedCards[0] === scenario.setup.optimalMove.card &&
          (demandedSuit === scenario.setup.optimalMove.suit ||
            scenario.setup.optimalMove.action === "block-penalty");
      } else if (currentLesson === "doubleAceTechniques") {
        // Double Ace validation
        isValid = scenario.setup.validMoves.some((moves) =>
          moves.every((move) => selectedCards.includes(move))
        );
        isOptimal =
          selectedCards.length === 2 &&
          demandedSuit === scenario.setup.optimalMove.suit &&
          demandedRank === scenario.setup.optimalMove.rank;
      } else if (currentLesson === "advancedInteractions") {
        // Advanced interaction validation
        isValid = scenario.setup.validMoves.includes(selectedCards[0]);
        isOptimal =
          selectedCards[0] === scenario.setup.optimalMove.card &&
          (demandedSuit ||
            scenario.setup.optimalMove.action === "block-and-choose-suit");
      }

      if (!isValid) {
        setFeedback({
          type: "error",
          message: "Invalid Ace Card play",
        });
        return;
      }

      // Animate card play
      if (gameRef.current) {
        await gameRef.current.playAceCards({
          cards: selectedCards,
          suit: demandedSuit,
          rank: demandedRank,
        });
      }

      // Calculate points
      const pointsEarned = isOptimal
        ? lesson.points / lesson.scenarios.length
        : (lesson.points / lesson.scenarios.length) * 0.7;

      setScore((prev) => prev + pointsEarned);
      setFeedback({
        type: "success",
        message: isOptimal
          ? "Perfect Ace Card strategy!"
          : "Valid Ace Card play",
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
        setDemandedSuit(null);
        setDemandedRank(null);
        setFeedback(null);
        setShowHint(false);
      }, 1500);
    } finally {
      setIsAnimating(false);
    }
  };

  const resetScenario = () => {
    setSelectedCards([]);
    setDemandedSuit(null);
    setDemandedRank(null);
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
          <h1>Canvas Placeholder</h1>

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
              {/* Explanation */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-300">
                  <Info className="w-4 h-4 text-primary" />
                  <span>{scenario.explanation}</span>
                </div>

                {/* Strategic Considerations */}
                {scenario.setup.strategicConsiderations && (
                  <div className="space-y-2">
                    {scenario.setup.strategicConsiderations.map(
                      (consideration, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-gray-400"
                        >
                          <ChevronRight className="w-4 h-4 text-primary" />
                          <span>{consideration}</span>
                        </div>
                      )
                    )}
                  </div>
                )}
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
                {scenario.setup.hint}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Suit Selection for Single Ace Scenarios */}
        {currentLesson === "singleAceStrategies" &&
          selectedCards.length > 0 && (
            <div className="bg-gray-800/50 rounded-xl p-6 mb-8">
              <h3 className="text-white mb-4">Choose a Suit to Demand</h3>
              <div className="flex gap-4">
                {["H", "D", "S", "C"].map((suit) => (
                  <button
                    key={suit}
                    onClick={() => handleSuitSelect(suit)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      demandedSuit === suit
                        ? "bg-primary text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    {
                      { H: "Hearts", D: "Diamonds", S: "Spades", C: "Clubs" }[
                        suit
                      ]
                    }
                  </button>
                ))}
              </div>
            </div>
          )}

        {/* Rank Selection for Double Ace Scenarios */}
        {currentLesson === "doubleAceTechniques" &&
          selectedCards.length === 2 && (
            <div className="bg-gray-800/50 rounded-xl p-6 mb-8">
              <div className="space-y-4">
                <div>
                  <h3 className="text-white mb-4">Choose a Rank to Demand</h3>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      "2",
                      "3",
                      "4",
                      "5",
                      "6",
                      "7",
                      "8",
                      "9",
                      "10",
                      "J",
                      "Q",
                      "K",
                      "A",
                    ].map((rank) => (
                      <button
                        key={rank}
                        onClick={() => handleRankSelect(rank)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          demandedRank === rank
                            ? "bg-primary text-white"
                            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        }`}
                      >
                        {rank}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Suit Selection */}
                <div>
                  <h3 className="text-white mb-4">Choose a Suit to Demand</h3>
                  <div className="flex gap-4">
                    {["H", "D", "S", "C"].map((suit) => (
                      <button
                        key={suit}
                        onClick={() => handleSuitSelect(suit)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          demandedSuit === suit
                            ? "bg-primary text-white"
                            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        }`}
                      >
                        {
                          {
                            H: "Hearts",
                            D: "Diamonds",
                            S: "Spades",
                            C: "Clubs",
                          }[suit]
                        }
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

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
            disabled={
              selectedCards.length === 0 ||
              isAnimating ||
              (currentLesson === "singleAceStrategies" && !demandedSuit) ||
              (currentLesson === "doubleAceTechniques" &&
                (!demandedSuit || !demandedRank))
            }
            className="px-6 py-2 rounded-lg bg-primary hover:bg-primary/90
                     text-white font-medium disabled:opacity-50
                     disabled:cursor-not-allowed transition-colors"
          >
            Play Ace Card{selectedCards.length > 1 ? "s" : ""}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AceCardControl;
