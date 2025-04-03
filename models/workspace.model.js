import mongoose from "mongoose";
import WalletModel from "./payments/wallet.model.js";

const WorkspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: [1, "Name must be at least 1 character long"],
      maxlength: [40, "Name cannot be more than 40 characters long"],
    },
    username: {
      type: String,
      required: true,
      minlength: [3, "Username must be at least 3 characters long"],
      maxlength: [40, "Username cannot be more than 40 characters long"],
      unique: [true, "Username not available. Try another one"],
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    users: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        role: {
          type: String,
          enum: ["admin", "editor", "viewer"],
          default: "viewer",
        },
      },
    ],
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
    },
    profilePicture: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

WorkspaceSchema.post("save", async function (doc, next) {
  try {
    // Create a Wallet for new workspaces
    if (doc && doc._id && doc.isNew) {
      const wallet = new WalletModel({
        type: "workspace",
        teamId: doc._id,
        balance: 0,
        currency: "KES", // or whatever default currency you prefer
      });
      await wallet.save();
    }
    next();
  } catch (error) {
    next(error);
  }
});

const workspaceModel =
  mongoose?.models?.Workspace || mongoose.model("Workspace", WorkspaceSchema);

export default workspaceModel;
