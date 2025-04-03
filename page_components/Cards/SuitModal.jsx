// "use client";
// import Image from "next/image";
// import { useState } from "react";

// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";

// const cardRanks = [
//   { label: "Ace", value: "A" },
//   { label: "2", value: "2" },
//   { label: "3", value: "3" },
//   { label: "4", value: "4" },
//   { label: "5", value: "5" },
//   { label: "6", value: "6" },
//   { label: "7", value: "7" },
//   { label: "8", value: "8" },
//   { label: "9", value: "9" },
//   { label: "10", value: "10" },
//   { label: "Jack", value: "J" },
//   { label: "Queen", value: "Q" },
//   { label: "King", value: "K" },
// ];

// const suits = [
//   { name: "spade", symbol: "S" },
//   { name: "club", symbol: "C" },
//   { name: "diamond", symbol: "D" },
//   { name: "heart", symbol: "H" },
// ];

// const SuitModal = ({
//   openSuitModal,
//   handleCloseSuitModal,
//   handleAces,
//   isPenalty,
//   matchId,
//   isSecondAcePlay = false,
//   isAceOfSpades = false,
//   desiredSuit,
//   desiredRank,
// }) => {
//   const [selectedSuit, setSelectedSuit] = useState(null);
//   const [selectedRank, setSelectedRank] = useState(null);
//   const [step, setStep] = useState("suit"); // 'suit' or 'rank'

//   const handleRankSelect = (rank) => {
//     if (isAceOfSpades) {
//       setSelectedRank(rank);
//       // If both suit and rank are selected, send to backend
//       if (selectedSuit) {
//         handleAces(selectedSuit, rank, matchId);
//         handleCloseSuitModal();
//       }
//     } else {
//       // Regular second ace play
//       handleAces(rank, matchId);
//       handleCloseSuitModal();
//     }
//   };

//   const handleSuitSelect = (suit) => {
//     if (isAceOfSpades) {
//       setSelectedSuit(suit);
//       setStep("rank"); // Move to rank selection
//     } else {
//       // Regular ace play
//       handleAces(suit, matchId);
//       handleCloseSuitModal();
//     }
//   };

//   const getDialogTitle = () => {
//     if (isAceOfSpades) {
//       return step === "suit" ? "Choose Suit (AS)" : "Choose Rank (AS)";
//     }
//     return isSecondAcePlay ? "Choose Rank" : "Choose Suit";
//   };

//   return (
//     <Dialog open={openSuitModal} onOpenChange={handleCloseSuitModal}>
//       <DialogContent
//         className="w-[95%] sm:w-11/12 md:max-w-[80%] lg:max-w-[60%]
//       bg-[rgba(25,32,95,0.3)] border border-[#00B8FF] backdrop-blur-xl mx-auto"
//       >
//         <DialogHeader>
//           <div className="flex items-center justify-between">
//             <DialogTitle className="text-white text-lg font-medium">
//               {/* {isSecondAcePlay ? "Choose Rank" : "Choose Suit"} */}
//               {getDialogTitle()}
//             </DialogTitle>
//           </div>
//         </DialogHeader>

//         {/* {isSecondAcePlay ? (
//           <div className="flex flex-col gap-4">
//             <div className="flex items-center justify-center gap-2 p-2 bg-[rgba(255,255,255,0.05)] rounded-lg">
//               <span className="text-white text-sm">Current Suit:</span>
//               <div className="relative w-6 h-6">
//                 <Image
//                   src={`/cards/${
//                     suits.find((s) => s.symbol === desiredSuit)?.name || "spade"
//                   }.png`}
//                   alt="Current Suit"
//                   fill
//                   className="object-contain"
//                 />
//               </div>
//             </div>
//             <div className="grid grid-cols-4 gap-2 p-2">
//               {cardRanks.map((rank) => (
//                 <Button
//                   key={rank.value}
//                   variant="outline"
//                   className="h-12 bg-[rgba(255,255,255,0.05)] border-[#00B8FF]/20 hover:bg-[rgba(255,255,255,0.1)] text-white"
//                   onClick={() => handleRankSelect(rank.value)}
//                 >
//                   {rank.label}
//                 </Button>
//               ))}
//             </div>
//           </div>
//         ) : (
//           <div className="grid grid-cols-2 gap-4 p-4">
//             {suits.map((suit) => (
//               <Button
//                 key={suit.name}
//                 className="p-4 h-24 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] border border-[#00B8FF]/20"
//                 onClick={() => handleSuitSelect(suit.symbol)}
//               >
//                 <div className="relative w-12 h-12">
//                   <Image
//                     src={`/cards/${suit.name}.png`}
//                     alt={suit.name}
//                     fill
//                     className="object-contain"
//                   />
//                 </div>
//               </Button>
//             ))}
//           </div>
//         )} */}

//         {/* Show suit selection for AS first step or regular ace */}
//         {((isAceOfSpades && step === "suit") ||
//           (!isAceOfSpades && !isSecondAcePlay)) && (
//           <div className="grid grid-cols-2 gap-4 p-4">
//             {suits.map((suit) => (
//               <Button
//                 key={suit.name}
//                 className="p-4 h-24 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] border border-[#00B8FF]/20"
//                 onClick={() => handleSuitSelect(suit.symbol)}
//               >
//                 <div className="relative w-12 h-12">
//                   <Image
//                     src={`/cards/${suit.name}.png`}
//                     alt={suit.name}
//                     fill
//                     className="object-contain"
//                   />
//                 </div>
//               </Button>
//             ))}
//           </div>
//         )}

//         {/* Show rank selection for AS second step or regular second ace */}
//         {((isAceOfSpades && step === "rank") ||
//           (!isAceOfSpades && isSecondAcePlay)) && (
//           <div className="flex flex-col gap-4">
//             {isAceOfSpades && (
//               <div className="flex items-center justify-center gap-2 p-2 bg-[rgba(255,255,255,0.05)] rounded-lg">
//                 <span className="text-white text-sm">Selected Suit:</span>
//                 <div className="relative w-6 h-6">
//                   <Image
//                     src={`/cards/${
//                       suits.find((s) => s.symbol === selectedSuit)?.name ||
//                       "spade"
//                     }.png`}
//                     alt="Selected Suit"
//                     fill
//                     className="object-contain"
//                   />
//                 </div>
//               </div>
//             )}
//             {!isAceOfSpades && desiredSuit && (
//               <div className="flex items-center justify-center gap-2 p-2 bg-[rgba(255,255,255,0.05)] rounded-lg">
//                 <span className="text-white text-sm">Current Suit:</span>
//                 <div className="relative w-6 h-6">
//                   <Image
//                     src={`/cards/${
//                       suits.find((s) => s.symbol === desiredSuit)?.name ||
//                       "spade"
//                     }.png`}
//                     alt="Current Suit"
//                     fill
//                     className="object-contain"
//                   />
//                 </div>
//               </div>
//             )}
//             <div className="grid grid-cols-4 gap-2 p-2">
//               {cardRanks.map((rank) => (
//                 <Button
//                   key={rank.value}
//                   variant="outline"
//                   className="h-12 bg-[rgba(255,255,255,0.05)] border-[#00B8FF]/20 hover:bg-[rgba(255,255,255,0.1)] text-white"
//                   onClick={() => handleRankSelect(rank.value)}
//                 >
//                   {rank.label}
//                 </Button>
//               ))}
//             </div>
//           </div>
//         )}
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default SuitModal;

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
  { name: "spade", symbol: "S", color: "#1F2937" },
  { name: "club", symbol: "C", color: "#1F2937" },
  { name: "diamond", symbol: "D", color: "#EF4444" },
  { name: "heart", symbol: "H", color: "#EF4444" },
];

const SuitModal = ({
  openSuitModal,
  handleCloseSuitModal,
  handleAces,
  isPenalty,
  matchId,
  isSecondAcePlay = false,
  isAceOfSpades = false,
  desiredSuit,
  desiredRank,
}) => {
  const [selectedSuit, setSelectedSuit] = useState(null);
  const [selectedRank, setSelectedRank] = useState(null);
  const [step, setStep] = useState("suit"); // 'suit' or 'rank'

  const handleRankSelect = (rank) => {
    if (isAceOfSpades) {
      setSelectedRank(rank);
      // If both suit and rank are selected, send to backend
      if (selectedSuit) {
        handleAces(selectedSuit, rank, matchId);
        handleCloseSuitModal();
      }
    } else {
      // Regular second ace play
      handleAces(rank, matchId);
      handleCloseSuitModal();
    }
  };

  const handleSuitSelect = (suit) => {
    if (isAceOfSpades) {
      setSelectedSuit(suit);
      setStep("rank"); // Move to rank selection
    } else {
      // Regular ace play
      handleAces(suit, matchId);
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
        className="
          w-[95%] 
          sm:w-11/12 
          md:max-w-[80%] 
          lg:max-w-[60%] 
          bg-[rgba(25,32,95,0.7)] 
          border-2 
          border-[#00B8FF]/60 
          backdrop-blur-xl 
          mx-auto 
          rounded-2xl 
          shadow-2xl 
          overflow-hidden"
      >
        <DialogHeader>
          <div className="flex items-center justify-between p-4 pb-0">
            <DialogTitle
              className="
              text-white 
              text-xl 
              font-semibold 
              tracking-wide 
              drop-shadow-md"
            >
              {getDialogTitle()}
            </DialogTitle>
          </div>
        </DialogHeader>

        {/* Suit Selection */}
        {((isAceOfSpades && step === "suit") ||
          (!isAceOfSpades && !isSecondAcePlay)) && (
          <div
            className="
            grid 
            grid-cols-2 
            gap-4 
            p-6 
            sm:p-8 
            max-w-2xl 
            mx-auto 
            w-full"
          >
            {suits.map((suit) => (
              <Button
                key={suit.name}
                aria-label={`Select ${suit.name} suit`}
                className={`
                  p-4 
                  h-24 
                  bg-white/10 
                  hover:bg-white/20 
                  border 
                  border-[#00B8FF]/40 
                  flex 
                  items-center 
                  justify-center 
                  transition-all 
                  duration-200 
                  transform 
                  hover:scale-105 
                  rounded-xl 
                  shadow-lg 
                  hover:shadow-[#00B8FF]/50
                  focus:outline-none 
                  focus:ring-2 
                  focus:ring-[#00B8FF]
                `}
                onClick={() => handleSuitSelect(suit.symbol)}
              >
                <div
                  className="
                  relative 
                  w-16 
                  h-16 
                  filter 
                  drop-shadow-[0_0_5px_rgba(255,255,255,0.3)] 
                  hover:drop-shadow-[0_0_10px_rgba(0,184,255,0.5)]"
                >
                  <Image
                    src={`/cards/${suit.name}.png`}
                    alt={suit.name}
                    fill
                    className="
                      object-contain 
                      brightness-125 
                      contrast-125 
                      hover:brightness-150
                      saturate-150"
                  />
                </div>
              </Button>
            ))}
          </div>
        )}

        {/* Rank Selection */}
        {((isAceOfSpades && step === "rank") ||
          (!isAceOfSpades && isSecondAcePlay)) && (
          <div className="flex flex-col gap-4 p-6 sm:p-8 max-w-2xl mx-auto w-full">
            {/* Selected Suit Display */}
            {(isAceOfSpades || (!isAceOfSpades && desiredSuit)) && (
              <div
                className="
                flex 
                items-center 
                justify-center 
                gap-3 
                p-3 
                bg-white/10 
                rounded-lg 
                border 
                border-[#00B8FF]/30"
              >
                <span className="text-white text-sm font-medium">
                  {isAceOfSpades ? "Selected Suit:" : "Current Suit:"}
                </span>
                <div className="relative w-8 h-8">
                  <Image
                    src={`/cards/${
                      suits.find(
                        (s) =>
                          s.symbol ===
                          (isAceOfSpades ? selectedSuit : desiredSuit)
                      )?.name || "spade"
                    }.png`}
                    alt="Selected/Current Suit"
                    fill
                    className="object-contain brightness-125"
                  />
                </div>
              </div>
            )}

            {/* Rank Buttons */}
            <div className="grid grid-cols-4 gap-3">
              {cardRanks.map((rank) => (
                <Button
                  key={rank.value}
                  aria-label={`Select ${rank.label} rank`}
                  variant="outline"
                  className="
                    h-14 
                    text-base 
                    font-semibold 
                    bg-white/10 
                    border-[#00B8FF]/40 
                    hover:bg-white/20 
                    text-white 
                    transition-all 
                    duration-200 
                    transform 
                    hover:scale-105 
                    focus:outline-none 
                    focus:ring-2 
                    focus:ring-[#00B8FF]"
                  onClick={() => handleRankSelect(rank.value)}
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

export default SuitModal;
