import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
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
    text: {
      type: String,
      required: true,
      minlength: [1, "Must be at least 1 character long"],
      maxlength: [200, "Cannot be more than 200 characters long"],
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

const commentModel =
  mongoose?.models?.Comment || mongoose.model("Comment", CommentSchema);

export default commentModel;
