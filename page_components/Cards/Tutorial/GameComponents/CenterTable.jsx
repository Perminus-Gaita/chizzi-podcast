"use client";
import { useRef, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";

import TutorialAcceptJump from "./TutorialAcceptJump.jsx";
import TutorialAcceptKickback from "./TutorialAcceptKickback.jsx";
import TutorialPassTurn from "./TutorialPassTurn.jsx";

import { useIsMobile } from "@/hooks/useIsMobile";

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

const CenterTable = ({
  topCard,
  canDraw,
  roomData,
  setOn,
  isShuffling,
  handleDrawCard,
  handleDrawPenalty,
  handleAcceptJump,
  handleAcceptKickback,
  handlePassTurn,
  scenario,
  loading,
  changedSuit,
}) => {
  const isMobile = useIsMobile();

  const cardPositionsRef = useRef({});
  const viewerRef = useRef(null);

  const [selectedCard, setSelectedCard] = useState(null);
  const [isViewingHistory, setIsViewingHistory] = useState(false);
  const [animate, setAnimate] = useState(false);

  const userProfile = useSelector((state) => state.auth.profile);

  const pileWidth = isMobile ? 55 : 70;
  const pileHeight = isMobile ? 80 : 100;

  const {
    discardPile,
    drawPileLength,
    turn,
    jumpCounter,
    lastGamePlay,
    isPenalty,
    isKickback,
    isQuestion = false,
    desiredRank,
    direction,
    timer,
    recentPlays,
    currentSuit,
    isPlayerKadi,
  } = roomData;

  // const { on = false, playerDeck = [] } = playerObj || {};

  const playerObj = {
    on: false,
    playerDeck: [],
  };

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
    const baseOffset = isMobile ? 25 : pileWidth * 0.3;
    const selectedOffset = isMobile ? 35 : pileWidth * 0.4;
    const totalCards = 4;
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

  const handlePileClick = () => {
    // console.log("viewing..");
    setIsViewingHistory(true);
  };

  const handleCardClick = (index, event) => {
    event.stopPropagation();
    if (isViewingHistory) {
      setSelectedCard(selectedCard === index ? null : index);
    }
  };

  const cardStyle = getCardStyle(topCard, 0);

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
        {/* <div className="flex items-center h-8 sm:h-10 px-2 sm:px-3 rounded-l-lg bg-gradient-to-r from-gray-100 to-gray-200 shadow-inner border border-gray-300"> */}
        <div className="flex items-center h-8 sm:h-10 rounded-l-lg bg-gradient-to-r from-gray-100 to-gray-200 shadow-inner border border-gray-300">
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

        <button
          onClick={setOn}
          className={`h-8 sm:h-10 px-3 sm:px-4 rounded-r-lg 
              font-semibold text-xs sm:text-sm transition-all transform 
              active:scale-95 hover:opacity-90`}
          style={{
            background: isPlayerKadi ? "#78d64b" : "#faca00",
            cursor: "pointer",
          }}
        >
          {isPlayerKadi ? "ON" : "KADI"}
        </button>
      </div>

      {/* Card Piles Container */}
      <div id="table-drop-target" className="flex items-center gap-4 sm:gap-24">
        {/* DISCARD PILE */}
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
                key={`discard-${index}-${card}`}
                onClick={(e) => {
                  e.stopPropagation();
                  // console.log("clicking now..#.");
                  if (isViewingHistory) {
                    handleCardClick(index, e);
                  } else {
                    handlePileClick();
                  }
                }}
                className={`absolute inset-0 rounded-lg shadow-xl ring-1 ring-white/10 
                    transition-all duration-300 ease-out
                    ${isViewingHistory || isTopCard ? "cursor-pointer" : ""}`}
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
              //     {isViewingHistory && (
              //       <div
              //         className={`absolute ${
              //           isMobile
              //             ? "-right-2 top-0"
              //             : "-top-4 left-1/2 -translate-x-1/2"
              //         } px-2 py-0.5 text-xs font-bold rounded-full
              // bg-black/70 text-white transform scale-90`}
              //         onClick={(e) => e.stopPropagation()}
              //       >
              //         {discardPile.length - index}
              //       </div>
              //     )}
              //   </div>
            );
          })}

          {scenario?.id === "rank-matching" && (
            <motion.div
              className="absolute top-0 left-0 right-0 bottom-0 border-2 
                border-primary rounded-xl pointer-events-none"
              style={
                {
                  // ...cardStyle,
                }
              }
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </div>
        {/* END DISCARD PILE */}

        {/* Draw Pile - Right handed Side */}
        <div className="relative">
          {canDraw && (
            <div
              className="absolute top-1 left-1/2 -translate-x-1/2 flex 
        flex-col items-center gap-1 z-20 hover:scale-105 cursor-pointer"
            >
              <button
                className="hover:scale-105 transition-transform duration-200 hover:border-white ring-2 ring-white/20 ring-offset-2 ring-offset-black/50 shadow-lg"
                style={{
                  width: isMobile ? 45 : 60,
                  height: isMobile ? 70 : 90,
                  backgroundColor: "rgba(0,0,0,0.3)",
                  border: "1px dashed rgba(255,255,255,0.6)",
                  borderRadius: "10px",
                }}
                onClick={() => {
                  if (isPenalty) {
                    handleDrawPenalty();
                  } else {
                    handleDrawCard();
                  }
                }}
              />
              <span
                className="text-xs text-white px-2 py-1 font-bold 
          rounded-lg bg-black/50 backdrop-blur-sm shadow-lg mt-1"
              >
                {isPenalty
                  ? "Draw Penalty"
                  : turn === "player" && (isQuestion || isPenalty)
                  ? "Pick Answer"
                  : "Pick"}
              </span>
            </div>
          )}

          {/* Regular Draw Pile or Shuffling Animation */}
          <div style={{ width: pileWidth, height: pileHeight }}>
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
              : [...Array(Math.min(roomData.drawPileLength || 0, 3))].map(
                  (_, index) => (
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
                  )
                )}
          </div>
        </div>
      </div>

      <div
        className="absolute left-1/2 -translate-x-1/2 bottom-0 
          flex items-center gap-2 sm:gap-3"
        style={{
          bottom: isMobile ? "-16px" : "-20px",
          zIndex: 20,
        }}
      >
        {turn === "player" &&
          jumpCounter > 0 &&
          lastGamePlay?.player !== "player" && (
            <TutorialAcceptJump
              acceptJump={handleAcceptJump}
              direction={direction}
              loading={loading}
            />
          )}

        {turn === "player" &&
          lastGamePlay?.player !== "player" &&
          isKickback && (
            <TutorialAcceptKickback
              acceptKickback={handleAcceptKickback}
              direction={direction}
              loading={loading}
            />
          )}

        <>
          {/* {!isQuestion && */}
          {turn === "player" && lastGamePlay?.player === "player" && (
            <TutorialPassTurn
              loading={loading}
              direction={direction}
              passTurn={handlePassTurn}
            />
          )}
        </>
      </div>
    </div>
  );
};

export default CenterTable;
