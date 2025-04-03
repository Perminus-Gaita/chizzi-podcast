import mongoose from "mongoose";

const ProductCategorySchema = new mongoose.Schema({
  name: String,
  type: {
    type: String,
    enum: [
      "digital",
      "basic-merch",
      "premium-merch",
      "exclusive-digital",
      "limited-edition",
      "custom-merch",
      "exclusive-experience",
    ],
  },
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: {
    amount: { type: Number, required: true, min: 100 },
    currency: {
      type: String,
      required: true,
      enum: ["USD", "KES"], // Only USD and Kenyan Shilling allowed
    },
  },
  image: String,
  // inventory: { type: Number, required: true },
  // sold: { type: Number, default: 0 },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  tierId: { type: String, required: true }, // References SponsorshipTier id
  category: ProductCategorySchema,
  featured: { type: Boolean, default: false },
  // type: {
  //   type: String,
  //   enum: ["physical", "digital"],
  //   required: true,
  // },
  // Ownership & Transfer tracking
  currentOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  ownershipHistory: [
    {
      owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      acquiredAt: { type: Date, default: Date.now },
      transactionType: {
        type: String,
        enum: ["created", "sponsored", "won", "transferred"],
      },
    },
  ],
  // Redemption tracking
  isRedeemed: { type: Boolean, default: false },
  redemptionDetails: {
    redeemedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    redeemedAt: Date,
    shippingAddress: String,
    phoneNumber: String,
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered"],
      default: "pending",
    },
  },
  // Tournament usage tracking
  usedInTournaments: [
    {
      tournament: { type: mongoose.Schema.Types.ObjectId, ref: "Tournament" },
      usedAs: {
        type: String,
        enum: ["prize", "sponsorship"],
      },
      usedAt: { type: Date, default: Date.now },
    },
  ],
  // Viral mechanics
  transferCount: { type: Number, default: 0 },
  tournamentWins: { type: Number, default: 0 },
});

const productModel =
  mongoose.models.Product || mongoose.model("Product", productSchema);

export default productModel;
