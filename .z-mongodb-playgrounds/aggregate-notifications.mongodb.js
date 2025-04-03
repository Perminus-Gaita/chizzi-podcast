import mongoose from 'mongoose';
const { ObjectId } = mongoose.Types;

// Select the database to use.
use('wufwuf-automations-test');

// 66b077ff50cb7b39868753ff
// Insert a few documents into the sales collection.
db.getCollection('notifications').aggregate([
    {
        $match: {
            userId: new ObjectId("66b077ff50cb7b39868753ff")  // Assuming userId is already an ObjectId or string
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
                        id: "$workspace._id",
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
                                id: "$$mentionId",
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
                        id: "$invite._id",
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
            createdAt: 1,
            updatedAt: 1
        }
    }
]);
