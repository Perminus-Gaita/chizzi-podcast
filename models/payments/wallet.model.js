import mongoose, { Schema } from "mongoose";

// Create a reusable currency schema
const CurrencySchema = new mongoose.Schema(
  {
    balance: {
      type: Number,
      default: 0,
      required: true,
      validate: {
        validator: function (v) {
          return v >= 0;
        },
        message: (props) =>
          `${props.value} is not a valid balance. Balance must be non-negative.`,
      },
    },
  },
  { _id: false }
);

const WalletSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["individual", "workspace"],
      default: "individual",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      sparse: true,
      required: function () {
        return this.type === "individual";
      },
    },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      sparse: true,
      required: function () {
        return this.type === "workspace";
      },
    },
    balances: {
      KES: CurrencySchema,
      USD: CurrencySchema,
    }
  },
  {
    timestamps: true
  }
);
const WalletModel =
  mongoose.models.Wallet || mongoose.model("Wallet", WalletSchema);

export default WalletModel;
