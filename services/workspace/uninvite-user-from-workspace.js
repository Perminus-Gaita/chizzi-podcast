import mongoose from 'mongoose';
import Invite from '@/models/invite.model.js';
import Notification from '@/models/notification.model.js';

// Connect to the database
import connectToDatabaseMongoDB from '@/lib/database';
await connectToDatabaseMongoDB("uninviteUserFromWorkspace");

export const uninviteUserFromWorkspace = async (
    workspaceId,
    inviterId,
    inviteeId
) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Find the pending invite
        const invite = await Invite.findOne({
            workspaceId,
            inviterId,
            inviteeId,
            status: 'pending'
        });

        // If no invite exists
        if (!invite) {
            throw new Error('Invite not found');
        }

        // If invite exists but is not pending
        if (invite.status !== 'pending') {
            throw new Error('Cannot uninvite user - invite has already been accepted or declined');
        }

        // Find and delete the associated notification
        await Notification.deleteOne({
            userId: inviteeId,
            workspaceId: workspaceId,
            type: "newWorkspaceInvite",
            relatedId: invite._id,
            relatedModel: "Invite"
        }, { session });

        // Delete the invite
        await Invite.deleteOne({ _id: invite._id }, { session });

        await session.commitTransaction();
        session.endSession();

        return { message: 'Successfully uninvited user' };

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

// Example usage:
// try {
//     const result = await uninviteUserFromWorkspace(workspaceId, inviterId, inviteeId);
//     console.log(result);
// } catch (error) {
//     console.error('Error uninviting user:', error.message);
// }