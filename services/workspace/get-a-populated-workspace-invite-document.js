import InviteModel from '@/models/invite.model';

// Connect to the database **Outside of handler function**
import connectToDatabaseMongoDB from '@/lib/database';
await connectToDatabaseMongoDB("getAPopulatedWorkspaceInviteDocument");

export async function getAPopulatedWorkspaceInviteDocument(inviteId, inviteeId) {
    try {
        if (!inviteId) {
            throw new Error('Invite ID is required');
        }
        if (!inviteeId) {
            throw new Error('Invitee ID is required');
        }

        const populatedInviteDocument = await InviteModel.findOne({
            _id: inviteId,
            inviteeId: inviteeId
        })
        .populate({
            path: 'workspaceId',
            select: '_id name username profilePicture type members',
        })
        .populate({
            path: 'inviterId',
            select: '_id name username profilePicture type',
            // Ensure we're only getting individual type documents
            match: { type: 'individual' }
        })
        .populate({
            path: 'inviteeId',
            select: '_id name username profilePicture type',
            // Ensure we're only getting individual type documents
            match: { type: 'individual' }
        });

        if (!populatedInviteDocument) {
            throw new Error('Invite not found or does not match the provided invitee');
        }

        // Verify all references were populated correctly
        if (!populatedInviteDocument.workspaceId) {
            throw new Error('Referenced workspace not found or is not of type workspace');
        }
        if (!populatedInviteDocument.inviterId) {
            throw new Error('Referenced inviter not found or is not of type individual');
        }
        if (!populatedInviteDocument.inviteeId) {
            throw new Error('Referenced invitee not found or is not of type individual');
        }

        return populatedInviteDocument;
    } catch (error) {
        console.error('Error in getAPopulatedWorkspaceInviteDocument service:', error);
        throw error;
    }
}
