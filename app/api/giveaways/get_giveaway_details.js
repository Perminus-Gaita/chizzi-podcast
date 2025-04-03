import mongoose from "mongoose";
import giveawayModel from "../../../models/giveaway.model";

import database_connection from "../../../services/database";
database_connection().then(() => console.log("Connected successfully"));

export default async function handler(req, res) {
  try {
    const { giveawayId } = req.query;

    if (!giveawayId) {
      return res.status(400).json({ message: "Giveaway ID is required" });
    }

    const giveawayDetails = await giveawayModel.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(giveawayId),
        },
      },
      {
        $lookup: {
          from: "entries",
          let: { giveawayId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$giveawayId", "$$giveawayId"] },
              },
            },
          ],
          as: "entries",
        },
      },
      {
        $lookup: {
          from: "votes",
          let: { giveawayId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$giveawayId", "$$giveawayId"] }, // Change from entryId to giveawayId
              },
            },
          ],
          as: "votes",
        },
      },
      {
        $lookup: {
          from: "comments",
          let: { giveawayId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$giveawayId", "$$giveawayId"] }, // Change from entryId to giveawayId
              },
            },
          ],
          as: "comments",
        },
      },
      {
        $project: {
          giveawayId: 1,
          numberOfEntries: { $size: "$entries" },
          numberOfVotes: { $size: "$votes" },
          numberOfComments: { $size: "$comments" },
        },
      },
    ]);

    if (giveawayDetails.length > 0) {
      return res.status(200).json(giveawayDetails);
    } else {
      return res.status(200).json([]);
    }
  } catch (error) {
    console.error("Error fetching entries:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
