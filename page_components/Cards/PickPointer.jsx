"use client";

const PickPointer = ({
  isSmallScreen,
  isPenalty,
  isLastPlayer,
  isQuestion,
}) => {
  return (
    <div className="flex items-center justify-center gap-1">
      <div>
        {isPenalty && !isLastPlayer && (
          <div
            className="flex flex-row items-center justify-center
        bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 
        text-white font-bold py-1 px-2 
        rounded-xl shadow-lg 
        transition-all duration-300 transform max-w-[200px]"
          >
            <span className="text-xs text-left">
              Block or <br /> Accept Penalty
            </span>
            <div className="point-up">
              <img
                src={`/cards/rightpointer.png`}
                width="40"
                height="60"
                style={{ transform: "rotate(-90deg)" }}
              />
            </div>
          </div>
        )}

        {isQuestion && (
          <div
            className="flex flex-row items-center justify-center
        bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 
        text-white font-bold py-1 px-2 
        rounded-xl shadow-lg 
        transition-all duration-300 transform"
          >
            <span className="text-xs text-left">Pick Answer</span>
            <div className={`drawAnswer point-up`}>
              <img
                src={`/cards/rightpointer.png`}
                width="40"
                height="60"
                style={{ transform: "rotate(-90deg)" }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PickPointer;
