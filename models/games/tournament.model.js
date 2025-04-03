import mongoose from "mongoose";

// Participant Model
const ParticipantSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: { type: String, required: true },
  resultText: { type: String, default: null },
  isWinner: { type: Boolean, default: false },
});

const ParticipantModel =
  mongoose.models.Participant ||
  mongoose.model("Participant", ParticipantSchema);

// Match Model
const MatchSchema = new mongoose.Schema({
  tournamentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tournament",
    required: true,
  },
  id: { type: Number, required: true },
  name: { type: String, required: true },
  nextMatchId: { type: Number, default: null },
  tournamentRoundText: { type: String, required: true },
  startTime: { type: Date },
  state: {
    type: String,
    enum: [
      "SCHEDULED",
      "NO_SHOW",
      "WALK_OVER",
      "NO_PARTY",
      "DONE",
      "SCORE_DONE",
      "IN_PROGRESS",
      "COMPLETED",
    ],
    default: "SCHEDULED",
  },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Participant" }],
  gameRoom: { type: mongoose.Schema.Types.ObjectId, ref: "CardsRoom" },
});

const MatchModel =
  mongoose.models.Match || mongoose.model("Match", MatchSchema);

// Tournament Model
const TournamentSchema = new mongoose.Schema(
  {
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: null,
    },
    game: {
      type: String,
      enum: ["kadi"],
      required: true,
    },
    format: {
      type: String,
      enum: ["single elimination", "double elimination", null],
      required: true,
    },
    startDate: { type: Date, default: null },
    maxDuration: { type: String, default: null },
    type: {
      type: String,
      enum: ["paid", "sponsored", null],
      default: null,
    },

    // Enhanced sponsorship tracking
    sponsorshipDetails: {
      targetAmount: { type: Number, default: 0 },
      currentAmount: { type: Number, default: 0 },
      sponsors: [
        {
          user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          products: [
            {
              product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
              quantity: Number,
              value: Number,
            },
          ],
          sponsoredAt: { type: Date, default: Date.now },
        },
      ],
    },

    // Prize pool tracking
    prizePool: {
      products: [
        {
          product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
          quantity: Number,
          value: Number,
        },
      ],
      totalValue: { type: Number, default: 0 },
    },

    // Payment distribution
    paymentDistribution: {
      creatorShare: { type: Number, default: 70 }, // 70%
      winnerShare: { type: Number, default: 25 }, // 25%
      platformShare: { type: Number, default: 5 }, // 5%
    },

    numberOfParticipants: {
      type: Number,
      min: 4,
      default: null,
    },
    status: {
      type: String,
      enum: ["draft", "setup", "ready", "in-progress", "completed"],
      default: "draft",
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    customTableBackgroundImage: {
      type: String,
      required: true,
    },
    customCardSkinImage: {
      type: String,
      required: true,
    },
    // Viral mechanics
    viewCount: { type: Number, default: 0 },
    shareCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

const TournamentModel =
  mongoose.models.Tournament || mongoose.model("Tournament", TournamentSchema);

export { TournamentModel, MatchModel, ParticipantModel };
