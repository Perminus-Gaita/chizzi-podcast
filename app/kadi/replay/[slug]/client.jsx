"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch } from "react-redux";

import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Clock,
  Users,
  Share2,
  Download,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/components/ui/toast";
import { useToast } from "@/components/hooks/use-toast";

import { init_page } from "@/app/store/pageSlice";
import { useIsMobile } from "@/hooks/useIsMobile";

import ReplayCenterTable from "@/page_components/Cards/Replay/ReplayCenterTable";
import GameDirection from "@/page_components/Cards/GameDirection";
import ReplayCardAnimations from "@/page_components/Cards/Replay/ReplayCardAnimations";

import { startAnimation } from "@/app/store/animationSlice";

// const PlayerInfo = ({ player, isTurn, playerIndex }) => {
//   const isMobile = useIsMobile();
//   const avatarSize = isMobile ? "w-8 h-8" : "w-10 h-10";

//   return (
//     <div
//       className="relative"
//       style={{
//         display: "flex",
//         flexDirection: playerIndex === 0 ? "column" : "column-reverse",
//         justifyItems: "center",
//         alignItems: "center",
//         width: "90%",
//         maxWidth: "350px",
//       }}
//     >
//       <div
//         className={`flex items-center space-x-2 w-full p-2
//           rounded-xl transition-shadow duration-300 ${
//             isTurn
//               ? "shadow-md shadow-blue-500/50 border-2 border-blue-500"
//               : "shadow-sm shadow-gray-400/30 border border-gray-300 dark:border-gray-700"
//           }

//           ${
//             player.kadi
//               ? "border-b-4 border-yellow-500 dark:border-yellow-600"
//               : ""
//           }

//           `}
//         style={{
//           width: "300px",
//           maxWidth: "350px",
//         }}
//       >
//         <Avatar className="h-8 w-8">
//           <AvatarImage
//             src={
//               player.profilePicture ||
//               `https://api.dicebear.com/6.x/initials/svg?seed=${player.name}`
//             }
//             alt={player.name}
//           />
//         </Avatar>
//         <div className="flex flex-col flex-grow min-w-0">
//           <span className="text-sm font-medium truncate capitalize">
//             {player.name}
//           </span>
//           <span className="text-xs text-muted-foreground truncate">
//             @{player.username}
//           </span>
//         </div>

//         {player.kadi && (
//           <span
//             style={{
//               position: "absolute",
//               right: 2,
//             }}
//             className="px-2 py-0.5 text-xs font-semibold bg-yellow-500 dark:bg-yellow-600 text-white rounded-full"
//           >
//             KADI
//           </span>
//         )}
//       </div>

//       {/* Player Deck */}
//       <PlayerDeckReadOnly playerDeck={player.playerDeck} />
//     </div>
//   );
// };

// const PlayerInfo = ({ player, isTurn, playerIndex }) => {
//   const isMobile = useIsMobile();

//   // Determine avatar size based on mobile and player count
//   const avatarSize = isMobile ? "w-8 h-8" : "w-10 h-10";

//   return (
//     <div
//       className={`flex items-center gap-2 ${
//         isTurn ? "bg-blue-100 dark:bg-blue-900" : "bg-gray-100 dark:bg-gray-700"
//       } rounded-lg p-1 px-2`}
//     >
//       <div
//         className={`${avatarSize} rounded-full overflow-hidden bg-gray-300 flex-shrink-0`}
//       >
//         {player.avatar ? (
//           <img
//             src={player.avatar}
//             alt={player.name || `Player ${playerIndex + 1}`}
//             className="w-full h-full object-cover"
//           />
//         ) : (
//           <div className="w-full h-full flex items-center justify-center bg-blue-500 text-white font-bold">
//             {(player.name || `P${playerIndex + 1}`).charAt(0).toUpperCase()}
//           </div>
//         )}
//       </div>

//       <div className="flex flex-col">
//         <span
//           className={`font-semibold ${
//             isMobile ? "text-xs" : "text-sm"
//           } truncate max-w-24`}
//         >
//           {player.name || `Player ${playerIndex + 1}`}
//         </span>
//         <span
//           className={`${
//             isMobile ? "text-xs" : "text-sm"
//           } text-gray-600 dark:text-gray-300`}
//         >
//           Cards: {player.hand?.length || 0}
//         </span>
//       </div>
//     </div>
//   );
// };

const PlayerInfo = ({ player, isTurn, playerIndex }) => {
  const isMobile = useIsMobile();

  // Smaller avatar and text for better mobile fitting
  const avatarSize = isMobile ? "w-6 h-6" : "w-8 h-8";

  return (
    <div
      className={`flex items-center gap-1 ${
        isTurn ? "bg-blue-100 dark:bg-blue-900" : "bg-gray-100 dark:bg-gray-700"
      } rounded-lg p-1`}
    >
      <div
        className={`${avatarSize} rounded-full overflow-hidden bg-gray-300 flex-shrink-0`}
      >
        {player.avatar ? (
          <img
            src={player.avatar}
            alt={player.name || `P${playerIndex + 1}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-blue-500 text-white text-xs font-bold">
            {(player.name || `P${playerIndex + 1}`).charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <div className="flex flex-col">
        <span className="font-semibold text-xs truncate max-w-16">
          {player.name || `P${playerIndex + 1}`}
        </span>
        <span className="text-xs text-gray-600 dark:text-gray-300">
          {player.hand?.length || 0}
        </span>
      </div>
    </div>
  );
};

const PlayerDeckReadOnly = ({
  player,
  playerDeck,
  loading,
  invalidMove,
  rotation = 0,
}) => {
  const isMobile = useIsMobile();
  const deckRef = useRef(null);

  // Track card positions and dimensions for animations
  const [cards, setCards] = useState([]);

  const calculateLayout = useCallback(() => {
    // Optimized card dimensions for different player counts
    const baseCardWidth = isMobile ? 50 : 60; // Further reduced for mobile
    const baseCardHeight = isMobile ? 70 : 84; // Adjusted height ratio

    const calculateOverlap = (numCards) => {
      // More aggressive overlap for better mobile viewing
      if (numCards <= 6) return baseCardWidth * 0.4;
      if (numCards <= 10) return baseCardWidth * 0.6;
      if (numCards <= 15) return baseCardWidth * 0.7;
      return baseCardWidth * 0.8;
    };

    const calculateArcOffset = (index, total) => {
      if (total <= 8) return 0;
      const normalizedPosition = (index / (total - 1)) * 2 - 1;
      const maxArcHeight = isMobile ? -2 : -3; // Reduced arc height for mobile
      return -Math.pow(normalizedPosition * 2, 2) * maxArcHeight;
    };

    return {
      cardWidth: baseCardWidth,
      cardHeight: baseCardHeight,
      cardOverlap: cards.length > 1 ? calculateOverlap(cards.length) : 0,
      calculateArcOffset,
    };
  }, [isMobile, cards.length]);

  useEffect(() => {
    if (playerDeck) {
      const mappedCards = playerDeck.map((card, index) => ({
        id: `${card}-${index}`,
        value: card,
        x: 0,
        y: 0,
        isDragging: false,
        initialX: 0,
        initialY: 0,
        originalIndex: index,
      }));
      setCards(mappedCards);
    }
  }, [playerDeck]);

  const { cardWidth, cardHeight, cardOverlap, calculateArcOffset } =
    calculateLayout();

  // Limit deck width based on screen size and card count
  const maxWidth = isMobile
    ? window.innerWidth * 0.85
    : window.innerWidth * 0.6;
  const calculatedWidth =
    (cards.length - 1) * (cardWidth - cardOverlap) + cardWidth;
  const deckWidth = Math.min(calculatedWidth, maxWidth);

  // Determine if this is a vertical orientation
  const isVertical = rotation === 90 || rotation === -90;

  return (
    <div
      ref={deckRef}
      className="relative flex items-center justify-center touch-none overflow-visible"
      style={{
        width: isVertical ? cardHeight : deckWidth,
        height: isVertical ? deckWidth : cardHeight,
        perspective: "1000px",
        touchAction: "none",
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
        transform: rotation ? `rotate(${rotation}deg)` : undefined,
      }}
    >
      <div className="relative w-full h-full overflow-visible">
        {cards.map((card, index) => {
          const arcOffset = calculateArcOffset(index, cards.length);

          // Position calculation based on orientation
          const positionStyle = isVertical
            ? {
                top: index * (cardWidth - cardOverlap),
                left: arcOffset,
              }
            : {
                left: index * (cardWidth - cardOverlap),
                top: arcOffset,
              };

          return (
            <motion.div
              key={card.id}
              data-card={card.value}
              className={`absolute transform ${
                loading ? "opacity-80" : ""
              } transition-all duration-200 ease-out`}
              initial={false}
              style={{
                ...positionStyle,
                width: cardWidth,
                height: cardHeight,
                zIndex: index,
                willChange: "transform",
              }}
            >
              <img
                src={`/cards/${card.value}.png`}
                alt={card.value}
                data-card-img={card.value}
                className="w-full h-full rounded-lg shadow-md"
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

const CardsReplayTable = ({ roomData, gameData }) => {
  const dispatch = useDispatch();
  const { toast } = useToast();

  const isMobile = useIsMobile();

  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [gameState, setGameState] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const playbackRef = useRef(null);

  const cardDimensions = {
    width: isMobile ? 75 : 80,
    height: isMobile ? 105 : 112,
  };

  const playerCount = gameState?.players?.length || 2;

  // Calculate positions for different player counts
  const getPlayerPositions = () => {
    if (playerCount === 2) {
      return [
        { position: "top-2 left-1/2 transform -translate-x-1/2", rotation: 0 },
        {
          position: "bottom-2 left-1/2 transform -translate-x-1/2",
          rotation: 0,
        },
      ];
    } else if (playerCount === 3) {
      return [
        { position: "top-2 left-1/2 transform -translate-x-1/2", rotation: 0 },
        { position: "bottom-8 left-8", rotation: 0 },
        { position: "bottom-8 right-8", rotation: 0 },
      ];
    } else if (playerCount === 4) {
      // return [
      //   { position: "top-2 left-1/2 transform -translate-x-1/2", rotation: 0 },
      //   { position: "left-2 top-1/2 transform -translate-y-1/2", rotation: 90 },
      //   {
      //     position: "bottom-2 left-1/2 transform -translate-x-1/2",
      //     rotation: 0,
      //   },
      //   {
      //     position: "right-2 top-1/2 transform -translate-y-1/2",
      //     rotation: -90,
      //   },
      // ];
      return [
        { position: "top-2 left-1/2 transform -translate-x-1/2", rotation: 0 },
        {
          position: "top-1/2 right-2 transform -translate-y-1/2",
          rotation: 270,
        },
        {
          position: "bottom-2 left-1/2 transform -translate-x-1/2",
          rotation: 0,
        },
        { position: "top-1/2 left-2 transform -translate-y-1/2", rotation: 90 },
      ];
    }
  };

  const playerPositions = getPlayerPositions();

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

  // const formatMove = (move) => {
  //   const { moveType, card, player } = move;

  //   let playerUsername = gameState?.players?.find(
  //     (p) => p.player === player
  //   )?.username;

  //   switch (moveType) {
  //     case "play":
  //       // Format card displays (e.g., "10H" becomes "10 of Hearts")
  //       const cardDisplay = formatCard(card);
  //       return `@${playerUsername} Played ${cardDisplay}`;

  //     case "draw":
  //       return `@${playerUsername} drew a card${
  //         card ? ` (${formatCard(card)})` : ""
  //       }`;

  //     case "drawPenalty":
  //       return `@${playerUsername} drew penalty card${
  //         card ? ` (${formatCard(card)})` : ""
  //       }`;

  //     case "jump":
  //       return `@${playerUsername} accepted Jump`;

  //     case "kickback":
  //       return `@${playerUsername} accepted Kickback`;

  //     default:
  //       return "Unknown move";
  //   }
  // };

  // // Helper to format card notation into readable text
  // const formatCard = (card) => {
  //   if (!card) return "";
  //   if (card === "JOK") return "Joker";

  //   const suit = card.slice(-1);
  //   const value = card.slice(0, -1);

  //   const suitMap = {
  //     H: "♥️",
  //     D: "♦️",
  //     C: "♣️",
  //     S: "♠️",
  //   };

  //   const valueMap = {
  //     K: "King",
  //     Q: "Queen",
  //     J: "Jack",
  //     A: "Ace",
  //   };

  //   const displayValue = valueMap[value] || value;
  //   const displaySuit = suitMap[suit];

  //   return `${displayValue} ${displaySuit}`;
  // };

  // Optional: Add special move formatting
  // const getSpecialMoveDescription = (card, moveType) => {
  //   if (!card) return null;

  //   const value = card.startsWith("JOK") ? "JOK" : card.slice(0, -1);

  //   if (value === "2" || value === "3" || value === "JOK") {
  //     if (moveType === "play") {
  //       const penaltyMap = {
  //         2: "Penalty Card - Next player draws 2 cards",
  //         3: "Penalty Card - Next player draws 3 cards",
  //         JOK: "Joker - Next player draws 5 cards",
  //       };
  //       return penaltyMap[value];
  //     } else if (moveType === "drawPenalty") {
  //       const drawMap = {
  //         2: "Drew a 2 card",
  //         3: "Drew a 3 card",
  //         JOK: "Drew a Joker",
  //       };
  //       return drawMap[value];
  //     }
  //   } else {
  //     const specialMoves = {
  //       J: "Jump Card - Skips the next player",
  //       Q: "Question Card - Must be followed by an Answer card",
  //       8: "Question Card - Must be followed by an Answer card",
  //       K: "Kickback Card - Reverses game direction",
  //       A: "Ace Card - Lets you choose the next suit",
  //     };
  //     return moveType === "play" && specialMoves[value]
  //       ? specialMoves[value]
  //       : null;
  //   }
  // };

  // const getSpecialMoveDescription = (card, moveType) => {
  //   if (!card) return null;

  //   const value = card === "JOK" ? "JOK" : card.slice(0, -1);

  //   const specialMoves = {
  //     J: "Jump Card - Skips the next player",
  //     Q: "Question Card - Must be followed by an Answer card",
  //     8: "Question Card - Must be followed by an Answer card",
  //     K: "Kickback Card - Reverses game direction",
  //     A: "Ace Card - Lets you choose the next suit",
  //     2: "Penalty Card - Next player draws 2 cards",
  //     3: "Penalty Card - Next player draws 3 cards",
  //     JOK: "Joker - Next player draws 5 cards",
  //   };

  //   return specialMoves[value];
  // };

  // const getSpecialMoveDescription = (move) => {
  //   const { card, moveType, player } = move;

  //   let playerUsername = gameState?.players?.find(
  //     (p) => p.player === player
  //   )?.username;

  //   // if (!card) return null;

  //   const value = card?.startsWith("JOK") ? "JOK" : card?.slice(0, -1);

  //   if (moveType === "kickback") {
  //     const direction =
  //       gameState?.direction === 1 ? "clockwise" : "counterclockwise";
  //     return `Game reversed to ${direction}!`;
  //   }

  //   if (moveType === "jump") {
  //     return `@${playerUsername} was skipped! Ouch!`;
  //   }

  //   if (moveType === "play" && card)
  //     if (moveType === "play" && card) {
  //       if (value === "K") {
  //         return `Attempts to reverse the game!`;
  //       }
  //       if (value === "J") {
  //         return `Attempts to skip the next player!`;
  //       }
  //       const specialMoves = {
  //         // J: "Jump Card - Skips the next player",
  //         Q: "Question Card - Must be followed by an Answer card",
  //         8: "Question Card - Must be followed by an Answer card",
  //         // K: "Kickback Card - Reverses game direction",
  //         A: "Ace Card - Lets you choose the next suit",
  //         2: "Penalty Card - Next player draws 2 cards",
  //         3: "Penalty Card - Next player draws 3 cards",
  //         JOK: "Joker - Next player draws 5 cards",
  //       };
  //       return specialMoves[value];
  //     }

  //   if (moveType === "drawPenalty") {
  //     return `+${card} penalty`;
  //   }

  //   if (moveType === "kickback") {
  //     const direction =
  //       gameState?.direction === 1 ? "clockwise" : "counterclockwise";
  //     return `Game reversed to ${direction}!`;
  //   }

  //   return null;
  // };

  const formatMove = (move) => {
    const { moveType, card, player } = move;

    // let playerUsername =
    //   gameState?.players?.find((p) => p.player === player)?.username ||
    //   "Player";

    let playerUsername =
      gameState?.players?.find((p) => p.player === player)?.username ||
      "Player";
    let displayUsername =
      playerUsername.length > 6
        ? `${playerUsername.substring(0, 6)}...`
        : playerUsername;

    switch (moveType) {
      case "play":
        const cardDisplay = formatCard(card);
        const value = card?.startsWith("JOK") ? "JOK" : card?.slice(0, -1);

        // Add more exciting descriptions for special cards
        const specialPlays = {
          K: `${displayUsername} drops a ${cardDisplay} to reverse the flow!`,
          J: `${displayUsername} slams down a ${cardDisplay} to skip the next player!`,
          A: `${displayUsername} takes control with an ${cardDisplay}!`,
          Q: `${displayUsername} plays a ${cardDisplay} question!`,
          8: `${displayUsername} plays a ${cardDisplay} question!`,
          2: `${displayUsername} punishes with a ${cardDisplay}!`,
          3: `${displayUsername} unleashes a ${cardDisplay} penalty!`,
          JOK: `${displayUsername} devastates with a ${cardDisplay}!`,
        };

        return specialPlays[value] || `${displayUsername} plays ${cardDisplay}`;

      case "draw":
        return `${displayUsername} draws a card`;

      case "drawPenalty":
        return `${displayUsername} takes the penalty`;

      case "jump":
        return `${displayUsername} is jumped - turn skipped!`;

      case "kickback":
        return `${displayUsername} accepts the direction change`;

      default:
        return "Unknown move";
    }
  };

  const formatCard = (card) => {
    if (!card) return "";
    if (card === "JOK") return "Joker";

    const suit = card.slice(-1);
    const value = card.slice(0, -1);

    const suitMap = {
      H: "Hearts ♥️",
      D: "Diamonds ♦️",
      C: "Clubs ♣️",
      S: "Spades ♠️",
    };

    const valueMap = {
      K: "King",
      Q: "Queen",
      J: "Jack",
      A: "Ace",
    };

    const displayValue = valueMap[value] || value;
    const displaySuit = suitMap[suit];

    return `${displayValue} of ${displaySuit}`;
  };

  const getSpecialMoveDescription = (move) => {
    const { card, moveType, player } = move;

    // If no card or not a play move type, handle separately
    if (!card && moveType !== "kickback" && moveType !== "jump") return null;

    const value = card?.startsWith("JOK") ? "JOK" : card?.slice(0, -1);
    const suit = card?.slice(-1);

    // Special move descriptions
    if (moveType === "kickback") {
      const direction =
        gameState?.direction === 1 ? "clockwise" : "counterclockwise";
      return `Game reversed to ${direction}!`;
    }

    if (moveType === "jump") {
      return `Player skipped!`;
    }

    if (moveType === "drawPenalty") {
      const penaltyCards = {
        2: 2,
        3: 3,
        JOK: 5,
      };
      return `Drew ${penaltyCards[value] || ""} penalty cards`;
    }

    if (moveType === "play") {
      const specialMoves = {
        J: "Jump Card - Next player will be skipped",
        Q: "Question Card - Must be followed by an Answer Card",
        8: "Question Card - Must be followed by an Answer Card",
        K: "Kickback Card - Game direction will reverse",
        A: "Ace Card - Controls next suit",
        2: "Penalty Card - Next player draws 2 cards",
        3: "Penalty Card - Next player draws 3 cards",
        JOK: "Joker - Next player draws 5 cards",
      };

      return specialMoves[value];
    }

    return null;
  };

  const reconstructGameState = (moves, initialRoom) => {
    let state = {
      playerCards: {},
      drawPile: [...initialRoom.drawPile],
      discardPile: [initialRoom.discardPile[0]],
      turn: initialRoom.turn,
      direction: initialRoom.direction,
      currentSuit: initialRoom.currentSuit, // Track current suit
      currentRank: null, // Track current rank demand
      nikoKadiAnnounced: false, // Track "Niko Kadi"
      skippedPlayers: [], // Track skipped players
      penaltyCards: 0, // Track penalty cards to draw.
    };

    initialRoom.players.forEach((player) => {
      state.playerCards[player.player] = [];
    });

    moves.forEach((move) => {
      const { player, moveType, card } = move;

      switch (moveType) {
        case "play":
          // Remove card from player's hand
          state.playerCards[player] = state.playerCards[player].filter(
            (c) => c !== card
          );
          // Add to discard pile
          state.discardPile.push(card);

          //Handle penalty cards.
          if (
            card.startsWith("2") ||
            card.startsWith("3") ||
            card.startsWith("JOK")
          ) {
            if (card.startsWith("2")) {
              state.penaltyCards += 2;
            } else if (card.startsWith("3")) {
              state.penaltyCards += 3;
            } else {
              state.penaltyCards += 5;
            }
          } else {
            state.penaltyCards = 0;
          }

          // Handle special cards
          if (card.startsWith("J")) {
            // Jump Card
            //Implement logic to skip the next player
            //state.skippedPlayers.push(nextPlayer);
          } else if (card.startsWith("K")) {
            // Kickback Card
            state.direction *= -1;
          } else if (card.startsWith("Q") || card.startsWith("8")) {
            // Question Card
            //Implement logic to check for matching answer card
          } else if (card.startsWith("A")) {
            // Ace Card
            //Implement logic to handle suit and rank demands
            if (state.penaltyCards > 0) {
              state.penaltyCards = 0;
            }
            state.currentSuit = card.slice(-1);
            state.currentRank = null;
          } else {
            // Answer Card
            state.currentSuit = card.slice(-1);
            state.currentRank = null;
          }
          break;

        case "draw":
          // Add card to player's hand
          if (card) {
            state.playerCards[player].push(card);
            // Remove from draw pile
            state.drawPile = state.drawPile.filter((_, i) => i !== 0);
          }
          break;

        case "kickback":
          // Reverse direction
          state.direction *= -1;
          break;
        case "nikoKadi":
          state.nikoKadiAnnounced = true;
          break;
      }
    });

    return state;
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    const reconstructedHands = reconstructPlayerHands(gameData, roomData); // Step 2: Call reconstructPlayerHands
    const playersWithDecks = roomData.players.map((player) => ({
      ...player,
      playerDeck: reconstructedHands.initialPlayerCards[player.player] || [], // Step 2: Add playerDeck
    }));

    setGameState({
      playerCards: Object.fromEntries(
        roomData.players.map((p) => [p.player, []])
      ),
      drawPile: [...roomData.drawPile],
      discardPile: [roomData.discardPile[0]],
      turn: roomData.turn,
      direction: roomData.direction,
      players: playersWithDecks,
      currentSuit: roomData.discardPile[0].slice(-1),
    });

    setCurrentMoveIndex(-1);

    setIsPlaying(!isPlaying);
  };

  const handleShare = async () => {
    const shareData = {
      title: `KingKadi Game Replay: ${roomData.name}`,
      text: `Check out this epic KingKadi game! ${roomData.players
        .map((p) => p.username)
        .join(" vs ")}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(
          `${shareData.text} ${shareData.url}`
        );
        toast({
          title: "Link copied!",
          description:
            "Share this link with your friends to show them the game replay.",
        });
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleDownload = () => {
    const gameReplayData = JSON.stringify({ roomData, gameData }, null, 2);
    const blob = new Blob([gameReplayData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kingkadi_replay_${roomData.name}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePlayMove = async (card) => {
    if (!card || isAnimating) return;

    setIsAnimating(true);

    try {
      // Get target element (center table)
      const targetElement = document.getElementById("table-drop-target");
      const targetRect = targetElement.getBoundingClientRect();

      const sourceCard = document.querySelector(`[data-card="${card}"]`);
      const sourceRect = sourceCard.getBoundingClientRect();
      const startX = sourceRect.x + sourceRect.width / 2;

      // Start animation
      await new Promise((resolve) => {
        startCardAnimation({
          cardId: card,
          cardValue: card,
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
              const currentPlayer = prevState.turn;

              const updatedPlayers = prevState.players.map((player) => {
                if (player.player === currentPlayer) {
                  const updatedDeck = player.playerDeck.filter(
                    (c) => c !== card
                  );
                  const isKadi = updatedDeck.length === 1;

                  return {
                    ...player,
                    playerDeck: player.playerDeck.filter((c) => c !== card),
                    kadi: isKadi,
                  };
                }
                return player;
              });

              // Calculate the next player
              const currentPlayerIndex = prevState.players.findIndex(
                (p) => p.player === currentPlayer
              );

              let nextPlayerIndex =
                (currentPlayerIndex +
                  prevState.direction +
                  prevState.players.length) %
                prevState.players.length;

              // if (card.startsWith("J")) {
              //   nextPlayerIndex =
              //     (nextPlayerIndex +
              //       prevState.direction +
              //       prevState.players.length) %
              //     prevState.players.length;
              // }

              const nextPlayer = prevState.players[nextPlayerIndex].player;

              let nextTurn = currentPlayer;
              // nextTurn = gameData[currentMoveIndex + 2].player;

              if (gameData[currentMoveIndex + 2]) {
                nextTurn = gameData[currentMoveIndex + 2].player;
              } else if (gameData[currentMoveIndex + 1]) {
                nextTurn = gameData[currentMoveIndex + 1].player;
              }

              // // Handle special card effects
              // if (card.startsWith("K")) {
              //   // Kickback
              //   newTurn = prevState.turn;
              //   prevState.direction *= -1;
              // }

              return {
                ...prevState,
                players: updatedPlayers,
                discardPile: [...prevState.discardPile, card],
                currentSuit: card.slice(-1),
                topCard: card,
                turn: nextTurn,
              };
            });

            resolve();
          },
        });
      });
    } finally {
      setIsAnimating(false);
    }
  };

  const handleDrawCard = async (drawnCard) => {
    setIsAnimating(true);

    try {
      const drawPileElement = document.getElementById("table-drop-target");
      const drawPileRect = drawPileElement.getBoundingClientRect();

      const currentPlayer = gameState.turn;
      const currentPlayerIndex = gameState.players.findIndex(
        (p) => p.player === currentPlayer
      );
      const targetElementId = `deck-${currentPlayerIndex + 1}`;
      const targetElement = document.getElementById(targetElementId);

      if (!targetElement) {
        console.error(`Target element not found: ${targetElementId}`);
        setIsAnimating(false);
        return;
      }

      const targetRect = targetElement.getBoundingClientRect();
      const startX = targetRect.x + targetRect.width / 2;

      await new Promise((resolve) => {
        startCardAnimation({
          cardId: `draw-${drawnCard}`,
          cardValue: drawnCard,
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
            setGameState((prev) => {
              const updatedPlayers = prev.players.map((player) => {
                if (player.player === currentPlayer) {
                  return {
                    ...player,
                    playerDeck: [...player.playerDeck, drawnCard],
                  };
                }
                return player;
              });

              const updatedDrawPile = prev.drawPile.slice(1);

              // Calculate next player
              const nextPlayerIndex =
                (currentPlayerIndex + prev.direction + prev.players.length) %
                prev.players.length;
              const nextPlayer = prev.players[nextPlayerIndex].player;

              return {
                ...prev,
                players: updatedPlayers,
                drawPile: updatedDrawPile,
                turn: nextPlayer,
              };
            });

            resolve();
          },
        });
      });
    } finally {
      setIsAnimating(false);
    }
  };

  const handleDrawPenaltyCards = async (card) => {
    const drawPile = document.getElementById("table-drop-target");
    const drawPileRect = drawPile.getBoundingClientRect();

    const currentPlayer = gameState.turn;
    const currentPlayerIndex = gameState.players.findIndex(
      (p) => p.player === currentPlayer
    );
    const targetElementId = `deck-${currentPlayerIndex + 1}`;
    const targetElement = document.getElementById(targetElementId);

    if (!targetElement) {
      console.error(`Target element not found: ${targetElementId}`);
      return;
    }

    const targetRect = targetElement.getBoundingClientRect();

    await new Promise((resolve) => {
      startCardAnimation({
        cardId: `draw-penalty-${card}`,
        cardValue: card,
        sourceRect: {
          x: drawPileRect.x + (drawPileRect.width - cardDimensions.width) / 2,
          y: drawPileRect.y + (drawPileRect.height - cardDimensions.height) / 2,
          width: cardDimensions.width,
          height: cardDimensions.height,
        },
        targetRect: {
          x: targetRect.x + targetRect.width / 2,
          y: targetRect.y + (targetRect.height - cardDimensions.height) / 2,
          width: cardDimensions.width,
          height: cardDimensions.height,
        },
        onComplete: () => {
          setGameState((prev) => {
            const updatedPlayers = prev.players.map((player) => {
              if (player.player === currentPlayer) {
                return {
                  ...player,
                  playerDeck: [...player.playerDeck, card],
                };
              }
              return player;
            });

            return {
              ...prev,
              players: updatedPlayers,
            };
          });
          resolve();
        },
      });
    });
  };

  const reconstructPlayerHands = (gameData) => {
    const finalPlayerCards = {};
    gameData.forEach((move) => {
      const { player, moveType, card } = move;
      if (!finalPlayerCards[player]) {
        finalPlayerCards[player] = [];
      }
      if (moveType === "play") {
        if (card) {
          const cardIndex = finalPlayerCards[player].indexOf(card);
          if (cardIndex !== -1) {
            finalPlayerCards[player].splice(cardIndex, 1);
          }
        }
      } else if (moveType === "draw") {
        if (card) {
          finalPlayerCards[player].push(card);
        }
      }
    });

    const initialPlayerCards = JSON.parse(JSON.stringify(finalPlayerCards));
    const reversedMoves = [...gameData].reverse();

    reversedMoves.forEach((move) => {
      const { player, moveType, card } = move;

      if (moveType === "play") {
        initialPlayerCards[player].push(card);
      } else if (moveType === "draw" || moveType === "drawPenalty") {
        const cardIndex = initialPlayerCards[player].indexOf(card);
        if (cardIndex !== -1) {
          initialPlayerCards[player].splice(cardIndex, 1);
        }
      }
    });

    const startingPlayerCards = {};
    for (const player in initialPlayerCards) {
      startingPlayerCards[player] = initialPlayerCards[player].slice(0, 4);
    }

    // console.log(startingPlayerCards);

    return {
      initialPlayerCards: startingPlayerCards,
      finalPlayerCards: finalPlayerCards,
    };
  };

  const formatDuration = (ms) => {
    if (isNaN(ms)) return "Invalid";
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m ${
      s % 60
    }s`;
  };

  // Reconstruct game state at current move
  useEffect(() => {
    if (gameData && roomData) {
      if (currentMoveIndex === -1) {
        const reconstructedHands = reconstructPlayerHands(gameData, roomData); // Step 2: Call reconstructPlayerHands
        const playersWithDecks = roomData.players.map((player) => ({
          // Step 2: Create playersWithDecks
          ...player,
          playerDeck:
            reconstructedHands.initialPlayerCards[player.player] || [], // Step 2: Add playerDeck
        }));

        // Initial state - only show the starting card
        setGameState({
          playerCards: Object.fromEntries(
            roomData.players.map((p) => [p.player, []])
          ),
          drawPile: [...roomData.drawPile],
          discardPile: [roomData.discardPile[0]], // Just the first card
          turn: roomData.turn,
          direction: roomData.direction,
          players: playersWithDecks,
          currentSuit: roomData.discardPile[0].slice(-1),
        });
      } else {
        // Normal state reconstruction with moves
        const reconstructedState = reconstructGameState(
          gameData.slice(0, currentMoveIndex + 1),
          roomData
        );
        setGameState(reconstructedState);
      }
    }
  }, [gameData, roomData]);

  // scroll into view
  useEffect(() => {
    if (playbackRef.current && currentMoveIndex >= 0 && gameData.length > 0) {
      const moveElement = playbackRef.current.children[currentMoveIndex];
      if (moveElement) {
        moveElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    }
  }, [currentMoveIndex, gameData]);

  useEffect(() => {
    let intervalId;
    let isPenaltySequence = false; // Flag to track penalty sequence

    if (isPlaying && gameData && currentMoveIndex < gameData.length - 1) {
      intervalId = setInterval(async () => {
        const move = gameData[currentMoveIndex + 1];

        if (isPenaltySequence && move.moveType !== "drawPenalty") {
          // Penalty sequence ended, reset flag
          isPenaltySequence = false;
        }

        if (move.moveType === "play") {
          await handlePlayMove(move.card);
        } else if (move.moveType === "draw") {
          await handleDrawCard(move.card);
        } else if (move.moveType === "drawPenalty") {
          if (!isPenaltySequence) {
            // Start of a new penalty sequence
            isPenaltySequence = true;

            // Determine total penalty cards based on previous move
            let totalPenaltyCards = 0;
            const previousMove = gameData[currentMoveIndex];

            if (previousMove && previousMove.card) {
              if (previousMove.card.startsWith("2")) {
                totalPenaltyCards = 2;
              } else if (previousMove.card.startsWith("3")) {
                totalPenaltyCards = 3;
              } else if (previousMove.card === "JOK") {
                totalPenaltyCards = 5;
              }
            }

            // console.log("### PENALIZED ", totalPenaltyCards);
            // console.log(previousMove);

            // Draw penalty cards
            for (let i = 0; i < totalPenaltyCards; i++) {
              const penaltyMove = gameData[currentMoveIndex + 1 + i];
              await handleDrawPenaltyCards(penaltyMove.card);
            }

            // Change turn after all penalty cards are drawn
            setGameState((prevState) => {
              const currentPlayerIndex = prevState.players.findIndex(
                (p) => p.player === prevState.turn
              );
              const nextPlayerIndex =
                (currentPlayerIndex +
                  prevState.direction +
                  prevState.players.length) %
                prevState.players.length;
              const nextPlayer = prevState.players[nextPlayerIndex].player;

              return {
                ...prevState,
                turn: nextPlayer,
              };
            });

            // Advance currentMoveIndex once for the whole penalty draw
            setCurrentMoveIndex((prevIndex) =>
              Math.min(gameData.length - 1, prevIndex + totalPenaltyCards)
            );

            return; // Skip the default setCurrentMoveIndex below
          } else {
            // Penalty sequence already started, skip this iteration
            return;
          }
        } else if (move.moveType === "kickback" || move.moveType === "jump") {
          setGameState((prevState) => {
            const currentPlayerIndex = prevState.players.findIndex(
              (p) => p.player === prevState.turn
            );
            const nextPlayerIndex =
              (currentPlayerIndex +
                prevState.direction +
                prevState.players.length) %
              prevState.players.length;
            const nextPlayer = prevState.players[nextPlayerIndex].player;

            return {
              ...prevState,
              turn: nextPlayer,
            };
          });
        }

        // Default increment for non-penalty moves
        setCurrentMoveIndex((prevIndex) =>
          Math.min(gameData.length - 1, prevIndex + 1)
        );
      }, 1000 / playbackSpeed);
    } else if (!isPlaying) {
      clearInterval(intervalId);
    }
    return () => clearInterval(intervalId);
  }, [isPlaying, currentMoveIndex, gameData, playbackSpeed]);

  useEffect(() => {
    dispatch(
      init_page({
        page_title: `Game Replay: ${roomData.name}`,
        show_back: false,
        show_menu: true,
        route_to: "",
      })
    );
  }, []);

  return (
    <>
      <ReplayCardAnimations />

      <div
        className="relative flex flex-col gap-8"
        style={{ minHeight: "100vh" }}
      >
        <div
          className="fixed bottom-20 md:bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 shadow-md cursor-pointer transition-colors duration-200 z-50"
          onClick={handleShare}
        >
          <Share2 className="w-5 h-5" />
        </div>

        <div className="max-w-7xl mx-auto">
          {/* <div className="mb-6 flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center space-x-4">
              <Button
                disabled
                onClick={handleShare}
                variant="outline"
                size="sm"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button
             onClick={handleDownload}
              variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            </div>
          </div> */}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div
              className="relative lg:col-span-2 bg-white dark:bg-gray-800
             rounded-lg shadow-lg"
              style={{
                position: "relative",
                height: isMobile ? "60vh" : "70vh",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: isMobile ? "120px" : "250px",
                  height: isMobile ? "120px" : "150px",
                }}
              >
                <GameDirection
                  direction={1}
                  isKickback={false}
                  isMobile={isMobile}
                />
                <ReplayCenterTable
                  canDraw={false}
                  roomData={{
                    discardPile: gameState?.discardPile,
                    drawPileLength: gameState?.drawPile.length,
                    turn: gameState?.turn,
                    jumpCounter: 0,
                    isPenalty: false,
                    isKickback: false,
                    isQuestion: false,
                    desiredRank: null,
                    direction: 1,
                    currentSuit: gameState?.currentSuit,
                  }}
                  // isShuffling={shufflingCards}
                  // changedSuit={changedSuit}
                />
              </div>

              {gameState && (
                <>
                  {gameState.players.map((player, index) => {
                    const position = playerPositions[index];
                    const isVertical =
                      position.rotation === 90 || position.rotation === 270;

                    return (
                      <div
                        id={`deck-${index + 1}`}
                        key={index}
                        className={`absolute z-10 ${position.position}`}
                      >
                        <div
                          style={{
                            transform:
                              position.rotation !== 0
                                ? `rotate(${position.rotation}deg)`
                                : undefined,
                            transformOrigin: "center",
                            maxWidth: isVertical ? "80px" : undefined,
                          }}
                        >
                          <PlayerInfo
                            player={player}
                            isTurn={
                              gameState?.turn === roomData.players[index].player
                            }
                            playerIndex={index}
                          />
                          <div
                            className={`mt-1 ${
                              isMobile ? "scale-75 origin-top" : ""
                            }`}
                          >
                            <PlayerDeckReadOnly
                              player={player}
                              playerDeck={player.playerDeck}
                              loading={false}
                              invalidMove={false}
                              rotation={0}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
              <div className="flex justify-center space-x-4 mb-4">
                <Button
                  onClick={() => handleReset()}
                  variant="outline"
                  size="icon"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() =>
                    setCurrentMoveIndex(Math.max(0, currentMoveIndex - 1))
                  }
                  variant="outline"
                  size="icon"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button onClick={togglePlayback} variant="default" size="icon">
                  {isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  onClick={() =>
                    setCurrentMoveIndex(
                      Math.min(gameData.length - 1, currentMoveIndex + 1)
                    )
                  }
                  variant="outline"
                  size="icon"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() =>
                    setPlaybackSpeed((speed) => (speed === 1 ? 2 : 1))
                  }
                  variant="outline"
                  size="icon"
                >
                  <FastForward className="w-4 h-4" />
                </Button>
              </div>

              <Slider
                value={[currentMoveIndex + 1]}
                max={gameData.length}
                step={1}
                onValueChange={([value]) => setCurrentMoveIndex(value - 1)}
                className="mb-4"
              />

              <ScrollArea
                className="h-[calc(100vh-400px)]"
                scrollHidden={false}
              >
                <div className="space-y-2 pr-4" ref={playbackRef}>
                  {gameData.map((move, index) => (
                    <motion.div
                      key={move._id}
                      className={`p-2 rounded ${
                        index === currentMoveIndex
                          ? "bg-blue-50 dark:bg-blue-900/20"
                          : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      } cursor-pointer`}
                      onClick={() => setCurrentMoveIndex(index)}
                      initial={
                        index > currentMoveIndex
                          ? { opacity: 0, y: 20 }
                          : { opacity: 1, y: 0 }
                      }
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {formatMove(move)}
                          </span>
                          {getSpecialMoveDescription(move) && (
                            <span className="text-xs text-gray-500">
                              {getSpecialMoveDescription(move)}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(move.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Game duration:{" "}
              {formatDuration(
                new Date(gameData.slice(-1)[0].timestamp).getTime() -
                  new Date(gameData[0].timestamp).getTime()
              )}
            </p>
          </div>
        </div>

        {/* <button
          onClick={async () => {
            await handlePlayMove("10S");
          }}
        >
          SET HEREzz {currentMoveIndex}
        </button>

        <button
          onClick={() => {
            console.log(roomData);
            console.log(gameData);
          }}
        >
          BUTTON
        </button>

        <button
          onClick={() => {
            reconstructPlayerHands(gameData);
          }}
        >
          HERE IS ONE!
        </button>

        <button onClick={() => console.log(gameState)}>STATE</button> */}
      </div>
    </>
  );
};

export default CardsReplayTable;
