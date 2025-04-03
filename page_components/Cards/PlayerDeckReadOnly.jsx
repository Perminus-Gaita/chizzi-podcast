"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { useIsMobile } from "@/hooks/useIsMobile";
import { motion, AnimatePresence } from "framer-motion";

const PlayerDeckReadOnly = ({ player, playerDeck, loading, invalidMove }) => {
  const isMobile = useIsMobile();
  const deckRef = useRef(null);

  // Track card positions and dimensions for animations
  const [cards, setCards] = useState([]);

  // const calculateLayout = useCallback(() => {
  //   const baseCardWidth = isMobile ? 75 : 80;
  //   const baseCardHeight = isMobile ? 105 : 112;

  //   const calculateOverlap = (numCards) => {
  //     if (numCards <= 10) return baseCardWidth * 0.7;
  //     if (numCards <= 15) return baseCardWidth * 0.75;
  //     return baseCardWidth * 0.85;
  //   };

  //   const calculateArcOffset = (index, total) => {
  //     if (total <= 12) return 0;
  //     const normalizedPosition = (index / (total - 1)) * 2 - 1;
  //     const maxArcHeight = isMobile ? -4 : -5;
  //     return -Math.pow(normalizedPosition * 2, 2) * maxArcHeight;
  //   };

  //   return {
  //     cardWidth: baseCardWidth,
  //     cardHeight: baseCardHeight,
  //     cardOverlap: cards.length > 1 ? calculateOverlap(cards.length) : 0,
  //     calculateArcOffset,
  //   };
  // }, [isMobile, cards.length]);

  // Initialize cards when playerObj changes

  const calculateLayout = useCallback(() => {
    // Reduced card dimensions
    const baseCardWidth = isMobile ? 60 : 65; // Reduced width
    const baseCardHeight = isMobile ? 84 : 91; // Reduced height

    const calculateOverlap = (numCards) => {
      // Adjusted overlap calculation
      if (numCards <= 10) return baseCardWidth * 0.6; // Increased overlap for fewer cards
      if (numCards <= 15) return baseCardWidth * 0.7; // Moderate overlap
      return baseCardWidth * 0.8; // Reduced overlap for many cards
    };

    const calculateArcOffset = (index, total) => {
      if (total <= 12) return 0;
      const normalizedPosition = (index / (total - 1)) * 2 - 1;
      const maxArcHeight = isMobile ? -3 : -4; // Slightly reduced arc height
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
        id: index,
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

  const { cardWidth, cardHeight, cardOverlap } = calculateLayout();
  const deckWidth = Math.min(
    (cards.length - 1) * (cardWidth - cardOverlap) + cardWidth,
    window.innerWidth * (isMobile ? 0.95 : 0.8)
  );

  return (
    <div
      ref={deckRef}
      className={`relative flex items-center justify-center touch-none overflow-visible`}
      style={{
        width: deckWidth,
        height: cardHeight,
        perspective: "1000px",
        touchAction: "none",
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
      }}
    >
      <div className="relative w-full h-full overflow-visible">
        {cards.map((card, index) => {
          return (
            <motion.div
              key={card.id}
              data-card={card.value}
              className={`absolute transform
                ${loading ? "opacity-80" : ""}
                transition-all duration-200 ease-out
              `}
              initial={false}
              style={{
                left: index * (cardWidth - cardOverlap),
                width: cardWidth,
                height: cardHeight,
                zIndex: index,
                // cursor: "pointer",
                willChange: "transform",
              }}
            >
              <img
                src={`/cards/${card.value}.png`}
                alt={card.value}
                data-card-img={card.value}
                className={`w-full h-full rounded-lg shadow-md`}
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

export default PlayerDeckReadOnly;
