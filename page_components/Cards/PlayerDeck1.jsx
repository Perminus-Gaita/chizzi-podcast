import React, { useState, useEffect, useRef, useCallback } from "react";

const PlayerDeck1 = ({
  playerObj,
  handleCardClick,
  handleOpenSuitModal,
  isSmallScreen,
  roomData,
  loading,
}) => {
  const [cards, setCards] = useState([]);
  const [draggedCard, setDraggedCard] = useState(null);
  const [touchOffset, setTouchOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [rearrangeMode, setRearrangeMode] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [dropTarget, setDropTarget] = useState(false);

  const deckRef = useRef(null);
  const dragStartPosRef = useRef({ x: 0, y: 0 });
  const longPressTimeoutRef = useRef(null);
  const dragStartIndexRef = useRef(null);

  // Layout calculation
  const calculateLayout = useCallback(() => {
    const baseCardWidth = isSmallScreen ? 60 : 80;
    const baseCardHeight = isSmallScreen ? 84 : 112;
    const containerWidth = window.innerWidth * (isSmallScreen ? 0.95 : 0.8);

    const calculateOverlap = (numCards) => {
      const minOverlap = baseCardWidth * 0.2;
      const maxOverlap = baseCardWidth * 0.8;
      const idealWidth = numCards * baseCardWidth - (numCards - 1) * maxOverlap;

      if (idealWidth <= containerWidth) {
        return maxOverlap;
      }

      const requiredOverlap =
        (numCards * baseCardWidth - containerWidth) / (numCards - 1);
      return Math.min(Math.max(requiredOverlap, minOverlap), maxOverlap);
    };

    return {
      cardWidth: baseCardWidth,
      cardHeight: baseCardHeight,
      cardOverlap: cards.length > 1 ? calculateOverlap(cards.length) : 0,
    };
  }, [isSmallScreen, cards.length]);

  // Long press handling for rearrange mode
  const startLongPress = useCallback((card, index) => {
    longPressTimeoutRef.current = setTimeout(() => {
      console.log("Entering rearrange mode"); // Add this debug log

      setRearrangeMode(true);
      dragStartIndexRef.current = index;
    }, 500);
  }, []);

  const endLongPress = useCallback(() => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
    }
  }, []);

  // Card reordering
  const reorderCards = useCallback((fromIndex, toIndex) => {
    if (fromIndex === toIndex) return; // Add this check

    setCards((prevCards) => {
      const newCards = [...prevCards];
      const [movedCard] = newCards.splice(fromIndex, 1);
      newCards.splice(toIndex, 0, {
        ...movedCard,
        x: 0,
        y: 0,
        isDragging: false,
        originalIndex: toIndex,
      });
      return newCards.map((card, idx) => ({
        ...card,
        id: idx,
        originalIndex: idx,
      }));
    });
  }, []);

  // Drop target detection
  const checkDropTarget = useCallback(
    (clientX, clientY) => {
      if (rearrangeMode) {
        const deckRect = deckRef.current.getBoundingClientRect();
        const { cardWidth } = calculateLayout();
        const relativeX = clientX - deckRect.left;
        const newIndex = Math.min(
          Math.max(0, Math.floor(relativeX / (cardWidth / 2))),
          cards.length - 1
        );
        setDragOverIndex(newIndex);
        return true;
      }

      const tableElement = document.getElementById("table-drop-target");
      if (!tableElement) return false;

      const tableBounds = tableElement.getBoundingClientRect();
      const isWithinTable =
        clientX >= tableBounds.left &&
        clientX <= tableBounds.right &&
        clientY >= tableBounds.top &&
        clientY <= tableBounds.bottom;

      setDropTarget(isWithinTable);
      return isWithinTable;
    },
    [rearrangeMode, cards.length, calculateLayout]
  );

  // Combined click and drop handling
  const handleCardAction = useCallback(
    (card, isDragDrop = false) => {
      if (loading) return;

      if (!isDragDrop) {
        // Click handling
        if (card.value.slice(0, -1) === "A" && roomData?.isPenalty) {
          handleCardClick(card.value);
        } else if (card.value.slice(0, -1) === "A" && !roomData?.isPenalty) {
          handleOpenSuitModal(card.value);
        } else {
          handleCardClick(card.value);
        }
      } else {
        // Drag-drop handling
        if (card.value.slice(0, -1) === "A") {
          if (roomData?.isPenalty) {
            handleCardClick(card.value);
          } else {
            handleOpenSuitModal(card.value);
          }
        } else {
          handleCardClick(card.value);
        }
      }
    },
    [handleCardClick, handleOpenSuitModal, roomData?.isPenalty, loading]
  );

  // Touch handlers
  const handleTouchStart = (e, card, index) => {
    if (loading) return;
    e.preventDefault();
    const touch = e.touches[0];
    const rect = e.target.getBoundingClientRect();

    dragStartPosRef.current = { x: touch.clientX, y: touch.clientY };
    startLongPress(card, index);

    setTouchOffset({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    });

    setDraggedCard({
      ...card,
      initialX: touch.clientX,
      initialY: touch.clientY,
    });

    setIsDragging(true);
  };

  const handleTouchMove = useCallback(
    (e) => {
      if (!draggedCard || !isDragging) return;
      e.preventDefault();
      if (!rearrangeMode) {
        endLongPress();
      }

      const touch = e.touches[0];
      const x = touch.clientX - touchOffset.x;
      const y = touch.clientY - touchOffset.y;

      setCards((prevCards) =>
        prevCards.map((card) => {
          if (card.id === draggedCard.id) {
            return {
              ...card,
              x: x - draggedCard.initialX,
              y: y - draggedCard.initialY,
              isDragging: true,
            };
          }
          return card;
        })
      );

      checkDropTarget(touch.clientX, touch.clientY);
    },
    [draggedCard, isDragging, touchOffset, checkDropTarget, endLongPress]
  );

  const handleTouchEnd = useCallback(
    (e) => {
      if (!draggedCard || !isDragging) return;
      endLongPress();

      const touch = e.changedTouches[0];
      const dragDistance = Math.hypot(
        dragStartPosRef.current.x - touch.clientX,
        dragStartPosRef.current.y - touch.clientY
      );

      if (rearrangeMode && dragOverIndex !== null) {
        reorderCards(dragStartIndexRef.current, dragOverIndex);
      } else if (dragDistance >= 10) {
        const isSuccessful = checkDropTarget(touch.clientX, touch.clientY);
        if (isSuccessful) {
          handleCardAction(draggedCard, true);
        }
      }

      // Reset states
      setCards((prevCards) =>
        prevCards.map((card) => ({
          ...card,
          x: 0,
          y: 0,
          isDragging: false,
        }))
      );

      setRearrangeMode(false);
      setDragOverIndex(null);
      setDraggedCard(null);
      setDropTarget(false);
      setIsDragging(false);
      dragStartIndexRef.current = null;
    },
    [
      draggedCard,
      isDragging,
      rearrangeMode,
      dragOverIndex,
      reorderCards,
      checkDropTarget,
      handleCardAction,
    ]
  );

  const handleMouseUp = useCallback(
    (e) => {
      if (!draggedCard || !isDragging) return;
      endLongPress();

      const dragDistance = Math.hypot(
        dragStartPosRef.current.x - e.clientX,
        dragStartPosRef.current.y - e.clientY
      );

      if (rearrangeMode && dragOverIndex !== null) {
        reorderCards(dragStartIndexRef.current, dragOverIndex);
      } else if (dragDistance >= 10) {
        const isSuccessful = checkDropTarget(e.clientX, e.clientY);
        if (isSuccessful) {
          // Handle card play
          if (draggedCard.value.slice(0, -1) === "A") {
            if (roomData?.isPenalty) {
              handleCardClick(draggedCard.value);
            } else {
              handleOpenSuitModal(draggedCard.value);
            }
          } else {
            handleCardClick(draggedCard.value);
          }
        }
      }

      // Reset all states
      setCards((prevCards) =>
        prevCards.map((card) => ({
          ...card,
          x: 0,
          y: 0,
          isDragging: false,
        }))
      );

      setRearrangeMode(false);
      setDragOverIndex(null);
      setDraggedCard(null);
      setDropTarget(false);
      setIsDragging(false);
      dragStartIndexRef.current = null;
    },
    [
      draggedCard,
      isDragging,
      rearrangeMode,
      dragOverIndex,
      reorderCards,
      checkDropTarget,
      handleCardClick,
      handleOpenSuitModal,
      roomData?.isPenalty,
      endLongPress,
    ]
  );

  const handleMouseDown = (e, card, index) => {
    e.preventDefault();
    const rect = e.target.getBoundingClientRect();

    dragStartPosRef.current = { x: e.clientX, y: e.clientY };
    startLongPress(card, index);

    setTouchOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });

    setDraggedCard({
      ...card,
      initialX: e.clientX,
      initialY: e.clientY,
    });

    setIsDragging(true);
  };

  const handleMouseMove = useCallback(
    (e) => {
      if (!draggedCard || !isDragging) return;
      e.preventDefault();
      endLongPress();

      const x = e.clientX - touchOffset.x;
      const y = e.clientY - touchOffset.y;

      setCards((prevCards) =>
        prevCards.map((card) => {
          if (card.id === draggedCard.id) {
            return {
              ...card,
              x: x - draggedCard.initialX,
              y: y - draggedCard.initialY,
              isDragging: true,
            };
          }
          return card;
        })
      );

      checkDropTarget(e.clientX, e.clientY);
    },
    [draggedCard, isDragging, touchOffset, checkDropTarget, endLongPress]
  );

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove, { passive: false });
      window.addEventListener("touchend", handleTouchEnd);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [
    isDragging,
    handleMouseMove,
    handleMouseUp,
    handleTouchMove,
    handleTouchEnd,
  ]);

  // initialize cards
  useEffect(() => {
    if (playerObj?.playerDeck) {
      const mappedCards = playerObj.playerDeck.map((card, index) => ({
        id: index,
        value: card,
        x: 0, // Add these properties
        y: 0, // for tracking position
        isDragging: false, // and drag state
        initialX: 0,
        initialY: 0,
        originalIndex: index,
      }));
      setCards(mappedCards);
    }
  }, [playerObj?.playerDeck]);

  // Layout calculation
  const { cardWidth, cardHeight, cardOverlap } = calculateLayout();
  const deckWidth = Math.min(
    (cards.length - 1) * (cardWidth - cardOverlap) + cardWidth,
    window.innerWidth * (isSmallScreen ? 0.95 : 0.8)
  );

  return (
    <div
      ref={deckRef}
      className="relative flex items-center justify-center touch-none overflow-visible"
      style={{
        width: deckWidth,
        height: cardHeight,
        perspective: "1000px",
        touchAction: "none", // Add this
        WebkitUserSelect: "none", // Add this
        WebkitTouchCallout: "none",
      }}
    >
      <div className="relative w-full h-full">
        {cards.map((card, index) => (
          <div
            key={card.id}
            className={`absolute select-none touch-none transform 
              ${
                card.isDragging
                  ? "z-50 shadow-2xl scale-110"
                  : "hover:-translate-y-2"
              }
              ${dropTarget && card.isDragging ? "ring-2 ring-green-500" : ""}
              ${
                dragOverIndex === index && rearrangeMode
                  ? "ring-2 ring-blue-500"
                  : ""
              }
              ${loading ? "opacity-80 pointer-events-none" : ""}
              transition-all duration-200 ease-out`}
            style={{
              left: index * (cardWidth - cardOverlap),
              width: cardWidth,
              height: cardHeight,
              transform: card.isDragging
                ? `translate(${card.x}px, ${card.y}px)`
                : "none",
              zIndex: card.isDragging ? 1000 : index,
              cursor: isDragging
                ? "grabbing"
                : loading
                ? "not-allowed"
                : "pointer",
            }}
            onClick={() =>
              !isDragging && !rearrangeMode && handleCardAction(card)
            }
            onTouchStart={(e) => handleTouchStart(e, card, index)}
            onMouseDown={(e) => handleMouseDown(e, card, index)}
          >
            <img
              src={`/cards/${card.value}.png`}
              alt={card.value}
              className={`w-full h-full rounded-lg shadow-md select-none
                ${card.isDragging ? "brightness-110" : ""}
                ${rearrangeMode ? "ring-1 ring-blue-300" : ""}`}
              draggable={false}
            />
          </div>
        ))}
      </div>

      {rearrangeMode && (
        <div className="absolute top-0 left-0 right-0 -mt-6 text-center text-sm text-blue-400">
          Rearranging Cards
        </div>
      )}
    </div>
  );
};

export default PlayerDeck1;
