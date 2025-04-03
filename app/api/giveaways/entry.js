import mongoose from "mongoose";
import entryModel from "../../../models/entry.model";

// Connect to the database **OUtside of handler function**
import database_connection from "../../../services/database";
database_connection().then(() => console.log("Connected successfully"));

export default async function handler(req, res) {
    try {
        const { entryId } = req.query;
    
        if (!entryId) {
            return res.status(400).json({ message: "Entry ID is required" });
        }
    
        const entry = await entryModel.aggregate([
            {
                $match: {
                "_id": mongoose.Types.ObjectId(entryId)
                }
            },
            {
                $lookup: {
                from: "votes",
                let: { entryId: "$_id" },
                pipeline: [
                    {
                    $match: {
                        $expr: { $eq: ["$entryId", "$$entryId"] }
                    }
                    },
                    {
                    $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "user"
                    }
                    },
                    {
                    $unwind: {
                        path: "$user",
                        // preserveNullAndEmptyArrays: true // Preserve votes without users
                    }
                    },
                    {
                    $project: {
                        _id: 1,
                        entryId: 1,
                        userId: 1,
                        user: {
                        _id: "$user._id",
                        name: "$user.name",
                        username: "$user.username",
                        onboardingStatus: "$user.onboardingStatus",
                        accountType: "$user.accountType",
                        createdAt: "$user.createdAt",
                        profilePicture: "$user.profilePicture",
                        }
                    }
                    }
                ],
                as: "votes"
                }
            },
            {
                $lookup: {
                from: "comments",
                let: { entryId: "$_id" },
                pipeline: [
                    {
                    $match: {
                        $expr: { $eq: ["$entryId", "$$entryId"] }
                    }
                    },
                    {
                    $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "user"
                    }
                    },
                    {
                    $unwind: {
                        path: "$user",
                        // preserveNullAndEmptyArrays: true // Preserve comments without users
                    }
                    },
                    {
                    $project: {
                        _id: 1,
                        text: 1,
                        entryId: 1,
                        userId: 1,
                        user: {
                        _id: "$user._id",
                        name: "$user.name",
                        username: "$user.username",
                        onboardingStatus: "$user.onboardingStatus",
                        accountType: "$user.accountType",
                        createdAt: "$user.createdAt",
                        profilePicture: "$user.profilePicture",
                        },
                        createdAt: 1,
                        numberOfLikes: {
                        $size: { $ifNull: ["$likes", []] } // Handle scenario with no likes in comments
                        }
                    }
                    }
                ],
                as: "comments"
                }
            },
            {
                $project: {
                _id: 1,
                giveawayId: 1,
                profilePicture: 1,
                username: 1,
                platform: 1,
                linkToProfile: 1,
                linkToPost: 1,
                progress: 1,
                tags: 1,
                numberOfVotes: { $size: "$votes" },
                numberOfComments: { $size: "$comments" },
                votes: 1,
                comments: 1
                }
            }
        ]);

        console.log(entry);

        
        // Additional logic or data processing if needed
        if (entry.length > 0) {
          return res.status(200).json(entry[0]);
        } else {
          return res.status(200).json({message: "no entry with that Id found"});
        }
      } catch (error) {
        console.error("Error fetching entries:", error);
        return res.status(500).json({ message: "Internal Server Error" });
      }
}