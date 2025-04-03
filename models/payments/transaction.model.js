import mongoose from "mongoose";
import WalletModel from "./wallet.model.js";

// transaction objectId also doubles as
// paystack transaction reference
const TransactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "deposit",
        "withdraw",
        "buyIn",
        "payOut",
        "gameCancelled",
        "tournamentBuyIn",
        "tournamentPayOut",
        "tournamentRefund",
        "tournamentCancelled",
        "tournamentPrize",

        "tournamentCreatorShare",
      ],
      required: true,
    },
    status: {
      type: String,
      enum: ["initiated", "processing", "success", "failed", "reversed"],
      required: true,
      // set: function (value) {
      //   if (value === "success" && !this.$isUsingStaticMethod) {
      //     throw new Error(
      //       "Cannot set status to success directly. Use updateTransactionAndWallet static method."
      //     );
      //   }
      //   return value;
      // },
    },
    transactionBelongsTo: {
      type: String,
      enum: ["individual", "workspace"],
      default: "individual",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    walletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wallet",
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
    paymentMethod: {
      type: String,
      enum: [
        "pending",
        "wufwufWallet",
        "mpesa",
        "paystackCard",
        "paystackMpesa",
      ],
      default: "wufwufWallet",
    },
    paystackRecipientCode: {
      type: String,
    },
    gameId: {
      type: mongoose.Schema.Types.ObjectId,
      //ref: 'Team', to add later
      required: function () {
        return (
          this.type === "buyIn" ||
          this.type === "payOut" ||
          this.type === "gameCancelled"
        );
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Define the function for updateTransactionAndWallet used while depositing and withdrawing.
async function updateTransactionAndWallet(
  transactionId,
  newStatus,
  updateData,
  session
) {
  // Find the transaction first
  const transaction = await this.findById(transactionId).session(session);
  if (!transaction) {
    throw new Error("Transaction not found");
  }

  if (newStatus !== "success") {
    throw new Error("This method can only be used to set status to success");
  }

  if (transaction.status === "success") {
    throw new Error("Transaction is already marked as success");
  }

  // Find the wallet using the walletId from the transaction
  const wallet = await WalletModel.findById(transaction.walletId).session(
    session
  );
  if (!wallet) {
    throw new Error("Wallet not found");
  }

  // Determine if we're adding or subtracting from the wallet
  const isAddingFunds = ["deposit", "payOut"].includes(transaction.type);
  const isRemovingFunds = ["withdraw", "buyIn"].includes(transaction.type);

  // Update wallet balance
  if (isAddingFunds || isRemovingFunds) {
    const balanceField = `balances.${transaction.currency}.balance`;
    const currentBalance = wallet.balances[transaction.currency].balance;
    if (isRemovingFunds && currentBalance < transaction.amount) {
      throw new Error("Insufficient funds");
    }
    const updateAmount = isAddingFunds
      ? transaction.amount
      : -transaction.amount;
    await WalletModel.updateOne(
      { _id: transaction.walletId },
      { $inc: { [balanceField]: updateAmount } },
      { session }
    );
  }

  // Update the transaction
  transaction.$isUsingStaticMethod = true;
  transaction.status = "success";

  // Apply additional updates from updateData
  if (updateData && typeof updateData === "object") {
    Object.keys(updateData).forEach((key) => {
      if (key !== "status" && key !== "_id" && key in transaction) {
        transaction[key] = updateData[key];
      }
    });
  }

  await transaction.save({ session });

  // Fetch the updated wallet
  const updatedWallet = await WalletModel.findById(
    transaction.walletId
  ).session(session);

  return { transaction, wallet: updatedWallet };
}

// static for creating a transaction and updating wallet
async function createTransactionAndUpdateWallet(transactionData, session) {
  const { type, walletId, amount, currency, ...otherData } = transactionData;

  // Validate transaction type
  if (
    !["buyIn", "payOut", "deposit", "withdraw", "gameCancelled"].includes(type)
  ) {
    throw new Error("Invalid transaction type");
  }

  // Find the wallet
  const wallet = await WalletModel.findById(walletId).session(session);
  if (!wallet) {
    throw new Error("Wallet not found");
  }

  // Determine if we're adding or subtracting from the wallet
  const isAddingFunds = ["deposit", "payOut", "gameCancelled"].includes(type);
  const isRemovingFunds = ["withdraw", "buyIn"].includes(type);

  // Check for sufficient funds if removing
  if (isRemovingFunds) {
    const currentBalance = wallet.balances[currency].balance;
    if (currentBalance < amount) {
      throw new Error("Insufficient funds");
    }
  }

  // Update wallet balance
  const balanceField = `balances.${currency}.balance`;
  const updateAmount = isAddingFunds ? amount : -amount;
  await WalletModel.updateOne(
    { _id: walletId },
    { $inc: { [balanceField]: updateAmount } },
    { session }
  );

  // Create the transaction
  const transaction = new this({
    type,
    walletId,
    amount,
    currency,
    status: "success",
    ...otherData,
  });

  transaction.$isUsingStaticMethod = true;
  await transaction.save({ session });

  // Fetch the updated wallet
  const updatedWallet = await WalletModel.findById(walletId).session(session);

  return { transaction, wallet: updatedWallet };
}

// Attach both functions to the schema's statics
TransactionSchema.statics.updateTransactionAndWallet =
  updateTransactionAndWallet;
TransactionSchema.statics.createTransactionAndUpdateWallet =
  createTransactionAndUpdateWallet;
// Middleware to reset the flag after save
TransactionSchema.post("save", function () {
  this.$isUsingStaticMethod = false;
});

const TransactionModel =
  mongoose.models.Transaction ||
  mongoose.model("Transaction", TransactionSchema);

export default TransactionModel;
