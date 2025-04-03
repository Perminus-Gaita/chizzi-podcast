import mongoose from "mongoose";

const TelegramUserToAddToTournamentSchema = new mongoose.Schema(
    {
        userId: { // mongodb object id of user to add to tournament
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User",
            required: true
        },
        telegramUserId: { // telegram user to be added to tournament
            type: String,
            required: true,
            index: true
        },
        telegramGroupId: { // add user to tourna when they join this group
            type: String,
            required: true,
            index: true
        },
        tournamentId: { // tournament user will be added to
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Tournament",
            required: true
        },
        userHasBeenAddedToTournament: { // to track so that don't try to add twice
            type: Boolean,
            default: false
        },
    },
    {
        timestamps: true
    }
);

const TelegramUserToAddToTournament =
  mongoose.models.TelegramUserToAddToTournament ||
  mongoose.model("TelegramUserToAddToTournament", TelegramUserToAddToTournamentSchema);

export default TelegramUserToAddToTournament;
