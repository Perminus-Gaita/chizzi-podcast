"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSelector } from "react-redux";

import "../../styles/cards.css";
import { useIsMobile } from "@/hooks/useIsMobile";

const PlayerDeck = ({
  playerObj,
  handleCardClick,
  handleOpenSuitModal,
  roomData,
  loading,
  invalidMove,
}) => {
  const isMobile = useIsMobile();

  const userProfile = useSelector((state) => state.auth.profile);

  const [cards, setCards] = useState([]);

  const [lastPlayedCard, setLastPlayedCard] = useState(null);

  const deckRef = useRef(null);

  const autoArrangeCards = useCallback(() => {
    setCards((prevCards) => {
      const sortedCards = [...prevCards].sort((a, b) => {
        // Group potential sequences first (Question cards with Answer cards)
        const isQuestionCard = (card) => ["Q", "8"].includes(card.value[0]);
        const isAnswerCard = (card) =>
          ["4", "5", "6", "7", "9", "10", "A"].includes(card.value[0]);

        // Primary sort: Group Question+Answer cards together
        if (isQuestionCard(a) && !isQuestionCard(b)) return -1;
        if (!isQuestionCard(a) && isQuestionCard(b)) return 1;

        // Secondary sort: By suit
        const suitOrder = { H: 0, D: 1, C: 2, S: 3 };
        const suitDiff =
          suitOrder[a.value.slice(-1)] - suitOrder[b.value.slice(-1)];
        if (suitDiff !== 0) return suitDiff;

        // Tertiary sort: By rank within suit
        const rankOrder = {
          A: 1,
          2: 2,
          3: 3,
          4: 4,
          5: 5,
          6: 6,
          7: 7,
          8: 8,
          9: 9,
          10: 10,
          J: 11,
          Q: 12,
          K: 13,
        };
        return (
          rankOrder[a.value.slice(0, -1)] - rankOrder[b.value.slice(0, -1)]
        );
      });

      return sortedCards.map((card, idx) => ({
        ...card,
        id: idx,
        originalIndex: idx,
      }));
    });
  }, []);

  const calculateLayout = useCallback(() => {
    const baseCardWidth = isMobile ? 75 : 80;
    const baseCardHeight = isMobile ? 105 : 112;
    const containerWidth = window.innerWidth * (isMobile ? 0.95 : 0.8);

    const calculateOverlap = (numCards) => {
      // Aggressive overlap for larger hands
      if (numCards <= 10) {
        return baseCardWidth * 0.7; // 60% overlap for small hands
      } else if (numCards <= 15) {
        return baseCardWidth * 0.75; // 75% overlap for medium hands
      } else {
        return baseCardWidth * 0.85; // 85% overlap for large hands
      }
    };

    // Calculate arc parameters
    const calculateArcOffset = (index, total) => {
      if (total <= 12) return 0; // No arc for small hands

      const normalizedPosition = (index / (total - 1)) * 2 - 1; // -1 to 1
      const maxArcHeight = isMobile ? -4 : -5;

      // Quadratic arc calculation
      return -Math.pow(normalizedPosition * 2, 2) * maxArcHeight;
    };

    return {
      cardWidth: baseCardWidth,
      cardHeight: baseCardHeight,
      cardOverlap: cards.length > 1 ? calculateOverlap(cards.length) : 0,
      calculateArcOffset,
    };
  }, [isMobile, cards.length]);

  const handleMobileCardClick = useCallback(
    (card) => {
      setLastPlayedCard(card);
      if (card.value.slice(0, -1) === "A") {
        if (
          roomData?.isPenalty ||
          roomData?.desiredRank ||
          (roomData.desiredSuit &&
            roomData.secondLastGamePlay?.card &&
            roomData.secondLastGamePlay?.card[0] === "A" &&
            roomData.secondLastGamePlay?.player.toString() !== userProfile.uuid)
        ) {
          handleCardClick(card.value);
        } else {
          handleOpenSuitModal(card.value);
        }
      } else {
        handleCardClick(card.value);
      }
    },
    [isMobile, handleCardClick, handleOpenSuitModal, roomData?.isPenalty]
  );

  // Initialize cards
  useEffect(() => {
    if (playerObj?.playerDeck) {
      const mappedCards = playerObj.playerDeck.map((card, index) => ({
        id: index,
        value: card,
        x: 0,
        y: 0,
        initialX: 0,
        initialY: 0,
        originalIndex: index,
      }));
      setCards(mappedCards);
    }
  }, [playerObj?.playerDeck]);

  const { cardWidth, cardHeight, cardOverlap, calculateArcOffset } =
    calculateLayout();
  // const deckWidth = Math.min(
  //   (cards.length - 1) * (cardWidth - cardOverlap) + cardWidth,
  //   window.innerWidth * (isMobile ? 0.98 : 0.8)
  // );

  const deckWidth = Math.min(
    (cards.length - 1) * (cardWidth - cardOverlap) + cardWidth,
    window.innerWidth * (isMobile ? 0.95 : 0.8)
  );

  return (
    <div
      ref={deckRef}
      className={`relative flex items-center justify-center touch-none overflow-visible shake-animation
        ${invalidMove ? "shake-animation" : ""}
      `}
      style={{
        width: deckWidth,
        height: cardHeight + (cards.length > 12 ? 25 : 0),
        perspective: "1000px",
      }}
    >
      <button
        onClick={autoArrangeCards}
        className="absolute -top-10 right-0 px-3 py-1.5 
        bg-blue-500/90 hover:bg-blue-600 text-white text-xs
        rounded-full shadow-lg transition-all duration-200
        flex items-center gap-1.5 opacity-80 hover:opacity-100"
      >
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
          />
        </svg>
      </button>

      <div className="relative w-full h-full overflow-visible">
        {cards.map((card, index) => {
          const arcOffset = calculateArcOffset(index, cards.length);

          return (
            <div
              key={card.id}
              className={`absolute select-none transition-all duration-200
                  hover:-translate-y-2
                ${loading ? "opacity-80 pointer-events-none" : ""}
                transition-all duration-200 ease-out
              `}
              style={{
                left: index * (cardWidth - cardOverlap),
                top: arcOffset,
                width: cardWidth,
                height: cardHeight,
                zIndex: index,
              }}
              onClick={() => handleMobileCardClick(card)}
            >
              <img
                src={`/cards/${card.value}.png`}
                alt={card.value}
                className={`w-full h-full rounded-lg shadow-md cursor-pointer`}
                draggable={false}
                style={{ WebkitTouchCallout: "none" }}
              />
              {invalidMove && card.id === lastPlayedCard?.id && (
                <div
                  className="absolute inset-0 bg-red-500/20 rounded-lg border-2
                   border-red-500 pointer-events-none z-50 animate-fade-out"
                  style={{ animation: "fadeOut 0.5s ease-out" }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlayerDeck;
