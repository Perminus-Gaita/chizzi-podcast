import mongoose from 'mongoose';
import User from '@/models/user/index.model.js';
import Invite from '@/models/invite.model.js';
import { createNotificationDocumentAndPublishItToIotCoreTopic } from '@/services/notification/create-notification-document-and-publish-it-to-iot-core-topic'

// Connect to the database **Outside of handler function**
import connectToDatabaseMongoDB from '@/lib/database';
await connectToDatabaseMongoDB("inviteUserToAWorkspace")

// function to invite user to a workspace
export const inviteUserToAWorkspace = async (
    workspaceId, inviterId, inviteeId
) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        // Find the invitee, the user being invited.
        const invitee = await User.findById(inviteeId);
        if (!invitee) { throw new Error('Invitee not found'); }

        // Check if an invite already exists
        const existingInvite = await Invite.findOne({
            workspaceId,
            inviteeId: invitee._id,
            status: 'pending'
        });

        if (existingInvite) {
            throw new Error('An invite for this user is already pending');
        }

        // Create the invite
        const invite = new Invite({
            workspaceId,
            inviterId,
            inviteeId: invitee._id
        });
        await invite.save({ session });

        console.log({invite});

        // Create the notification
        const newNotification = await createNotificationDocumentAndPublishItToIotCoreTopic(
            {
                userId: invitee._id,
                recipientType: "userWorkspace",
                workspaceId: workspaceId,
                status: "info",
                type: "newWorkspaceInvite",
                message: `@USER:${inviterId} has invited you to join their workspace named: @WORKSPACE:${workspaceId}`,
                relatedId: invite._id,
                relatedModel: "Invite"
            },
            session
        )

        await session.commitTransaction();
        session.endSession();

        return { invite, notification: newNotification };
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

