import mongoose from "mongoose";
import { get_mongodb } from "../../../api-lib/mongodb";
import base from "../../../middleware";
import entryModel from "../../../models/entry.model";

const handler = base().get(async (req, res) => {
  const db = await get_mongodb();

  try {
    const { giveawayId } = req.query;

    if (!giveawayId) {
      return res.status(400).json({ message: "Giveaway ID is required" });
    }

    // Use the giveawayId in the query to fetch entries
    const entries = await entryModel.aggregate([
      {
        $match: {
          giveawayId: mongoose.Types.ObjectId(giveawayId),
        },
      },
      {
        $lookup: {
          from: "votes",
          localField: "_id",
          foreignField: "entryId",
          as: "votes",
        },
      },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "entryId",
          as: "comments",
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
          numberOfComments: { $size: "$comments" },
          // Add other fields as needed
        },
      },
      {
        $sort: { numberOfVotes: -1 }, // Sort in descending order based on the number of votes
      },
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
});

export default handler;
