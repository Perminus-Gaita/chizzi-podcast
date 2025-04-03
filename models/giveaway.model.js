import mongoose from "mongoose";

const GiveawaySchema = new mongoose.Schema({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  tags: [String],
  status: {
    type: String,
    enum: ["active", "ended", "cancelled"],
    default: "active",
  },
});

const giveawayModel =
  mongoose?.models?.Giveaway || mongoose.model("Giveaway", GiveawaySchema);

export default giveawayModel;
