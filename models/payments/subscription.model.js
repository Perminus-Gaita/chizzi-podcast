import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  workspaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ["inactive", "active", "pastDue", "canceled", "pending"],
    default: "pending",
  },
  amount: {
    type: Number,
    validate: {
        validator: function (value) {
            return value > 0; // Check if amount is positive
        },
        message: "Amount must be a positive number",
    }
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true,
    validator: function(this, v) {
        return v > this.startDate;
    }
  },
  nextPaymentDate: {
    type: Date,
    required: true,
    validate: {
      validator: function(v) {
        return v > new Date();
      },
      message: 'Next payment date must be in the future'
    }
  },
  isInitialSubscription: {
    type: Boolean,
    required: true,
    default: true  // Changed to true
  },
  paymentMethod: {
    type: String,
    enum: ["wufwufWallet", "paystackCard", "paystackMpesa", "mpesa"],
    required: true
  },
  paystackSubscriptionCode: {  // Fixed typo
    type: String,
    required: function(this) {
      return ["paystackCard"].includes(this.paymentMethod);
    }
  },
  walletId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Wallet",
    required: function(this) {
      return ["wufwufWallet"].includes(this.paymentMethod);
    }
  },
  canceledAt: Date,
  cancelReason: String,
  trialEndDate: Date
}, {
  timestamps: true,  // Adds createdAt and updatedAt
  versionKey: false
});

// Index for efficient querying
SubscriptionSchema.index({ userId: 1, workspaceId: 1, status: 1 });

const subscriptionModel = mongoose.models.Subscription || mongoose.model("Subscription", SubscriptionSchema);

export default subscriptionModel;