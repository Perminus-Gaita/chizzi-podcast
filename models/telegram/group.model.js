import mongoose from "mongoose";

const TelegramGroupSchema = new mongoose.Schema(
  {
    telegramGroupId: {
      type: String,
      unique: true,
      required: true
    },
    telegramUserId: { // user who added bot to group
      type: String,
      required: true,
      index: true
    },
    groupName: {
      type: String,
      required: true
    },
    profilePicture: String,
    groupType: {
      type: String,
      required: true
    },
    memberCount: {
      type: Number,
      required: true
    },
    wufwufBotRole: {
      type: String,
      enum: ['notInGroup', 'member', 'admin'],
      required: true,
      default: 'notInGroup'
    },
    botPermissions: {
      canInviteViaLink: {
        type: Boolean,
        default: false
      },
      canManageStories: {
        type: Boolean,
        default: false
      }
    },
    allMembersAreAdministrators: Boolean,
    primaryInviteLink: String,
    hasSentFinalBotStatusMessage: {
      type: Boolean,
      default: false
    },
  },
  {
    timestamps: true
  }
);

const TelegramGroup =
  mongoose.models.TelegramGroup ||
  mongoose.model("TelegramGroup", TelegramGroupSchema);

export default TelegramGroup;