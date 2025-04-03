"use client";

import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect, useRef, useCallback } from "react";

import { motion, AnimatePresence } from "framer-motion";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Video as VideoCamera, Play, Pause, RotateCcw } from "lucide-react";

import { useIsMobile } from "@/hooks/useIsMobile";

import ReplayCardAnimations from "@/page_components/Cards/Replay/ReplayCardAnimations";
import { startAnimation } from "@/app/store/animationSlice";

const SuitIcon = ({ suit, desiredSuit, animate }) => {
  const baseClasses = "w-5 h-5 sm:w-6 sm:h-6 transition-all duration-300";
  const desiredClasses = desiredSuit ? "animate-desired-suit " : "";
  const pulseClasses = animate ? "animate-pulse-scale" : "";

  const suitImages = {
    S: "/cards/spade.png",
    C: "/cards/club.png",
    D: "/cards/diamond.png",
    H: "/cards/heart.png",
  };

  const suitColors = {
    S: "rgba(0, 0, 0, 0.7)",
    C: "rgba(0, 0, 0, 0.7)",
    D: "rgba(255, 0, 0, 0.7)",
    H: "rgba(255, 0, 0, 0.7)",
  };

  return (
    <div className="relative">
      {desiredSuit && (
        <div
          className="absolute inset-0 animate-ping-slow rounded-full"
          style={{
            backgroundColor: suitColors[suit],
            opacity: 0.2,
          }}
        />
      )}
      <img
        src={suitImages[suit]}
        className={`${baseClasses} ${desiredClasses} ${pulseClasses}`}
        alt={`${suit} suit`}
        style={{
          filter: desiredSuit
            ? `drop-shadow(0 0 4px ${suitColors[suit]})`
            : "none",
        }}
      />
    </div>
  );
};

const ReplayCenterTable = ({ roomData, isShuffling, changedSuit }) => {
  const isMobile = useIsMobile();

  const cardPositionsRef = useRef({});
  const viewerRef = useRef(null);

  const [isViewingHistory, setIsViewingHistory] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [animate, setAnimate] = useState(false);

  const pileWidth = 50;
  const pileHeight = 70;

  const {
    discardPile,
    drawPileLength,
    turn,
    jumpCounter,
    lastGamePlay,
    isPenalty,
    isKickback,
    isQuestion,
    currentSuit,
    desiredRank,
    direction,
    timer,
    recentPlays,
  } = roomData;

  // Get the top card from discard pile

  const getCardStyle = (cardId, index) => {
    if (!cardPositionsRef.current[cardId]) {
      cardPositionsRef.current[cardId] = {
        rotation: Math.random() * 60 - 30,
        offsetX:
          Math.random() * parseInt(pileWidth) * 0.2 - parseInt(pileWidth) * 0.1,
        offsetY:
          Math.random() * parseInt(pileHeight) * 0.2 -
          parseInt(pileHeight) * 0.1,
        scale: 0.95 + Math.random() * 0.1,
      };
    }

    const pos = cardPositionsRef.current[cardId];
    return {
      transform: `translate(${pos.offsetX}px, ${pos.offsetY}px) rotate(${pos.rotation}deg) scale(${pos.scale})`,
      zIndex: index,
    };
  };

  const getTransformStyle = (index, isSelected) => {
    // const baseOffset = isMobile ? 25 : pileWidth * 0.3;
    // const selectedOffset = isMobile ? 35 : pileWidth * 0.4;

    const baseOffset = 0; // Reduced base offset
    const selectedOffset = 0;
    const totalCards = recentPlays?.length;
    const position = index - totalCards + 1;

    if (isMobile) {
      return `translateY(${
        position * (isSelected ? -selectedOffset : baseOffset)
      }px) 
              scale(${isSelected ? 1.15 : 1})
              ${isSelected ? "translateZ(20px)" : ""}`;
    }

    // Desktop view
    return `translateX(${
      position * (isSelected ? selectedOffset : baseOffset)
    }px)
            translateY(${isSelected ? -20 : 0}px)
            scale(${isSelected ? 1.15 : 1})
            ${isSelected ? "translateZ(20px)" : ""}`;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (viewerRef.current && !viewerRef.current.contains(event.target)) {
        setIsViewingHistory(false);
        setSelectedCard(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setAnimate(true);
    const timeout = setTimeout(() => setAnimate(false), 500);
    return () => clearTimeout(timeout);
  }, [changedSuit]);

  return (
    <div
      className="absolute inset-0 flex items-center justify-center z-50"
      style={{ cursor: "pointer", zIndex: 999 }}
    >
      <div
        className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center gap-1 md:gap-2 w-full
        "
        style={{
          top: isMobile ? "-16px" : "-20px",
          zIndex: 20,
        }}
      >
        <div className="flex items-center h-8 sm:h-10 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 shadow-inner border border-gray-300">
          {desiredRank && (
            <div className="flex items-center justify-center px-2 sm:px-3 border-r border-gray-300">
              <span className="font-semibold text-sm sm:text-base bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
                {desiredRank}
              </span>
            </div>
          )}

          <div className="flex items-center px-2 sm:px-3">
            {currentSuit === "S" && (
              <SuitIcon
                suit="S"
                desiredSuit={roomData?.desiredSuit}
                animate={animate}
              />
            )}
            {currentSuit === "C" && (
              <SuitIcon
                suit="C"
                desiredSuit={roomData?.desiredSuit}
                animate={animate}
              />
            )}
            {currentSuit === "D" && (
              <SuitIcon
                suit="D"
                desiredSuit={roomData?.desiredSuit}
                animate={animate}
              />
            )}
            {currentSuit === "H" && (
              <SuitIcon
                suit="H"
                desiredSuit={roomData?.desiredSuit}
                animate={animate}
              />
            )}
            {currentSuit === "FREE" && (
              <span className="text-xs font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
                FREE
              </span>
            )}
          </div>
        </div>
      </div>

      <div id="table-drop-target" className="flex items-center gap-10">
        <div
          ref={viewerRef}
          className="relative group cursor-pointer"
          style={{ width: pileWidth, height: pileHeight }}
        >
          <div className="absolute inset-0" />

          {discardPile?.slice(-10)?.map((card, index) => {
            const isTopCard = index === discardPile.length - 1;
            const isSelected = selectedCard === index;
            const cardStyle = isViewingHistory
              ? {
                  transform: getTransformStyle(index, isSelected),
                  opacity: isTopCard || isSelected ? 1 : 0.8,
                  zIndex: isSelected ? 50 : index,
                }
              : getCardStyle(card, index);

            return (
              <div
                id="discard-pile"
                key={`discard-${index}-${card}`}
                className={`absolute inset-0 rounded-lg shadow-xl ring-1 ring-white/10 
                    transition-all duration-300 ease-out
                    ${isTopCard ? "cursor-pointer" : ""}
                    ${isTopCard ? "starter-card-landing" : ""}`}
                style={{
                  width: `${pileWidth}px`,
                  height: `${pileHeight}px`,
                  backgroundImage: `url('/cards/${card}.png')`,
                  backgroundSize: "100% 100%",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  border: "1px solid rgba(255,255,255,0.1)",
                  boxShadow: isSelected
                    ? "0 12px 32px rgba(0,0,0,0.5)"
                    : "0 4px 12px rgba(0,0,0,0.3)",
                  ...cardStyle,
                }}
              />
            );
          })}
        </div>
        {/* END DISCARD PILE */}

        <div className="relative">
          <div id="draw-pile" style={{ width: pileWidth, height: pileHeight }}>
            {isShuffling
              ? [...Array(5)].map((_, index) => (
                  <div
                    key={index}
                    className="shufflingCard absolute rounded-lg"
                    style={{
                      width: "100%",
                      height: "100%",
                      backgroundImage: "url('/cards/backred.png')",
                      backgroundSize: "100% 100%",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  />
                ))
              : [...Array(Math.min(drawPileLength || 0, 3))].map((_, index) => (
                  <div
                    key={`draw-${index}`}
                    className="absolute rounded-lg"
                    style={{
                      width: "100%",
                      height: "100%",
                      backgroundImage: "url('/cards/backred.png')",
                      backgroundSize: "100% 100%",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                      transform: `translateY(${index * -1}px)`,
                      border: "1px solid rgba(255,255,255,0.1)",
                      zIndex: 3 - index,
                    }}
                  />
                ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const PlayerInfo = ({ player, isTurn, playerIndex }) => {
  const isMobile = useIsMobile();

  const avatarSize = isMobile ? "w-4 h-4" : "w-6 h-6";

  return (
    <div
      className={`flex items-center gap-1 ${
        isTurn
          ? "bg-blue-100/90 dark:bg-blue-900/90"
          : "bg-gray-100/70 dark:bg-gray-700/70"
      } rounded-lg p-1`}
    >
      <div
        className={`${avatarSize} rounded-full overflow-hidden bg-gray-300 flex-shrink-0`}
      >
        {player.profilePicture ? (
          <img
            src={
              player.profilePicture ||
              `https://api.dicebear.com/9.x/shapes/svg?seed=${player.name}`
            }
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
          @{player.name || `P${playerIndex + 1}`}
        </span>
        <span className="text-xs text-gray-600 dark:text-gray-300">
          RP {player.hand?.length || 0}
        </span>
      </div>
    </div>
  );
};

const GameDirection = ({ direction, isKickback = false, isMobile = false }) => {
  const [dots, setDots] = useState([0, 120, 240]);

  const gameDirection = direction === 1 && "clockwise";

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) =>
        prev.map(
          (angle) => (angle + (gameDirection === "clockwise" ? 5 : -5)) % 360
        )
      );
    }, 100);

    return () => clearInterval(interval);
  }, [direction]);

  const calculatePosition = (angle) => {
    const radius = isMobile ? 45 : 60;
    const radian = (angle * Math.PI) / 180;
    return {
      x: Math.cos(radian) * radius,
      y: Math.sin(radian) * radius,
    };
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Base Ring */}
      <div
        className={`absolute inset-0 rounded-xl border-2 transition-colors duration-300
        ${isKickback ? "border-orange-500/20" : "border-emerald-500/20"}`}
      />

      {/* Moving Dots */}
      {dots.map((angle, i) => {
        const pos = calculatePosition(angle);
        return (
          <div
            key={i}
            className={`absolute left-1/2 top-1/2 w-2 h-2 rounded-full
              transform -translate-x-1/2 -translate-y-1/2 transition-colors duration-300
              ${isKickback ? "bg-orange-500" : "bg-emerald-500"}`}
            style={{
              transform: `translate(${pos.x}px, ${pos.y}px)`,
              opacity: 0.8 - i * 0.2,
            }}
          />
        );
      })}
    </div>
  );
};

const PlayerDeckReadOnly = ({ player, playerDeck, loading, rotation = 0 }) => {
  const isMobile = useIsMobile();
  const deckRef = useRef(null);

  // Track card positions and dimensions for animations
  const [cards, setCards] = useState([]);

  const calculateLayout = useCallback(() => {
    const baseCardWidth = isMobile ? 50 : 50; // Reduced base width
    const baseCardHeight = isMobile ? 70 : 70; // Reduced base height (maintaining aspect ratio)

    const calculateOverlap = (numCards) => {
      // More aggressive overlap for better mobile viewing
      if (numCards <= 6) return baseCardWidth * 0.5; // Increased overlap
      if (numCards <= 10) return baseCardWidth * 0.7; // Increased overlap
      if (numCards <= 15) return baseCardWidth * 0.8; // Increased overlap
      return baseCardWidth * 0.9; // Increased overlap
    };

    const calculateArcOffset = (index, total) => {
      if (total <= 8) return 0;
      const normalizedPosition = (index / (total - 1)) * 2 - 1;
      const maxArcHeight = isMobile ? -1 : -2; // Reduced arc height further
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

          if (!card.value || card.value.trim() === "") {
            return null;
          }

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

const roomData = {
  _id: "67c826b04c4f5816e9b90d19",
  name: "grub1",
  maxPlayers: 2,
  direction: -1,
  turn: "674de1dff15bd1881adc0aab",
  currentSuit: "S",
  drawPile: [
    "8H",
    "9S",
    "8S",
    "4H",
    "4D",
    "QD",
    "JS",
    "3S",
    "QH",
    "AD",
    "QC",
    "9C",
    "6C",
    "6D",
    "KS",
    "5D",
    "6S",
    "AC",
    "JH",
    "9D",
    "8D",
    "2C",
    "5S",
    "7C",
    "4S",
    "7H",
    "8C",
    "10C",
  ],
  discardPile: [
    "10H",
    "10S",
    "10D",
    "7D",
    "KD",
    "KC",
    "JOK1",
    "KH",
    "9H",
    "5H",
    "5C",
    "4C",
    "JOK2",
    "3D",
    "AH",
    "QS",
    "7S",
  ],
  gamePlay: [
    {
      player: "674de1dff15bd1881adc0aab",
      moveType: "play",
      card: "10S",
      _id: "676ac69469bc322ae514da3a",
      timestamp: "2024-12-24T14:35:00.633Z",
    },
    {
      player: "66b796ccc18c8e15519af3e6",
      moveType: "play",
      card: "10D",
      _id: "676ac6a169bc322ae514da41",
      timestamp: "2024-12-24T14:35:13.534Z",
    },
    {
      player: "674de1dff15bd1881adc0aab",
      moveType: "play",
      card: "7D",
      _id: "676ac6b169bc322ae514da50",
      timestamp: "2024-12-24T14:35:29.676Z",
    },
    {
      player: "66b796ccc18c8e15519af3e6",
      moveType: "play",
      card: "KD",
      _id: "676ac6b669bc322ae514da59",
      timestamp: "2024-12-24T14:35:34.461Z",
    },
    {
      player: "674de1dff15bd1881adc0aab",
      moveType: "kickback",
      card: null,
      _id: "676ac6c069bc322ae514da63",
      timestamp: "2024-12-24T14:35:44.390Z",
    },
    {
      player: "66b796ccc18c8e15519af3e6",
      moveType: "play",
      card: "KC",
      _id: "676ac6c469bc322ae514da6e",
      timestamp: "2024-12-24T14:35:48.166Z",
    },
    {
      player: "674de1dff15bd1881adc0aab",
      moveType: "kickback",
      card: null,
      _id: "676ac6c769bc322ae514da7a",
      timestamp: "2024-12-24T14:35:51.486Z",
    },
    {
      player: "66b796ccc18c8e15519af3e6",
      moveType: "play",
      card: "JOK1",
      _id: "676ac6ca69bc322ae514da87",
      timestamp: "2024-12-24T14:35:54.099Z",
    },
    {
      player: "674de1dff15bd1881adc0aab",
      moveType: "drawPenalty",
      card: "3D",
      _id: "676ac6ce69bc322ae514da95",
      timestamp: "2024-12-24T14:35:58.635Z",
    },
    {
      player: "674de1dff15bd1881adc0aab",
      moveType: "drawPenalty",
      card: "7S",
      _id: "676ac6ce69bc322ae514da96",
      timestamp: "2024-12-24T14:35:58.636Z",
    },
    {
      player: "674de1dff15bd1881adc0aab",
      moveType: "drawPenalty",
      card: "QS",
      _id: "676ac6ce69bc322ae514da97",
      timestamp: "2024-12-24T14:35:58.637Z",
    },
    {
      player: "674de1dff15bd1881adc0aab",
      moveType: "drawPenalty",
      card: "KH",
      _id: "676ac6ce69bc322ae514da98",
      timestamp: "2024-12-24T14:35:58.638Z",
    },
    {
      player: "674de1dff15bd1881adc0aab",
      moveType: "drawPenalty",
      card: "5H",
      _id: "676ac6ce69bc322ae514da99",
      timestamp: "2024-12-24T14:35:58.639Z",
    },
    {
      player: "66b796ccc18c8e15519af3e6",
      moveType: "draw",
      card: "2D",
      _id: "676ac6d169bc322ae514daac",
      timestamp: "2024-12-24T14:36:01.687Z",
    },
    {
      player: "674de1dff15bd1881adc0aab",
      moveType: "play",
      card: "KH",
      _id: "676ac6d769bc322ae514dac0",
      timestamp: "2024-12-24T14:36:07.528Z",
    },
    {
      player: "66b796ccc18c8e15519af3e6",
      moveType: "kickback",
      card: null,
      _id: "676ac6db69bc322ae514dad5",
      timestamp: "2024-12-24T14:36:11.320Z",
    },
    {
      player: "674de1dff15bd1881adc0aab",
      moveType: "play",
      card: "9H",
      _id: "676ac6e069bc322ae514daeb",
      timestamp: "2024-12-24T14:36:16.918Z",
    },
    {
      player: "66b796ccc18c8e15519af3e6",
      moveType: "draw",
      card: "2H",
      _id: "676ac6e469bc322ae514db02",
      timestamp: "2024-12-24T14:36:20.427Z",
    },
    {
      player: "674de1dff15bd1881adc0aab",
      moveType: "play",
      card: "5H",
      _id: "676ac6ea69bc322ae514db1a",
      timestamp: "2024-12-24T14:36:26.021Z",
    },
    {
      player: "674de1dff15bd1881adc0aab",
      moveType: "play",
      card: "5C",
      _id: "676ac6ec69bc322ae514db33",
      timestamp: "2024-12-24T14:36:28.799Z",
    },
    {
      player: "66b796ccc18c8e15519af3e6",
      moveType: "draw",
      card: "2S",
      _id: "676ac6f169bc322ae514db4d",
      timestamp: "2024-12-24T14:36:33.642Z",
    },
    {
      player: "674de1dff15bd1881adc0aab",
      moveType: "draw",
      card: "4C",
      _id: "676ac6f769bc322ae514db68",
      timestamp: "2024-12-24T14:36:39.331Z",
    },
    {
      player: "66b796ccc18c8e15519af3e6",
      moveType: "draw",
      card: "6H",
      _id: "676ac6fb69bc322ae514db84",
      timestamp: "2024-12-24T14:36:43.600Z",
    },
    {
      player: "674de1dff15bd1881adc0aab",
      moveType: "play",
      card: "4C",
      _id: "676ac70069bc322ae514dba1",
      timestamp: "2024-12-24T14:36:48.648Z",
    },
    {
      player: "66b796ccc18c8e15519af3e6",
      moveType: "draw",
      card: "JOK2",
      _id: "676ac70469bc322ae514dbbf",
      timestamp: "2024-12-24T14:36:52.564Z",
    },
    {
      player: "674de1dff15bd1881adc0aab",
      moveType: "draw",
      card: "AH",
      _id: "676ac70869bc322ae514dbde",
      timestamp: "2024-12-24T14:36:56.219Z",
    },
    {
      player: "66b796ccc18c8e15519af3e6",
      moveType: "play",
      card: "JOK2",
      _id: "676ac71069bc322ae514dbfe",
      timestamp: "2024-12-24T14:37:04.518Z",
    },
    {
      player: "674de1dff15bd1881adc0aab",
      moveType: "play",
      card: "3D",
      _id: "676ac71369bc322ae514dc1f",
      timestamp: "2024-12-24T14:37:07.811Z",
    },
    {
      player: "66b796ccc18c8e15519af3e6",
      moveType: "drawPenalty",
      card: "3C",
      _id: "676ac71869bc322ae514dc41",
      timestamp: "2024-12-24T14:37:12.113Z",
    },
    {
      player: "66b796ccc18c8e15519af3e6",
      moveType: "drawPenalty",
      card: "JD",
      _id: "676ac71869bc322ae514dc42",
      timestamp: "2024-12-24T14:37:12.114Z",
    },
    {
      player: "66b796ccc18c8e15519af3e6",
      moveType: "drawPenalty",
      card: "JC",
      _id: "676ac71869bc322ae514dc43",
      timestamp: "2024-12-24T14:37:12.124Z",
    },
    {
      player: "674de1dff15bd1881adc0aab",
      moveType: "play",
      card: "AH",
      _id: "676ac71d69bc322ae514dc68",
      timestamp: "2024-12-24T14:37:17.037Z",
    },
    {
      player: "66b796ccc18c8e15519af3e6",
      moveType: "draw",
      card: "3H",
      _id: "676ac72469bc322ae514dcb3",
      timestamp: "2024-12-24T14:37:24.247Z",
    },
    {
      player: "674de1dff15bd1881adc0aab",
      moveType: "play",
      card: "QS",
      _id: "676ac72769bc322ae514dcda",
      timestamp: "2024-12-24T14:37:27.036Z",
    },
    {
      player: "674de1dff15bd1881adc0aab",
      moveType: "play",
      card: "7S",
      _id: "676ac72a69bc322ae514dd08",
      timestamp: "2024-12-24T14:37:30.753Z",
    },
  ],
  players: [
    {
      player: "674de1dff15bd1881adc0aab",
      playerDeck: [],
      username: "WufWuf",
      name: "Wuf Wuf",
      profilePicture:
        "https://lh3.googleusercontent.com/a/ACg8ocIdPKnw-CbEIdlXdxqdvs5H6DCCt52sm01yK7N5q4njWdlE8Q=s96-c",
    },
    {
      player: "66b796ccc18c8e15519af3e6",
      playerDeck: ["2D", "2H", "2S", "6H", "3C", "JD", "JC", "3H"],
      username: "ericklumunge",
      name: "erick lumunge",
      profilePicture:
        "https://lh3.googleusercontent.com/a/ACg8ocK9-tpzIVW6mWIyYiCSjirAeMeOqv8vOs0KATNr2X2VE5Ja_A=s96-c",
    },
  ],
};

const GOD = () => {
  const dispatch = useDispatch();

  const isMobile = useIsMobile();

  const gameData = roomData.gamePlay;

  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(0.5);
  const [gameState, setGameState] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);

  // const cardDimensions = {
  //   width: isMobile ? 75 : 80,
  //   height: isMobile ? 105 : 112,
  // };

  const cardDimensions = {
    width: isMobile ? 35 : 40,
    height: isMobile ? 50 : 60,
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
    const reconstructedHands = reconstructPlayerHands(roomData?.gamePlay); // reconstruct player hands
    const playersWithDecks = roomData.players.map((player) => ({
      ...player,
      playerDeck: reconstructedHands.initialPlayerCards[player.player] || [],
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

    // setIsPlaying(false);
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
        // notify link copied
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handlePlayMove = async (card) => {
    if (!card || isAnimating) return;

    setIsAnimating(true);

    try {
      const targetElement = document.getElementById("discard-pile");
      const sourceCard = document.querySelector(`[data-card="${card}"]`);
      const gameContainer = document.getElementById("game-container");

      if (!targetElement || !sourceCard || !gameContainer) {
        console.error("Target or source element not found.");
        setIsAnimating(false);
        return;
      }

      const targetRect = targetElement.getBoundingClientRect();
      const sourceRect = sourceCard.getBoundingClientRect();
      const containerRect = gameContainer.getBoundingClientRect();

      const relativeSourceRect = {
        x: sourceRect.left - containerRect.left,
        y: sourceRect.top - containerRect.top,
        width: cardDimensions.width,
        height: cardDimensions.height,
      };

      const relativeTargetRect = {
        x: targetRect.left - containerRect.left,
        y: targetRect.top - containerRect.top,
        width: cardDimensions.width,
        height: cardDimensions.height,
      };

      // console.log(relativeSourceRect);

      await new Promise((resolve) => {
        startCardAnimation({
          cardId: card,
          cardValue: card,
          sourceRect: {
            x: relativeSourceRect.x,
            y: relativeSourceRect.y,
            width: relativeSourceRect.width,
            height: relativeSourceRect.height,
          },
          targetRect: {
            x: relativeTargetRect.x,
            y: relativeTargetRect.y,
            width: relativeTargetRect.width,
            height: relativeTargetRect.height,
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
                currentSuit: card.startsWith("JOK") ? "FREE" : card.slice(-1),
                topCard: card,
                turn: nextTurn,
              };
            });

            setIsAnimating(false);

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
      const drawPileElement = document.getElementById("draw-pile");

      const currentPlayer = gameState.turn;
      const currentPlayerIndex = gameState.players.findIndex(
        (p) => p.player === currentPlayer
      );
      const targetElementId = `deck-${currentPlayerIndex + 1}`;
      const targetElement = document.getElementById(targetElementId);

      const gameContainer = document.getElementById("game-container");

      const drawPileRect = drawPileElement.getBoundingClientRect();
      const targetRect = targetElement.getBoundingClientRect();
      const containerRect = gameContainer.getBoundingClientRect();

      if (!targetElement || !drawPileElement || !gameContainer) {
        console.error("Target or source element not found.");
        setIsAnimating(false);
        return;
      }

      const relativeSourceRect = {
        x: drawPileRect.left - containerRect.left,
        y: drawPileRect.top - containerRect.top,
        width: cardDimensions.width,
        height: cardDimensions.height,
      };

      const relativeTargetRect = {
        x: targetRect.left - containerRect.left,
        y: targetRect.top - containerRect.top,
        width: cardDimensions.width,
        height: cardDimensions.height,
      };

      const startX = targetRect.x + targetRect.width / 2;

      // console.log("# SOURCE #");
      // console.log(relativeSourceRect);
      // console.log("# TARGET #");
      // console.log(relativeTargetRect);

      await new Promise((resolve) => {
        startCardAnimation({
          cardId: `draw-${drawnCard}`,
          cardValue: drawnCard,
          sourceRect: {
            x: relativeSourceRect.x,
            y: relativeSourceRect.y,
            width: relativeSourceRect.width,
            height: relativeSourceRect.height,
          },
          targetRect: {
            x: relativeTargetRect.x,
            y: relativeTargetRect.y,
            width: relativeTargetRect.width,
            height: relativeTargetRect.height,
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
    const drawPileElement = document.getElementById("draw-pile");

    const currentPlayer = gameState.turn;
    const currentPlayerIndex = gameState.players.findIndex(
      (p) => p.player === currentPlayer
    );
    const targetElementId = `deck-${currentPlayerIndex + 1}`;
    const targetElement = document.getElementById(targetElementId);

    const gameContainer = document.getElementById("game-container");

    if (!targetElement || !drawPileElement || !gameContainer) {
      console.error("Target or source element not found.");
      setIsAnimating(false);
      return;
    }

    const drawPileRect = drawPileElement.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();
    const containerRect = gameContainer.getBoundingClientRect();

    const relativeSourceRect = {
      x: drawPileRect.left - containerRect.left,
      y: drawPileRect.top - containerRect.top,
      width: cardDimensions.width,
      height: cardDimensions.height,
    };

    const relativeTargetRect = {
      x: targetRect.left - containerRect.left,
      y: targetRect.top - containerRect.top,
      width: cardDimensions.width,
      height: cardDimensions.height,
    };

    await new Promise((resolve) => {
      startCardAnimation({
        cardId: `draw-penalty-${card}`,
        cardValue: card,
        sourceRect: {
          x: relativeSourceRect.x,
          y: relativeSourceRect.y,
          width: relativeSourceRect.width,
          height: relativeSourceRect.height,
        },
        targetRect: {
          x: relativeTargetRect.x,
          y: relativeTargetRect.y,
          width: relativeTargetRect.width,
          height: relativeTargetRect.height,
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

  // Reconstruct game state at current move
  useEffect(() => {
    if (roomData) {
      if (currentMoveIndex === -1) {
        const reconstructedHands = reconstructPlayerHands(roomData?.gamePlay); // reconstruct player hands
        const playersWithDecks = roomData.players.map((player) => ({
          // Step 2: Create playersWithDecks
          ...player,
          playerDeck:
            reconstructedHands.initialPlayerCards[player.player] || [],
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
  }, [roomData]);

  useEffect(() => {
    if (roomData && currentMoveIndex >= gameData.length - 1) {
      setShowGameOver(true);
      setTimeout(() => {
        setShowGameOver(false);
        handleReset();
      }, 2000);
    }
  }, [currentMoveIndex, roomData]);

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
              } else if (previousMove.card.startsWith("JOK")) {
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

  return (
    <>
      <ReplayCardAnimations />

      <div className="space-y-4 mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <VideoCamera className="w-5 h-5 text-primary" /> Game of the Day
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              id="game-container"
              className="relative bg-gray-300 dark:bg-gray-800 rounded-lg h-96"
            >
              {showGameOver && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                  <div className="text-white text-center space-y-2 p-4">
                    <div className="text-lg md:text-xl lg:text-2xl font-semibold">
                      Game Over!
                    </div>
                    <div className="text-base md:text-lg lg:text-xl font-medium">
                      @
                      {
                        gameState.players.find(
                          (p) => p.player === gameState.turn
                        ).username
                      }{" "}
                      Wins
                    </div>
                  </div>
                </div>
              )}

              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: isMobile ? "50%" : "60%",
                  height: isMobile ? "80px" : "100px",
                }}
              >
                <GameDirection
                  direction={1}
                  isKickback={false}
                  isMobile={isMobile}
                />
                <ReplayCenterTable
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

              {gameState && gameState?.players.length > 0 && (
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
                            // transform:
                            //   position.rotation !== 0
                            //     ? `rotate(${position.rotation}deg)`
                            //     : undefined,
                            transformOrigin: "center",
                            maxWidth: isVertical ? "80px" : undefined,
                          }}
                        >
                          <div
                            className={`absolute z-10 ${
                              index === 0
                                ? "top-1/2 -translate-y-1/2"
                                : "bottom-1/2 translate-y-1/2"
                            } left-1/2 -translate-x-1/2`}
                          >
                            <PlayerInfo
                              player={player}
                              isTurn={
                                gameState?.turn ===
                                roomData.players[index].player
                              }
                              playerIndex={index}
                            />
                          </div>
                          <div
                            className={`${
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

              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-11/12 h-1 bg-gray-200 dark:bg-gray-700 rounded-xl">
                <div
                  className="h-full bg-primary rounded-xl"
                  style={{
                    width: `${
                      (currentMoveIndex / (gameData?.length - 1)) * 100
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            {/* <div className="flex items-center justify-center gap-4">
              <Button variant="outline" size="sm">
                Watch Full Replay
              </Button>

              <Button onClick={togglePlayback} variant="default" size="icon">
                {isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>

              <Button
                onClick={() => handleReset()}
                variant="outline"
                size="icon"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div> */}
          </CardContent>
        </Card>
      </div>

      {/* <button onClick={() => console.log(gameState)}>Here</button> */}
    </>
  );
};

export default GOD;
