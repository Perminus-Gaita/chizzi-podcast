import mongoose from "mongoose";

// Tournament Model
const TournamentSchema = new mongoose.Schema({
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: null
    },
    game: {
        type: String,
        enum: ["kadi"],
        required: true
    },
    format: {
        type: String,
        enum: ["single elimination", "double elimination", null],
        required: true
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

export default TournamentModel;
