import { useState, useEffect } from "react";
import Image from "next/image";

const KadiLoader = () => {
  const [tipIndex, setTipIndex] = useState(0);

  const tips = [
    // {
    //   category: "Game Basics",
    //   text: "Drag and drop your cards to play them! Hold a card to pick it up, then drop it on the play area.",
    //   image: "/cards/dnd.jpg",
    // },
    {
      category: "Card Strategy",
      text: "Save your Ace cards for critical moments - they can block penalties and let you control the game's suit!",
      image: "/cards/AS.png",
    },
    {
      category: "Pro Tip",
      text: "Don't forget to say 'Niko Kadi' when you can win on your next turn!",
      image: "/cards/tutorial/kadi-call.png",
    },
    {
      category: "Card Combo",
      text: "Got multiple 10s? Play them all at once to quickly reduce your hand!",
      image: "/cards/10H.png",
    },
    {
      category: "Defense Strategy",
      text: "Keep a Jack or King handy to counter other players' special moves!",
      image: "/cards/JH.png",
    },
    {
      category: "Question Cards",
      text: "Playing Q or 8? Have an Answer card (4-7, 9-10) ready!",
      image: "/cards/QS.png",
    },
    {
      category: "Penalty Defense",
      text: "Block 2 or 3 penalties with matching cards, Jokers, or Aces!",
      image: "/cards/2D.png",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % tips.length);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center max-w-md px-6">
        <div className="flex items-center justify-center space-x-2 mb-8">
          {[0, 0.2, 0.4].map((delay, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: `${delay}s` }}
            />
          ))}
        </div>

        <div className="transform animate-fade-in transition-all duration-500">
          <div className="mb-4 flex justify-center">
            <Image
              src={tips[tipIndex].image}
              alt={tips[tipIndex].category}
              width={80}
              height={112}
              className="rounded-lg shadow-lg"
            />
          </div>
          <div className="text-sm font-medium text-blue-500 dark:text-blue-400 mb-2">
            {tips[tipIndex].category}
          </div>
          <div className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
            {tips[tipIndex].text}
          </div>
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400 mt-8">
          Shuffling the deck...
        </div>
      </div>
    </div>
  );
};

export default KadiLoader;
