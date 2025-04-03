import mongoose from 'mongoose';
import User from '@/models/user/index.model.js';

// Connect to the database **Outside of handler function**
import connectToDatabaseMongoDB from '@/lib/database';
await connectToDatabaseMongoDB("removeMemberFromWorkspace")

export const removeMemberFromWorkspace = async (memberUserId, requestingUserId, workspaceId) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Validate inputs
        if (!memberUserId || !requestingUserId || !workspaceId) {
            throw new Error('Missing required parameters');
        }

        // Find the workspace and validate it exists
        const workspace = await User.findOne({
            _id: workspaceId,
            type: { $in: ['individual', 'workspace'] }
        });

        if (!workspace) {
            throw new Error('Workspace not found');
        }

        // For individual workspaces, prevent removing the owner
        if (workspace.type === 'individual') {
            if (workspace._id.toString() === memberUserId.toString()) {
                throw new Error('Cannot remove an individual from their own workspace');
            }
        }

        // Validate that the requesting user is an admin of the workspace
        const requestingMember = workspace.members.find(
            member => member.userId.toString() === requestingUserId.toString()
        );

        if (!requestingMember) {
            throw new Error('Requesting user is not a member of this workspace');
        }

        if (requestingMember.role !== 'admin') {
            throw new Error('Only workspace admins can remove members');
        }

        // Find the member to be removed
        const memberToRemove = workspace.members.find(
            member => member.userId.toString() === memberUserId.toString()
        );

        if (!memberToRemove) {
            throw new Error('User to be removed is not a member of this workspace');
        }

        // Special validation for workspace creator in workspace type
        if (workspace.type === 'workspace' && 
            workspace.creator.toString() === memberToRemove.userId.toString()) {
            // Only allow creator to remove themselves
            if (requestingUserId.toString() !== memberToRemove.userId.toString()) {
                throw new Error('Workspace creator can only be removed by themselves');
            }
        }

        // If removing an admin, check if they're the last admin
        if (memberToRemove.role === 'admin') {
            const adminCount = workspace.members.reduce((count, member) => 
                member.role === 'admin' ? count + 1 : count, 0);
            
            if (adminCount <= 1) {
                throw new Error('Cannot remove the last admin from the workspace');
            }
        }

        // Remove the member
        workspace.members = workspace.members.filter(
            member => member.userId.toString() !== memberUserId.toString()
        );

        // Save the changes
        await workspace.save({ session });

        await session.commitTransaction();
        session.endSession();

        return { 
            success: true,
            message: 'Member successfully removed from workspace',
            workspace
        };
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};