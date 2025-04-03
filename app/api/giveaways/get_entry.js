import mongoose from "mongoose";
import { get_mongodb } from "../../../api-lib/mongodb";
import base from "../../../middleware";
import userModel from "@/models/user/index.model";
import entryModel from "../../../models/entry.model";

const handler = base().get(async (req, res) => {
  const db = await get_mongodb();

  try {
    let entry = await entryModel
      .aggregate([
        {
          $match: {
            giveawayId: mongoose.Types.ObjectId(req.query.giveawayId), // Add this $match stage
            _id: mongoose.Types.ObjectId(req.query.entryId), // Convert id to ObjectId
          },
        },
        {
          $lookup: {
            from: "users",
            let: {
              userIds: {
                $map: {
                  input: "$votes",
                  as: "vote",
                  in: { $toObjectId: "$$vote" },
                },
              },
            },
            pipeline: [
              { $match: { $expr: { $in: ["$_id", "$$userIds"] } } },
              {
                $project: {
                  _id: 1,
                  name: 1,
                  username: 1,
                  profilePicture: 1,
                  createdAt: 1,
                },
              },
            ],
            as: "votes",
          },
        },
      ])
      .exec();

    if (entry) {
      return res.status(200).json(entry);
    } else {
      return res.status(404).json({ message: "No entry found!" });
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

export default handler;
