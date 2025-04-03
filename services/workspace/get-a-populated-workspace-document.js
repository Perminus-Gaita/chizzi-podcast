import UserModel from '@/models/user/index.model.js';

// Connect to the database **Outside of handler function**
import connectToDatabaseMongoDB from '@/lib/database';
await connectToDatabaseMongoDB("getAPopulatedWorkspaceDocument");

export async function getAPopulatedWorkspaceDocument(workspaceId, currentUserId) {
    try {
        if (!workspaceId) throw new Error('Workspace ID is required');
        if (!currentUserId) throw new Error('Current user ID is required');

        const workspace = await UserModel.findOne({
            _id: workspaceId,
            'members.userId': currentUserId
        });

        if (!workspace) throw new Error('Workspace not found or user is not a member');

        const populatedWorkspaceDocument = await UserModel.aggregate([
            {
                $match: {
                    _id: workspace._id
                }
            },
            // Lookup creator
            {
                $lookup: {
                    from: 'users',
                    localField: 'creator',
                    foreignField: '_id',
                    as: 'creator'
                }
            },
            {
                $unwind: {
                    path: '$creator',
                    preserveNullAndEmptyArrays: true
                }
            },
            // Lookup subscription
            {
                $lookup: {
                    from: 'subscriptions',
                    localField: 'subscriptionId',
                    foreignField: '_id',
                    as: 'subscription'
                }
            },
            {
                $unwind: {
                    path: '$subscription',
                    preserveNullAndEmptyArrays: true
                }
            },
            // Lookup pending invites with user details
            {
                $lookup: {
                    from: 'invites',
                    let: { workspaceId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$workspaceId', '$$workspaceId'] },
                                        { $eq: ['$status', 'pending'] }
                                    ]
                                }
                            }
                        },
                        // Lookup invitee details
                        {
                            $lookup: {
                                from: 'users',
                                let: { inviteeId: '$inviteeId' },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: { $eq: ['$_id', '$$inviteeId'] }
                                        }
                                    },
                                    {
                                        $project: {
                                            name: 1,
                                            username: 1,
                                            profilePicture: 1
                                        }
                                    }
                                ],
                                as: 'inviteeDetails'
                            }
                        },
                        {
                            $unwind: '$inviteeDetails'
                        },
                        // Combine invite and invitee details
                        {
                            $project: {
                                inviteeId: 1,
                                status: 1,
                                name: '$inviteeDetails.name',
                                username: '$inviteeDetails.username',
                                profilePicture: '$inviteeDetails.profilePicture',
                                createdAt: 1  // Include the invite creation date
                            }
                        }
                    ],
                    as: 'pendingInvites'
                }
            },
            // Unwind members array
            {
                $unwind: {
                    path: '$members',
                    preserveNullAndEmptyArrays: true
                }
            },
            // Lookup member user details
            {
                $lookup: {
                    from: 'users',
                    localField: 'members.userId',
                    foreignField: '_id',
                    pipeline: [
                        {
                            $match: { type: 'individual' }
                        },
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                username: 1,
                                profilePicture: 1,
                                currentWorkspaceId: 1
                            }
                        }
                    ],
                    as: 'memberDetails'
                }
            },
            {
                $unwind: '$memberDetails'
            },
            // Create member structure
            {
                $addFields: {
                    'memberWithDetails': {
                        _id: '$memberDetails._id',
                        name: '$memberDetails.name',
                        username: '$memberDetails.username',
                        profilePicture: '$memberDetails.profilePicture',
                        currentWorkspaceId: '$memberDetails.currentWorkspaceId',
                        role: '$members.role',
                        isCurrentUser: { $eq: ['$memberDetails._id', currentUserId] },
                        isInvitePending: false
                    }
                }
            },
            // Group back the members
            {
                $group: {
                    _id: '$_id',
                    name: { $first: '$name' },
                    username: { $first: '$username' },
                    profilePicture: { $first: '$profilePicture' },
                    type: { $first: '$type' },
                    creator: { $first: '$creator' },
                    subscription: { $first: '$subscription' },
                    pendingInvites: { $first: '$pendingInvites' },
                    members: { $push: '$memberWithDetails' },
                    createdAt: { $first: '$createdAt' },
                    updatedAt: { $first: '$updatedAt' }
                }
            },
            // Add invited users to members array
            {
                $addFields: {
                    members: {
                        $concatArrays: [
                            '$members',
                            {
                                $map: {
                                    input: '$pendingInvites',
                                    as: 'invite',
                                    in: {
                                        _id: '$$invite.inviteeId',
                                        name: '$$invite.name',
                                        username: '$$invite.username',
                                        profilePicture: '$$invite.profilePicture',
                                        role: 'pending',
                                        isCurrentUser: { $eq: ['$$invite.inviteeId', currentUserId] },
                                        isInvitePending: true,
                                        inviteCreatedAt: '$$invite.createdAt'  // Add the invite creation date
                                    }
                                }
                            }
                        ]
                    }
                }
            },
            // Final project
            {
                $project: {
                    _id: 1,
                    name: 1,
                    username: 1,
                    profilePicture: 1,
                    type: 1,
                    creator: {
                        _id: 1,
                        name: 1,
                        username: 1,
                        profilePicture: 1
                    },
                    subscription: 1,
                    members: 1,
                    createdAt: 1,
                    updatedAt: 1
                }
            }
        ]);

        if (!populatedWorkspaceDocument || populatedWorkspaceDocument.length === 0) {
            throw new Error('Error retrieving workspace data');
        }

        return populatedWorkspaceDocument[0];
    } catch (error) {
        console.error('Error in getAPopulatedWorkspaceDocument service:', error);
        throw error;
    }
}


