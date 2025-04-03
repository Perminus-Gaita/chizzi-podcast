// import mongoose from "mongoose";
// import entryModel from "../../../models/entry.model";

// // Connect to the database **OUtside of handler function**
// import database_connection from "../../../services/database";
// database_connection().then(() => console.log("Connected successfully"));

// export default async function handler(req, res) {
//     try {
//         const { giveawayId } = req.query;

//         if (!giveawayId) {
//             return res.status(400).json({ message: "Giveaway ID is required" });
//         }

//         // Use the giveawayId in the get the data via aggregation
//         const entries = await entryModel.aggregate([
//             {
//               $match: {
//                 "giveawayId": mongoose.Types.ObjectId(giveawayId)
//               }
//             },
//             {
//               $lookup: {
//                 from: "votes",
//                 let: { entryId: "$_id" },
//                 pipeline: [
//                   {
//                     $match: {
//                       $expr: { $eq: ["$entryId", "$$entryId"] }
//                     }
//                   },
//                   {
//                     $lookup: {
//                       from: "users",
//                       localField: "userId",
//                       foreignField: "_id",
//                       as: "user"
//                     }
//                   },
//                   {
//                     $unwind: {
//                       path: "$user",
//                       // preserveNullAndEmptyArrays: true // Preserve votes without users
//                     }
//                   },
//                   {
//                     $project: {
//                       _id: 1,
//                       entryId: 1,
//                       userId: 1,
//                       user: {
//                         _id: "$user._id",
//                         name: "$user.name",
//                         username: "$user.username",
//                         onboardingStatus: "$user.onboardingStatus",
//                         accountType: "$user.accountType",
//                         createdAt: "$user.createdAt",
//                         profilePicture: "$user.profilePicture",
//                       }
//                     }
//                   }
//                 ],
//                 as: "votes"
//               }
//             },
//             {
//               $project: {
//                 _id: 1,
//                 giveawayId: 1,
//                 profilePicture: 1,
//                 username: 1,
//                 platform: 1,
//                 linkToProfile: 1,
//                 linkToPost: 1,
//                 progress: 1,
//                 tags: 1,
//                 numberOfVotes: { $size: "$votes" },
//                 votes: 1
//               }
//             },
//             {
//               $sort: { numberOfVotes: -1 } // Sort in descending order based on the number of votes
//             }
//           ]);

//         // Additional logic or data processing if needed

//         if (entries.length > 0) {
//           return res.status(200).json(entries);
//         } else {
//           return res.status(200).json([]);
//         }
//       } catch (error) {
//         console.error("Error fetching entries:", error);
//         return res.status(500).json({ message: "Internal Server Error" });
//       }
// }

import mongoose from "mongoose";
import entryModel from "../../../models/entry.model";

// Connect to the database **Outside of the handler function**
import database_connection from "../../../services/database";
database_connection().then(() => console.log("Connected successfully"));

export default async function handler(req, res) {
  try {
    const { giveawayId } = req.query;

    if (!giveawayId) {
      return res.status(400).json({ message: "Giveaway ID is required" });
    }

    // Use the giveawayId in the get the data via aggregation
    const entries = await entryModel.aggregate([
      {
        $match: {
          giveawayId: mongoose.Types.ObjectId(giveawayId),
        },
      },
      {
        $lookup: {
          from: "votes",
          let: { entryId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$entryId", "$$entryId"] },
              },
            },
            {
              $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "user",
              },
            },
            {
              $unwind: {
                path: "$user",
                // preserveNullAndEmptyArrays: true // Preserve votes without users
              },
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
                },
              },
            },
          ],
          as: "votes",
        },
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
          votes: 1,
        },
      },
      {
        $sort: { numberOfVotes: -1 }, // Sort in descending order based on the number of votes
      },
      // {
      //   $limit: 1, // Limit the result to the first 10 entries
      // },
    ]);

    // Additional logic or data processing if needed

    if (entries.length > 0) {
      return res.status(200).json(entries);
    } else {
      return res.status(200).json([]);
    }
  } catch (error) {
    console.error("Error fetching entries:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
