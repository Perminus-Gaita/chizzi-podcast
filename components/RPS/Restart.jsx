"use client";

const Restart = ({
  set_game_over,
  player_score,
  computer_score,
  set_player_score,
  set_computer_score,
}) => {
  return (
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
            player_score > computer_score
              ? "text-primaryGreen"
              : "text-primaryRed"
          } font-semibold text-3xl`}
        >
          {player_score > computer_score ? "You Won" : "You Lost"}
        </h6>
      </div>

      <div>
        <h4 className="text-white font-semibold text-3xl">{`${
          player_score || 0
        } : ${computer_score || 0}`}</h4>
      </div>

      <div>
        <button
          onClick={() => {
            set_player_score(0);
            set_computer_score(0);

            set_game_over(false);
          }}
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
  );
};

export default Restart;
