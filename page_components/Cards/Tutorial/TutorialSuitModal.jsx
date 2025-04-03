"use client";
import Image from "next/image";
import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const cardRanks = [
  { label: "Ace", value: "A" },
  { label: "2", value: "2" },
  { label: "3", value: "3" },
  { label: "4", value: "4" },
  { label: "5", value: "5" },
  { label: "6", value: "6" },
  { label: "7", value: "7" },
  { label: "8", value: "8" },
  { label: "9", value: "9" },
  { label: "10", value: "10" },
  { label: "Jack", value: "J" },
  { label: "Queen", value: "Q" },
  { label: "King", value: "K" },
];

const suits = [
  { name: "spade", symbol: "S" },
  { name: "club", symbol: "C" },
  { name: "diamond", symbol: "D" },
  { name: "heart", symbol: "H" },
];

const TutorialSuitModal = ({
  openSuitModal,
  handleCloseSuitModal,
  handleAces,
  isPenalty,
  isSecondAcePlay = false,
  isAceOfSpades = false,
  desiredSuit,
  desiredRank,
  tutorialInstruction,
  correctSuit,
  correctRank,
}) => {
  const [selectedSuit, setSelectedSuit] = useState(null);
  const [selectedRank, setSelectedRank] = useState(null);
  const [step, setStep] = useState("suit"); // 'suit' or 'rank'

  //   const handleRankSelect = (rank) => {
  //     if (isAceOfSpades) {
  //       setSelectedRank(rank);
  //       // If both suit and rank are selected, send to backend
  //       if (selectedSuit) {
  //         handleAces(selectedSuit, rank);
  //         handleCloseSuitModal();
  //       }
  //     } else {
  //       // Regular second ace play
  //       handleAces(rank);
  //       handleCloseSuitModal();
  //     }
  //   };

  const handleSuitSelect = (suit) => {
    if (isAceOfSpades) {
      setSelectedSuit();
      setStep("rank"); // Move to rank selection
    } else {
      // Regular ace play
      handleAces(suit);
      handleCloseSuitModal();
    }
  };

  const getDialogTitle = () => {
    if (isAceOfSpades) {
      return step === "suit" ? "Choose Suit (AS)" : "Choose Rank (AS)";
    }
    return isSecondAcePlay ? "Choose Rank" : "Choose Suit";
  };

  return (
    <Dialog open={openSuitModal} onOpenChange={handleCloseSuitModal}>
      <DialogContent
        className="w-[95%] sm:w-11/12 md:max-w-[80%] lg:max-w-[60%] 
      bg-[rgba(25,32,95,0.3)] border border-[#00B8FF] backdrop-blur-xl mx-auto"
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            {tutorialInstruction && (
              <DialogTitle className="text-white text-sm font-medium">
                {/* {isSecondAcePlay ? "Choose Rank" : "Choose Suit"} */}
                {/* {getDialogTitle()} */}
                {tutorialInstruction}
              </DialogTitle>
            )}
          </div>
        </DialogHeader>

        {/* Show suit selection for AS first step or regular ace */}
        {((isAceOfSpades && step === "suit") ||
          (!isAceOfSpades && !isSecondAcePlay)) && (
          <div className="grid grid-cols-2 gap-4 p-4">
            {suits.map((suit) => (
              <Button
                key={suit.name}
                // className="p-4 h-24 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] border border-[#00B8FF]/20"
                className={`p-4 h-24 bg-[rgba(255,255,255,0.05)] 
                  hover:bg-[rgba(255,255,255,0.1)] border 
                  ${
                    correctSuit === suit.symbol
                      ? "border-green-500 animate-pulse"
                      : "border-[#00B8FF]/20"
                  }`}
                onClick={() => handleSuitSelect(suit.symbol)}
              >
                <div className="relative w-12 h-12">
                  <Image
                    src={`/cards/${suit.name}.png`}
                    alt={suit.name}
                    fill
                    className="object-contain"
                  />
                </div>
              </Button>
            ))}
          </div>
        )}

        {/* Show rank selection for AS second step or regular second ace */}
        {((isAceOfSpades && step === "rank") ||
          (!isAceOfSpades && isSecondAcePlay)) && (
          <div className="flex flex-col gap-4">
            {isAceOfSpades && (
              <div
                // className="flex items-center justify-center gap-2 p-2 bg-[rgba(255,255,255,0.05)] rounded-lg"
                className={`h-12 bg-[rgba(255,255,255,0.05)] 
                hover:bg-[rgba(255,255,255,0.1)] text-white
                ${
                  correctRank === rank.value
                    ? "border-green-500 animate-pulse"
                    : "border-[#00B8FF]/20"
                }`}
              >
                <span className="text-white text-sm">Selected Suit:</span>
                <div className="relative w-6 h-6">
                  <Image
                    src={`/cards/${
                      suits.find((s) => s.symbol === selectedSuit)?.name ||
                      "spade"
                    }.png`}
                    alt="Selected Suit"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            )}
            {!isAceOfSpades && desiredSuit && (
              <div className="flex items-center justify-center gap-2 p-2 bg-[rgba(255,255,255,0.05)] rounded-lg">
                <span className="text-white text-sm">Current Suit:</span>
                <div className="relative w-6 h-6">
                  <Image
                    src={`/cards/${
                      suits.find((s) => s.symbol === desiredSuit)?.name ||
                      "spade"
                    }.png`}
                    alt="Current Suit"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            )}
            <div className="grid grid-cols-4 gap-2 p-2">
              {cardRanks.map((rank) => (
                <Button
                  key={rank.value}
                  variant="outline"
                  className="h-12 bg-[rgba(255,255,255,0.05)] border-[#00B8FF]/20 hover:bg-[rgba(255,255,255,0.1)] text-white"
                  //   onClick={() => handleRankSelect(rank.value)}
                >
                  {rank.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TutorialSuitModal;
