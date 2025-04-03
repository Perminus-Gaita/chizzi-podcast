"use client";
import dynamic from "next/dynamic";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ChevronLeft,
  Star,
  Lightbulb,
  RotateCcw,
  Eye,
  BookOpen,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Trophy,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { useDispatch, useSelector } from "react-redux";
import TutorialPlayerDeck from "./TutorialPlayerDeck";
import CenterTable from "./GameComponents/CenterTable";
import InstructionArea from "./InstructionArea";
import Controls from "./Controls";
import TutorialCardAnimations from "./TutorialCardAnimations";
import TutorialGameDirection from "./GameComponents/TutorialGameDirection";

import "../../../styles/kaditutorial.css";
import { useIsMobile } from "@/hooks/useIsMobile";

import ModuleProgress from "./ModuleProgress";
import { startAnimation } from "@/app/store/animationSlice";
import ScenarioComplete from "./ScenarioComplete";
import ScenarioIntro from "./ScenarioIntro";
import Feedback from "./Feedback";

const scenarios = [
  {
    id: "turn-order",
    title: "Understanding Turns",
    description: "Learn how turns work and progress in Kadi",
    points: 1,
    setup: {
      playerHand: ["4H", "5S", "6D", "7C"],
      topCard: "4C",
      aiHand: ["4D", "5D", "6C", "7D"],
      validMoves: ["5S", "7C"],
      requiredMoves: 3,
      direction: 1,
    },
    steps: [
      {
        type: "turn-order",
        instruction: "Watch the turn order: it starts with you",
        validation: () => true,
        requireConfirmation: true,
        feedback: "In Kadi, players take turns clockwise by default",
      },
      {
        type: "suit-match",
        instruction: "It's your turn! Play the 7 of Clubs to match the suit",
        highlight: "7C",
        validation: (card) => card === "7C",
        feedback: "Good! You matched the Clubs suit. Now it's opponent's turn",
      },
      {
        type: "opponent-first-play",
        instruction: "Opponent plays 6 of Clubs",
        aiPlay: "6C",
        validation: () => true,
        feedback: "Opponent matched the suit (Clubs). Now it's your turn again",
      },
      {
        type: "rank-match",
        instruction: "Match the rank by playing your 6 of Diamonds",
        highlight: "6D",
        validation: (card) => card === "6D",
        feedback: "Perfect! You understand basic turn progression!",
      },
    ],
  },
  {
    id: "valid-plays",
    title: "Valid Card Plays",
    description: "Learn what cards you can play on your turn",
    points: 2,
    setup: {
      playerHand: ["5H", "5D", "6H", "7S"],
      topCard: "5C",
      aiHand: ["4D", "5S", "6C", "7D"],
      validMoves: ["5H", "5D"],
      requiredMoves: 4,
    },
    steps: [
      {
        type: "multiple-valid",
        instruction:
          "You can play either 5♥ or 5♦ since they both match the rank of the top card (5♣)",
        highlight: ["5H", "5D"],
        validation: (card) => card === "5H" || card === "5D",
        feedback:
          "Excellent! When multiple cards match either the rank or suit of the top card, you can choose which one to play",
      },
      {
        type: "opponent-second-play",
        instruction: "Opponent plays 5 of Spades",
        aiPlay: "5S",
        validation: () => true,
        feedback: "The opponent also matched the rank",
      },
      {
        type: "invalid-play-demo",
        instruction: "Try playing the 6 of Hearts",
        highlight: "6H",
        validation: (card) => card === "6H",
        feedback: "Invalid! It must match either rank or suit of the top card",
      },
      {
        type: "force-draw",
        instruction: "When you have no valid plays, you must draw a card",
        highlight: "drawPile",
        validation: () => true,
        feedback: "Drawing ends your turn unless you can play the drawn card",
      },
    ],
  },
  {
    id: "multiple-cards",
    title: "Playing Multiple Cards",
    description: "Learn when you can play multiple cards together",
    points: 2,
    setup: {
      playerHand: ["6H", "6D", "7S", "7C"],
      topCard: "6C",
      aiHand: ["4C", "4S", "6C", "7H"],
      validMoves: [["6H", "6D", "7S"]],
      requiredMoves: 2,
    },
    steps: [
      {
        type: "multi-card-instruction",
        instruction: "You can play multiple cards of the same rank together",
        highlight: ["6H", "6D"],
        validation: (cards) => {
          if (!Array.isArray(cards)) {
            return ["6H", "6D"].includes(cards);
          }
        },
        feedback: "Excellent! Playing multiple 6s is a valid move",
      },
      {
        type: "opponent-third-play",
        instruction: "Opponent plays 7 of Hearts",
        aiPlay: "7H",
        validation: () => true,
        feedback:
          "The opponent matches the previous card's rank by playing a 7, continuing game flow.",
      },
      {
        type: "single-card-option",
        instruction:
          "Play your 7 of Clubs (7♣) to match the 7 of Hearts on top",
        highlight: ["7C"],
        validation: (card) => card === "7C",
        feedback:
          "Good! You matched the rank of 7. Playing one card at a time can be strategic - you've kept your other 7 for later use",
      },
      {
        type: "turn-passing",
        instruction:
          "You've played a valid card. You should pass your turn now to keep your remaining 7♠ for later",
        options: ["Play Another Card", "Pass Turn"],
        validation: (choice) => choice === "Pass Turn",
        feedback:
          "Great decision! Passing your turn after playing a card is often strategic - it lets you keep useful cards for later in the game",
      },
      {
        type: "opponent-multi",
        instruction: "Watch opponent play multiple cards...",
        aiPlay: ["4C", "4S"],
        validation: () => true,
        feedback: "Opponents face the same choices with their cards",
      },
    ],
  },
  {
    id: "basic-direction",
    title: "Game Direction",
    description: "Learn how turns flow around the table",
    points: 1,
    setup: {
      playerHand: ["4H", "5D", "6C", "7S"],
      topCard: "4C",
      aiHand: ["4D", "5H", "6S", "7D"],
      validMoves: ["4H", "6C"],
      requiredMoves: 3,
      direction: 1,
    },
    steps: [
      {
        type: "direction-demo",
        instruction: "Watch how turns move clockwise around the table",
        validation: () => true,
        requireConfirmation: true,
        feedback: "In Kadi, play normally moves clockwise",
      },
      {
        type: "regular-play",
        instruction: "Play your 6 of Clubs",
        highlight: "6C",
        validation: (card) => card === "6C",
        feedback: "Good! Now watch the turn pass to your left",
      },
      {
        type: "observe-flow",
        instruction: "Notice how play continues clockwise",
        validation: () => true,
        requireConfirmation: true,
        feedback:
          "This clockwise flow continues unless modified by special cards",
      },
    ],
  },
];

// const CompletionScreen = ({
//   showCompletion,
//   setShowCompletion,
//   points,
//   completedScenarios,
//   onComplete,
// }) => (
//   <AnimatePresence mode="wait">
//     {showCompletion && (
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         exit={{ opacity: 0 }}
//         className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
//       >
//         <motion.div
//           initial={{ opacity: 0, scale: 0.95 }}
//           animate={{ opacity: 1, scale: 1 }}
//           className="max-w-2xl w-full mx-4 flex flex-col items-center justify-center
//                   space-y-6 p-8 bg-white dark:bg-gray-900
//                   rounded-2xl shadow-xl text-black dark:text-white"
//         >
//           <div className="flex flex-col items-center gap-2">
//             <Trophy className="w-8 md:w-16 h-8 md:h-16 text-primary" />
//             <Badge variant="secondary" className="bg-primary/10">
//               Game Flow Mastered!
//             </Badge>
//           </div>

//           <h2 className="text-xl md:text-2xl sm:text-3xl font-bold text-center">
//             Ready for Your First Game
//           </h2>

//           <div className="flex items-center gap-2 text-lg">
//             <Star className="w-6 h-6 text-yellow-500" />
//             <span className="font-medium">{points} points earned</span>
//           </div>

//           <div className="space-y-3 text-center">
//             <p className="text-gray-600 dark:text-gray-400 max-w-md">
//               You've mastered the basic game flow! Time to test your skills in a
//               real match.
//             </p>

//             <div className="bg-primary/5 p-4 rounded-lg">
//               <h3 className="font-semibold mb-2">What's next:</h3>
//               <ul className="text-left space-y-1 text-gray-600 dark:text-gray-400">
//                 <li>• Real game experience</li>
//                 <li>• Playing against an Opponent</li>
//                 <li>• Full game mechanics</li>
//                 <li>• Strategic decisions</li>
//               </ul>
//             </div>
//           </div>
//           {/* </div> */}

//           <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
//             <Button
//               variant="outline"
//               onClick={() => setShowCompletion(false)}
//               className="w-full sm:w-auto"
//             >
//               <RotateCcw className="w-5 h-5 mr-2" />
//               Review Flow
//             </Button>
//             <Button
//               onClick={onComplete}
//               className="w-full sm:w-auto bg-primary hover:bg-primary/90"
//             >
//               Start First Game
//               <ChevronRight className="w-5 h-5 ml-2" />
//             </Button>
//           </div>

//           <motion.div className="flex items-center gap-2">
//             {[...Array(3)].map((_, i) => (
//               <motion.div
//                 key={i}
//                 className="h-2 w-16 rounded-full bg-primary"
//                 initial={{ scale: 0 }}
//                 animate={{ scale: 1 }}
//                 transition={{ delay: i * 0.1 }}
//               />
//             ))}
//             <div className="h-2 w-16 rounded-full bg-gray-700/30" />
//           </motion.div>
//         </motion.div>
//       </motion.div>
//     )}
//   </AnimatePresence>
// );

// const DecisionTree = ({ options, onSelect }) => (
//   <motion.div
//     initial={{ opacity: 0, y: 20 }}
//     animate={{ opacity: 1, y: 0 }}
//     className="absolute bottom-24 left-1/2 -translate-x-1/2
//               bg-gray-800/95 backdrop-blur-sm rounded-xl p-4 max-w-md w-full"
//   >
//     <div className="space-y-3">
//       {options.map((option, index) => (
//         <Button
//           key={index}
//           onClick={() => onSelect(option)}
//           className="w-full flex items-center gap-3 p-3 rounded-lg
//                    bg-gray-700/50 hover:bg-gray-700 transition-colors
//                    text-left group"
//         >
//           <div
//             className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-600
//                         flex items-center justify-center group-hover:bg-primary/20"
//           >
//             <ArrowRight className="w-4 h-4 text-primary" />
//           </div>
//           <div className="flex-1 min-w-0">
//             <p className="font-medium text-white">{option.label}</p>
//             <p className="text-sm text-gray-400">{option.description}</p>
//           </div>
//         </Button>
//       ))}
//     </div>
//   </motion.div>
// );

// const StrategyTip = ({ tip, onClose }) => (
//   <motion.div
//     initial={{ opacity: 0, scale: 0.95 }}
//     animate={{ opacity: 1, scale: 1 }}
//     exit={{ opacity: 0, scale: 0.95 }}
//     className="absolute top-24 right-4 max-w-xs bg-primary/10 backdrop-blur-sm
//               border border-primary/20 rounded-lg p-4 z-20"
//   >
//     <div className="flex items-start gap-3">
//       <Lightbulb className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
//       <div className="flex-1 space-y-2">
//         <p className="font-medium">Strategy Tip</p>
//         <p className="text-sm text-gray-300">{tip}</p>
//       </div>
//     </div>
//     <Button
//       onClick={onClose}
//       className="absolute top-2 right-2 text-gray-400 hover:text-white"
//     >
//       ×
//     </Button>
//   </motion.div>
// );

// const StrategicChoiceFeedback = ({ show, onClose }) => (
//   <AnimatePresence>
//     {show && (
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         exit={{ opacity: 0, y: 20 }}
//         className="absolute bottom-24 left-1/2 -translate-x-1/2
//                   bg-primary/10 backdrop-blur-sm rounded-xl p-4"
//       >
//         <div className="space-y-2">
//           <h4 className="font-medium text-white">Strategy Note</h4>
//           <p className="text-sm text-gray-300">
//             Playing in the same suit (♥) forces opponents to either: - Follow
//             suit if they have hearts - Break suit and lose control
//           </p>
//         </div>
//         <Button onClick={onClose}>Got it!</Button>
//       </motion.div>
//     )}
//   </AnimatePresence>
// );

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
            Basic Game Flow Complete!
          </SheetTitle>

          <SheetDescription className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-lg">
              <Star className="w-6 h-6 text-yellow-500" />
              <span className="font-medium">{points} / 8 points earned</span>
            </div>

            <span className="text-gray-600 dark:text-gray-400 max-w-md text-center">
              Great job mastering the basic game flow! Now let's explore what
              makes each card special.
            </span>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => setShowCompletion(false)}
                className="w-full sm:w-auto"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Review Flow
              </Button>
              <Button
                onClick={onComplete}
                className="w-full sm:w-auto bg-primary hover:bg-primary/90"
              >
                Learn Card Powers
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            <motion.div className="flex items-center gap-2">
              {[...Array(2)].map((_, i) => (
                <motion.div
                  key={i}
                  className="h-2 w-16 rounded-full bg-primary"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                />
              ))}
              <div className="h-2 w-16 rounded-full bg-gray-700/30" />
              <div className="h-2 w-16 rounded-full bg-gray-700/30" />
            </motion.div>
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};

const CompletionScreen = ({
  showCompletion,
  setShowCompletion,
  points,
  onComplete,
}) => (
  <AnimatePresence mode="wait">
    {showCompletion && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full mx-4 flex flex-col items-center justify-center 
                  space-y-6 p-8 bg-white dark:bg-gray-900 
                  rounded-2xl shadow-xl text-black dark:text-white"
        >
          <div className="flex flex-col items-center gap-2">
            <Trophy className="w-8 md:w-16 h-8 md:h-16 text-primary" />
            <h2 className="text-xl md:text-2xl sm:text-3xl font-bold text-center">
              Basic Game Flow Complete!
            </h2>
          </div>

          <div className="flex items-center gap-2 text-lg">
            <Star className="w-6 h-6 text-yellow-500" />
            <span className="font-medium">{points} points earned</span>
          </div>

          <div className="space-y-3 text-center">
            <p className="text-gray-600 dark:text-gray-400 max-w-md">
              Great job mastering the basic game flow! Now let's explore what
              makes each card special.
            </p>

            <div className="bg-primary/5 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">What's next:</h3>
              <ul className="text-left space-y-1 text-gray-600 dark:text-gray-400">
                <li>• Special card abilities</li>
                <li>• Power combinations</li>
                <li>• Strategic card usage</li>
                <li>• Advanced mechanics</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => setShowCompletion(false)}
              className="w-full sm:w-auto"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Review Flow
            </Button>
            <Button
              onClick={onComplete}
              className="w-full sm:w-auto bg-primary hover:bg-primary/90"
            >
              Learn Card Powers
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>

          <motion.div className="flex items-center gap-2">
            {[...Array(2)].map((_, i) => (
              <motion.div
                key={i}
                className="h-2 w-16 rounded-full bg-primary"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1 }}
              />
            ))}
            <div className="h-2 w-16 rounded-full bg-gray-700/30" />
            <div className="h-2 w-16 rounded-full bg-gray-700/30" />
          </motion.div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

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

const BasicGameFlow = ({ cardDimensions, handleCompleteModule }) => {
  const isMobile = useIsMobile();

  const dispatch = useDispatch();

  const [playingCard, setPlayingCard] = useState(null);
  const [invalidMove, setInvalidMove] = useState(false);

  const [loading, setLoading] = useState(false);
  const [currentScenario, setCurrentScenario] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [showDecisionTree, setShowDecisionTree] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [selectedCards, setSelectedCards] = useState([]);
  const [points, setPoints] = useState(0);
  const [completedScenarios, setCompletedScenarios] = useState(new Set());
  const [isValidatingMove, setIsValidatingMove] = useState(false);

  const [lastPlayedCard, setLastPlayedCard] = useState(null);
  const [isShuffling, setIsShuffling] = useState(false);
  const [invalidAttempts, setInvalidAttempts] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [showProgressButton, setShowProgressButton] = useState(false);
  const [showStrategicFeedback, setShowStrategicFeedback] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);

  const [isAnimating, setIsAnimating] = useState(false);

  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const [showScenarioComplete, setShowScenarioComplete] = useState(false);
  const [completedScenario, setCompletedScenario] = useState(null);
  const [showScenarioIntro, setShowScenarioIntro] = useState(true);
  const [showHint, setShowHint] = useState(false);

  const [gameState, setGameState] = useState(INITIAL_GAME_STATE);

  const scenario = scenarios[currentScenario];
  const step = scenario.steps[currentStep];

  // const getRankMatchingDecisions = (selectedCard) => [
  //   {
  //     label: "Switch to Hearts ♥",
  //     description: "Force opponents into a new suit",
  //     moves: [selectedCard],
  //     aiResponse: {
  //       card: null,
  //       explanation: "AI has no hearts and must draw",
  //       newTopCard: selectedCard,
  //     },
  //   },
  //   {
  //     label: "Stay in Clubs ♣",
  //     description: "Keep current suit for chain potential",
  //     moves: [selectedCard],
  //     aiResponse: {
  //       card: "5C",
  //       explanation: "AI matches your rank with their 5♣",
  //       newTopCard: "5C",
  //     },
  //   },
  // ];

  // const getSuitMatchingDecisions = (selectedCard) => [
  //   {
  //     label: "Play High Heart",
  //     description: "Use 6♥ to maintain suit control with higher rank",
  //     moves: ["6H"],
  //     aiResponse: {
  //       card: "8H",
  //       explanation: "AI responds with a higher heart",
  //     },
  //   },
  //   {
  //     label: "Play Low Heart",
  //     description: "Use 4♥ to save higher hearts for later",
  //     moves: ["4H"],
  //     aiResponse: {
  //       card: "9H",
  //       explanation: "AI still has hearts to respond with",
  //     },
  //   },
  // ];

  // // Handle strategic decision selection
  // const handleDecisionSelect = async (action) => {
  //   console.log("### THE ACTION ###");
  //   console.log(action);

  //   console.log("### THE STEP ###");
  //   console.log(step);
  //   console.log(scenario);
  //   setShowDecisionTree(false);

  //   if (action.type === "draw" && step?.id === "draw-action") {
  //     // Progress only to reshuffle demo
  //     setCurrentStep((prev) => prev + 1);
  //     return; // Important: return here to prevent double progression
  //   }

  //   if (scenario.id === "suit-matching") {
  //     setShowStrategicFeedback(true); // Add this line at the start of this block

  //     // Show AI response
  //     if (action.aiResponse) {
  //       // setShowTip({
  //       //   type: "ai-feedback",
  //       //   content: action.aiResponse.explanation,
  //       // });
  //       setShowTip(true);
  //     }

  //     // Progress after animation
  //     setTimeout(() => {
  //       if (currentStep < scenario.steps.length - 1) {
  //         setCurrentStep((prev) => prev + 1);
  //       } else {
  //         completeScenario();
  //       }
  //     }, 1500);
  //   }

  //   if (scenario.id === "rank-matching") {
  //     // Animate card play

  //     // Handle AI response
  //     if (action.aiResponse) {
  //       if (action.aiResponse.card) {
  //         setShowTip({
  //           type: "ai-feedback",
  //           content: action.aiResponse.explanation,
  //         });
  //       } else {
  //         // Show AI drawing cards
  //         setShowTip({
  //           type: "ai-feedback",
  //           content: "AI had no matching cards and drew from the pile",
  //         });
  //       }

  //       // Update top card display
  //       setLastPlayedCard(action.aiResponse.newTopCard);
  //     }

  //     // Complete scenario after animations
  //     setTimeout(() => {
  //       completeScenario();
  //     }, 2000);
  //   }

  //   //  multiple-cards scenario
  //   if (scenario.id === "multiple-cards") {
  //     if (currentStep === 0) {
  //       // First step - group selection already validated
  //       return;
  //     }

  //     console.log("here now");
  //     console.log(Array.isArray(selectedCards));
  //     console.log(selectedCards);

  //     // Second step - validate card order
  //     if (Array.isArray(selectedCards) && selectedCards.length > 1) {
  //       // Simulate playing cards
  //       setIsValidatingMove(true);
  //       setTimeout(() => {
  //         completeScenario();
  //         setIsValidatingMove(false);
  //       }, 1000);
  //     }
  //     return;
  //   }
  // };

  // Update DecisionTree rendering
  // {
  //   showDecisionTree && scenario.id === "suit-matching" && (
  //     <DecisionTree
  //       options={getSuitMatchingDecisions(selectedCards[0])}
  //       onSelect={handleDecisionSelect}
  //     />
  //   );
  // }

  // {
  //   showDecisionTree && scenario.id === "rank-matching" && (
  //     <DecisionTree
  //       options={getRankMatchingDecisions(selectedCards[0])}
  //       onSelect={handleDecisionSelect}
  //     />
  //   );
  // }

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

  const handleCardSelection = useCallback(
    (card) => {
      if (loading || isValidatingMove) return;

      // For single card steps, validate immediately
      const isValid = step.validation(card.value);
      if (isValid) {
        setLastPlayedCard(card);

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

  const handlePlayMove = async () => {
    if (!selectedCards.length || isAnimating) return;

    if (
      scenarios[currentScenario].steps[currentStep].type === "invalid-play-demo"
    ) {
      const isValid = step.validation(selectedCards[0]);

      if (isValid) {
        if (step.feedback) {
          setFeedbackMessage(step.feedback);
          setShowFeedback(true);
        }

        setTimeout(() => {
          setCurrentStep((prev) => prev + 1);
        }, 3000);
      }
      return;
    }

    // handle additional moves
    if (step.type === "single-card-option") {
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
                  currentSuit: playedCard.slice(-1),
                  turn: "player",
                  topCard: playedCard,
                  lastGamePlay: {
                    player: "player",
                    card: playedCard,
                    type: "play",
                  },
                };
              });

              setTimeout(() => {
                setCurrentStep((prev) => prev + 1);
              }, 3000);

              resolve();
            },
          });
        });
      }
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
                  x: startX,
                  y:
                    targetRect.y +
                    (targetRect.height - cardDimensions.height) / 2,
                  width: cardDimensions.width,
                  height: cardDimensions.height,
                },
                onComplete: () => {
                  setGameState((prevState) => {
                    const lastPlayedCard =
                      selectedCards[selectedCards.length - 1];
                    return {
                      ...prevState,
                      playerHand: prevState.playerHand.filter(
                        (card) => !selectedCards.includes(card)
                      ),
                      discardPile: [...prevState.discardPile, ...selectedCards],
                      currentSuit: lastPlayedCard.slice(-1),
                      turn: "ai",
                      topCard: lastPlayedCard,
                    };
                  });

                  resolve();
                },
              });
            });
          }
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
                x: startX, // Fan out cards
                y:
                  targetRect.y +
                  (targetRect.height - cardDimensions.height) / 2,
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
                    isKickback: step.type === "play-kickback" && true,
                    discardPile: [...prevState.discardPile, playedCard],
                    currentSuit: playedCard.slice(-1),
                    turn: "ai",
                    topCard: playedCard,
                  };
                });
                resolve();
              },
            });
          });
        }

        if (currentStep < scenario.steps.length - 1) {
          setTimeout(() => {
            setCurrentStep((prev) => prev + 1);
          }, 3000);

          // console.log(selectedCards);

          // console.log("will run this>>>");
        } else {
          // Complete scenario
          // setCompletedScenarios((prev) => new Set([...prev, scenario.id]));
          // setPoints((prev) => prev + scenario.points);

          if (currentScenario < scenarios.length - 1) {
            // console.log("running this>>>");
            // setCurrentScenario((prev) => prev + 1);
            // setCurrentStep(0);
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
    if (!(step.type === "force-draw")) {
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
          cardId: "draw-5D",
          cardValue: "5D",
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
              playerHand: [...prev.playerHand, "5D"],
              turn: "ai",
            }));

            setTimeout(() => {
              completeScenario();
            }, 1000);
            resolve();
          },
        });
      });
    } finally {
      setIsAnimating(false);
    }
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

          if (step.type === "opponent-multi") {
            setTimeout(() => {
              completeScenario();
            }, 1500);
          } else {
            setTimeout(() => {
              // complete scenario
              setCurrentStep((prev) => prev + 1);
            }, 1000);
          }

          resolve();
        },
      });
    });
  };

  const handlePassTurn = () => {
    if (step.type !== "turn-passing") {
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setGameState((prevState) => ({
        ...prevState,
        turn: "ai",
        lastGamePlay: {
          player: "player",
          card: null,
          type: "passTurn",
        },
      }));

      setLoading(false);
    }, 1500);

    // console.log("setting the next step here >>>");

    setTimeout(() => {
      setCurrentStep((prev) => prev + 1);
    }, 3000);
  };

  // Complete current scenario
  const completeScenario = () => {
    setCompletedScenarios((prev) => new Set([...prev, scenario.id]));
    setPoints((prev) => prev + scenario.points);
    setCompletedScenario(scenario);

    setTimeout(() => {
      setShowScenarioComplete(true);
    }, 3000);
  };

  // Reset current scenario
  const handleReset = () => {
    setCurrentStep(0);
    setSelectedCards([]);
    setShowDecisionTree(false);
    setShowTip(false);

    // setGameState(INITIAL_GAME_STATE);

    const currentScenarioSetup = scenarios[0].setup;

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
  };

  const handleProgressReset = (index) => {
    setCurrentScenario(index);
    setCurrentStep(0);
    setSelectedCards([]);
    setShowTip(false);
    setErrorMessage("");
  };

  useEffect(() => {
    if (
      (step.type === "opponent-first-play" && step.aiPlay) ||
      (step.type === "opponent-second-play" && step.aiPlay) ||
      (step.type === "opponent-third-play" && step.aiPlay) ||
      (step.type === "opponent-multi" && step.aiPlay) // Added this condition
    ) {
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
  }, [currentStep, currentScenario]);

  useEffect(() => {
    setSelectedCards([]);
    setShowDecisionTree(false);
    setShowStrategicFeedback(false);
    setShowTip(false);

    // }
  }, [currentScenario]);

  useEffect(() => {
    if (step.id === "reshuffle-demo") {
      // Trigger reshuffle animation sequence
      setIsShuffling(true);
      setTimeout(() => {
        setIsShuffling(false);
        completeScenario();
        // console.log("done with scenario ####");
      }, 3000);
    }
  }, [currentStep]);

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

      <AnimatePresence>
        {showScenarioIntro && (
          <ScenarioIntro
            scenario={scenario}
            onStart={() => setShowScenarioIntro(false)}
          />
        )}
      </AnimatePresence>

      {/* <CompletionScreen
        showCompletion={showCompletion}
        setShowCompletion={setShowCompletion}
        points={points}
        completedScenarios={completedScenarios}
        onComplete={handleCompleteModule}
      /> */}

      <CompletionSheet
        points={points}
        setShowCompletion={setShowCompletion}
        onComplete={handleCompleteModule}
        open={showCompletion}
      />

      <div className="min-h-screen w-full md:max-w-5xl mx-auto">
        <div className="max-w-7xl mx-auto p-2 md:p-4 space-y-2 md:space-y-6">
          {/* Progress Bar */}

          <ModuleProgress
            scenarios={scenarios}
            currentScenario={currentScenario}
            onReset={handleProgressReset}
          />

          {/* Scenario Content */}
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
                canDraw={step?.type === "force-draw"}
                roomData={gameState}
                handleDrawPenalty={() => {
                  return;
                }}
                handleAcceptJump={() => {
                  return;
                }}
                handleAcceptKickback={() => {
                  return;
                }}
                handlePassTurn={handlePassTurn}
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
                loading={playingCard !== null}
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

          {/* <StrategicChoiceFeedback
            show={
              scenario.id === "suit-matching" &&
              currentStep === 1 &&
              showStrategicFeedback
            }
            onClose={() => setShowStrategicFeedback(false)}
          /> */}

          {/* Tutorial Overlays */}
          {/* <AnimatePresence>
            {showDecisionTree && scenario.id === "suit-matching" && (
              <DecisionTree
                options={getSuitMatchingDecisions(selectedCards[0])}
                onSelect={handleDecisionSelect}
              />
            )}

            {showTip && (
              <StrategyTip
                tip={step.tip}
                onClose={() => {
                  setShowTip(false);
                  console.log("colsing....");
                }}
              />
            )}

            {scenario.id === "hand-management" && currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute bottom-32 left-1/2 -translate-x-1/2 
               bg-primary/10 px-4 py-2 rounded-full"
              >
                <p className="text-sm text-primary">
                  {selectedCards[0] === "4H"
                    ? "Maintaining heart suit control!"
                    : "Changing to diamond suit strategy!"}
                </p>
              </motion.div>
            )}
          </AnimatePresence> */}
          {/* </div> */}

          <InstructionArea
            scenario={scenario}
            step={step}
            errorMessage={errorMessage}
            showHint={showHint}
            setShowHint={setShowHint}
            handleModuleReset={handleReset}
          />

          <Controls
            step={step}
            points={points}
            selectedCards={selectedCards}
            handlePlayMove={handlePlayMove}
            isAnimating={isAnimating}
            setCurrentStep={setCurrentStep}
            completeScenario={() => setShowCompletion(true)}
          />

          {/* Controls */}

          {/* AI Play Observation Panel */}
          {/* <AnimatePresence>
            {step.aiResponse && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-gray-800/50 rounded-xl p-6"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-700
                                flex items-center justify-center"
                  >
                    <Eye className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-white mb-1">
                      Watch AI's Response
                    </h4>
                    <p className="text-gray-300">
                      {step.aiResponse.explanation}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence> */}

          {/* Mini Quiz/Check Understanding */}
          {/* <AnimatePresence>
            {step.quiz && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-gray-800/50 rounded-xl p-6"
              >
                <div className="space-y-4">
                  <h4 className="font-medium text-white">Quick Check</h4>
                  <p className="text-gray-300">{step.quiz.question}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {step.quiz.options.map((option, index) => (
                      <Button
                        key={index}
                        onClick={() => {
                          if (option.correct) {
                            completeStep();
                          } else {
                            // Show feedback
                            setShowTip(true);
                          }
                        }}
                        className="p-3 rounded-lg bg-gray-700/50 hover:bg-gray-700
                                 text-left transition-colors"
                      >
                        <p className="font-medium text-white">{option.text}</p>
                        <p className="text-sm text-gray-400">
                          {option.explanation}
                        </p>
                      </Button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence> */}

          {/* Navigation */}
          {/* <div className="flex items-center justify-between pt-4">
            <Button
              onClick={() => {
                if (currentStep > 0) {
                  setCurrentStep((prev) => prev - 1);
                } else if (currentScenario > 0) {
                  setCurrentScenario((prev) => prev - 1);
                  setCurrentStep(
                    scenarios[currentScenario - 1].steps.length - 1
                  );
                }
              }}
              disabled={currentScenario === 0 && currentStep === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg 
                       bg-gray-700 hover:bg-gray-600 text-gray-300 
                       hover:text-white transition-colors disabled:opacity-50
                       disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-gray-400" />
              <span className="text-gray-300">
                Step {currentStep + 1} of {scenario.steps.length}
              </span>
            </div>

            <Button
              onClick={() => {
                if (currentStep < scenario.steps.length - 1) {
                  setCurrentStep((prev) => prev + 1);
                } else if (currentScenario < scenarios.length - 1) {
                  setCurrentScenario((prev) => prev + 1);
                  setCurrentStep(0);
                } else {
                  onComplete(points);
                }
              }}
              disabled={!step.completed}
              className="flex items-center gap-2 px-4 py-2 rounded-lg 
                       bg-primary hover:bg-primary/90
                       transition-colors disabled:opacity-50
                       disabled:cursor-not-allowed"
            >
              {currentScenario === scenarios.length - 1 &&
              currentStep === scenario.steps.length - 1
                ? "Complete Tutorial"
                : "Next"}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div> */}
        </div>
      </div>

      {/* <button onClick={() => console.log(gameState)}>game State</button>

      <button onClick={() => console.log(selectedCards)}>SELECTED CARDS</button>
      <br />
      <button onClick={() => console.log(scenarios[currentScenario])}>
        CURRENT SCENARIO
      </button>
      <br />
      <button onClick={() => console.log(step)}>HELLO</button>
      <button onClick={() => console.log(currentStep)}>CURRENT STEP</button>
      <br />
      <button onClick={() => setCounter(counter + 1)}>Counter</button> */}
    </>
  );
};

export default BasicGameFlow;
