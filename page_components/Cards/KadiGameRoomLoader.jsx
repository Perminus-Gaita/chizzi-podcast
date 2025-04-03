"use client";

import { useEffect, useState } from "react";

// const LOADING_MESSAGES = [
//   {
//     title: "Card Combinations",
//     tips: [
//       "Stack multiple cards of the same rank to clear your hand faster",
//       "Use Ace cards to change the suit when you have valuable cards to play",
//       "Hold onto penalty cards (2,3,JOK) to defend against other players",
//     ],
//   },
//   {
//     title: "Strategy Tips",
//     tips: [
//       "Save your Jump (J) and Kickback (K) cards to counter other players' special moves",
//       "Say 'Niko Kadi' when you're sure you can win next turn",
//       "Keep track of played cards to anticipate opponents' moves",
//     ],
//   },
//   {
//     title: "Quick Tips",
//     tips: [
//       "Drag cards to the center to play them",
//       "Double-click cards to select multiples of the same rank",
//       "Watch the direction indicator - it changes with Kickback cards",
//     ],
//   },
// ];

// const GameTip = ({ message }) => (
//   <div className="px-4 py-2 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
//     <p className="text-white/80 text-sm">{message}</p>
//   </div>
// );

// const KadiGameRoomLoader = ({
//   connectionState,
//   secondsLeft = 20,
//   roomName,
// }) => {
//   const [currentTipSet, setCurrentTipSet] = useState(0);
//   const [currentTip, setCurrentTip] = useState(0);

//   useEffect(() => {
//     const tipInterval = setInterval(() => {
//       setCurrentTip((prev) => {
//         if (prev + 1 >= LOADING_MESSAGES[currentTipSet].tips.length) {
//           setCurrentTipSet((prev) => (prev + 1) % LOADING_MESSAGES.length);
//           return 0;
//         }
//         return prev + 1;
//       });
//     }, 1000);

//     return () => clearInterval(tipInterval);
//   }, [currentTipSet]);

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#131633] to-[#222840] text-white w-full">
//       {/* Progress Indicator */}
//       <div className="relative mb-8">
//         <CircularProgress
//           size={80}
//           thickness={4}
//           sx={{ color: "#00b8ff" }}
//           variant="determinate"
//           value={((20 - secondsLeft) / 20) * 100}
//         />
//         <div className="absolute inset-0 flex items-center justify-center">
//           <span className="text-2xl font-bold">{secondsLeft}</span>
//         </div>
//       </div>

//       {/* Connection State */}
//       <h1 className="mb-4 text-xl md:text-3xl font-bold text-center">
//         <span className="text-[#00b8ff]">{roomName}</span>
//       </h1>

//       <p className="text-lg text-[#9f9f9f] animate-pulse mb-8">
//         {connectionState}
//       </p>

//       {/* Game Tips Section */}
//       <div className="max-w-md px-4 mb-8">
//         <h3 className="text-center text-[#00b8ff] font-semibold mb-4">
//           {LOADING_MESSAGES[currentTipSet].title}
//         </h3>
//         <div className="space-y-4 transition-all duration-300 ease-in-out">
//           <GameTip message={LOADING_MESSAGES[currentTipSet].tips[currentTip]} />
//         </div>
//       </div>

//       {/* Loading Indicator */}
//       <div className="flex space-x-2">
//         {[0, 1, 2].map((i) => (
//           <div
//             key={i}
//             className="w-3 h-3 bg-[#00b8ff] rounded-full animate-bounce"
//             style={{ animationDelay: `${i * 0.2}s` }}
//           />
//         ))}
//       </div>
//     </div>
//   );
// };

// export default KadiGameRoomLoader;

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Sword,
  Shield,
  Lightbulb,
  Crown,
  Grab,
  Shuffle,
  ArrowLeftRight,
  Hourglass,
  Sparkles,
  Brain,
} from "lucide-react";

const LOADING_MESSAGES = [
  {
    title: "Power Combinations",
    icon: <Sword className="w-5 h-5 text-blue-400" />,
    tips: [
      {
        text: "Stack multiple cards of the same rank for a powerful play",
        visual: ["10H", "10D", "10S"], // Example of stackable cards
        example: "Play multiple 10s at once to quickly reduce your hand",
      },
    ],
  },
  {
    title: "Defensive Moves",
    icon: <Shield className="w-5 h-5 text-emerald-400" />,
    tips: [
      {
        text: "Block penalty cards with matching cards or an Ace",
        visual: ["2H", "2S", "AS"], // Shows blocking a 2 with another 2 or Ace
        example: "When facing a 2♥, play 2♠ or A♠ to avoid drawing cards",
      },
    ],
  },
  {
    title: "Special Cards",
    icon: <Sparkles className="w-5 h-5 text-purple-400" />,
    tips: [
      {
        text: "Use Jump (J) cards to skip the next player's turn",
        visual: ["JH", "JS"], // Jump cards
        example: "Play multiple Jacks to skip multiple players",
      },
    ],
  },
  {
    title: "Game Control",
    icon: <Crown className="w-5 h-5 text-yellow-400" />,
    tips: [
      {
        text: "Aces let you change the game's suit - use them wisely!",
        visual: ["AH", "AD", "AC", "AS"], // All Aces
        example: "Play an Ace to switch to a suit where you have strong cards",
      },
    ],
  },
  {
    title: "Quick Moves",
    icon: <Grab className="w-5 h-5 text-orange-400" />,
    tips: [
      {
        text: "Drag cards to the center to play them quickly",
        visual: ["7H"], // Simple card to show dragging
        example: "Click and hold to drag cards to the play area",
      },
    ],
  },
];

const GameTip = ({ tip, isVisible }) => (
  <Card
    className={`
    w-full bg-white/5 border-white/10 transition-all duration-500 
    ${
      isVisible
        ? "opacity-100 transform translate-y-0"
        : "opacity-0 transform translate-y-4"
    }
  `}
  >
    <CardContent className="p-4">
      <div className="flex flex-col gap-4">
        <p className="text-white/80 text-sm">{tip.text}</p>

        {/* Card Visuals */}
        <div className="flex justify-center gap-2">
          {tip.visual.map((card, index) => (
            <div
              key={index}
              className="relative group transition-transform duration-300 hover:scale-110"
              style={{
                width: "60px",
                height: "84px",
              }}
            >
              <img
                src={`/cards/${card}.png`}
                alt={card}
                className="rounded-lg shadow-lg"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
              />
            </div>
          ))}
        </div>

        <div className="mt-2">
          <Badge variant="outline" className="text-xs text-white/60 bg-white/5">
            {tip.example}
          </Badge>
        </div>
      </div>
    </CardContent>
  </Card>
);

const KadiGameRoomLoader = ({
  connectionState,
  secondsLeft = 20,
  roomName,
}) => {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const tipInterval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 4000);

    return () => clearInterval(tipInterval);
  }, []);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 1));
    }, secondsLeft * 10);

    return () => clearInterval(progressInterval);
  }, [secondsLeft]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#131633] to-[#222840] p-4">
      {/* Progress and Room Info */}
      <div className="w-full max-w-md mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">{roomName}</h2>
          <div className="flex items-center gap-2">
            <Hourglass className="w-4 h-4 text-[#00b8ff] animate-spin" />
            <span className="text-sm text-white/80">{secondsLeft}s</span>
          </div>
        </div>
        <Progress value={progress} className="h-2 bg-white/5" />
      </div>

      {/* Connection State */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-2 h-2 bg-[#00b8ff] rounded-full animate-pulse" />
        <p className="text-white/60">{connectionState}</p>
      </div>

      {/* Tips Section */}
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-4">
          {LOADING_MESSAGES[currentTipIndex].icon}
          <h3 className="text-lg font-semibold text-white">
            {LOADING_MESSAGES[currentTipIndex].title}
          </h3>
        </div>

        {LOADING_MESSAGES[currentTipIndex].tips.map((tip, index) => (
          <GameTip
            key={index}
            tip={tip}
            isVisible={index === 0} // Only show first tip of each category
          />
        ))}
      </div>

      {/* Connection Indicators */}
      <div className="flex gap-2 mt-8">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-[#00b8ff] rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  );
};

export default KadiGameRoomLoader;
