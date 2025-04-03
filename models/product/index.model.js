import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    initialOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    currentOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductOwnershipHistory",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    groupName: {
      type: String,
      required: true,
    },
    image: String,
    description: String,
    type: {
      type: String,
      enum: ["digital", "physical"],
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create a compound index on initialOwner+groupName+name combination.
productSchema.index({ initialOwner: 1, groupName: 1, name: 1 }, { unique: true });

// Add error handling for duplicate key error
productSchema.post("save", function (error, doc, next) {
  if (error.code === 11000 && error.keyPattern) {
    if (error.keyPattern.initialOwner && error.keyPattern.groupName && error.keyPattern.name) {
      next(
        new Error(
          `Product name '${doc.name}' already exists in group '${doc.groupName}' for this owner`
        )
      );
    }
  } else {
    next(error);
  }
});

const productModel =
  mongoose.models.Product || mongoose.model("Product", productSchema);

export default productModel;