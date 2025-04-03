import mongoose from "mongoose";

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
            "COMPLETED"
        ],
        default: "SCHEDULED",
    },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Participant" }],
    gameRoom: { type: mongoose.Schema.Types.ObjectId, ref: "CardsRoom" },
});

const MatchModel =
    mongoose.models.Match || mongoose.model("Match", MatchSchema);
  
export default MatchModel;

