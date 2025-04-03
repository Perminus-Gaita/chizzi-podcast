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

export default ParticipantModel;
