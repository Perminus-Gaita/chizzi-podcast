import UserModel from '@/models/user/index.model.js';

// Connect to the database **Outside of handler function**
import connectToDatabaseMongoDB from '@/lib/database';
await connectToDatabaseMongoDB("getUserProfileMembers");

export async function getUserProfileMembers(username, currentUserId) {
    try {
        if (!username) {
            throw new Error('Username is required');
        }

        // Get user profile members aggregation
        const aggregationPipeline = getUserProfileMembersAggregation(username, currentUserId);
        const workspaceMembers = await UserModel.aggregate(aggregationPipeline);

        return workspaceMembers;
    } catch (error) {
        console.error('Error in getUserProfileMembersAggregation service:', error);
        throw error;
    }
}

function getUserProfileMembersAggregation(username, currentUserId) {
    return [
        {
            $match: {
                username: username,
                isPubliclyVisibleInProfile: true
            }
        },
        {
            $unwind: '$members'
        },
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
                            currentWorkspaceId: 1,
                            isPubliclyVisibleInProfile: 1
                        }
                    }
                ],
                as: 'memberDetails'
            }
        },
        {
            $unwind: '$memberDetails'
        },
        {
            $project: {
                _id: { $toString: "$memberDetails._id" },  // Convert _id to string
                name: '$memberDetails.name',
                username: '$memberDetails.username',
                profilePicture: '$memberDetails.profilePicture',
                isCurrentUser: {
                    $eq: ['$memberDetails._id', currentUserId]
                },
                isPubliclyVisibleInProfile: "$memberDetails.isPubliclyVisibleInProfile"
            }
        }
    ];
}
