"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
  ChevronRight,
  ChevronLeft,
  Star,
  Trophy,
  BookOpen,
  Lightbulb,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import ModuleProgress from "./ModuleProgress";

import { useIsMobile } from "@/hooks/useIsMobile";

const Card3D = ({ frontContent, backContent, isFlipped, onClick }) => {
  const isMobile = useIsMobile();
  return (
    <Card
      onClick={onClick}
      className={`relative cursor-pointer bg-transparent border-0 shadow-none
        ${isMobile ? "w-[140px] mx-auto" : "w-[180px]"} 
        aspect-[2.5/3.5]`}
      style={{ perspective: "1000px" }}
    >
      <motion.div
        className="w-full h-full relative"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{
          duration: 0.6,
          type: "spring",
          stiffness: 260,
          damping: 20,
        }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front */}
        <CardContent className="absolute w-full h-full backface-hidden p-0">
          {frontContent}
        </CardContent>

        {/* Back */}

        <CardContent
          className="absolute w-full h-full backface-hidden p-4
                     bg-gradient-to-br from-primary/90 to-primary"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          {backContent}
        </CardContent>
      </motion.div>
    </Card>
  );
};

const CompletionSheet = ({
  points,
  setShowMastery,
  handleCompleteModule,
  open,
}) => {
  return (
    <Sheet open={open} onOpenChange={() => setShowMastery(false)}>
      <SheetContent
        side="bottom"
        className="h-[70vh] sm:h-[85vh]  bg-white dark:bg-gray-900 
        text-black dark:text-white rounded-t-xl rounded-b-none border-b-0"
      >
        <SheetHeader className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <Trophy className="w-16 h-16 text-primary" />
            <Badge variant="secondary" className="bg-primary/10">
              Step 1 of 4
            </Badge>
          </div>

          <SheetTitle className="text-2xl sm:text-3xl font-bold text-center">
            Card Recognition Complete!
          </SheetTitle>

          <SheetDescription className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-lg">
              <Star className="w-6 h-6 text-yellow-500" />
              <span className="font-medium">{points} / 8 points earned</span>
            </div>

            <Progress value={(points / 8) * 100} className="w-full max-w-md" />

            <div className="flex flex-col gap-2">
              <p className="text-muted-foreground max-w-md">
                Great job identifying the cards! Now let's learn what each one
                can do.
              </p>
              <p className="text-sm text-primary">Next: Basic Kadi Game flow</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => setShowMastery(false)}
                className="w-full sm:w-auto"
              >
                <BookOpen className="w-5 h-5 mr-2" />
                Review Cards
              </Button>
              <Button
                onClick={handleCompleteModule}
                className="w-full sm:w-auto bg-primary hover:bg-primary/90"
              >
                Continue to Basic Gameflow
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};

const CompletionModal = ({ points, setShowMastery, handleCompleteModule }) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-[95%] sm:w-11/12 md:max-w-[80%] lg:max-w-[60%] mx-4 flex flex-col items-center justify-center 
                            space-y-6 p-8 bg-white dark:bg-gray-900 
                            rounded-2xl shadow-xl text-black dark:text-white"
        >
          <div className="flex flex-col items-center gap-2">
            <Trophy className="w-16 h-16 text-primary" />
            <Badge variant="secondary" className="bg-primary/10">
              Step 1 of 4
            </Badge>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-center">
            Card Recognition Complete!
          </h2>

          <div className="flex items-center gap-2 text-lg">
            <Star className="w-6 h-6 text-yellow-500" />
            <span className="font-medium">{points} / 8 points earned</span>
          </div>

          <div className="space-y-2 text-center">
            <p className="text-gray-400 max-w-md">
              Great job identifying the cards! Now let's learn what each one can
              do.
            </p>
            <p className="text-sm text-primary">Next: Basic Kadi Game flow</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => setShowMastery(false)}
              className="w-full sm:w-auto"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Review Cards
            </Button>
            <Button
              onClick={handleCompleteModule}
              className="w-full sm:w-auto bg-primary hover:bg-primary/90"
            >
              Continue to Basic Gameflow
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>

          <div className="flex items-center gap-2 pt-4">
            <motion.div
              className="h-2 w-16 rounded-full bg-primary"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 }}
            />
            <div className="h-2 w-16 rounded-full bg-gray-700/30" />
            <div className="h-2 w-16 rounded-full bg-gray-700/30" />
            <div className="h-2 w-16 rounded-full bg-gray-700/30" />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const MeetYourCards = ({ handleCompleteModule }) => {
  const isMobile = useIsMobile();

  const [currentCategory, setCurrentCategory] = useState(0);
  const [flippedCard, setFlippedCard] = useState(null);
  const [completedCategories, setCompletedCategories] = useState(new Set());
  const [showMastery, setShowMastery] = useState(false);
  const [completedCards, setCompletedCards] = useState(new Set());
  const [points, setPoints] = useState(0);

  const scenarios = [
    {
      id: "answer-cards",
      title: "Answer Cards",
      description: "Your basic playing cards that match suit or rank",
      cards: [
        { value: "4", suits: ["H", "D", "S", "C"] },
        { value: "5", suits: ["H", "D", "S", "C"] },
        { value: "6", suits: ["H", "D", "S", "C"] },
        { value: "7", suits: ["H", "D", "S", "C"] },
        { value: "9", suits: ["H", "D", "S", "C"] },
        { value: "10", suits: ["H", "D", "S", "C"] },
      ],
      tips: [
        "Match the suit (♥,♦,♣,♠) of the top card",
        "Or match the number regardless of suit",
        "Play multiple cards of same rank to dominate",
        "Use suits strategically to control game flow",
      ],
      points: 1,
    },
    {
      id: "ace-cards",
      title: "Ace Cards",
      description:
        "Special cards with dual powers for suit control and blocking",
      cards: [{ value: "A", suits: ["H", "D", "S", "C"] }],
      tips: [
        "Play one Ace to demand any suit",
        "Play two Aces to demand suit AND rank",
        "Use Ace to block penalties",
        "Max of 2 Aces per turn",
      ],
      points: 1.5,
    },
    {
      id: "question-cards",
      title: "Question Cards",
      description: "Queens and Eights that must be paired with Answer Cards",
      cards: [
        { value: "Q", suits: ["H", "D", "S", "C"] },
        { value: "8", suits: ["H", "D", "S", "C"] },
      ],
      tips: [
        "Queens (Q) & Eights (8) need matching suit Answer cards",
        "Same suit: Q♥→8♥ or 8♥→Q♥ connections allowed",
        "Cross suit: Q♥→Q♣ or 8♥→8♣ chains possible",
      ],
      points: 2,
    },
    {
      id: "jump-cards",
      title: "Jump Cards",
      description: "Jacks that skip the next player's turn",
      cards: [{ value: "J", suits: ["H", "D", "S", "C"] }],
      tips: [
        "Skip next player's turn",
        "Can be countered by Jump",
        "Chain multiple jumps for control",
      ],
      points: 1,
    },
    {
      id: "kickback-cards",
      title: "Kickback Cards",
      description: "Kings that reverse game direction",
      cards: [{ value: "K", suits: ["H", "D", "S", "C"] }],
      tips: [
        "Reverses play direction",
        "Counter with another King",
        "Use for strategic control",
      ],
      points: 1,
    },
    {
      id: "penalty-cards",
      title: "Penalty Cards",
      description: "Cards that force next player to draw",
      cards: [
        { value: "2", suits: ["H", "D", "S", "C"] },
        { value: "3", suits: ["H", "D", "S", "C"] },
        { value: "JOK", suits: ["1", "2"] },
      ],
      tips: [
        "2: Draw two cards",
        "3: Draw three cards",
        "Joker: Draw five cards",
        "Counter with matching penalty suit or Joker",
      ],
      points: 2,
    },
  ];

  const handleCardClick = (cardIndex) => {
    if (flippedCard === cardIndex) {
      setFlippedCard(null);
      setCompletedCards(
        (prev) => new Set([...prev, `${currentCategory}-${cardIndex}`])
      );

      const allCardsViewed = scenarios[currentCategory].cards.every((_, idx) =>
        completedCards.has(`${currentCategory}-${idx}`)
      );

      if (allCardsViewed && !completedCategories.has(currentCategory)) {
        setCompletedCategories((prev) => {
          const newCompleted = new Set([...prev, currentCategory]);
          setPoints(
            Array.from(newCompleted).reduce(
              (acc, catIdx) => acc + scenarios[catIdx].points,
              0
            )
          );
          return newCompleted;
        });
      }
    } else {
      setFlippedCard(cardIndex);
      setCompletedCards(
        (prev) => new Set([...prev, `${currentCategory}-${cardIndex}`])
      );
    }
  };

  const handleNext = () => {
    if (currentCategory < scenarios.length - 1) {
      if (!completedCategories.has(currentCategory)) {
        setCompletedCategories((prev) => {
          const newCompleted = new Set([...prev, currentCategory]);
          setPoints(
            Array.from(newCompleted).reduce(
              (acc, catIndex) => acc + scenarios[catIndex].points,
              0
            )
          );
          return newCompleted;
        });
      }

      setCurrentCategory((prev) => prev + 1);
      setFlippedCard(null);
    } else {
      setShowMastery(true);
    }
  };

  const handlePrevious = () => {
    if (currentCategory > 0) {
      setCurrentCategory((prev) => prev - 1);
      setFlippedCard(null);
    }
  };

  const handleProgressReset = (index) => {
    setCurrentCategory(index);
  };

  useEffect(() => {
    // Check if all cards in current category are viewed
    const allCardsViewed = scenarios[currentCategory].cards.every((_, idx) =>
      completedCards.has(`${currentCategory}-${idx}`)
    );

    if (allCardsViewed && !completedCategories.has(currentCategory)) {
      setCompletedCategories((prev) => {
        const newCompleted = new Set([...prev, currentCategory]);
        setPoints(
          Array.from(newCompleted).reduce(
            (acc, catIdx) => acc + scenarios[catIdx].points,
            0
          )
        );
        return newCompleted;
      });
    }
  }, [completedCards, currentCategory]);

  return (
    <>
      {isMobile ? (
        <CompletionSheet
          points={points}
          setShowMastery={setShowMastery}
          handleCompleteModule={handleCompleteModule}
          open={showMastery}
        />
      ) : (
        <>
          {showMastery && (
            <CompletionModal
              points={points}
              setShowMastery={setShowMastery}
              handleCompleteModule={handleCompleteModule}
            />
          )}
        </>
      )}

      <AnimatePresence mode="wait">
        <div className="w-full md:max-w-5xl mx-auto px-1 md:px-6 h-full">
          <div className="flex-none py-4 space-y-4">
            <ModuleProgress
              scenarios={scenarios}
              currentScenario={currentCategory}
              onReset={handleProgressReset}
            />

            <div className="text-center space-y-2">
              <h2 className="text-xl md:text-2xl font-bold">
                {scenarios[currentCategory].title}
              </h2>
              <p className="text-sm md:text-base text-muted-foreground">
                {scenarios[currentCategory].description}
              </p>
            </div>

            <Separator />
          </div>

          <ScrollArea className="flex-grow min-h-0 px-1 md:px-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 justify-items-center content-start pb-4">
              {scenarios[currentCategory].cards.map((card, index) => (
                <Card3D
                  key={`${card.value}-${index}`}
                  isFlipped={flippedCard === index}
                  onClick={() => handleCardClick(index)}
                  frontContent={
                    <div className="w-full h-full relative group">
                      <img
                        src={`/cards/${card.value}${card.suits[0]}.png`}
                        alt={`${card.value} card`}
                        className="w-full h-full object-contain rounded-xl shadow-xl 
                                   transition-transform duration-200 group-hover:scale-105"
                      />
                      <div
                        className="absolute inset-0 bg-black/0 group-hover:bg-black/10 
                                      rounded-xl transition-colors duration-200"
                      />
                    </div>
                  }
                  backContent={
                    <ScrollArea
                      className="h-full pr-2 bg-gradient-to-br from-primary/90 to-primary
                  rounded-xl shadow-xl p-2 md:p-4"
                    >
                      <div className="space-y-1.5 md:space-y-3 overflow-y-auto max-h-full">
                        {scenarios[currentCategory].tips.map((tip, i) => (
                          <div key={i} className="flex items-start gap-1.5">
                            <Lightbulb
                              className="w-3 h-3 md:w-4 md:h-4 mt-0.5 flex-shrink-0 
                                           text-orange-500/90"
                            />
                            <p
                              className={`
                                text-[10px] md:text-sm  
                                text-left text-light dark:text-dark
                              `}
                            >
                              {tip}
                            </p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  }
                />
              ))}
            </div>
          </ScrollArea>

          <div className="flex-none py-4 bg-background/80 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <Button
                onClick={handlePrevious}
                disabled={currentCategory === 0}
                variant="outline"
                size="sm"
                className="gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden md:inline">Previous</span>
              </Button>

              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" />
                <span className="text-sm md:text-base font-medium">
                  {points} / 8 points
                </span>
              </div>

              <Button
                onClick={handleNext}
                size="sm"
                className="gap-1 bg-primary hover:bg-primary/90"
              >
                <span>
                  {currentCategory === scenarios.length - 1
                    ? "Complete"
                    : "Next"}
                </span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </AnimatePresence>
    </>
  );
};

export default MeetYourCards;
