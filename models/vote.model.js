import mongoose from "mongoose";

const VoteSchema = new mongoose.Schema(
  {
    giveawayId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Giveaway",
      required: true,
    },
    entryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Entry",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

const voteModel = mongoose?.models?.Vote || mongoose.model("Vote", VoteSchema);

export default voteModel;
