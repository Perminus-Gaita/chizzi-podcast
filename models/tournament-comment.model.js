import mongoose from "mongoose";

const TournamentCommentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tournamentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
    },
    text: {
      type: String,
      required: true,
      minlength: [1, "Must be at least 1 character long"],
      maxlength: [500, "Cannot be more than 500 characters long"],
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isAnnouncement: {
      type: Boolean,
      default: false,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TournamentComment",
      default: null,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

TournamentCommentSchema.virtual("replies", {
  ref: "TournamentComment",
  localField: "_id",
  foreignField: "parentId",
});

TournamentCommentSchema.set("toObject", { virtuals: true });
TournamentCommentSchema.set("toJSON", { virtuals: true });

// Add indexes for better query performance
TournamentCommentSchema.index({ tournamentId: 1, createdAt: -1 });
TournamentCommentSchema.index({ userId: 1 });
TournamentCommentSchema.index({ parentId: 1 });

const TournamentComment =
  mongoose.models.TournamentComment ||
  mongoose.model("TournamentComment", TournamentCommentSchema);

export default TournamentComment;
