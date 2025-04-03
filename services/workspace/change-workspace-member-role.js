import mongoose from 'mongoose';
import User from '@/models/user/index.model.js';

// Connect to the database **Outside of handler function**
import connectToDatabaseMongoDB from '@/lib/database';
await connectToDatabaseMongoDB("changeWorkspaceMemberRole")

// Function to handle changing a workspace member role
export const changeWorkspaceMemberRole = async (newRole, memberUserId, workspaceId, requestingUserId) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Validate inputs
        if (!newRole || !memberUserId || !workspaceId || !requestingUserId) {
            throw new Error('Missing required parameters');
        }

        // Validate role
        if (!['admin', 'editor', 'viewer'].includes(newRole)) {
            throw new Error('Invalid role specified');
        }

        // Find the workspace and validate it exists
        const workspace = await User.findOne({
            _id: workspaceId,
            // type: 'workspace'
        });

        if (!workspace) {
            throw new Error('Workspace not found');
        }

        // Validate that the requesting user is an admin of the workspace
        const requestingMember = workspace.members.find(
            member => member.userId.toString() === requestingUserId.toString()
        );

        if (!requestingMember || requestingMember.role !== 'admin') {
            throw new Error('Only workspace admins can change member roles');
        }

        // Find the member whose role is being changed
        const memberIndex = workspace.members.findIndex(
            member => member.userId.toString() === memberUserId.toString()
        );

        if (memberIndex === -1) {
            throw new Error('User is not a member of this workspace');
        }

        // Special validation for workspace creator
        if (workspace.creator.toString() === memberUserId.toString()) {
            // If trying to change creator's role
            if (requestingUserId.toString() !== memberUserId && workspace.members[memberIndex].role === 'admin') {
                throw new Error('Only the workspace creator can change their own role');
            }
        }

        // Check if this would remove the last admin
        if (workspace.members[memberIndex].role === 'admin' && newRole !== 'admin') {
            // Count remaining admins
            const adminCount = workspace.members.reduce((count, member) => 
                member.role === 'admin' ? count + 1 : count, 0);
            
            if (adminCount <= 1) {
                throw new Error('Cannot change role: workspace must have at least one admin');
            }
        }

        // Update the member's role
        workspace.members[memberIndex].role = newRole;

        // Save the changes
        await workspace.save({ session });

        await session.commitTransaction();
        session.endSession();

        return { 
            success: true,
            workspace,
            updatedMember: workspace.members[memberIndex]
        };
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};




