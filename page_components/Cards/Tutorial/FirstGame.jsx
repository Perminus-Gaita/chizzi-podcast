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
  BookOpen,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";

const scenarios = [
  {
    id: "complete-first-game",
    title: "Your First Game",
    description: "Experience a complete game combining all basic elements",
    points: 5,
    setup: {
      playerHand: [
        "6H",
        "6D", // Multiple card potential
        "QS",
        "4S", // Question-Answer pair
        "JH", // Jump defense
        "2D", // Penalty option
        "AH", // Control card
        "KD", // Direction control
        "5C", // Basic play option
      ],
      topCard: "6S",
      aiHand: [
        "6C", // Multiple play potential
        "8H",
        "4H", // Question-Answer pair
        "JS", // Jump threat
        "3C", // Penalty counter
        "KC", // Direction counter
        "5D", // Basic play
        "AS", // Control counter
      ],
      validMoves: ["6H", "6D"],
      requiredMoves: 12,
      direction: 1,
    },
    steps: [
      {
        type: "shuffle-deck",
        instruction: "Opponent (dealer) shuffles the deck",
        validation: () => true,
        feedback: "The deck has been shuffled",
      },
      {
        type: "deal-cards",
        instruction: "Watch as 4 cards are dealt to each player",
        validation: () => true,
        feedback: "Each player now has 4 cards",
      },
      {
        type: "start-card",
        instruction: "Dealer turns over the top card to start the game",
        validation: (card) =>
          !setup.gameState.invalidStartCards.includes(card[0]),
        feedback: "The game starts with {card}",
      },
      {
        type: "game-start",
        instruction:
          "You have multiple 6s. The first 6 must match the top card's suit (Diamonds). Play 6D first, then 6H.",
        highlight: ["6H", "6D"],
        validation: (cards) => {
          if (Array.isArray(cards)) {
            return cards.includes("6H") && cards.includes("6D");
          }
          return cards === "6H" || cards === "6D";
        },
        feedback: "Strong opening! Showing multiple card control",
      },
      {
        type: "opponent-play",
        instruction: "Opponent plays J♥ attempting to skip your turn!",
        aiPlay: "JH",
        validation: () => true,
        feedback: "You can counter this with your own Jack",
      },
      {
        type: "defensive-counter",
        instruction: "Counter with your J♠ to maintain your turn",
        highlight: "JS",
        validation: (card) => card === "JS",
        feedback: "Excellent defense! Turn maintained",
      },
      {
        type: "strategic-penalty",
        instruction: "Now play 2♠ to force opponent to draw 2 cards",
        highlight: "2S",
        validation: (card) => card === "2S",
        feedback: "Good pressure! Making opponent draw cards",
      },
      {
        type: "opponent-play",
        instruction: "Opponent counters with 3♠ - a bigger penalty!",
        aiPlay: "3S",
        validation: () => true,
        feedback: "Opponent blocked your penalty with a stronger one",
      },
      {
        type: "forced-draw",
        instruction: "Must draw 3 cards - penalty forces a skip",
        highlight: "drawPile",
        validation: () => true,
        feedback: "Sometimes accepting penalties is unavoidable",
      },
      {
        type: "opponent-play",
        instruction: "Opponent plays 4♠",
        aiPlay: "4S",
        validation: () => true,
        feedback: "Now it's your turn",
      },
      {
        type: "basic-play",
        instruction: "play 4♥",
        highlight: "4H",
        validation: (card) => card === "4H",
        feedback: "Good move matching the previous card's rank",
      },
      {
        type: "opponent-play",
        instruction: "Opponent plays K♥ attempting to reverse game direction",
        aiPlay: "KH",
        validation: () => true,
        feedback:
          "Opponent plays a Kickback Card to change the game's direction.",
      },
      {
        type: "accept-kickback",
        instruction: "You can counter with K or accept the direction change",
        options: ["Play KD", "Accept Reversal"],
        validation: (choice) => choice === "Accept Reversal",
        feedback: "Accepting the reversal - game now moves counterclockwise",
      },
      {
        type: "opponent-draw",
        instruction: "Opponent draws card",
        aiPlay: "JOK1",
        validation: () => true,
        feedback: "Now it's your turn in the new direction",
      },
      {
        type: "control-play",
        instruction: "Play A clubs to control the suit",
        highlight: "AC",
        options: ["Hearts", "Diamonds", "Clubs", "Spades"],
        validation: (card) => card === "AC",
        feedback:
          "You've used an Ace to control the game's suit. Choose wisely!",
      },
      {
        type: "win-setup",
        instruction:
          "Your next hand could win the game - click the 'KADI' to announce",
        highlight: "kadiButton",
        validation: (action) => action === "pressKadiButton",
        feedback:
          "Perfect! You've announced 'Niko Kadi' - you can win next round with your remaining cards. Remember, failing to announce means you can't win!",
        requireConfirmation: true,
      },
      {
        type: "opponent-draw",
        instruction: "Opponent draws another(q/a)",
        aiPlay: "8S",
        validation: () => true,
        feedback: "This is your chance to win after announcing Niko Kadi!",
      },
      {
        type: "winning-move",
        instruction: "Play 10 Diamonds finish the game!",
        highlight: "10D",
        validation: (card) => card === "10D",
        feedback:
          "Brilliant! You've won with a 10D You've mastered the basics of Kadi!",
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

const WelcomeOverlay = ({ onStart }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50"
    >
      {/* <div className="max-w-lg w-full mx-4 bg-white dark:bg-gray-900 rounded-xl p-6 shadow-xl">
        <div className="text-center space-y-4">
          <div className="flex justify-center gap-2 underline">
            <Trophy className="w-6 h-6 md:w-12 md:h-12 text-primary" />
            <h2 className="text-xl md:text-2xl font-bold text-foreground">
              Your First Game
            </h2>
          </div>

          <p className="text-muted-foreground">
            Let's bring everything together! Play a complete game using all the
            kadi basics you've learned.
          </p>

          <div className="py-4 space-y-3">
            <div
              className={cn(
                "flex items-center gap-3 rounded-lg p-3",
                "bg-muted/50 hover:bg-muted/80 transition-colors"
              )}
            >
              {" "}
              <Star className="w-5 h-5 text-yellow-500 flex-shrink-0" />
              <p className="text-sm text-gray-300 text-left">
                Earn 5 points by demonstrating mastery of basic game mechanics
              </p>
            </div>
            <div className="flex items-center gap-3 bg-gray-800/50 rounded-lg p-3">
              <BookOpen className="w-5 h-5 text-blue-500 flex-shrink-0" />
              <p className="text-sm text-gray-300 text-left">
                Experience turn sequences, special card combinations, and
                strategic decisions in a full game
              </p>
            </div>
          </div>

          <Button onClick={() => onStart()} className="w-full">
            Start First Game
          </Button>
        </div>
      </div> */}

      <Card className="max-w-lg w-full mx-4">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center items-center gap-2">
              <Trophy className="w-6 h-6 md:w-12 md:h-12 text-primary" />
              <h2 className="text-xl md:text-2xl font-bold text-foreground">
                Your First Game
              </h2>
            </div>

            <p className="text-muted-foreground">
              Let's bring everything together! Play a complete game using all
              the kadi basics you've learned.
            </p>

            <div className="py-4 space-y-3">
              <div
                className={cn(
                  "flex items-center gap-3 rounded-lg p-3",
                  "bg-muted/50 hover:bg-muted/80 transition-colors"
                )}
              >
                <Star className="w-5 h-5 text-yellow-500 dark:text-yellow-400 flex-shrink-0" />
                <p className="text-sm text-foreground/80 text-left">
                  Earn 5 points by demonstrating mastery of basic game mechanics
                </p>
              </div>

              <div
                className={cn(
                  "flex items-center gap-3 rounded-lg p-3",
                  "bg-muted/50 hover:bg-muted/80 transition-colors"
                )}
              >
                <BookOpen className="w-5 h-5 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                <p className="text-sm text-foreground/80 text-left">
                  Experience turn sequences, special card combinations, and
                  strategic decisions in a full game
                </p>
              </div>
            </div>

            <Button onClick={onStart} className="w-full" size="lg">
              Start First Game
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
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

const FirstGame = ({ cardDimensions }) => {
  const dispatch = useDispatch();
  const isMobile = useIsMobile();

  const shuffleSound = useRef(
    typeof Audio !== "undefined" ? new Audio("/cards/audio/shuffle.wav") : null
  );
  const cardPlace1 = useRef(
    typeof Audio !== "undefined"
      ? new Audio("/cards/audio/cardPlace1.wav")
      : null
  );

  const userProfile = useSelector((state) => state.auth.profile);

  const [loading, setLoading] = useState(false);
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

  const [invalidMove, setInvalidMove] = useState(false);

  const [showScenarioComplete, setShowScenarioComplete] = useState(false);
  const [completedScenario, setCompletedScenario] = useState(null);
  const [showScenarioIntro, setShowScenarioIntro] = useState(true);

  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [openSuitModal, setOpenSuitModal] = useState(false);

  const [isShuffling, setIsShuffling] = useState(false);

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

  const handleShufflingSequence = () => {
    setIsShuffling(true);
    shuffleSound.current?.play().catch(console.error);

    setTimeout(() => {
      setIsShuffling(false);

      setCurrentStep((prev) => prev + 1);
    }, 2000);
  };

  const handleDealSequence = async () => {
    const cards = ["6H", "2S", "6D", "JS", "JH", "4S", "KH", "3S"];

    let currentPlayerHand = [];
    let currentAIHand = [];

    // Get elements and dimensions
    const drawPile = document.getElementById("table-drop-target");
    const drawPileRect = drawPile.getBoundingClientRect();
    const playerDeck = document.getElementById("player-deck");
    const aiDeck = document.getElementById("opponent-deck");

    const cardDimensions = {
      width: isMobile ? 75 : 80,
      height: isMobile ? 105 : 112,
    };

    // First 4 cards go to first player, next 4 to second player
    const firstPlayer = "player";
    const secondPlayer = "ai";

    // Deal 4 cards alternating between players
    for (let cardNum = 0; cardNum < 4; cardNum++) {
      const playerStartX = playerDeck.getBoundingClientRect().x + cardNum * 20;
      const aiStartX = aiDeck.getBoundingClientRect().x + cardNum * 20;

      // Deal to first player
      await new Promise((resolve) => setTimeout(resolve, 200));
      await new Promise((resolve) => {
        startCardAnimation({
          cardId: `deal-${firstPlayer}-${cardNum}`,
          cardValue: cards[cardNum], // First player gets cards 0,1,2,3
          sourceRect: {
            x: drawPileRect.x + (drawPileRect.width - cardDimensions.width) / 2,
            y:
              drawPileRect.y +
              (drawPileRect.height - cardDimensions.height) / 2,
            width: cardDimensions.width,
            height: cardDimensions.height,
          },
          targetRect: {
            x: firstPlayer === "player" ? playerStartX : aiStartX,
            y:
              firstPlayer === "player"
                ? playerDeck.getBoundingClientRect().y
                : aiDeck.getBoundingClientRect().y,
            width: cardDimensions.width,
            height: cardDimensions.height,
          },
          onComplete: () => {
            if (firstPlayer === "player") {
              currentPlayerHand.push(cards[cardNum]);
            } else {
              currentAIHand.push(cards[cardNum]);
            }
            setGameState((prev) => ({
              ...prev,
              playerHand: [...currentPlayerHand],
              aiHand: [...currentAIHand],
            }));

            cardPlace1.current?.play().catch(console.error);
            resolve();
          },
        });
      });

      // Deal to second player
      await new Promise((resolve) => setTimeout(resolve, 200));
      await new Promise((resolve) => {
        startCardAnimation({
          cardId: `deal-${secondPlayer}-${cardNum}`,
          cardValue: cards[cardNum + 4], // Second player gets cards 4,5,6,7
          sourceRect: {
            x: drawPileRect.x + (drawPileRect.width - cardDimensions.width) / 2,
            y:
              drawPileRect.y +
              (drawPileRect.height - cardDimensions.height) / 2,
            width: cardDimensions.width,
            height: cardDimensions.height,
          },
          targetRect: {
            x: secondPlayer === "player" ? playerStartX : aiStartX,
            y:
              secondPlayer === "player"
                ? playerDeck.getBoundingClientRect().y
                : aiDeck.getBoundingClientRect().y,
            width: cardDimensions.width,
            height: cardDimensions.height,
          },
          onComplete: () => {
            // Update hand after card animation completes
            if (secondPlayer === "player") {
              currentPlayerHand.push(cards[cardNum + 4]);
            } else {
              currentAIHand.push(cards[cardNum + 4]);
            }
            setGameState((prev) => ({
              ...prev,
              playerHand: [...currentPlayerHand],
              aiHand: [...currentAIHand],
            }));

            resolve();
          },
        });
      });
    }

    setCurrentStep((prev) => prev + 1);
  };

  const handleFirstCardReveal = () => {
    if (step.type !== "start-card") return;

    setGameState((prev) => ({
      ...prev,
      turn: "player",
      discardPile: ["9D"],
      currentSuit: "D",
      topCard: "9D",
    }));

    setTimeout(() => {
      setCurrentStep((prev) => prev + 1);
    }, 2000);
  };

  const handleStartScenario = () => {
    setShowScenarioIntro(false);

    setTimeout(() => {
      handleShufflingSequence();
    }, 1500);
  };

  // Add card selection handling
  // Handle card selection
  const handleCardSelection = useCallback(
    (card) => {
      if (loading || isValidatingMove) return;

      // console.log("### CURRENT SCENARIO ###");
      // console.log(scenario);

      // console.log("CURRENT STEP ###");
      // console.log(step);
      // console.log("reached here >>>");

      // For single card steps, validate immediately
      const isValid = step.validation(card.value);

      // console.log(isValid);
      // console.log(card);
      if (isValid) {
        // console.log("now here >>>");
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

  const handleSetOn = () => {
    // console.log("setting on>>");
    setGameState((prevState) => {
      return {
        ...prevState,
        isPlayerKadi: true,
        turn: "ai",
      };
    });

    setCurrentStep((prev) => prev + 1);
  };

  const handlePlayAces = async (desiredSuit = "") => {
    if (!selectedCards.length || isAnimating) return;

    try {
      // Validate move based on step type
      setIsAnimating(true);
      const isValid = step.validation(selectedCards[0]);

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
                };
              });

              setTimeout(() => {
                setCurrentStep((prev) => prev + 1);
              });

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

    // console.log("AFTER SUIT DEMAND RUNNING &&&");
    // // demand suit for aces

    // setGameState((prevState) => {
    //   const playedCard = selectedCards[0];
    //   return {
    //     ...prevState,
    //     playerHand: prevState.playerHand.filter(
    //       (card) => !selectedCards.includes(card)
    //     ),
    //     discardPile: [...prevState.discardPile, playedCard],
    //     currentSuit: desiredSuit,
    //     topCard: playedCard,
    //     desiredSuit: desiredSuit,
    //   };
    // });
  };

  // Validate move and progress
  const handlePlayMove = async () => {
    if (!selectedCards.length || isAnimating) return;

    if (selectedCards[0].slice(0, -1) === "A") {
      handleOpenSuitModal();
      return;
    }

    try {
      // Validate move based on step type
      setIsAnimating(true);
      const isValid = step.validation(selectedCards[0]);

      if (isValid) {
        if (step.feedback) {
          setFeedbackMessage(step.feedback);
          setShowFeedback(true);
        }

        // Get target element (center table)
        const targetElement = document.getElementById("table-drop-target");
        const targetRect = targetElement.getBoundingClientRect();

        if (selectedCards.length > 1) {
          // console.log("running multiple>>>");

          for (const cardValue of selectedCards) {
            const sourceCard = document.querySelector(
              `[data-card="${cardValue}"]`
            );
            const sourceRect = sourceCard.getBoundingClientRect();

            const startX = sourceRect.x + sourceRect.width / 2;

            // Start animation
            await new Promise((resolve) => {
              startCardAnimation({
                cardId: cardValue,
                cardValue: cardValue,
                sourceRect: {
                  x:
                    sourceRect.x +
                    (sourceRect.width - cardDimensions.width) / 2,
                  y:
                    sourceRect.y +
                    (sourceRect.height - cardDimensions.height) / 2,
                  width: cardDimensions.width,
                  height: cardDimensions.height,
                },
                targetRect: {
                  x: startX, // Fan out cards
                  y:
                    targetRect.y +
                    (targetRect.height - cardDimensions.height) / 2,
                  width: cardDimensions.width,
                  height: cardDimensions.height,
                },
                onComplete: () => {
                  setGameState((prevState) => {
                    return {
                      ...prevState,
                      playerHand: prevState.playerHand.filter(
                        (card) => !selectedCards.includes(card)
                      ),
                      discardPile: [...prevState.discardPile, ...selectedCards],
                      currentSuit: cardValue.slice(-1),
                      topCard: cardValue,
                    };
                  });
                  resolve();
                },
              });
            });
          }

          setTimeout(() => {
            setGameState((prevState) => {
              return {
                ...prevState,
                turn: "ai",
              };
            });
          }, 1500);
        } else {
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
                y:
                  sourceRect.y +
                  (sourceRect.height - cardDimensions.height) / 2,
                width: cardDimensions.width,
                height: cardDimensions.height,
              },
              targetRect: {
                x: startX,
                y:
                  targetRect.y +
                  (targetRect.height - cardDimensions.height) / 2,
                width: cardDimensions.width,
                height: cardDimensions.height,
              },
              onComplete: resolve,
            });
          });

          if (step.type === "defensive-counter") {
            setGameState((prevState) => {
              const playedCard = selectedCards[0];
              return {
                ...prevState,
                playerHand: prevState.playerHand.filter(
                  (card) => !selectedCards.includes(card)
                ),
                discardPile: [...prevState.discardPile, playedCard],
                jumpCounter: prevState.jumpCounter - 1,
                currentSuit: playedCard.slice(-1),
                turn: "player",
                topCard: playedCard,
              };
            });
          } else if (step.type === "winning-move") {
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

            // handle game over
            alert("game  over");

            return;
          } else {
            // console.log("failed...");
            setGameState((prevState) => {
              const playedCard = selectedCards[0];
              return {
                ...prevState,
                playerHand: prevState.playerHand.filter(
                  (card) => !selectedCards.includes(card)
                ),
                isKickback: step.type === "play-kickback" && true,
                discardPile: [...prevState.discardPile, playedCard],
                currentSuit: playedCard.slice(-1),
                turn: "ai",
                topCard: playedCard,
              };
            });
          }
        }

        // }

        // Progress to next step or scenario
        if (currentStep < scenario.steps.length - 1) {
          setTimeout(() => {
            setCurrentStep((prev) => prev + 1);
          }, 3000);

          // console.log(selectedCards);

          // console.log("will run this>>>");
        } else {
          if (currentScenario < scenarios.length - 1) {
            // console.log("running this>>>");
            setCompletedScenarios((prev) => new Set([...prev, scenario.id]));
            setPoints((prev) => prev + scenario.points);
            setCompletedScenario(scenario);

            setTimeout(() => {
              setShowScenarioComplete(true);
            }, 3000);
          } else {
            // console.log("running that>>>");

            setCompletedScenarios((prev) => new Set([...prev, scenario.id]));
            setPoints(points + scenario.points);
            // setShowCompletion(true);

            alert("good job - you are now a master of kadi!");
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
    if (step.type !== "forced-draw") {
      return;
    }

    setIsAnimating(true);

    try {
      const drawPile = document.getElementById("table-drop-target");
      const drawPileRect = drawPile.getBoundingClientRect();

      // Start draw animation using our animation system
      await new Promise((resolve) => {
        startCardAnimation({
          cardId: "draw-4H",
          cardValue: "4H",
          sourceRect: {
            x: drawPileRect.x,
            y: drawPileRect.y,
            width: drawPileRect.width,
            height: drawPileRect.height,
          },
          targetRect: {
            // Target will be player's hand area
            x: window.innerWidth / 2,
            y: window.innerHeight - 150,
            width: drawPileRect.width,
            height: drawPileRect.height,
          },
          onComplete: () => {
            setGameState((prev) => ({
              ...prev,
              playerHand: ["QH", "8H", "4H", "5D"],
              discardPile: ["6S"],
            }));

            setTimeout(() => {
              setCurrentStep((prev) => prev + 1);
            }, 500);
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
            x: startX,
            y: targetRect.y + (targetRect.height - cardDimensions.height) / 2,
            width: cardDimensions.width,
            height: cardDimensions.height,
          },
          onComplete: () => {
            // Update game state
            setGameState((prev) => ({
              ...prev,
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

    setGameState((prev) => ({
      ...prev,
      turn: player === "player" ? "ai" : "player",
    }));

    setTimeout(() => {
      setCurrentStep((prev) => prev + 1);

      // setGameState((prevState) => ({
      //   ...prevState,
      //   turn: "ai",
      // }));
    }, 1000);
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
    }, 1500);

    // console.log("setting the next step here >>>");

    // handleCompleteScenario();
  };

  const handleDrawPenalty = async () => {
    if (step.type !== "forced-draw") {
      return;
    }

    await handleMultipleDraws(["AC", "4H", "10D"], "player");
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

  const handleAcceptKickback = () => {
    if (step.type !== "accept-kickback") {
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
    }, 1500);

    // console.log("setting the next step here >>>");

    setCurrentStep((prev) => prev + 1);
  };

  // Reset current scenario
  const handleReset = () => {
    setCurrentStep(0);
    setSelectedCards([]);
    setGameState(INITIAL_GAME_STATE);
    setShowHint(false);
    setErrorMessage("");

    setTimeout(() => {
      setShowScenarioIntro(true);
    }, 1500);
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

  const handleOpponentDraw = async (card) => {
    // Get draw pile and hand positions
    const drawPile = document.getElementById("table-drop-target");
    const drawPileRect = drawPile.getBoundingClientRect();

    const cardDimensions = {
      width: isMobile ? 75 : 80,
      height: isMobile ? 105 : 112,
    };

    let targetElement = document.getElementById("opponent-deck");
    const targetRect = targetElement.getBoundingClientRect();

    const startX = drawPileRect.x + drawPileRect.width / 2;

    // Animate current card
    await new Promise((resolve) => {
      startCardAnimation({
        cardId: `draw-card-${card}`,
        cardValue: card,
        sourceRect: {
          x: drawPileRect.x + (drawPileRect.width - cardDimensions.width) / 2,
          y: drawPileRect.y + (drawPileRect.height - cardDimensions.height) / 2,
          width: cardDimensions.width,
          height: cardDimensions.height,
        },
        targetRect: {
          // Add slight offset for each card
          x: startX,
          y: targetRect.y + (targetRect.height - cardDimensions.height) / 2,
          width: cardDimensions.width,
          height: cardDimensions.height,
        },
        onComplete: () => {
          // Update game state
          setGameState((prev) => ({
            ...prev,
            turn: "player",
            aiHand: [...prev.aiHand, card],
            lastGamePlay: {
              player: "ai",
              card: null,
              type: "draw",
            },
          }));

          setTimeout(() => {
            setCurrentStep((prev) => prev + 1);
          }, 1000);
          resolve();
        },
      });
    });
  };

  const handleOpponentPlayMove = async (cardToPlay) => {
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
          // Update game state after opponent plays card
          if (step.aiPlay === "JH") {
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
                card: cardToPlay,
                type: "play",
              },
            }));
          } else if (step.aiPlay === "3S") {
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
                card: cardToPlay,
                type: "play",
              },
            }));
          } else if (step.aiPlay === "KH") {
            setGameState((prevState) => ({
              ...prevState,
              discardPile: [...prevState.discardPile, cardToPlay],
              aiHand: prevState.aiHand.filter((card) => card !== cardToPlay),
              topCard: cardToPlay,
              isKickback: true,
              currentSuit: cardToPlay.slice(-1),
              isPenalty: true,
              turn: "player",
              lastGamePlay: {
                player: "ai",
                card: cardToPlay,
                type: "play",
              },
            }));
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
                card: cardToPlay,
                type: "play",
              },
            }));
          }

          setTimeout(() => {
            setCurrentStep((prev) => prev + 1);
          }, 1000);
          resolve();
        },
      });
    });
  };

  // scenario intro
  useEffect(() => {
    setShowScenarioIntro(true);
  }, [currentScenario]);

  // handle opponent moves
  useEffect(() => {
    if (step.type === "opponent-play" && step.aiPlay) {
      const executeOpponentMove = async () => {
        setIsAnimating(true);
        try {
          setTimeout(async () => {
            // Check if aiPlay is an array (multiple cards)
            if (Array.isArray(step.aiPlay)) {
              for (const card of step.aiPlay) {
                await handleOpponentPlayMove(card);
                // Add small delay between multiple card animations
                await new Promise((resolve) => setTimeout(resolve, 500));
              }
            } else {
              await handleOpponentPlayMove(step.aiPlay);
            }
          }, 3000);
        } finally {
          setIsAnimating(false);
        }
      };
      executeOpponentMove();
    }

    if (step.type === "opponent-draw" && step.aiPlay) {
      const executeOpponentMove = async () => {
        setIsAnimating(true);
        try {
          setTimeout(async () => {
            await handleOpponentDraw(step.aiPlay);
          }, 3000);
        } finally {
          setIsAnimating(false);
        }
      };
      executeOpponentMove();
    }
  }, [currentStep, currentScenario]);

  useEffect(() => {
    if (step.type === "deal-cards") {
      const func = async () => {
        setIsAnimating(true);
        try {
          await handleDealSequence();
        } finally {
          setIsAnimating(false);
        }
      };
      func();
    }

    if (step.type === "start-card") {
      handleFirstCardReveal();
    }
  }, [currentStep, currentScenario]);

  // init game state
  // useEffect(() => {
  //   const currentScenarioSetup = scenarios[currentScenario].setup;

  //   setGameState({
  //     direction: currentScenarioSetup.direction,
  //     drawPileLength: 10,
  //     jumpCounter: 0,
  //   });
  // }, [currentScenario]);

  return (
    <>
      <TutorialCardAnimations />

      <TutorialSuitModal
        openSuitModal={openSuitModal}
        handleCloseSuitModal={handleCloseSuitModal}
        handleAces={handlePlayAces}
        tutorialInstruction="Choose Diamonds (♦) to make your opponent follow suit"
        correctSuit="D"
      />

      {/* {showCompletion && (
        <CompletionScreen
          showCompletion={showCompletion}
          setShowCompletion={setShowCompletion}
          points={points}
          completedScenarios={completedScenarios}
        />
      )} */}

      {showScenarioIntro && <WelcomeOverlay onStart={handleStartScenario} />}

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
          {/* Progress Bar */}
          {/* <ModuleProgress
            scenarios={scenarios}
            currentScenario={currentScenario}
            onReset={handleProgressReset}
          /> */}

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
                canDraw={step.type === "forced-draw"}
                roomData={gameState}
                setOn={handleSetOn}
                isShuffling={isShuffling}
                handleDrawPenalty={handleDrawPenalty}
                handleAcceptJump={handleAcceptJump}
                handleAcceptKickback={handleAcceptKickback}
                // handlePassTurn={handlePassTurn}
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
          ${
            gameState.isPlayerKadi
              ? "border-b-4 border-yellow-500 dark:border-yellow-600"
              : ""
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
              {gameState.isPlayerKadi && (
                <span className="absolute -top-3 right-2 px-2 py-0.5 text-xs font-semibold bg-yellow-500 dark:bg-yellow-600 text-white rounded-full">
                  KADI
                </span>
              )}
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

      <button onClick={() => console.log(selectedCards)}>Selected Cards</button>
      <br />
      <button onClick={() => console.log(currentStep)}>CURRENT STEP</button>
      <br />
      <button onClick={() => setCounter(counter + 1)}>Counter</button> */}
    </>
  );
};

export default FirstGame;
