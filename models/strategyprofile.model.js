import mongoose from "mongoose";

const StrategyProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  version: {
    type: Number,
    default: 1,
  },
  data: {
    type: Object,
    required: true,
  },
  performance: {
    gamesPlayed: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    avgMoveTime: { type: Number, default: 0 },
    specialMoves: {
      jumpCards: { type: Number, default: 0 },
      kickbackCards: { type: Number, default: 0 },
      aceDeclarations: { type: Number, default: 0 },
      penaltyAvoidances: { type: Number, default: 0 },
    },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const StrategyProfileModel =
  mongoose.models.StrategyProfile ||
  mongoose.model("StrategyProfile", StrategyProfileSchema);

export default StrategyProfileModel;
