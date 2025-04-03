import mongoose from 'mongoose';
import userModel from '@/models/user/index.model';

// Connect to the database **Outside of handler function**
import connectToDatabaseMongoDB from '@/lib/database';
await connectToDatabaseMongoDB("searchUsersToInviteToAWorkspaceAggregation")

export const searchUsersToInviteToAWorkspaceAggregation = async (searchTerm, currentUserId, workspaceId) => {
    try {
        if (!currentUserId) throw new Error("currentUserId parameter is needed.");
        if (!workspaceId) throw new Error("workspaceId parameter is needed.");

        // First, get the count of matching users
        const countMatch = await userModel.aggregate([
            {
                $match: {
                    type: 'individual',
                    $or: [
                        { name: { $regex: searchTerm, $options: 'i' } },
                        { username: { $regex: searchTerm, $options: 'i' } },
                        { mainEmail: searchTerm },
                        { 'google.email': searchTerm }
                    ]
                }
            },
            {
                $count: "totalMatches"
            }
        ]);

        // Check if more than 50 results.
        if (countMatch.length > 0 && countMatch[0].totalMatches > 50) {
            throw new Error("More than 50 users matched, please be more specific in your search");
        }

        const users = await userModel.aggregate([
            {
                $match: {
                    type: 'individual',
                    $or: [
                        { name: { $regex: searchTerm, $options: 'i' } },
                        { username: { $regex: searchTerm, $options: 'i' } },
                        { mainEmail: searchTerm },
                        { 'google.email': searchTerm }
                    ]
                }
            },
            {
                $addFields: {
                    isCurrentUser: {
                        $eq: ['$_id', new mongoose.Types.ObjectId(currentUserId)]
                    }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    let: { userId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ['$_id', new mongoose.Types.ObjectId(workspaceId)]
                                }
                            }
                        },
                        {
                            $project: {
                                members: {
                                    $filter: {
                                        input: '$members',
                                        as: 'member',
                                        cond: {
                                            $eq: ['$$member.userId', '$$userId']
                                        }
                                    }
                                }
                            }
                        }
                    ],
                    as: 'workspaceInfo'
                }
            },
            {
                $addFields: {
                    isWorkspaceMember: {
                        $gt: [{ $size: { $arrayElemAt: ['$workspaceInfo.members', 0] } }, 0]
                    }
                }
            },
            {
                $lookup: {
                    from: 'invites',
                    let: { userId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$inviteeId', '$$userId'] },
                                        { $eq: ['$workspaceId', new mongoose.Types.ObjectId(workspaceId)] },
                                        { $eq: ['$status', 'pending'] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'pendingInvite'
                }
            },
            {
                $addFields: {
                    invitePending: {
                        $cond: {
                            if: { $gt: [{ $size: '$pendingInvite' }, 0] },
                            then: true,
                            else: false
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    username: 1,
                    profilePicture: 1,
                    isCurrentUser: 1,
                    invitePending: 1,
                    isWorkspaceMember: 1
                }
            }
        ]);

        return users;
    } catch (error) {
        console.error('Error searching for users to invite to a workspace:', error);
        throw error;
    }
};