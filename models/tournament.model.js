import mongoose from "mongoose";

// Participant Model
const ParticipantSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    matchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Match",
      required: true,
    },
    tournamentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
    },
    tournamentType: {
      type: String,
      enum: ["paid", "sponsored", null],
      required: true,
    },
    name: { type: String, required: true },
    resultText: { type: String, default: null },
    isWinner: { type: Boolean, default: false },

    // if tournament type is buy-in
    buyInDetails: {
      transactionId: mongoose.Schema.Types.ObjectId,
      transactionType: String,
      amount: Number,
      currency: String,
      referenceNote: String,
      verified: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  }
);

const ParticipantModel =
  mongoose.models.Participant ||
  mongoose.model("Participant", ParticipantSchema);

// Match Model
const MatchSchema = new mongoose.Schema(
  {
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
        "COMPLETED",
      ],
      default: "SCHEDULED",
    },
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Participant" },
    ],
    gameRoom: { type: mongoose.Schema.Types.ObjectId, ref: "CardsRoom" },
  },
  { timestamps: true }
);

const MatchModel =
  mongoose.models.Match || mongoose.model("Match", MatchSchema);

const GameSettingsSchema = new mongoose.Schema({
  // Joker cards settings
  includeJokers: {
    type: Boolean,
    default: true,
    description: "Whether Joker cards are included in the deck",
  },

  // Timer settings
  timerEnabled: {
    type: Boolean,
    default: false,
    description: "Whether games are timed or async",
  },

  // Timer duration in seconds (30 seconds default)
  turnDuration: {
    type: Number,
    default: 30,
    min: 15,
    max: 120,
    description: "Duration of each turn in seconds",
  },

  // Reminder settings
  reminderEnabled: {
    type: Boolean,
    default: true,
    description: "Whether to send turn reminders",
  },

  reminderInterval: {
    type: Number,
    default: 10,
    min: 5,
    max: 30,
    description: "How many seconds before turn end to send reminder",
  },
});

const ContactInfoSchema = new mongoose.Schema({
  email: {
    type: String,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
  },
  telegram: {
    type: String,
    trim: true,
  },
});

// const SponsorshipTierSchema = new mongoose.Schema({
//   id: String,
//   name: { type: String, required: true },
//   amount: { type: Number, required: true },
//   percentage: { type: Number, required: true },
//   maxSponsors: { type: Number, default: 0 },
//   currentSponsors: { type: Number, default: 0 },
//   perks: [String],
//   icon: {
//     type: String,
//     enum: ["medal", "trophy", "crown", "gift"],
//     required: true,
//   },
//   color: { type: String, required: true },
// });

const SponsorshipTierSchema = new mongoose.Schema({
  id: String,
  name: { type: String, required: true },
  icon: {
    type: String,
    enum: ["users", "shield", "trophy", "crown"],
    required: true,
  },
  color: { type: String, required: true },
  bgColor: { type: String, required: true },
  amount: { type: Number, required: true },
  percentage: { type: Number, required: true },
  maxSponsors: { type: Number, default: 0 },
  currentSponsors: { type: Number, default: 0 },
  directSponsorshipPerks: [String],
  productPerks: [String],
  productStrategy: {
    maxProducts: { type: Number, required: true },
    priceRange: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
    },
    recommendedTypes: [String],
  },
});

// Tournament Model
const TournamentSchema = new mongoose.Schema(
  {
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    telegramGroupId: String,
    description: {
      type: String,
      trim: true,
      default: null,
    },
    // paymentInformation: {
    //   type: {
    //     type: String,
    //     enum: ["phoneNumber", "mpesaPaybill", "lipaNaMpesa"],
    //     required: false,
    //   },
    //   details: {
    //     type: String,
    //     required: false,
    //   },
    //   verified: { type: Boolean, default: false }, // Add verification status
    // },
    requireTelegram: {
      type: Boolean,
      default: true,
    },
    game: {
      type: String,
      enum: ["kadi"],
      required: true,
    },
    // New game settings field
    gameSettings: {
      type: GameSettingsSchema,
      default: () => ({}), // This will use all the defaults defined above
    },
    // Match schedule tracking
    matchSchedule: {
      type: [
        {
          matchId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Match",
          },
          scheduledTime: {
            type: Date,
            required: true,
          },
          round: {
            type: Number,
            required: true,
          },
          bufferTimeMinutes: {
            type: Number,
            default: 15,
            min: 5,
            max: 60,
          },
        },
      ],
      default: [], // OPTIONAL
    },
    autoStart: {
      type: Boolean,
      default: false,
    },
    format: {
      type: String,
      enum: ["single elimination", "double elimination", null],
      required: true,
    },
    startDate: { type: Date, default: null },
    maxDuration: { type: String, default: null },
    type: {
      type: String,
      enum: ["paid", "sponsored", null],
      default: null,
    },

    // Enhanced sponsorship tracking
    sponsorshipDetails: {
      targetAmount: { type: Number, default: 0 },
      currentAmount: { type: Number, default: 0 },
      scale: { type: String, enum: ["micro", "small", "medium", "large"] },
      tiers: [SponsorshipTierSchema],
      totalSponsors: { type: Number },
      sponsors: [
        {
          sponsorshipId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Sponsorship",
            required: true,
          },
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
          amount: {
            type: Number,
            required: true,
            validate: {
              validator: function (value) {
                return value > 0; // Check if amount is positive
              },
              message: "Amount must be a positive number",
            },
          },
          currency: {
            type: String,
            enum: ["KES", "USD"],
            default: "KES",
            required: true,
          },
          sponsoredAt: { type: Date, default: Date.now },
        },
      ],
    },

    // Sponsored Prize pool tracking
    prizePool: {
      totalValue: { type: Number, default: 0 },
    },

    prizeDistribution: {
      first: { type: Number, default: 100 },
      second: { type: Number, default: 0 },
      third: { type: Number, default: 0 },
    },

    // // Sponsored Payment distribution
    // paymentDistribution: {
    //   creatorShare: { type: Number, default: 70 }, // 70%
    //   winnerShare: { type: Number, default: 25 }, // 25%
    //   platformShare: { type: Number, default: 5 }, // 5%
    // },

    // Add to TournamentSchema
    buyIn: {
      entryFee: { type: Number, min: 0, max: 20000 },
      prizePool: { type: Number },
      // milestones: [{
      //   target: Number, // number of participants
      //   bonus: Number, // bonus added to prize pool
      //   achieved: { type: Boolean, default: false }
      // }],
      // earlyBirdDiscount: {
      //   enabled: { type: Boolean, default: false },
      //   amount: { type: Number, default: 0 },
      //   endDate: Date
      // }
    },

    numberOfParticipants: {
      type: Number,
      min: 4,
      default: null,
    },
    status: {
      type: String,
      enum: ["draft", "setup", "ready", "in-progress", "completed"],
      default: "draft",
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    brandingLogo: {
      type: String,
      default: null,
    },
    customBannerImage: {
      type: String,
      default: null,
    },
    customTableBackgroundImage: {
      type: String,
      required: true,
    },
    customCardSkinImage: {
      type: String,
      required: true,
    },

    contactInfo: {
      type: ContactInfoSchema,
      default: null,
      required: false,
    },

    // Viral mechanics
    viewCount: { type: Number, default: 0 },
    shareCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Add index for faster lookups
// TournamentSchema.index({ slug: 1 });
TournamentSchema.index({ status: 1 });
TournamentSchema.index({ "matchSchedule.scheduledTime": 1 });

// Ensure buffer time between matches
TournamentSchema.pre("save", function (next) {
  if (this.matchSchedule && this.matchSchedule.length > 1) {
    // Sort matches by scheduled time
    this.matchSchedule.sort((a, b) => a.scheduledTime - b.scheduledTime);

    // Check buffer times
    for (let i = 1; i < this.matchSchedule.length; i++) {
      const timeDiff =
        this.matchSchedule[i].scheduledTime -
        this.matchSchedule[i - 1].scheduledTime;
      const minBuffer = this.matchSchedule[i - 1].bufferTimeMinutes * 60 * 1000;

      if (timeDiff < minBuffer) {
        next(new Error("Insufficient buffer time between matches"));
        return;
      }
    }
  }
  next();
});

const TournamentModel =
  mongoose.models.Tournament || mongoose.model("Tournament", TournamentSchema);

export { TournamentModel, MatchModel, ParticipantModel };
