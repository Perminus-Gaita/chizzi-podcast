import mongoose from 'mongoose';
const { ObjectId } = mongoose.Types;
import Notification from '@/models/notification.model';

export const aggregateNotificationDataToSendToClient = async (userId, limit = 25, session) => {  
    if(!userId) { throw new Error('userId is required'); }
    if(!ObjectId.isValid(userId)){ throw new Error('userId is not a valid mongodb objectId'); }

    const notificationData = await Notification.aggregate([
        {
            $match: {
                userId: new ObjectId(userId)
            }
        },
        {
            $addFields: {
                extractedMentions: {
                    $regexFindAll: {
                        input: "$message",
                        regex: /@(USER|WORKSPACE):([a-f\d]{24})/i
                    }
                }
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "workspaceId",
                foreignField: "_id",
                as: "workspace"
            }
        },
        {
            $unwind: {
                path: "$workspace",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: "users",
                let: { 
                    mentionIds: {
                        $map: {
                            input: "$extractedMentions.captures",
                            as: "mention",
                            in: { $arrayElemAt: ["$$mention", 1] }
                        }
                    }
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $in: [{ $toString: "$_id" }, "$$mentionIds"]
                            }
                        }
                    }
                ],
                as: "mentionedEntities"
            }
        },
        {
            $lookup: {
                from: "invites",
                localField: "relatedId",
                foreignField: "_id",
                as: "invite"
            }
        },
        {
            $unwind: {
                path: "$invite",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $addFields: {
                workspace: {
                    $cond: {
                        if: { $ifNull: ["$workspace", false] },
                        then: {
                            _id: "$workspace._id",
                            name: "$workspace.name",
                            username: "$workspace.username",
                            profilePicture: "$workspace.profilePicture",
                            type: "workspace"
                        },
                        else: null
                    }
                },
                mentions: {
                    $map: {
                        input: "$extractedMentions",
                        as: "mention",
                        in: {
                            $let: {
                                vars: {
                                    mentionType: { $toLower: { $arrayElemAt: ["$$mention.captures", 0] } },
                                    mentionId: { $arrayElemAt: ["$$mention.captures", 1] },
                                    mentionedEntity: {
                                        $arrayElemAt: [
                                            {
                                                $filter: {
                                                    input: "$mentionedEntities",
                                                    cond: { $eq: [{ $toString: "$$this._id" }, { $arrayElemAt: ["$$mention.captures", 1] }] }
                                                }
                                            },
                                            0
                                        ]
                                    }
                                },
                                in: {
                                    type: "$$mentionType",
                                    _id: "$$mentionId",
                                    name: "$$mentionedEntity.name",
                                    username: "$$mentionedEntity.username",
                                    profilePicture: "$$mentionedEntity.profilePicture"
                                }
                            }
                        }
                    }
                },
                invite: {
                    $cond: {
                        if: { $ifNull: ["$invite", false] },
                        then: {
                            _id: "$invite._id",
                            type: "workspaceInvite",
                            status: "$invite.status",
                            inviterId: "$invite.inviterId",
                            inviteeId: "$invite.inviteeId",
                            workspaceId: "$invite.workspaceId"
                        },
                        else: null
                    }
                }
            }
        },
        {
            $sort: { createdAt: -1 }  // Sort by createdAt in descending order
        },
        {
            $limit: limit  // Add a limit of 25 documents
        },
        {
            $project: {
                _id: 1,
                userId: 1,
                recipientType: 1,
                workspaceId: 1,
                workspace: 1,
                isRead: 1,
                type: 1,
                status: 1,
                message: 1,
                mentions: 1,
                relatedId: 1,
                relatedModel: 1,
                invite: 1,
                metadata:1,
                createdAt: 1,
                updatedAt: 1
            }
        }
    ], { session });

    return notificationData;
}