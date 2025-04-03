import mongoose from "mongoose";

const ProductPurchaseSchema = new mongoose.Schema(
  {
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    tournamentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
    },
    status: {
      type: String,
      enum: ["initiated", "processing", "success", "failed", "refunded"],
      default: "initiated",
    },
    // Payment details
    amount: {
      type: Number,
      required: true,
    },
    creatorAmount: {
      type: Number,
      required: true,
    },
    tournamentAmount: {
      type: Number,
      required: true,
    },
    platformFee: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    paymentReference: String,
    paymentProviderId: String, // Paystack transaction ID
    paymentMetadata: Object, // Additional payment provider data

    // Fulfillment tracking
    fulfillmentStatus: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    shippingAddress: {
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String,
      phoneNumber: String,
    },
    trackingNumber: String,
    deliveredAt: Date,

    // Associated sponsorship
    sponsorshipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sponsorship",
    },

    // Funds distribution tracking
    fundsDistributed: {
      type: Boolean,
      default: false,
    },
    creatorPaid: {
      type: Boolean,
      default: false,
    },
    creatorPaymentReference: String,
    tournamentContributionProcessed: {
      type: Boolean,
      default: false,
    },

    // Support/dispute tracking
    supportTicketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SupportTicket",
    },
    disputeStatus: {
      type: String,
      enum: ["none", "opened", "investigating", "resolved", "closed"],
      default: "none",
    },
    refundStatus: {
      type: String,
      enum: ["none", "requested", "processing", "completed", "denied"],
      default: "none",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common queries
ProductPurchaseSchema.index({ buyerId: 1, status: 1 });
ProductPurchaseSchema.index({ productId: 1, status: 1 });
ProductPurchaseSchema.index({ tournamentId: 1, status: 1 });
ProductPurchaseSchema.index({ sponsorshipId: 1 });
ProductPurchaseSchema.index({ createdAt: -1 });

// Pre-save hook to validate amounts
ProductPurchaseSchema.pre("save", function (next) {
  const total = this.creatorAmount + this.tournamentAmount + this.platformFee;
  if (total !== this.amount) {
    next(new Error("Amount distribution does not match total amount"));
  }
  next();
});

// Virtual for calculating profit margins
ProductPurchaseSchema.virtual("margins").get(function () {
  return {
    creatorPercentage: (this.creatorAmount / this.amount) * 100,
    tournamentPercentage: (this.tournamentAmount / this.amount) * 100,
    platformPercentage: (this.platformFee / this.amount) * 100,
  };
});

const ProductPurchaseModel =
  mongoose.models.ProductPurchase ||
  mongoose.model("ProductPurchase", ProductPurchaseSchema);

export default ProductPurchaseModel;
