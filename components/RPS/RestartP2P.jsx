"use client";

const RestartP2P = ({ playerScore, opponentScore }) => {
  return (
    <>
      <div
        className="flex flex-col items-center gap-4 bg-tertiary md:w-4/12 w-11/12 py-3 rounded-lg"
        style={{
          minHeight: "150px",
          margin: "0 auto 0 auto ",
        }}
      >
        <div>
          <h6
            className={`${
              playerScore > opponentScore
                ? "text-primaryGreen"
                : "text-primaryRed"
            } font-semibold text-3xl`}
          >
            {playerScore > opponentScore ? "You Won" : "You Lost"}
          </h6>
        </div>

        <div>
          <h4 className="text-white font-semibold text-3xl">{`${
            playerScore || 0
          } : ${opponentScore || 0}`}</h4>
        </div>

        <div>
          <button
            disabled
            style={{
              backgroundColor: "#222840",
              borderRadius: "10px",
              color: "#fff",
              fontWeight: "600",
              textTransform: "capitalize",
              letterSpacing: "2px",
              padding: "5px 1rem",
              fontSize: "1rem",
            }}
          >
            Play Again
          </button>
        </div>
      </div>
    </>
  );
};

export default RestartP2P;
