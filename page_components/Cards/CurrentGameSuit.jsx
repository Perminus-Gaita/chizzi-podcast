"use client";

const CurrentGameSuit = ({ currentSuit }) => {
  return (
    <div className="flex items-center justify-center h-10 px-3 rounded-l-lg bg-opacity-80 bg-[#222840]">
      {currentSuit === "S" && (
        <img src="/cards/spade.png" className="w-6 h-6" alt="spades" />
      )}
      {currentSuit === "C" && (
        <img src="/cards/club.png" className="w-6 h-6" alt="clubs" />
      )}
      {currentSuit === "D" && (
        <img src="/cards/diamond.png" className="w-6 h-6" alt="diamonds" />
      )}
      {currentSuit === "H" && (
        <img src="/cards/heart.png" className="w-6 h-6" alt="hearts" />
      )}
      {currentSuit === "FREE" && (
        <span className="text-xs text-white font-semibold">FREE</span>
      )}
    </div>
  );
};

export default CurrentGameSuit;
