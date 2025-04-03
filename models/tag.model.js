const mongoose = require("mongoose");

const tagSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    color: {
      type: String,
      default: "#000000",
      validate: {
        validator: function (v) {
          return /^#[0-9A-F]{6}$/i.test(v);
        },
        message: (props) => `${props.value} is not a valid hex color!`,
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure uniqueness of tag names per user
tagSchema.index({ userId: 1, name: 1 }, { unique: true });

// Pre-save hook to update the 'updatedAt' timestamp
tagSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const tagModel = mongoose.models.Tag || mongoose.model("Tag", tagSchema);

export default tagModel;
