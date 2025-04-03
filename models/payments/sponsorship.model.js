import mongoose from "mongoose";

const SponsorshipSchema = new mongoose.Schema(
  {
    sponsorId: {// id of the user sponsoring
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tournamentId: {// id of the workspace being sponsored.
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
    },
    type:{
      type: String,
      enum: ["direct", "product"],
      required: true
    },
    productId: { // id of the product bought for sponsoring
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    status: {
      type: String,
      enum: ["initiated", "processing", "success", "failed", "reversed"],
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
    // creatorAmount: {
    //   type: Number,
    //   required: true,
    // },
    // tournamentAmount: {
    //   type: Number,
    //   required: true,
    // },
    // platformFee: {
    //   type: Number,
    //   required: true,
    // },
    message: {
      type: String,
      required: false,
    },
    paymentMethod: {
      type: String,
      enum: [
        "pending",
        "wufwufWallet",
        "paystackCard",
        "paystackMpesa",
        "mpesa",
        "userManagedMpesa"
      ],
      required: true,
      default: "pending",
    },
    mpesaTransactionCode:{
      type: String,
      required: false,
    },
    walletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wallet",
      required: function () {
        return ["wufwufWallet"].includes(this.paymentMethod);
      },
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Index for efficient querying
SponsorshipSchema.index({ sponsorId: 1, tournamentId: 1, status: 1 });

const sponsorshipModel =
  mongoose.models.Sponsorship ||
  mongoose.model("Sponsorship", SponsorshipSchema);

export default sponsorshipModel;

// sponsorship objectId also doubles as
// paystack transaction reference
