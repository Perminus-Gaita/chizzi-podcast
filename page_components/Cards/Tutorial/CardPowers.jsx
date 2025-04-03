"use client";
import dynamic from "next/dynamic";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Star,
  ChevronRight,
  ChevronLeft,
  Lightbulb,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import CompletionScreen from "./CompletionScreen";
import TutorialCardAnimations from "./TutorialCardAnimations";
import TutorialPlayerDeck from "./TutorialPlayerDeck";
import TutorialSuitModal from "./TutorialSuitModal";
import Feedback from "./Feedback";

import { startAnimation } from "@/app/store/animationSlice";
import CenterTable from "./GameComponents/CenterTable";
import TutorialGameDirection from "./GameComponents/TutorialGameDirection";
import { useIsMobile } from "@/hooks/useIsMobile";
import ModuleProgress from "./ModuleProgress";

const scenarios = [
  {
    id: "answer-cards",
    title: "Playing Answer Cards",
    description: "Learn to match cards by suit or rank",
    points: 2,
    setup: {
      playerHand: ["4H", "6S", "6C", "7C"],
      topCard: "5C",
      aiHand: ["5D", "5S", "6H", "7S"],
      validMoves: ["6C", "6S"],
      requiredMoves: 2,
    },
    steps: [
      {
        type: "suit-match",
        instruction: "Match the club suit by playing 6♣",
        highlight: "6C",
        validation: (card) => card === "6C",
      },
      {
        type: "opponent-play-answer",
        instruction: "Opponent plays 6 of Hearts (6♥)",
        aiPlay: "6H",
        validation: () => true,
        feedback: "Now it's the opponent's turn to play",
      },
      {
        type: "rank-match",
        instruction: "Match the rank 6 by playing 6♠",
        highlight: "6S",
        validation: (card) => card === "6S",
      },
    ],
  },
  {
    id: "question-pairs",
    title: "Question-Answer Pairs",
    description: "Learn how Queens and Eights work with Answer cards",
    points: 2,
    setup: {
      playerHand: ["QH", "8C", "6S", "5D"],
      topCard: "6H",
      aiHand: ["QC", "4C", "5C", "6C"],
      validMoves: [
        ["QH", "4H"],
        ["8H", "4H"],
      ],
      requiredMoves: 1,
    },
    steps: [
      {
        type: "invalid-single",
        instruction: "Try playing just the Queen...",
        highlight: "QH",
        validation: (cards) => {
          if (Array.isArray(cards)) {
            return cards.length === 1 && cards[0] === "QH";
          }
          return cards === "QH";
        },
        feedback: "Questions need matching Answer cards!",
      },
      {
        type: "force-draw",
        instruction:
          "Draw a card from the draw pile - always play a Queen with an Answer card",
        highlight: "drawPile",
        feedback: "Questions need matching Answer cards!",
      },
      {
        type: "valid-question",
        instruction: "First, play the Queen of Hearts",
        highlight: "QH",
        validation: (card) => card === "QH",
      },
      {
        type: "valid-answer",
        instruction: "Now play the 4 of Hearts to complete the pair",
        highlight: "4H",
        validation: (card) => card === "4H",
      },
    ],
  },
  {
    id: "jump-card",
    title: "Jump Cards (Jacks)",
    description: "Learn how to skip players using Jack cards",
    points: 1.5,
    setup: {
      playerHand: ["JH", "4H", "5H", "6H"],
      topCard: "4H",
      aiHand: ["JS", "4S", "5S", "6S"],
      validMoves: ["JH"],
      requiredMoves: 4,
    },
    steps: [
      {
        type: "basic-jump",
        instruction:
          "Your turn! Play the Jack of Hearts (J♥) to skip your opponent's next turn",
        highlight: "JH",
        validation: (card) => card === "JH",
        feedback:
          "You've played a Jump card! The opponent must accept or counter it",
      },
      {
        type: "opponent-accept-jump",
        instruction: "Now watch as your opponent accepts being skipped...",
        validation: () => true,
        feedback: "The opponent's turn was skipped. It's your turn again!",
      },
      {
        type: "regular-play",
        instruction:
          "Play 4 of Hearts (4♥) to continue play after successful skip",
        highlight: "4H",
        validation: (card) => card === "4H",
        feedback: "Good! Now it's the opponent's turn",
      },
      {
        type: "opponent-jump-attempt",
        instruction:
          "Now it's the opponent's turn... they're playing a Jack of Spades (J♠) to skip your turn!",
        aiPlay: "JS",
        validation: () => true,
        feedback: "The opponent is trying to skip your turn!",
      },
      {
        type: "forced-skip",
        instruction:
          "You don't have any Jump cards left to counter with. You must accept being skipped",
        validation: () => true,
        feedback:
          "When you can't counter a Jump, your turn is skipped. The game continues with the next player.",
      },
      {
        type: "opponent-play-after-skip",
        instruction: "Opponent plays 4 of Spades (4♠)",
        aiPlay: "4S",
        validation: () => true,
        feedback: "Now it's the opponent's turn to play",
      },
    ],
  },
  {
    id: "direction-change",
    title: "Kickback Cards (Kings)",
    description: "Learn how Kings reverse game direction",
    points: 1.5,
    setup: {
      playerHand: ["KH", "KC", "4H", "5H"],
      topCard: "4H",
      aiHand: ["KD", "4D", "5S", "6S"],
      validMoves: ["KH", "KC"],
      requiredMoves: 3,
      direction: 1,
    },
    steps: [
      {
        type: "direction-demo",
        instruction: "Notice the current game direction (clockwise)...",
        validation: () => true,
        requireConfirmation: true,
        feedback: "The game starts in clockwise direction by default",
      },
      {
        type: "play-king",
        instruction:
          "Play your King of Hearts (K♥) to attempt direction reversal",
        highlight: "KH",
        validation: (card) => card === "KH",
        feedback:
          "You've played a Kickback! Now the opponent must accept or counter it",
      },
      {
        type: "opponent-accept-kickback",
        instruction: "Watch as your opponent accepts the Kickback...",
        validation: () => true,
        feedback:
          "The opponent accepted your Kickback - direction is now reversed to counterclockwise! It's your turn again!",
      },
      {
        type: "regular-play",
        instruction: "Play your 4 of Hearts (4♥) to continue the game",
        highlight: "4H",
        validation: (card) => card === "4H",
        feedback: "Good! Now it's the opponent's turn",
      },
      {
        type: "opponent-kickback-attempt",
        instruction: "The opponent plays their King of Spades (K Diamonds)!",
        aiPlay: "KD",
        validation: () => true,
        feedback:
          "The opponent is attempting to reverse direction to clockwise",
      },
      {
        type: "forced-accept-kickback",
        instruction: "You have no Kings to counter with - you must accept",
        validation: () => true,
        feedback: "Direction is now clockwise. The opponent gets another turn!",
      },
      {
        type: "opponent-play-after-kickback",
        instruction: "Opponent plays 4 of Diamonds (♦)",
        aiPlay: "4D",
        validation: () => true,
        feedback: "Now it's your turn in the new direction",
      },
    ],
  },
  {
    id: "penalty-cards",
    title: "Penalty Cards",
    description: "Learn how 2s, 3s, and Jokers force opponents to draw cards",
    points: 1.5,
    setup: {
      playerHand: ["4H", "8H", "QS", "JOK1"],
      topCard: "7S",
      aiHand: ["2S", "4S", "5S", "6S"],
      validMoves: ["2H", "3H", "JOK1"],
      requiredMoves: 4,
    },
    steps: [
      {
        type: "penalty-intro",
        instruction:
          "First, let's see what happens when your opponent plays a penalty card...",
        aiPlay: "2S",
        validation: () => true,
        feedback:
          "The opponent played a 2♠ - you must draw 2 cards unless you can counter it!",
      },
      {
        type: "force-draw",
        instruction: "You have no matching 2s to counter with - draw 2 cards",
        highlight: "drawPile",
        validation: () => true,
        feedback:
          "When you can't counter a penalty, you must draw the cards and skip your turn",
      },
      {
        type: "play-two",
        instruction:
          "Your turn! Play your 2 of Hearts (2♥) to make the opponent draw 2 cards",
        highlight: "2H",
        validation: (card) => card === "2H",
        feedback:
          "You've played a penalty card! The opponent must draw 2 cards or counter it",
      },
      {
        type: "opponent-draws",
        instruction: "Watch as your opponent is forced to draw 2 cards...",
        validation: () => true,
        feedback:
          "When someone draws cards from a penalty, they miss their turn",
      },
      {
        type: "play-three",
        instruction:
          "Now play your 3 of Hearts (3♥) for an even bigger penalty!",
        highlight: "3H",
        validation: (card) => card === "3H",
        feedback: "Good! Your opponent will draw 3 cards this time",
      },
      {
        type: "opponent-draws-3",
        instruction: "Watch your opponent draw 3 cards and skip their turn",
        validation: () => true,
        feedback: "A 3 card is stronger than a 2 card - it forces more draws!",
      },
      {
        type: "joker-finale",
        instruction: "Finally, play your Joker for the maximum penalty!",
        highlight: "JOK1",
        validation: (card) => card === "JOK1",
        feedback:
          "The Joker is the strongest penalty card - forcing 5 card draws!",
      },
      {
        type: "opponent-draws-5",
        instruction: "Watch your opponent draw 5 cards and skip their turn",
        validation: () => true,
        feedback:
          "A JOK is stronger than a 2 and 3 card - it forces more draws!",
      },
    ],
  },
  {
    id: "ace-powers",
    title: "Ace Cards (Suit Control)",
    description: "Learn how Aces let you choose the next suit",
    points: 1.5,
    setup: {
      playerHand: ["AH", "5H", "6D", "7C"],
      topCard: "4S",
      aiHand: ["4H", "5D", "6S", "7S"],
      validMoves: ["AH"],
      requiredMoves: 5,
    },
    steps: [
      {
        type: "basic-ace",
        instruction: "Play your Ace of Hearts (A♥)",
        highlight: "AH",
        validation: (card) => card === "AH",
        feedback: "Good! Now you can demand any suit",
      },
      {
        type: "suit-demand",
        instruction: "Choose Hearts as your demanded suit",
        options: ["H", "D", "C", "S"],
        validation: (suit) => suit === "H",
        feedback:
          "Perfect! The opponent must play a Hearts card if they have one",
      },
      {
        type: "opponent-follows",
        instruction: "Watch as opponent follows your Hearts demand...",
        aiPlay: "4H",
        validation: () => true,
        feedback: "The opponent had a Hearts card and had to play it!",
      },
      {
        type: "regular-play-aces",
        instruction:
          "Now you can play any valid card - try your 5 of Hearts (5♥)",
        highlight: "5H",
        validation: (card) => card === "5H",
        feedback:
          "Good! Since the demand was fulfilled, you could play any card that matched the rank or suit of 4♥",
      },
    ],
  },
];

const ScenarioComplete = ({ scenario, points, onContinue }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <div className="bg-card max-w-md w-full mx-4 rounded-xl p-6 space-y-4">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-full bg-primary/10">
            <Trophy className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold">Module Complete!</h2>
          <p className="text-muted-foreground">{scenario.title}</p>
        </div>

        <div className="flex items-center justify-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" />
          <span className="font-medium">{points} points earned</span>
        </div>

        <div className="pt-4">
          <Button onClick={onContinue} className="w-full">
            Continue to Next Module
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

const ScenarioIntro = ({ scenario, onStart }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <div className="bg-card max-w-md w-full mx-4 rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-semibold">{scenario.title}</h2>
        <p className="text-muted-foreground">{scenario.description}</p>

        <div className="pt-4">
          <Button onClick={onStart} className="w-full">
            Start Module
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

const CompletionSheet = ({ points, setShowCompletion, onComplete, open }) => {
  return (
    <Sheet open={open} onOpenChange={() => setShowCompletion(false)}>
      <SheetContent
        side="bottom"
        className="h-[60vh] sm:h-[85vh]  bg-white dark:bg-gray-900 
        text-black dark:text-white rounded-t-xl rounded-b-none border-b-0"
      >
        <SheetHeader className="space-y-6">
          <SheetTitle className="text-2xl sm:text-3xl font-bold flex flex-col items-center gap-2">
            <Trophy className="w-8 md:w-16 h-8 md:h-16 text-primary" />
            Powers Mastered
          </SheetTitle>

          <SheetDescription className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-lg">
              <Star className="w-6 h-6 text-yellow-500" />
              <span className="font-medium">{points} / 8 points earned</span>
            </div>

            <div className="space-y-3 text-center">
              <p className="text-gray-600 dark:text-gray-400 max-w-md">
                You've mastered all card powers! Time to put your skills to the
                test in real gameplay scenarios.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => setShowCompletion(false)}
                className="w-full sm:w-auto"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Review Powers
              </Button>
              <Button
                onClick={onComplete}
                className="w-full sm:w-auto bg-primary hover:bg-primary/90"
              >
                Start Your First Game
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            <motion.div className="flex items-center gap-2">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="h-2 w-16 rounded-full bg-primary"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                />
              ))}
              <div className="h-2 w-16 rounded-full bg-gray-700/30" />
            </motion.div>
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};

const INITIAL_GAME_STATE = {
  isPenalty: false,
  selectedCards: [],
  currentSuit: null,
  desiredSuit: null,
  desiredRank: null,
  direction: 1,
  isKickback: false,
  discardPile: [],
  playerHand: [],
  isPlayerKadi: false,
  aiHand: [],
  currentSuit: null,
  turn: "player",
  topCard: null,
  drawPileLength: 54,
  jumpCounter: 0,
};

const CardPowers = ({ cardDimensions, handleCompleteModule }) => {
  const dispatch = useDispatch();
  const isMobile = useIsMobile();

  const userProfile = useSelector((state) => state.auth.profile);

  const [loading, setLoading] = useState(false);
  const [invalidMove, setInvalidMove] = useState(false);
  const [currentScenario, setCurrentScenario] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedScenarios, setCompletedScenarios] = useState(new Set());
  const [selectedCards, setSelectedCards] = useState([]);
  const [showHint, setShowHint] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [points, setPoints] = useState(0);
  const [isValidatingMove, setIsValidatingMove] = useState(false);
  const [lastPlayedCard, setLastPlayedCard] = useState(null);
  const [showCompletion, setShowCompletion] = useState(false);

  const [showScenarioComplete, setShowScenarioComplete] = useState(false);
  const [completedScenario, setCompletedScenario] = useState(null);
  const [showScenarioIntro, setShowScenarioIntro] = useState(true);

  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [openSuitModal, setOpenSuitModal] = useState(false);

  const [gameState, setGameState] = useState(INITIAL_GAME_STATE);

  const tutorialPlayerObj = {
    playerDeck: ["4H", "5H", "6C", "7C"],
    on: false,
  };

  const scenario = scenarios[currentScenario];
  const step = scenario.steps[currentStep];

  const startCardAnimation = ({
    cardId,
    cardValue,
    sourceRect,
    targetRect,
    onComplete,
  }) => {
    dispatch(
      startAnimation({
        id: cardId,
        value: cardValue,
        sourceRect,
        targetRect,
        onComplete,
      })
    );
  };

  // Add card selection handling
  // Handle card selection
  const handleCardSelection = useCallback(
    (card) => {
      if (loading || isValidatingMove) return;

      // Get current scenario and step
      // const scenario = scenarios[currentScenario];
      // const step = scenario.steps[currentStep];

      // console.log("### CURRENT SCENARIO ###");
      // console.log(scenario);

      // console.log("CURRENT STEP ###");
      // console.log(step);

      // For pair validation steps, manage card selection differently
      if (step.type.includes("pair")) {
        setLastPlayedCard(card);
        // onCardSelect(card.value); // Allow selection without validation
        setSelectedCards((prev) =>
          prev.includes(card.value)
            ? prev.filter((c) => c !== card.value)
            : [...prev, card.value]
        );

        return;
      }

      // For single card steps, validate immediately
      const isValid = step.validation(card.value);
      if (isValid) {
        setLastPlayedCard(card);
        // onCardSelect(card.value);

        setSelectedCards((prev) =>
          prev.includes(card.value)
            ? prev.filter((c) => c !== card.value)
            : [...prev, card.value]
        );
      } else {
        setLastPlayedCard(card);
        setTimeout(() => setLastPlayedCard(null), 500);
      }
    },
    [loading, isValidatingMove, currentScenario, currentStep]
  );

  const handlePlayAces = async (desiredSuit = "") => {
    if (!selectedCards.length || isAnimating) return;

    try {
      // Validate move based on step type
      setIsAnimating(true);
      const isValid = step.validation(desiredSuit);

      if (isValid) {
        if (step.feedback) {
          setFeedbackMessage(step.feedback);
          setShowFeedback(true);
        }

        // Get target element (center table)
        const targetElement = document.getElementById("table-drop-target");
        const targetRect = targetElement.getBoundingClientRect();

        const sourceCard = document.querySelector(
          `[data-card="${selectedCards[0]}"]`
        );
        const sourceRect = sourceCard.getBoundingClientRect();

        const startX = sourceRect.x + sourceRect.width / 2;

        // Start animation
        await new Promise((resolve) => {
          startCardAnimation({
            cardId: selectedCards[0],
            cardValue: selectedCards[0],
            sourceRect: {
              x: sourceRect.x + (sourceRect.width - cardDimensions.width) / 2,
              y: sourceRect.y + (sourceRect.height - cardDimensions.height) / 2,
              width: cardDimensions.width,
              height: cardDimensions.height,
            },
            targetRect: {
              x: startX,
              y: targetRect.y + (targetRect.height - cardDimensions.height) / 2,
              width: cardDimensions.width,
              height: cardDimensions.height,
            },
            onComplete: () => {
              setGameState((prevState) => {
                const playedCard = selectedCards[0];
                return {
                  ...prevState,
                  playerHand: prevState.playerHand.filter(
                    (card) => !selectedCards.includes(card)
                  ),
                  discardPile: [...prevState.discardPile, playedCard],
                  currentSuit: desiredSuit,
                  desiredSuit: desiredSuit,
                  topCard: playedCard,
                  turn: "ai",
                };
              });

              setCurrentStep((prev) => prev + 1);

              resolve();
            },
          });
        });
      } else {
        setErrorMessage("Invalid move! Try again.");
      }
    } finally {
      setIsAnimating(false);
      setSelectedCards([]);
      setShowHint(false);
    }
  };

  // Validate move and progress
  const handlePlayMove = async () => {
    if (!selectedCards.length || isAnimating) return;

    if (selectedCards[0].slice(0, -1) === "A") {
      handleOpenSuitModal();

      setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, 500);
      return;
    }

    setIsAnimating(true);

    try {
      // Validate move based on step type
      const isValid = step.type.includes("pair")
        ? step.validation(selectedCards)
        : step.validation(selectedCards[0]);

      if (isValid) {
        if (step.feedback) {
          setFeedbackMessage(step.feedback);
          setShowFeedback(true);
        }

        // Get target element (center table)
        const targetElement = document.getElementById("table-drop-target");
        const targetRect = targetElement.getBoundingClientRect();

        const sourceCard = document.querySelector(
          `[data-card="${selectedCards[0]}"]`
        );
        const sourceRect = sourceCard.getBoundingClientRect();
        const startX = sourceRect.x + sourceRect.width / 2;

        // Start animation
        await new Promise((resolve) => {
          startCardAnimation({
            cardId: selectedCards[0],
            cardValue: selectedCards[0],
            sourceRect: {
              x: sourceRect.x + (sourceRect.width - cardDimensions.width) / 2,
              y: sourceRect.y + (sourceRect.height - cardDimensions.height) / 2,
              width: cardDimensions.width,
              height: cardDimensions.height,
            },
            targetRect: {
              x: startX,
              y: targetRect.y + (targetRect.height - cardDimensions.height) / 2,
              width: cardDimensions.width,
              height: cardDimensions.height,
            },
            onComplete: () => {
              if (
                step.type === "invalid-single" ||
                step.type === "valid-question"
              ) {
                setGameState((prevState) => {
                  const playedCard = selectedCards[0];
                  return {
                    ...prevState,
                    playerHand: prevState.playerHand.filter(
                      (card) => !selectedCards.includes(card)
                    ),
                    discardPile: [...prevState.discardPile, playedCard],
                    currentSuit: playedCard.slice(-1),
                    topCard: playedCard,
                  };
                });
              } else if (
                scenarios[currentScenario].steps[currentStep].type ===
                "play-king"
              ) {
                setGameState((prevState) => {
                  const playedCard = selectedCards[0];
                  return {
                    ...prevState,
                    playerHand: prevState.playerHand.filter(
                      (card) => !selectedCards.includes(card)
                    ),
                    discardPile: [...prevState.discardPile, playedCard],
                    currentSuit: playedCard.slice(-1),
                    isKickback: true,
                    turn: "ai",
                    topCard: playedCard,
                  };
                });
              } else if (
                scenarios[currentScenario].steps[currentStep].type ===
                "regular-play-aces"
              ) {
                setTimeout(() => {
                  setCompletedScenarios(
                    (prev) => new Set([...prev, scenario.id])
                  );
                  setPoints((prev) => prev + scenario.points);
                  setCompletedScenario(scenario);
                }, 3000);
              } else {
                setGameState((prevState) => {
                  const playedCard = selectedCards[0];
                  return {
                    ...prevState,
                    playerHand: prevState.playerHand.filter(
                      (card) => !selectedCards.includes(card)
                    ),
                    discardPile: [...prevState.discardPile, playedCard],
                    currentSuit: playedCard.slice(-1),
                    turn: "ai",
                    topCard: playedCard,
                  };
                });
              }

              resolve();
            },
          });
        });

        // Progress to next step or scenario
        if (currentStep < scenario.steps.length - 1) {
          setTimeout(() => {
            setCurrentStep((prev) => prev + 1);
          }, 3000);
        } else {
          if (currentScenario < scenarios.length - 1) {
            setCompletedScenarios((prev) => new Set([...prev, scenario.id]));
            setPoints((prev) => prev + scenario.points);
            setCompletedScenario(scenario);

            setTimeout(() => {
              setShowScenarioComplete(true);
            }, 3000);
          } else {
            setCompletedScenarios((prev) => new Set([...prev, scenario.id]));
            setPoints(points + scenario.points);

            setTimeout(() => {
              setShowCompletion(true);
            }, 2000);
          }
        }
      } else {
        setErrorMessage("Invalid move! Try again.");
      }
    } finally {
      setIsAnimating(false);
      setSelectedCards([]);
      setShowHint(false);
    }
  };

  const handleDrawCard = async () => {
    // Only allow drawing during force-draw step
    if (!(scenario.id === "question-pairs" && step.type === "force-draw")) {
      return;
    }

    setIsAnimating(true);

    try {
      const drawPile = document.getElementById("table-drop-target");
      const drawPileRect = drawPile.getBoundingClientRect();

      const targetElement = document.getElementById("player-deck");
      const targetRect = targetElement.getBoundingClientRect();

      const startX = targetRect.x + targetRect.width / 2;

      // Start draw animation using our animation system
      await new Promise((resolve) => {
        startCardAnimation({
          cardId: "draw-10H",
          cardValue: "10H",
          sourceRect: {
            x: drawPileRect.x,
            y: drawPileRect.y,
            width: drawPileRect.width,
            height: drawPileRect.height,
          },
          targetRect: {
            x: startX,
            y: targetRect.y + (targetRect.height - cardDimensions.height) / 2,
            width: cardDimensions.width,
            height: cardDimensions.height,
          },
          onComplete: () => {
            setGameState((prev) => ({
              ...prev,
              playerHand: [...prev.playerHand, "10H"],
            }));

            setTimeout(() => {
              setCurrentStep((prev) => prev + 1);

              setGameState((prev) => ({
                ...prev,
                playerHand: ["QH", "8H", "4H", "5D"],
                discardPile: ["6S"],
              }));
            }, 3000);
            resolve();
          },
        });
      });
    } finally {
      setIsAnimating(false);
    }
  };

  const handleMultipleDraws = async (cards, player) => {
    // Get draw pile and hand positions
    const drawPile = document.getElementById("table-drop-target");
    const drawPileRect = drawPile.getBoundingClientRect();

    // Get target element (center table)
    let targetElement =
      player === "player"
        ? document.getElementById("player-deck")
        : document.getElementById("opponent-deck");

    const targetRect = targetElement.getBoundingClientRect();

    const startX =
      targetRect.x + targetRect.width / 2 - (cards.length * 20) / 2;

    // Animate cards one by one
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];

      // Add slight delay between each card
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Animate current card
      await new Promise((resolve) => {
        startCardAnimation({
          cardId: `draw-card-${i}`,
          cardValue: card,
          sourceRect: {
            x: drawPileRect.x + (drawPileRect.width - cardDimensions.width) / 2,
            y:
              drawPileRect.y +
              (drawPileRect.height - cardDimensions.height) / 2,
            width: cardDimensions.width,
            height: cardDimensions.height,
          },
          targetRect: {
            // Add slight offset for each card
            x: startX + i * 20, // Fan out cards
            y: targetRect.y + (targetRect.height - cardDimensions.height) / 2,
            width: cardDimensions.width,
            height: cardDimensions.height,
          },
          onComplete: () => {
            // Update game state
            setGameState((prev) => ({
              ...prev,
              turn: player === "player" ? "ai" : "player",
              isPenalty: false,
              playerHand:
                player === "player"
                  ? [...prev.playerHand, card]
                  : prev.playerHand,
              aiHand: player === "ai" ? [...prev.aiHand, card] : prev.aiHand,
              lastGamePlay: {
                player: player === "player" ? "player" : "ai",
                card: null,
                type: "drawPenalty",
              },
            }));
            resolve();
          },
        });
      });
    }

    // // Update game state with new cards
    // setGameState((prev) => ({
    //   ...prev,
    //   playerHand: [...prev.playerHand, ...cardsToAdd.map((card) => card.value)],
    // }));

    return cards;
  };

  const handleAcceptJump = () => {
    if (scenarios[currentScenario].steps[currentStep].type !== "forced-skip") {
      return;
    }

    setLoading(true);

    setTimeout(() => {
      if (gameState.jumpCounter > 0) {
        setGameState((prevState) => ({
          ...prevState,
          jumpCounter: prevState.jumpCounter - 1,
          turn: "ai",
          lastGamePlay: {
            player: "player",
            card: null,
            type: "acceptJump",
          },
        }));
      }

      setLoading(false);

      setCurrentStep((prev) => prev + 1);
    }, 500);

    // console.log("setting the next step here >>>");
  };

  const handleDrawPenalty = async () => {
    if (scenarios[currentScenario].steps[currentStep].type !== "force-draw") {
      return;
    }

    await handleMultipleDraws(["2H", "3H"], "player");

    setTimeout(() => {
      setCurrentStep((prev) => prev + 1);

      setGameState((prevState) => ({
        ...prevState,
        turn: "player",
      }));
    }, 5000);
  };

  const handleCompleteScenario = () => {
    setTimeout(() => {
      // complete scenario
      setCompletedScenarios((prev) => new Set([...prev, scenario.id]));
      setPoints((prev) => prev + scenario.points);
      setCompletedScenario(scenario);

      setTimeout(() => {
        setShowScenarioComplete(true);
      }, 3000);
    }, 1000);
  };

  const handleOpponentAnswerMove = async (cardToPlay) => {
    const targetElement = document.getElementById("table-drop-target");
    const targetRect = targetElement.getBoundingClientRect();

    const sourceRect = {
      x: window.innerWidth / 2,
      y: 0,
      width: targetRect.width,
      height: targetRect.height,
    };

    // Animate AI card play
    await new Promise((resolve) => {
      startCardAnimation({
        cardId: cardToPlay,
        cardValue: cardToPlay,
        sourceRect,
        targetRect,
        onComplete: resolve,
      });
    });

    // Update game state after opponent plays kickback card
    setGameState((prevState) => ({
      ...prevState,
      discardPile: [...prevState.discardPile, cardToPlay],
      aiHand: prevState.aiHand.filter((card) => card !== cardToPlay),
      topCard: cardToPlay,
      currentSuit: cardToPlay.slice(-1),
      turn: "player",
      lastGamePlay: {
        player: "ai",
        card: null,
        type: "play",
      },
    }));

    setTimeout(() => {
      // complete scenario
      setCurrentStep((prev) => prev + 1);
    }, 1000);
  };

  const handleOpponentJumpMove = async (cardToPlay) => {
    // Get source element (AI's hand) and target element (discard pile)
    const targetElement = document.getElementById("table-drop-target");
    const targetRect = targetElement.getBoundingClientRect();

    // Use approximate source position for AI card (top of screen)
    const sourceRect = {
      x: window.innerWidth / 2,
      y: 0,
      width: targetRect.width,
      height: targetRect.height,
    };

    // Animate AI card play
    await new Promise((resolve) => {
      startCardAnimation({
        cardId: cardToPlay,
        cardValue: cardToPlay,
        sourceRect,
        targetRect,
        onComplete: resolve,
      });
    });

    // Update game state after AI plays jump card
    setGameState((prevState) => ({
      ...prevState,
      discardPile: [...prevState.discardPile, cardToPlay],
      aiHand: prevState.aiHand.filter((card) => card !== cardToPlay),
      topCard: cardToPlay,
      currentSuit: cardToPlay.slice(-1),
      jumpCounter: prevState.jumpCounter + 1,
      turn: "player",
      lastGamePlay: {
        player: "ai",
        card: null,
        type: "jump",
      },
    }));

    setTimeout(() => {
      setCurrentStep((prev) => prev + 1);
    }, 1000);
  };

  const handleOpponentAcceptJump = () => {
    // console.log("setting game state");
    setGameState((prevState) => ({
      ...prevState,
      turn: "player",
      lastGamePlay: {
        player: "ai",
        card: null,
        type: "acceptJump",
      },
    }));

    setTimeout(() => {
      setCurrentStep((prev) => prev + 1);
    }, 1000);
  };

  const handleOpponentKickback = async (cardToPlay) => {
    const targetElement = document.getElementById("table-drop-target");
    const targetRect = targetElement.getBoundingClientRect();

    const sourceRect = {
      x: window.innerWidth / 2,
      y: 0,
      width: targetRect.width,
      height: targetRect.height,
    };

    // Animate AI card play
    await new Promise((resolve) => {
      startCardAnimation({
        cardId: cardToPlay,
        cardValue: cardToPlay,
        sourceRect,
        targetRect,
        onComplete: resolve,
      });
    });

    // Update game state after opponent plays kickback card
    setGameState((prevState) => ({
      ...prevState,
      discardPile: [...prevState.discardPile, cardToPlay],
      aiHand: prevState.aiHand.filter((card) => card !== cardToPlay),
      topCard: cardToPlay,
      currentSuit: cardToPlay.slice(-1),
      isKickback: true,
      turn: "player",
      lastGamePlay: {
        player: "ai",
        card: null,
        type: "kickback",
      },
    }));

    setTimeout(() => {
      setCurrentStep((prev) => prev + 1);
    }, 1000);
  };

  // kickback handlers
  const handleOpponentAcceptKickback = () => {
    // console.log("setting game state");
    setGameState((prevState) => ({
      ...prevState,
      turn: "player",
      isKickback: false,
      direction: -prevState.direction,
      lastGamePlay: {
        player: "ai",
        card: null,
        type: "acceptKickback",
      },
    }));

    setTimeout(() => {
      // move to next step
      setCurrentStep((prev) => prev + 1);
    }, 1000);
  };

  const handleOpponentMove = async (cardToPlay) => {
    const targetElement = document.getElementById("table-drop-target");
    const targetRect = targetElement.getBoundingClientRect();

    const sourceCard = document.querySelector(`[data-card="${cardToPlay}"]`);
    const sourceCardRect = sourceCard.getBoundingClientRect();

    const startX = sourceCardRect.x + sourceCardRect.width / 2;

    // Animate AI card play
    await new Promise((resolve) => {
      startCardAnimation({
        cardId: cardToPlay,
        cardValue: cardToPlay,
        sourceRect: {
          x:
            sourceCardRect.x +
            (sourceCardRect.width - cardDimensions.width) / 2,
          y:
            sourceCardRect.y +
            (sourceCardRect.height - cardDimensions.height) / 2,
          width: cardDimensions.width,
          height: cardDimensions.height,
        },
        targetRect: {
          x: startX,
          y: targetRect.y + (targetRect.height - cardDimensions.height) / 2,
          width: cardDimensions.width,
          height: cardDimensions.height,
        },
        onComplete: () => {
          if (step.type === "opponent-play-answer") {
            setGameState((prevState) => ({
              ...prevState,
              discardPile: [...prevState.discardPile, cardToPlay],
              aiHand: prevState.aiHand.filter((card) => card !== cardToPlay),
              topCard: cardToPlay,
              currentSuit: cardToPlay.slice(-1),
              turn: "player",
              lastGamePlay: {
                player: "ai",
                card: null,
                type: "play",
              },
            }));

            setTimeout(() => {
              setCurrentStep((prev) => prev + 1);
            }, 500);
          } else if (step.type === "opponent-jump-attempt") {
            setGameState((prevState) => ({
              ...prevState,
              discardPile: [...prevState.discardPile, cardToPlay],
              aiHand: prevState.aiHand.filter((card) => card !== cardToPlay),
              topCard: cardToPlay,
              currentSuit: cardToPlay.slice(-1),
              jumpCounter: prevState.jumpCounter + 1,
              turn: "player",
              lastGamePlay: {
                player: "ai",
                card: null,
                type: "play",
              },
            }));

            setCurrentStep((prev) => prev + 1);
          } else if (
            step.type === "opponent-play-after-skip" ||
            step.type === "opponent-play-after-kickback"
          ) {
            setGameState((prevState) => ({
              ...prevState,
              discardPile: [...prevState.discardPile, cardToPlay],
              aiHand: prevState.aiHand.filter((card) => card !== cardToPlay),
              topCard: cardToPlay,
              currentSuit: cardToPlay.slice(-1),
              turn: "player",
              lastGamePlay: {
                player: "ai",
                card: null,
                type: "play",
              },
            }));

            setTimeout(() => {
              handleCompleteScenario();
            }, 1500);
          } else if (step.type === "opponent-kickback-attempt") {
            setGameState((prevState) => ({
              ...prevState,
              discardPile: [...prevState.discardPile, cardToPlay],
              aiHand: prevState.aiHand.filter((card) => card !== cardToPlay),
              topCard: cardToPlay,
              currentSuit: cardToPlay.slice(-1),
              isKickback: true,
              turn: "player",
              lastGamePlay: {
                player: "ai",
                card: null,
                type: "play",
              },
            }));

            setTimeout(() => {
              setCurrentStep((prev) => prev + 1);
            }, 500);
          } else if (step.type === "penalty-intro") {
            setGameState((prevState) => ({
              ...prevState,
              discardPile: [...prevState.discardPile, cardToPlay],
              aiHand: prevState.aiHand.filter((card) => card !== cardToPlay),
              topCard: cardToPlay,
              isPenalty: true,
              currentSuit: cardToPlay.slice(-1),
              turn: "player",
              lastGamePlay: {
                player: "ai",
                card: null,
                type: "play",
              },
            }));

            setTimeout(() => {
              setCurrentStep((prev) => prev + 1);
            }, 1000);
          } else {
            setGameState((prevState) => ({
              ...prevState,
              discardPile: [...prevState.discardPile, cardToPlay],
              aiHand: prevState.aiHand.filter((card) => card !== cardToPlay),
              topCard: cardToPlay,
              currentSuit: cardToPlay.slice(-1),
              turn: "player",
              lastGamePlay: {
                player: "ai",
                card: null,
                type: "play",
              },
            }));
          }
          resolve();
        },
      });
    });
  };

  const handleOpponentMoveAces = async (cardToPlay) => {
    const targetElement = document.getElementById("table-drop-target");
    const targetRect = targetElement.getBoundingClientRect();

    const sourceRect = {
      x: window.innerWidth / 2,
      y: 0,
      width: targetRect.width,
      height: targetRect.height,
    };

    // Animate AI card play
    await new Promise((resolve) => {
      startCardAnimation({
        cardId: cardToPlay,
        cardValue: cardToPlay,
        sourceRect,
        targetRect,
        onComplete: resolve,
      });
    });

    // Update game state after opponent plays kickback card
    setGameState((prevState) => ({
      ...prevState,
      discardPile: [...prevState.discardPile, cardToPlay],
      aiHand: prevState.aiHand.filter((card) => card !== cardToPlay),
      topCard: cardToPlay,
      currentSuit: cardToPlay.slice(-1),
      turn: "player",
      lastGamePlay: {
        player: "ai",
        card: null,
        type: "play",
      },
    }));

    setSelectedCards([]);

    setCurrentStep((prev) => prev + 1);
  };

  const handleAcceptKickback = () => {
    if (
      scenarios[currentScenario].steps[currentStep].type !==
      "forced-accept-kickback"
    ) {
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setGameState((prevState) => ({
        ...prevState,
        jumpCounter: prevState.jumpCounter - 1,
        turn: "ai",
        isKickback: false,
        direction: -prevState.direction,
        lastGamePlay: {
          player: "player",
          card: null,
          type: "acceptKickback",
        },
      }));

      setLoading(false);

      setCurrentStep((prev) => prev + 1);
    }, 1500);

    // console.log("setting the next step here >>>");
  };

  // penalty handlers
  const handleOpponentPenaltyMove = async (cardToPlay) => {
    const targetElement = document.getElementById("table-drop-target");
    const targetRect = targetElement.getBoundingClientRect();

    const sourceCard = document.querySelector(`[data-card="${cardToPlay}"]`);
    const sourceRect = sourceCard.getBoundingClientRect();

    // Animate AI card play
    await new Promise((resolve) => {
      startCardAnimation({
        cardId: cardToPlay,
        cardValue: cardToPlay,
        sourceRect,
        targetRect,
        onComplete: resolve,
      });
    });

    // Update game state after opponent plays kickback card
    setGameState((prevState) => ({
      ...prevState,
      discardPile: [...prevState.discardPile, cardToPlay],
      aiHand: prevState.aiHand.filter((card) => card !== cardToPlay),
      topCard: cardToPlay,
      currentSuit: cardToPlay.slice(-1),
      isPenalty: true,
      turn: "player",
      lastGamePlay: {
        player: "ai",
        card: null,
        type: "play",
      },
    }));

    setCurrentStep((prev) => prev + 1);
  };

  const handleOpponentPenaltyDraw = async (n) => {
    // Update game state after opponent plays kickback card
    if (n == 2) {
      await handleMultipleDraws(["JS", "QS"], "ai");
    } else if (n == 3) {
      await handleMultipleDraws(["JH", "9D", "10S"], "ai");
    } else {
      await handleMultipleDraws(["3C", "QC", "KS", "KC", "10D"], "ai");
    }

    if (step.type === "opponent-draws-5") {
      setTimeout(() => {
        handleCompleteScenario();
      }, 1500);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  // Reset current scenario
  const handleReset = () => {
    setCurrentStep(0);
    setSelectedCards([]);
    setShowHint(false);
    setErrorMessage("");
  };

  const handleOpenSuitModal = () => {
    setOpenSuitModal(true);
  };

  const handleCloseSuitModal = () => setOpenSuitModal(false);

  const handleProgressReset = (index) => {
    setCurrentScenario(index);
    setCurrentStep(0);
    setSelectedCards([]);
    setShowHint(false);
    setErrorMessage("");
  };

  // handle answers

  useEffect(() => {
    // console.log("### EFFECT OPP(kickback) MOVE NOW ###");
    // const step = scenarios[currentScenario].steps[currentStep];

    // console.log(step);
    if (step.type === "opponent-play-answer" && step.aiPlay) {
      // console.log("### Executing opponet move >>>");
      const executeOpponentMove = async () => {
        setIsAnimating(true);
        try {
          setTimeout(async () => {
            await handleOpponentMove(step.aiPlay);
          }, 3000);
        } finally {
          setIsAnimating(false);
        }
      };
      executeOpponentMove();
    }

    if (
      (step.type === "opponent-play-after-skip" && step.aiPlay) ||
      (step.type === "opponent-play-after-kickback" && step.aiPlay)
    ) {
      const executeOpponentMove = async () => {
        setIsAnimating(true);
        try {
          setTimeout(async () => {
            await handleOpponentMove(step.aiPlay);
          }, 3000);
        } finally {
          setIsAnimating(false);
        }
      };
      executeOpponentMove();
    }
  }, [currentStep, currentScenario]);

  useEffect(() => {
    // const scenario = scenarios[currentScenario];
    // const step = scenario.steps[currentStep];

    if (step.type === "ai-receive-jump" && step.aiPlay) {
      // console.log("### PLAYING AI CARD ###");
      // console.log(step.aiPlay);

      // Animate AI playing the jump card
      const playAICard = async () => {
        // Add animation for AI playing JS
        // await animateCardPlay(step.aiPlay, 'ai');
        // Progress to next step
        setCurrentStep((prev) => prev + 1);
      };

      playAICard();
    }
  }, [currentScenario, currentStep]);

  // scenario intro
  useEffect(() => {
    setShowScenarioIntro(true);
  }, [currentScenario]);

  // hande ai jump moves
  useEffect(() => {
    // console.log("### EFFECT OPP(JUMP) MOVE NOW ###");
    // const step = scenarios[currentScenario].steps[currentStep];

    // console.log(step);

    if (step.type === "opponent-accept-jump") {
      // console.log("opponent accepting jump now###");
      setTimeout(() => {
        handleOpponentAcceptJump();
      }, 3000);
    }

    if (step.type === "opponent-jump-attempt" && step.aiPlay) {
      // reset game state for next demo

      setTimeout(() => {
        setGameState((prevState) => {
          return {
            ...prevState,
            playerHand: ["2H", "3H", "JOK1", "4H"],
            discardPile: ["10S"],
            currentSuit: "S",
            turn: "ai",
            topCard: "10S",
          };
        });
      }, 1500);

      setTimeout(() => {
        const executeAIJump = async () => {
          setIsAnimating(true);
          try {
            setTimeout(async () => {
              await handleOpponentMove(step.aiPlay);
            }, 3000);
          } finally {
            setIsAnimating(false);
          }
        };
        executeAIJump();
      }, 3000);
    }
  }, [currentStep, currentScenario]);

  // handle opponent(kickbacks)
  useEffect(() => {
    // console.log("### EFFECT OPP(kickback) MOVE NOW ###");
    // const step = scenarios[currentScenario].steps[currentStep];

    // console.log(step);

    if (step.type === "opponent-accept-kickback") {
      // console.log("opponent accepting kickback now ###");
      setTimeout(() => {
        handleOpponentAcceptKickback();
      }, 3000);
    }

    // if (step.type === "opponent-kickback-attempt") {
    //   console.log("resetting state for (forced kickback)>>>");

    //   setGameState((prevState) => {
    //     return {
    //       ...prevState,
    //       playerHand: ["2C", "10S", "4H", "5D"],
    //       discardPile: ["QD"],
    //       currentSuit: "S",
    //       turn: "ai",
    //       topCard: "QD",
    //     };
    //   });
    // }

    if (step.type === "opponent-kickback-attempt" && step.aiPlay) {
      // console.log("### Executing oppone tkickback >>>");
      const executeOpponentKickback = async () => {
        setIsAnimating(true);
        try {
          setTimeout(async () => {
            await handleOpponentMove(step.aiPlay);
          }, 3000);
        } finally {
          setIsAnimating(false);
        }
      };
      executeOpponentKickback();
    }

    if (step.type === "opponent-play" && step.aiPlay) {
      // console.log("### Executing opponet move >>>");
      const executeOpponentMove = async () => {
        setIsAnimating(true);
        try {
          setTimeout(async () => {
            await handleOpponentMove(step.aiPlay);
          }, 3000);
        } finally {
          setIsAnimating(false);
        }
      };
      executeOpponentMove();
    }
  }, [currentStep, currentScenario]);

  // handle opponent aces
  useEffect(() => {
    // console.log("### EFFECT OPP(JUMP) MOVE NOW ###");
    // const step = scenarios[currentScenario].steps[currentStep];

    if (step.type === "opponent-follows" && step.aiPlay) {
      // console.log("### Executing opponet move >>>");
      const executeOpponentMove = async () => {
        setIsAnimating(true);
        try {
          setTimeout(async () => {
            await handleOpponentMove(step.aiPlay);
          }, 3000);
        } finally {
          setIsAnimating(false);
        }
      };
      executeOpponentMove();

      setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, 1000);
    }
  }, [currentStep, currentScenario]);

  // handle opponent penalties
  useEffect(() => {
    if (scenario.id === "penalty-cards" && showScenarioIntro === false) {
      // const step = scenarios[currentScenario].steps[currentStep];

      // console.log(scenario.id);
      // console.log(showScenarioIntro === false && "YES");

      // console.log(step);

      if (step.type === "penalty-intro" && step.aiPlay) {
        setGameState((prevState) => {
          return {
            ...prevState,
            turn: "ai",
          };
        });

        const executeOpponentMove = async () => {
          setIsAnimating(true);
          try {
            setTimeout(async () => {
              await handleOpponentMove(step.aiPlay);
            }, 3000);
          } finally {
            setIsAnimating(false);
          }
        };

        setTimeout(() => {
          executeOpponentMove();
        }, 1000);
      }
    }
  }, [showScenarioIntro]);

  useEffect(() => {
    if (step.type === "opponent-draws") {
      // console.log("### Executing opponet move (penalty draw) >>>");
      const executeOpponentMove = async () => {
        setIsAnimating(true);
        try {
          setTimeout(async () => {
            await handleOpponentPenaltyDraw(2);
          }, 3000);
        } finally {
          setIsAnimating(false);
        }
      };
      executeOpponentMove();
    }

    if (step.type === "opponent-draws-3") {
      // console.log("### Executing opponet move (penalty draw) >>>");
      const executeOpponentMove = async () => {
        setIsAnimating(true);
        try {
          setTimeout(async () => {
            await handleOpponentPenaltyDraw(3);
          }, 3000);
        } finally {
          setIsAnimating(false);
        }
      };
      executeOpponentMove();
    }

    if (step.type === "opponent-draws-5") {
      const executeOpponentMove = async () => {
        setIsAnimating(true);
        try {
          setTimeout(async () => {
            await handleOpponentPenaltyDraw(5);
          }, 3000);
        } finally {
          setIsAnimating(false);
        }
      };
      executeOpponentMove();
    }
  }, [currentStep, currentScenario]);

  // init game state
  useEffect(() => {
    const currentScenarioSetup = scenarios[currentScenario].setup;

    setGameState({
      discardPile: [currentScenarioSetup.topCard],
      playerHand: [...currentScenarioSetup.playerHand],
      aiHand: [...currentScenarioSetup.aiHand],
      direction: currentScenarioSetup.direction,
      currentSuit: currentScenarioSetup.topCard.slice(-1),
      turn: "player",
      topCard: currentScenarioSetup.topCard,
      drawPileLength: 10,
      jumpCounter: 0,
    });
  }, [currentScenario]);

  return (
    <>
      <TutorialCardAnimations />

      <TutorialSuitModal
        openSuitModal={openSuitModal}
        handleCloseSuitModal={handleCloseSuitModal}
        handleAces={handlePlayAces}
        tutorialInstruction="Choose Hearts as your demanded suit"
        correctSuit="H"
      />

      {/* {showCompletion && (
        <CompletionScreen
          showCompletion={showCompletion}
          setShowCompletion={setShowCompletion}
          points={points}
          completedScenarios={completedScenarios}
          handleCompleteModule={handleCompleteModule}
        />
      )} */}

      <CompletionSheet
        points={points}
        setShowCompletion={setShowCompletion}
        onComplete={handleCompleteModule}
        open={showCompletion}
      />

      {showScenarioIntro && (
        <ScenarioIntro
          scenario={scenario}
          onStart={() => setShowScenarioIntro(false)}
        />
      )}

      <AnimatePresence>
        {showScenarioComplete && completedScenario && (
          <ScenarioComplete
            scenario={completedScenario}
            points={scenario.points}
            onContinue={() => {
              setShowScenarioComplete(false);
              setCompletedScenario(null);
              setCurrentScenario((prev) => prev + 1);
              setCurrentStep(0);
            }}
          />
        )}
      </AnimatePresence>

      <div className="min-h-screen w-full md:max-w-5xl mx-auto">
        <div className="max-w-7xl mx-auto p-2 md:p-4 space-y-2 md:space-y-6">
          {/* Progress */}
          <ModuleProgress
            scenarios={scenarios}
            currentScenario={currentScenario}
            onReset={handleProgressReset}
          />

          <div
            className="relative w-full rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-800/50"
            style={{
              height: isMobile ? "60vh" : "70vh",
              boxShadow: "0 4px 30px rgba(0, 0, 0, 0.08)",
            }}
          >
            {showFeedback && (
              <Feedback
                message={feedbackMessage}
                onClose={() => setShowFeedback(false)}
              />
            )}

            <div
              id="opponent-deck"
              className={`
                  relative flex justify-center items-center p-1 py-1 w-11/12 mt-1
                  ${
                    gameState.turn === "ai"
                      ? "ring-2 ring-primary/80 bg-primary/5 dark:ring-primary/70 dark:bg-primary/10"
                      : "ring-1 ring-gray-200/10 dark:ring-gray-700/30"
                  }
                  transition-all duration-300 rounded-xl
              `}
              style={{
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
                top: 0,
                zIndex: 10,
              }}
            >
              <TutorialPlayerDeck playerDeck={gameState.aiHand} player={"ai"} />
            </div>

            <div
              className={`absolute rounded-xl z-100
                                transition-all duration-200`}
              style={{
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                width: isMobile ? "150px" : "400px",
                height: isMobile ? "150px" : "180px",
              }}
            >
              <TutorialGameDirection
                direction={gameState.direction}
                isKickback={gameState.isKickback}
                isMobile={isMobile}
              />

              <CenterTable
                loading={loading}
                topCard={scenarios[currentScenario].setup.topCard}
                handleDrawCard={handleDrawCard}
                canDraw={
                  (scenarios[currentScenario].id === "question-pairs" &&
                    currentStep === 1) ||
                  (scenarios[currentScenario].id === "penalty-cards" &&
                    currentStep === 1) ||
                  step.id === "force-draw"
                }
                roomData={gameState}
                handleDrawPenalty={handleDrawPenalty}
                handleAcceptJump={handleAcceptJump}
                handleAcceptKickback={handleAcceptKickback}
              />
            </div>

            <div
              id="player-deck"
              className={`
      relative flex justify-center items-center py-1 w-11/12 mb-2
      ${
        gameState.turn === "player"
          ? "ring-2 ring-primary/80 bg-primary/5 dark:ring-primary/70 dark:bg-primary/10"
          : "ring-1 ring-gray-200/10 dark:ring-gray-700/30"
      }
      transition-all duration-300 rounded-xl
    `}
              style={{
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
                bottom: 0,
                zIndex: 10,
              }}
            >
              <TutorialPlayerDeck
                playerDeck={gameState.playerHand}
                roomData={gameState}
                loading={loading}
                invalidMove={invalidMove}
                highlightedCards={scenario.steps[currentStep].highlight || []}
                currentStep={currentStep}
                onCardSelect={(card) => {
                  setSelectedCards((prev) =>
                    prev.includes(card)
                      ? prev.filter((c) => c !== card)
                      : [...prev, card]
                  );
                }}
                selectedCards={selectedCards}
                validMoves={scenarios[currentScenario].setup.validMoves || []}
                isValidatingMove={isValidatingMove}
                scenarios={scenarios}
                currentScenario={currentScenario}
                handleCardClick={handleCardSelection}
                lastPlayedCard={lastPlayedCard}
              />
            </div>
          </div>

          {/* Instruction Area */}
          <div className="bg-gray-200 dark:bg-gray-800/50 rounded-xl p-4 md:p-6 space-y-2 md:space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div>
                  <h3 className="font-medium text-sm md:text-lg text-foreground">
                    {scenario.title}
                  </h3>
                  <p className="text-sm md:text-base text-gray-600 dark:text-muted-foreground">
                    {step.instruction}
                  </p>
                </div>{" "}
                {errorMessage && (
                  <p className="text-red-400 text-sm">{errorMessage}</p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowHint(true)}
                  className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 
                           text-gray-300 hover:text-white transition-colors"
                >
                  <Lightbulb className="w-4 h-4 md:w-5 md:h-5" />
                </button>
                <button
                  onClick={handleReset}
                  className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 
                           text-gray-300 hover:text-white transition-colors"
                >
                  <RotateCcw className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
            </div>

            {/* Hint Popup */}
            <AnimatePresence>
              {showHint && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="p-4 bg-gray-700 rounded-lg text-sm text-gray-300"
                >
                  {step.hint || "Try playing the highlighted card(s)!"}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action Area */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="text-sm md:text-md">{points} / 8 points</span>
            </div>

            {step.requireConfirmation && (
              <Button
                onClick={() => {
                  if (
                    step.type === "direction-demo" &&
                    step.requireConfirmation
                  ) {
                    setCurrentStep((prev) => prev + 1);
                  }
                }}
                className="px-6 py-2 rounded-lg bg-primary"
              >
                Continue
              </Button>
            )}

            {!step.requireConfirmation && (
              <Button
                onClick={handlePlayMove}
                disabled={!selectedCards.length || isAnimating}
                className="px-6 py-2 rounded-lg bg-primary hover:bg-primary/90 
                       font-medium disabled:opacity-50 
                       disabled:cursor-not-allowed transition-colors"
              >
                Play Move
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* <button onClick={() => console.log(gameState)}>GAME STATE</button>
      <br />
      <button onClick={() => console.log(scenarios[currentScenario])}>
        CURRENT SCENARIO
      </button>

      <button onClick={() => console.log(currentScenario)}>
        CURRENT SCENARIOII
      </button>
      <br />
      <button onClick={() => console.log(currentStep)}>CURRENT STEP</button>
      <br />
      <button onClick={() => setCounter(counter + 1)}>Counter</button> */}
    </>
  );
};

export default CardPowers;

const styles = `
  @keyframes float {
    0% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(450px) rotate(180deg); }
    100% { transform: translateY(900px) rotate(360deg); opacity: 0; }
  }

  .animate-float {
    animation: float 15s linear infinite;
  }
`;
