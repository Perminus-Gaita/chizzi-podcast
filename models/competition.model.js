import mongoose from "mongoose";

const SponsorSchema = new mongoose.Schema({
  sponsorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  contributionType: {
    type: String,
    enum: ["cash", "product"],
    default: "cash",
    required: true,
  },
  contribution: {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    amount: { 
      type: Number, 
      min: 0
    },
    currency: { 
      type: String, 
      enum: ['USD', 'KES'],
    }
  },
});

const VoteSchema = new mongoose.Schema({
  voterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  timestamp: { type: Date, default: Date.now },
});

const ParticipantSchema = new mongoose.Schema({
  participantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  submission: { 
    tiktok: String,
    instagram: String,
    x: String,
    youtube: String,
    facebook: String,
  },
  votes: [VoteSchema] // Added votes array to each participant
});

const CompetitionSchema = new mongoose.Schema({
    name: { 
      type: String,
      required: true
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: { 
      type: String,
      enum: ["draft", "submissions", "voting", "closed"],
      default: "draft" 
    },
    startDate: { 
      type: Date, 
      required: true
    },
    endDate: { 
      type: Date, 
      required: true 
    },
    // prize: { type: String, required: true },
    sponsors: [SponsorSchema],
    participants: [ParticipantSchema],
    // Removed separate votes array
}, { timestamps: true }
);

const competitionModel = mongoose?.models?.Competition || mongoose.model("Competition", CompetitionSchema);

export default competitionModel;
