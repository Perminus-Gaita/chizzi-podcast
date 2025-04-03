import { ObjectId } from "mongodb";

export const getGiveawayVotes = async (db, giveawayId) => {
  return db
    .collection("votes")
    .aggregate([
      {
        $match: {
          giveawayId: new ObjectId(giveawayId),
        },
      },
      {
        $lookup: {
          from: "users",
          let: { userId: "$userId" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
            {
              $project: {
                _id: "$_id",
                name: "$name",
                username: "$username",
                profilePicture: "$profilePicture",
                createdAt: "$createdAt",
              },
            },
          ],
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true,
        },
      },
      { $sort: { createdAt: -1 } },
    ])
    .toArray();
};

export const getEntryVotes = async (db, giveawayId, entryId) => {
  return db
    .collection("votes")
    .aggregate([
      {
        $match: {
          giveawayId: new ObjectId(giveawayId),
          entryId: new ObjectId(entryId), // Filter by entryId
        },
      },
      {
        $lookup: {
          from: "users",
          let: { userId: "$userId" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
            {
              $project: {
                _id: "$_id",
                name: "$name",
                username: "$username",
                profilePicture: "$profilePicture",
                createdAt: "$createdAt",
              },
            },
          ],
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true,
        },
      },
      { $sort: { createdAt: -1 } },
    ])
    .toArray();
};
