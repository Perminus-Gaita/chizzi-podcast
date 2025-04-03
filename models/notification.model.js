import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipientType: {
      type: String,
      enum: ["userPersonal", "userWorkspace", "allWorkspaceMembers"],
    },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        return (
          this.recipientType === "userWorkspace" ||
          this.recipientType === "allWorkspaceMembers"
        );
      },
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      enum: [
        // workspace invites
        "newWorkspaceInvite",
        "acceptedWorkspaceInvite",
        "declinedWorkspaceInvite",

        // subscribing to a plan
        "successSubscribingToAPlan",
        "errorSubscribingToAPlan",

        // depositing to wufwuf
        "successDepositing",
        "errorDepositing",

        //sponsoring a tournament
        "successSponsoringTournament",
        "errorSponsoringTournament",

        // Tournament Creation & Setup
        "tournamentCreated",
        "tournamentModified",
        "tournamentCancelled",
        "tournamentStartingSoon",

        "tournamentStarted",

        // Tournament Registration
        "tournamentJoin",
        "tournamentLeave",
        "tournamentInvite",

        "registrationConfirmed",
        "registrationReminder",
        "registrationClosing",

        // organizer notifications
        "tournamentParticipantJoined",
        "tournamentParticipantLeft",

        // Tournament Progress(use)
        "matchReady",
        "matchResult",
        "roundAdvancement",

        "matchStarting",
        "matchReminder",
        "tournamentElimination",

        // Tournament Completion
        "tournamentVictory",
        "tournamentComplete",
        "prizeAwarded",

        // Tournament Sponsorship
        "tournamentSponsored",
        "sponsorshipGoalReached",
        "sponsorshipUpdate",

        // Streaming & Spectating
        "featuredMatch",
        "highStakesMatch",
        "streamGoingLive",

        // Product redemption notification types
        "productRedemptionRequested",
        "productRedemptionProcessing",
        "productRedemptionShipped",
        "productRedemptionDelivered",
      ],
    },
    status: {
      type: String,
      enum: ["success", "error", "info", "warning"],
    },
    message: {
      type: String,
    },
    mentions: [
      {
        type: String,
        match: /^@(USER|WORKSPACE):[a-zA-Z0-9]+$/,
      },
    ],
    details: {
      type: String,
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "relatedModel",
    },
    relatedModel: {
      type: String,
      enum: ["Post", "Invite", "User", "Tournament", "Match", "Sponsorship", "Product"],
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to extract mentions from the message
NotificationSchema.pre("save", function (next) {
  const mentionRegex = /@(USER|WORKSPACE):[a-zA-Z0-9]+/g;
  this.mentions = (this.message && this.message.match(mentionRegex)) || [];
  next();
});

const notificationModel =
  mongoose.models.Notification ||
  mongoose.model("Notification", NotificationSchema);

export default notificationModel;
