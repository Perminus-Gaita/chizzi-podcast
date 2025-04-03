import userModel from "@/models/user/index.model";
import mongoose from 'mongoose';

// Connect to the database **Outside of handler function**
import connectToDatabaseMongoDB from "@/lib/database";
await connectToDatabaseMongoDB("getUserProfileData");

export async function getUserProfileData(userIdOrUsername, sessionUserId) {
    try {
        // Validate inputs
        if (!userIdOrUsername) {
            const error = new Error("userId or username is required");
            error.statusCode = 400;
            throw error;
        }

        // Create match stage based on whether input is ID or username
        const isValidObjectId = mongoose.Types.ObjectId.isValid(userIdOrUsername);
        const matchStage = isValidObjectId
            ? { $match: { _id: new mongoose.Types.ObjectId(userIdOrUsername) } }
            : { $match: { username: userIdOrUsername } };

        const sessionUserObjectId = sessionUserId ? new mongoose.Types.ObjectId(sessionUserId) : null;

        const userData = await userModel.aggregate([
            matchStage,
            {
                $project: {
                    _id: { $toString: "$_id" },  // Convert _id to string
                    name: 1,
                    username: 1,
                    profilePicture: 1,
                    bannerImage: 1,
                    type: 1,
                    socialLinks: {
                        $map: {
                            input: "$socialLinks",
                            as: "social",
                            in: {
                                platform: "$$social.platform",
                                link: "$$social.link"
                            }
                        }
                    },
                    createdAt: { $toString: "$createdAt" },  // Convert date to string
                    members: 1,
                    isSessionUser: {
                        $cond: {
                            if: { $and: [
                                { $ne: [sessionUserObjectId, null] },
                                { $eq: ["$_id", sessionUserObjectId] }
                            ]},
                            then: true,
                            else: false
                        }
                    }
                }
            },
            {
                $addFields: {
                    isSessionUserAMemberInThisWorkspace: {
                        $cond: {
                            if: { $ne: [sessionUserObjectId, null] },
                            then: {
                                $in: [
                                    sessionUserObjectId,
                                    { $map: { input: "$members", as: "member", in: "$$member.userId" } }
                                ]
                            },
                            else: false
                        }
                    },
                    sessionUserRoleInWorkspace: {
                        $cond: {
                            if: { $ne: [sessionUserObjectId, null] },
                            then: {
                                $let: {
                                    vars: {
                                        memberDoc: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: "$members",
                                                        cond: {
                                                            $eq: ["$$this.userId", sessionUserObjectId]
                                                        }
                                                    }
                                                },
                                                0
                                            ]
                                        }
                                    },
                                    in: "$$memberDoc.role"
                                }
                            },
                            else: null
                        }
                    }
                }
            },
            {
                $project: {
                    members: 0
                }
            }
        ]);

        if (!userData || userData.length === 0) {
            return {"userNotFound": true};
        }

        return userData[0];
    } catch (error) {
        // Ensure any error has a statusCode
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        console.error("Error getting user's profile data:", error);
        throw error;
    }
}