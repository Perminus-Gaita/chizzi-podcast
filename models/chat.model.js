import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    capped: { size: 1024 * 1024 * 5 }, // 5 MB size limit
    max: 5000, // Maximum number of documents
  },
  {
    versionKey: false,
  }
);

const ChatModel = mongoose.models.Chat || mongoose.model("Chat", ChatSchema);

export default ChatModel;
