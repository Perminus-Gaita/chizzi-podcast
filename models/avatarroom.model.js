import mongoose from "mongoose";

const AvatarCardsRoomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true, // Make name field unique
      index: true, // Add index for better query performance
      minlength: [1, "Must be at least 1 character long"],
      maxlength: [200, "Cannot be more than 200 characters long"],
      trim: true, // Remove whitespace
      // Add custom validation for special characters if needed
      validate: {
        validator: function (v) {
          // Allow letters, numbers, spaces, and basic punctuation
          return /^[a-zA-Z0-9\s\-_\.]+$/.test(v);
        },
        message: (props) => `${props.value} contains invalid characters!`,
      },
    },
    tournamentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
      default: null,
    },
    isComputerPlay: {
      type: Boolean,
      default: false,
      index: true,
    },
    maxPlayers: { type: Number, required: true },

    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    pot: { type: Number, required: true, default: 0 },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "KadiPlayer",
      default: null,
    },
    gameStatus: {
      type: String,
      // waiting - waiting for participants
      // active - game started
      // inactive - game not over, no play in last 30min
      // closed - game closed/cancelled
      // gameover - a overall winner has won
      enum: ["waiting", "active", "inactive", "closed", "gameover"],
      default: "active",
    },
    // GAME STATE
    direction: { type: Number, required: true }, // -1 for counter-clockwise, 1 for clockwise
    turn: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "KadiPlayer",
      default: null,
    }, // Name of the player whose turn it is
    currentSuit: { type: String, default: null }, // Current game suit
    desiredSuit: { type: String, default: null }, // Suit chosen by player with Ace
    desiredRank: { type: String, default: null }, // Suit chosen by player with 2 Aces of AS
    jumpCounter: { type: Number, required: true, default: 0 },
    isPenalty: { type: Boolean, required: true, default: false }, // Indicates if the game is in a penalty state
    isQuestion: { type: Boolean, required: true, default: false }, // Indicates if the game is in a question state
    isKickback: { type: Boolean, required: true, default: false }, // Indicates if the game is in a kickback state
    gamePlay: [
      {
        player: { type: mongoose.Schema.Types.ObjectId, ref: "KadiPlayer" },
        moveType: {
          type: String,
          enum: ["draw", "drawPenalty", "play", "jump", "kickback"],
          required: true,
        },
        card: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    drawPile: { type: [String], required: true },
    discardPile: { type: [String], required: true },
    players: [
      {
        player: { type: mongoose.Schema.Types.ObjectId, ref: "KadiPlayer" },
        playerDeck: { type: [String], required: true },
        score: { type: Number, required: true, default: 0 },
        on: { type: Boolean, required: true, default: false },
        checkedIn: { type: Boolean, default: false },
        initialRating: { type: Number, required: true },
        finalRating: { type: Number },
        ratingChange: { type: Number },
        specialMoves: {
          jumpCards: { type: Number, default: 0 },
          kickbackCards: { type: Number, default: 0 },
          aceDeclarations: { type: Number, default: 0 },
          penaltyAvoidances: { type: Number, default: 0 },
        },
        stallingPenalties: { type: Number, default: 0 },
        averageMoveTime: { type: Number },
      },
    ],
    gameDuration: { type: Number }, // in seconds
    tournamentMultiplier: { type: Number },
    gameScores: {
      // Final calculated scores including all bonuses and penalties
      type: Map,
      of: Number,
      default: new Map(),
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

AvatarCardsRoomSchema.index({
  "players.player": 1,
  gameStatus: 1,
  createdAt: -1,
});

// Error handling for duplicate names
AvatarCardsRoomSchema.post("save", function (error, doc, next) {
  if (error.code === 11000 && error.keyPattern.name) {
    next(
      new Error("Room name already exists. Please choose a different name.")
    );
  } else {
    next(error);
  }
});

const avatarRoomModel =
  mongoose?.models?.AvatarRoom ||
  mongoose.model("AvatarRoom", AvatarCardsRoomSchema);

export default avatarRoomModel;
