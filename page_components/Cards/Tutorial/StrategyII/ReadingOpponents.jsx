"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ChevronLeft,
  Star,
  Brain,
  Activity,
  Clock,
  BarChart,
  Users,
  Timer,
} from "lucide-react";

const LESSONS = {
  handReading: {
    title: "Hand Reading 101",
    description: "Track cards and analyze draw patterns",
    points: 2,
    scenarios: [
      {
        id: "detective",
        title: "The Detective",
        description: "Deduce opponent holdings through elimination",
        setup: {
          playedCards: ["KS", "QS", "JS", "JH", "2D", "3D", "JOK1"],
          knownHands: {
            player: ["4H", "5H", "6C", "7C"],
            opponent1: { size: 4, known: ["8H"] },
            opponent2: { size: 3, known: [] },
          },
          drawPileSize: 15,
          correctDeduction: {
            opponent1: ["8H", "AC", "KC", "QC"],
            probability: 0.8,
          },
        },
      },
      {
        id: "patterns",
        title: "Draw Pattern Analysis",
        description: "Analyze opponent drawing behavior",
        setup: {
          drawHistory: [
            { turn: 1, trigger: "6C", pattern: "clubs_draw" },
            { turn: 3, trigger: "7C", pattern: "clubs_draw" },
            { turn: 5, trigger: "QH", pattern: "discard_high" },
          ],
        },
      },
    ],
  },
  behavioralPatterns: {
    title: "Behavioral Patterns",
    description: "Read timing and preferences",
    points: 2,
    scenarios: [
      {
        id: "timing",
        title: "The Tell",
        description: "Identify timing-based patterns",
        setup: {
          timingData: [
            { card: "AS", time: 4.2, baseline: 2.1 },
            { card: "2H", time: 1.8, baseline: 2.1 },
            { card: "QC", time: 3.9, baseline: 2.1 },
          ],
        },
      },
      {
        id: "preferences",
        title: "Suit Preference Analysis",
        description: "Track and exploit suit choices",
        setup: {
          suitHistory: {
            hearts: 0.4,
            diamonds: 0.3,
            clubs: 0.2,
            spades: 0.1,
          },
        },
      },
    ],
  },
};

const CardTrackingOverlay = ({ playedCards, suitStats }) => (
  <div className="absolute top-4 left-4 bg-gray-900/90 backdrop-blur-sm rounded-lg p-4">
    <h3 className="text-sm font-medium text-white mb-2">Card Tracking</h3>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <h4 className="text-xs text-gray-400 mb-1">Recent Plays</h4>
        <div className="space-y-1">
          {playedCards.slice(-5).map((card, i) => (
            <div key={i} className="flex items-center gap-2">
              <img
                src={`/cards/${card}.png`}
                alt={card}
                className="w-8 h-12 object-contain"
              />
              <span className="text-xs text-gray-300">{card}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h4 className="text-xs text-gray-400 mb-1">Suit Stats</h4>
        {Object.entries(suitStats).map(([suit, percentage]) => (
          <div key={suit} className="flex items-center gap-2">
            <span className="text-xs text-gray-300">{suit}</span>
            <div className="w-24 h-2 bg-gray-700 rounded-full">
              <div
                className="h-full bg-primary rounded-full"
                style={{ width: `${percentage * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const TimingAnalysis = ({ timingData }) => (
  <div className="absolute bottom-4 right-4 bg-gray-900/90 backdrop-blur-sm rounded-lg p-4">
    <h3 className="text-sm font-medium text-white mb-2">Timing Analysis</h3>
    <div className="space-y-2">
      {timingData.map((data, i) => (
        <div key={i} className="flex items-center gap-4">
          <img
            src={`/cards/${data.card}.png`}
            alt={data.card}
            className="w-8 h-12 object-contain"
          />
          <div className="flex-1">
            <div className="w-full h-2 bg-gray-700 rounded-full">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(data.time / 5) * 100}%` }}
                className={`h-full rounded-full ${
                  data.time > data.baseline ? "bg-yellow-500" : "bg-green-500"
                }`}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-400">
                {data.time.toFixed(1)}s
              </span>
              <span className="text-xs text-gray-400">
                {data.time > data.baseline ? "Hesitation" : "Quick Play"}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const HeatMap = ({ suitPreferences }) => (
  <div className="absolute top-4 right-4 bg-gray-900/90 backdrop-blur-sm rounded-lg p-4">
    <h3 className="text-sm font-medium text-white mb-2">Suit Preferences</h3>
    <div className="grid grid-cols-2 gap-2">
      {Object.entries(suitPreferences).map(([suit, value]) => (
        <div
          key={suit}
          className="p-2 rounded bg-gray-800"
          style={{
            background: `linear-gradient(to right, rgba(59, 130, 246, ${value}), rgba(59, 130, 246, 0.1))`,
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-white">{suit}</span>
            <span className="text-xs text-gray-300">
              {(value * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ReadingOpponents = ({ onComplete, gameRef }) => {
  const [currentLesson, setCurrentLesson] = useState("handReading");
  const [currentScenario, setCurrentScenario] = useState(0);
  const [points, setPoints] = useState(0);
  const [prediction, setPrediction] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [showHint, setShowHint] = useState(false);

  const lesson = LESSONS[currentLesson];
  const scenario = lesson.scenarios[currentScenario];

  const handlePrediction = (prediction) => {
    const correctness = calculatePredictionAccuracy(prediction);
    const pointsEarned =
      correctness * (lesson.points / lesson.scenarios.length);

    setPoints((prev) => prev + pointsEarned);
    setFeedback({
      type: correctness > 0.8 ? "success" : "partial",
      message:
        correctness > 0.8
          ? "Excellent read!"
          : "Good attempt, but some patterns were missed",
      points: pointsEarned,
    });

    // Progress after feedback
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
          onComplete(points + pointsEarned);
        }
      }
      setPrediction(null);
      setFeedback(null);
    }, 2000);
  };

  const calculatePredictionAccuracy = (prediction) => {
    // Complex prediction accuracy calculation
    // Returns value between 0-1
    return 0.85; // Placeholder
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="grid grid-cols-2 gap-2 mb-12">
          {Object.entries(LESSONS).map(([key, value]) => (
            <div key={key} className="space-y-1">
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
              <div className="flex justify-between items-center px-1">
                <span className="text-xs text-gray-400">{value.title}</span>
                <span className="text-xs text-primary">{value.points}p</span>
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
            {/* Your game canvas renders here */}

            {/* Analysis Overlays */}
            {scenario.setup.playedCards && (
              <CardTrackingOverlay
                playedCards={scenario.setup.playedCards}
                suitStats={{
                  hearts: 0.3,
                  diamonds: 0.4,
                  clubs: 0.2,
                  spades: 0.1,
                }}
              />
            )}

            {scenario.setup.timingData && (
              <TimingAnalysis timingData={scenario.setup.timingData} />
            )}

            {scenario.setup.suitHistory && (
              <HeatMap suitPreferences={scenario.setup.suitHistory} />
            )}

            {/* Feedback Display */}
            <AnimatePresence>
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                           px-6 py-3 rounded-lg shadow-xl backdrop-blur-sm
                           ${
                             feedback.type === "success"
                               ? "bg-green-500/90"
                               : "bg-yellow-500/90"
                           }`}
                >
                  <div className="flex items-center gap-3">
                    {feedback.type === "success" ? (
                      <Activity className="w-5 h-5" />
                    ) : (
                      <Brain className="w-5 h-5" />
                    )}
                    <span className="text-white font-medium">
                      {feedback.message}
                    </span>
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

          {/* Analysis Tools */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-primary" />
                <h3 className="text-white font-medium">Timing Analysis</h3>
              </div>
              <div className="space-y-2">
                {scenario.setup.timingData?.map((data, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">{data.card}</span>
                    <div className="flex-1 h-2 bg-gray-700 rounded-full">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${(data.time / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <BarChart className="w-5 h-5 text-primary" />
                <h3 className="text-white font-medium">Pattern Analysis</h3>
              </div>
              <div className="space-y-2">
                {scenario.setup.drawHistory?.map((draw, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">
                      Turn {draw.turn}: {draw.pattern}
                    </span>
                    <span className="text-sm text-primary">{draw.trigger}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Area */}
          <div className="flex justify-between items-center pt-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowHint(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg 
                         bg-gray-700 hover:bg-gray-600 text-gray-300"
              >
                <Brain className="w-4 h-4" />
                Show Hint
              </button>

              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700">
                <Timer className="w-4 h-4 text-primary" />
                <span className="text-sm text-gray-300">
                  Decision Timer: 30s
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="text-white font-medium">
                  {points.toFixed(1)} / 4 points
                </span>
              </div>

              <button
                onClick={() =>
                  handlePrediction({
                    cards: ["AC", "KC", "QC"],
                    confidence: 0.8,
                    timing: "hesitant",
                    suitPreference: "clubs",
                  })
                }
                disabled={!prediction}
                className="px-6 py-2 rounded-lg bg-primary hover:bg-primary/90
                         text-white font-medium disabled:opacity-50
                         disabled:cursor-not-allowed"
              >
                Submit Prediction
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
                className="mt-4 p-4 bg-gray-700 rounded-lg"
              >
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-gray-300">
                      Look for these key patterns:
                    </p>
                    <ul className="list-disc list-inside text-gray-400 text-sm space-y-1">
                      <li>Consistent timing tells on specific card types</li>
                      <li>Preferred suits when multiple options available</li>
                      <li>Drawing patterns after specific card plays</li>
                      <li>Hand size management tendencies</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Prediction Input Area */}
          <div className="mt-6 bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-primary" />
              <h3 className="text-white font-medium">Make Your Prediction</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="text-sm text-gray-400">Likely Cards</h4>
                <div className="flex flex-wrap gap-2">
                  {["AC", "KC", "QC", "2H"].map((card) => (
                    <button
                      key={card}
                      onClick={() => {
                        const newPrediction = prediction?.cards?.includes(card)
                          ? {
                              ...prediction,
                              cards: prediction.cards.filter((c) => c !== card),
                            }
                          : {
                              ...prediction,
                              cards: [...(prediction?.cards || []), card],
                            };
                        setPrediction(newPrediction);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm ${
                        prediction?.cards?.includes(card)
                          ? "bg-primary text-white"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      {card}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm text-gray-400">Behavioral Patterns</h4>
                <div className="space-y-2">
                  <select
                    onChange={(e) =>
                      setPrediction((prev) => ({
                        ...prev,
                        timing: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-lg bg-gray-700 text-gray-300
                             border border-gray-600 focus:border-primary
                             focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Select Timing Pattern</option>
                    <option value="quick">Quick Plays</option>
                    <option value="hesitant">Hesitant on Power Cards</option>
                    <option value="variable">Variable Timing</option>
                  </select>

                  <select
                    onChange={(e) =>
                      setPrediction((prev) => ({
                        ...prev,
                        suitPreference: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-lg bg-gray-700 text-gray-300
                             border border-gray-600 focus:border-primary
                             focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Select Suit Preference</option>
                    <option value="hearts">Prefers Hearts</option>
                    <option value="diamonds">Prefers Diamonds</option>
                    <option value="clubs">Prefers Clubs</option>
                    <option value="spades">Prefers Spades</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadingOpponents;
