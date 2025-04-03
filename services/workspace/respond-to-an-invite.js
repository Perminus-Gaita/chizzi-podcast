import mongoose from 'mongoose';
import User from '@/models/user/index.model.js';
import Invite from '@/models/invite.model.js';
import { createNotificationDocumentAndPublishItToIotCoreTopic } from '@/services/notification/create-notification-document-and-publish-it-to-iot-core-topic'

// Connect to the database **Outside of handler function**
import connectToDatabaseMongoDB from '@/lib/database';
await connectToDatabaseMongoDB("respondToAnInvite")

// Function to handle invite response
export const respondToAnInvite = async (inviteId, inviteResponse, inviteeId) => {
    const session = await mongoose.startSession();
    session.startTransaction();
  
    try {
        const invite = await Invite.findById(inviteId);
        if (!invite) {
            throw new Error('Invite not found');
        }

        if(invite.inviteeId.toString() != inviteeId.toString()){
            throw new Error('This invite does not belong to session user.');
        }
  
        if (invite.status !== 'pending') {
            throw new Error('This invite has already been processed');
        }
  
        invite.status = inviteResponse // can either be accepted or declined;
        await invite.save({ session });
  
        let notificationMessage;
        let notificationType;        
        if (inviteResponse === 'accepted') {
            const workspace = await User.findById(invite.workspaceId);
            workspace.members.push({
                userId: invite.inviteeId,
                role: 'viewer' // or whatever default role you want to assign
            });
            await workspace.save({ session });
            notificationType = "acceptedWorkspaceInvite";
            notificationMessage = `@USER:${invite.inviteeId} has accepted your invite and is now part of your workspace @WORKSPACE:${invite.workspaceId}`;
        } else {
            notificationType = "declinedWorkspaceInvite";
            notificationMessage = `@USER:${invite.inviteeId} has declined your invitation to join the workpace @WORKSPACE:${invite.workspaceId}`;
        }
  
        // Create the notification to notify the inviter
        const newNotification = await createNotificationDocumentAndPublishItToIotCoreTopic(
            {
                userId: invite.inviterId,
                recipientType: "userWorkspace",
                workspaceId: invite.workspaceId,
                status: "info",
                type: notificationType,
                message: notificationMessage,
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

