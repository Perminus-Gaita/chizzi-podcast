import UserModel from '@/models/user/index.model.js';

// Connect to the database **Outside of handler function**
import connectToDatabaseMongoDB from '@/lib/database';
await connectToDatabaseMongoDB("getAPopulatedWorkspaceDocument");

export async function getWorkspaceMembersByUsername(workspaceUsername, currentUserId) {
    try {
        if (!workspaceUsername) {
            throw new Error('Username is required');
        }

        // Now get the full populated workspace with transformed members
        const aggregationPipeline = getWorkspaceMembersByUsernameAggregation(workspaceUsername, currentUserId);
        const workspaceMembers = await UserModel.aggregate(aggregationPipeline);

        return workspaceMembers;
    } catch (error) {
        console.error('Error in getAPopulatedWorkspaceDocument service:', error);
        throw error;
    }
}

function getWorkspaceMembersByUsernameAggregation(workspaceUsername, currentUserId) {
    return [
        {
            $match: {
                username: workspaceUsername,
                'members.userId': currentUserId // Check if current user is a member
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
                _id: '$memberDetails._id',
                name: '$memberDetails.name',
                username: '$memberDetails.username',
                profilePicture: '$memberDetails.profilePicture',
                // currentWorkspaceId: '$memberDetails.currentWorkspaceId',
                role: '$members.role',
                isCurrentUser: {
                    $eq: ['$memberDetails._id', currentUserId]
                },
                isPubliclyVisibleInProfile: "$memberDetails.isPubliclyVisibleInProfile"
            }
        }
    ];
}
