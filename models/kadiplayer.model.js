import mongoose from "mongoose";

const KadiPlayerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    strategyProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StrategyProfile",
      default: null,
    },
    // Primary Rating Fields - Used by existing code
    rating: { type: Number, default: 1500 },
    totalGames: { type: Number, default: 0 },
    rankedWins: { type: Number, default: 0 },
    seasonGames: { type: Number, default: 0 },
    seasonScore: { type: Number, default: 0 },
    casualGames: { type: Number, default: 0 },
    casualWins: { type: Number, default: 0 },

    progression: {
      level: { type: Number, default: 1 },
      experience: { type: Number, default: 0 },
      nextLevelExp: { type: Number, default: 1000 },
    },

    skillMetrics: {
      questionSequences: {
        total: { type: Number, default: 0 },
        successfulSequences: { type: Number, default: 0 },
        longest: { type: Number, default: 0 },
        winRate: { type: Number, default: 0 },
      },
      specialMoves: {
        aceControls: { type: Number, default: 0 },
        jumpChains: { type: Number, default: 0 },
        successfulKickbacks: { type: Number, default: 0 },
        penaltyAvoidances: { type: Number, default: 0 },
      },
      efficiency: {
        averageMoveTime: { type: Number, default: 0 },
        cardEfficiency: { type: Number, default: 0 },
        perfectGames: { type: Number, default: 0 },
      },
    },

    // Tournament tracking
    tournamentsPlayed: { type: Number, default: 0 },
    tournamentsWon: { type: Number, default: 0 },
    tournamentEarnings: { type: Number, default: 0 },

    // Game Performance Tracking
    winStreak: { type: Number, default: 0 },
    seasonHighest: { type: Number, default: 1500 },

    achievements: {
      speedDemon: { type: Number, default: 0 },
      comebackKing: { type: Number, default: 0 },
      tournamentTitan: { type: Number, default: 0 },
      penaltyMaster: { type: Number, default: 0 },
      consistentPlayer: { type: Number, default: 0 },
    },

    // Using exact division values from your RATING_CONFIG
    rankingTier: {
      type: String,
      enum: ["BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND"],
      default: "BRONZE",
    },

    // Season Tracking
    currentSeason: { type: Number, default: 1 },
    seasonHistory: [
      {
        season: Number,
        endRating: Number,
        highestRating: Number,
        gamesPlayed: Number,
        rank: String,
      },
    ],

    lastActive: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Maintain exact indexes used in queries
KadiPlayerSchema.index({ rating: -1, totalGames: -1 });
KadiPlayerSchema.index({ currentSeason: 1, rating: -1 });

// Update ranking tier using exact RATING_CONFIG division bounds
KadiPlayerSchema.methods.updateRankingTier = function () {
  if (this.rating < 1500) this.rankingTier = "BRONZE";
  else if (this.rating < 2000) this.rankingTier = "SILVER";
  else if (this.rating < 2500) this.rankingTier = "GOLD";
  else if (this.rating < 3000) this.rankingTier = "PLATINUM";
  else this.rankingTier = "DIAMOND";
};

// Update seasonal highest if applicable
KadiPlayerSchema.pre("save", function (next) {
  if (this.rating > this.seasonHighest) {
    this.seasonHighest = this.rating;
  }
  this.updateRankingTier();
  next();
});

const kadiPlayerModel =
  mongoose.models.KadiPlayer || mongoose.model("KadiPlayer", KadiPlayerSchema);

const baseOptions = { discriminatorKey: "playerType" };
const AvatarPlayerSchema = KadiPlayerSchema.discriminator(
  "AIAvatar",
  new mongoose.Schema(
    {
      creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    },
    baseOptions
  )
);

const AvatarPlayerModel =
  mongoose.models.AvatarPlayer ||
  mongoose.model("AvatarPlayer", AvatarPlayerSchema);

export { AvatarPlayerModel, kadiPlayerModel };
