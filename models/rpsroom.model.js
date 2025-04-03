import mongoose from "mongoose";

const RPSRoomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: [1, "Must be at least 1 character long"],
      maxlength: [200, "Cannot be more than 200 characters long"],
    },
    players: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        score: { type: Number, default: 0 },
        choice: {
          type: String,
          enum: ["rock", "paper", "scissors"],
          default: null,
        },
      },
    ],
    gameStatus: {
      type: String,
      // waiting - waiting for second player to join
      // active - full waiting to start game
      // open - waiting for second player to make pick
      // closed - player made pick and its draw or winner
      // gameover - a overall winner has won 3 times
      enum: ["active", "waiting", "open", "closed", "gameover"],
      default: "active",
    },
    game: {
      rounds: [
        {
          roundNumber: {
            type: Number,
            required: true,
          },
          choices: [
            {
              userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
              choice: { type: String, enum: ["rock", "paper", "scissors"] },
            },
          ],
        },
      ],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const rpsRoomModel =
  mongoose?.models?.RPSRoom || mongoose.model("RPSRoom", RPSRoomSchema);

export default rpsRoomModel;
