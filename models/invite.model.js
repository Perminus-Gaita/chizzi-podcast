import mongoose from 'mongoose';

// Invite Schema
const InviteSchema = new mongoose.Schema({
    workspaceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    inviterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    inviteeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'declined'],
        default: 'pending'
    },
//   expiresAt: {
//     type: Date,
//     default: () => new Date(+new Date() + 7*24*60*60*1000) // 7 days from now
//   }
}, { timestamps: true });

const inviteModel =
  mongoose.models.Invite ||
  mongoose.model("Invite", InviteSchema);

export default inviteModel

