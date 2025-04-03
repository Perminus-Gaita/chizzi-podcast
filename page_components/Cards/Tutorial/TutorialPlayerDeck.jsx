"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { useIsMobile } from "@/hooks/useIsMobile";
import { motion, AnimatePresence } from "framer-motion";

const TutorialPlayerDeck = ({
  player,
  playerDeck,
  handleCardClick,
  handleOpenSuitModal,

  loading,
  invalidMove,
  // New props for tutorial integration
  highlightedCards = [],
  currentStep,
  onCardSelect,
  selectedCards = [],
  validMoves = [],
  isValidatingMove = false,
  scenario,
  currentScenario,
  lastPlayedCard,
}) => {
  const isMobile = useIsMobile();
  const userProfile = useSelector((state) => state.auth.profile);
  const deckRef = useRef(null);

  // Track card hover state for desktop
  const [hoveredCard, setHoveredCard] = useState(null);

  // Track card positions and dimensions for animations
  const [cards, setCards] = useState([]);

  const calculateLayout = useCallback(() => {
    // const baseCardWidth = isMobile ? 75 : 80;
    // const baseCardHeight = isMobile ? 105 : 112;
    const baseCardWidth = isMobile
      ? player === "ai"
        ? 60
        : 75
      : player === "ai"
      ? 64
      : 80;
    const baseCardHeight = isMobile
      ? player === "ai"
        ? 84
        : 105
      : player === "ai"
      ? 90
      : 112;

    const containerWidth = window.innerWidth * (isMobile ? 0.95 : 0.8);

    const calculateOverlap = (numCards) => {
      if (numCards <= 10) return baseCardWidth * 0.7;
      if (numCards <= 15) return baseCardWidth * 0.75;
      return baseCardWidth * 0.85;
    };

    const calculateArcOffset = (index, total) => {
      if (total <= 12) return 0;
      const normalizedPosition = (index / (total - 1)) * 2 - 1;
      const maxArcHeight = isMobile ? -4 : -5;
      return -Math.pow(normalizedPosition * 2, 2) * maxArcHeight;
    };

    return {
      cardWidth: baseCardWidth,
      cardHeight: baseCardHeight,
      cardOverlap: cards.length > 1 ? calculateOverlap(cards.length) : 0,
      calculateArcOffset,
    };
  }, [isMobile, cards.length]);

  // // Handle card selection
  // const handleCardSelection = useCallback(
  //   (card) => {
  //     if (loading || isValidatingMove) return;

  //     // Get current scenario and step
  //     const scenario = scenarios[currentScenario];
  //     const step = scenario.steps[currentStep];

  //     console.log("### CURRENT SCENARIO ###");
  //     console.log(scenario);

  //     console.log("CURRENT STEP ###");
  //     console.log(step);

  //     // For pair validation steps, manage card selection differently
  //     if (step.type.includes("pair")) {
  //       setLastPlayedCard(card);
  //       onCardSelect(card.value); // Allow selection without validation
  //       return;
  //     }

  //     // For single card steps, validate immediately
  //     const isValid = step.validation(card.value);
  //     if (isValid) {
  //       setLastPlayedCard(card);
  //       onCardSelect(card.value);
  //     } else {
  //       setLastPlayedCard(card);
  //       setTimeout(() => setLastPlayedCard(null), 500);
  //     }
  //   },
  //   [loading, isValidatingMove, currentScenario, currentStep, onCardSelect]
  // );

  // Initialize cards when playerObj changes
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

  const { cardWidth, cardHeight, cardOverlap, calculateArcOffset } =
    calculateLayout();
  const deckWidth = Math.min(
    (cards.length - 1) * (cardWidth - cardOverlap) + cardWidth,
    window.innerWidth * (isMobile ? 0.95 : 0.8)
  );

  return (
    <div
      ref={deckRef}
      className={`relative flex items-center justify-center touch-none overflow-visible
        ${invalidMove ? "shake-animation" : ""}
      `}
      style={{
        width: deckWidth,
        height: cardHeight + (cards.length > 12 ? 25 : 0),
        perspective: "1000px",
        touchAction: "none",
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
      }}
    >
      <div className="relative w-full h-full overflow-visible">
        {cards.map((card, index) => {
          const arcOffset = calculateArcOffset(index, cards.length);
          const isHighlighted = highlightedCards.includes(card.value);
          const isSelected = selectedCards.includes(card.value);
          const isHovered = hoveredCard === card.id;

          return (
            <motion.div
              key={card.id}
              data-card={card.value}
              className={`absolute select-none touch-none transform
                ${loading ? "opacity-80 pointer-events-none" : ""}
                ${isSelected ? "translate-y-[-20px]" : ""}
                transition-all duration-200 ease-out
              `}
              initial={false}
              animate={{
                y: isSelected ? -20 : arcOffset,
                scale: isHovered || isSelected ? 1.05 : 1,
              }}
              style={{
                left: index * (cardWidth - cardOverlap),
                width: cardWidth,
                height: cardHeight,
                zIndex: isSelected ? 1000 : index,
                cursor: "pointer",
                willChange: "transform",
              }}
              onClick={() => handleCardClick(card)}
              onHoverStart={() => !isMobile && setHoveredCard(card.id)}
              onHoverEnd={() => !isMobile && setHoveredCard(null)}
            >
              <img
                src={`/cards/${card.value}.png`}
                alt={card.value}
                data-card-img={card.value}
                className={`w-full h-full rounded-lg shadow-md select-none
                  ${isHighlighted ? "animate-pulse" : ""}
                `}
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
              />

              {/* Invalid move feedback */}
              {invalidMove && card.id === lastPlayedCard?.id && (
                <motion.div
                  className="absolute inset-0 bg-red-500/20 rounded-lg border-2 border-red-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}

              {scenario?.id === "hand-management" && currentStep === 1 && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 mb-2">
                  <span className="text-xs text-primary font-medium">
                    {selectedCards.includes(card.value)
                      ? "Selected"
                      : "Click to choose"}
                  </span>
                </div>
              )}

              {/* Tutorial highlight indicator */}
              {isHighlighted && (
                <motion.div
                  className="absolute inset-0 rounded-lg border-2 border-primary"
                  initial={false}
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default TutorialPlayerDeck;
