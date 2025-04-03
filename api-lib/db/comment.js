import { ObjectId } from "mongodb";

export const getComments = async (
  db,
  giveawayId
  //  before, limit = 10
) => {
  return db
    .collection("comments")
    .aggregate([
      {
        $match: {
          giveawayId: new ObjectId(giveawayId),
          //   ...(before && { createdAt: { $lt: before } }),
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
      //   {
      //     $lookup: {
      //       from: "replies",
      //       let: { commentId: "$_id" },
      //       pipeline: [
      //         {
      //           $match: {
      //             $expr: { $eq: ["$commentId", "$$commentId"] },
      //           },
      //         },
      //         {
      //           $lookup: {
      //             from: "users",
      //             let: { userId: "$userId" },
      //             pipeline: [
      //               { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
      //               {
      //                 $project: {
      //                   _id: "$_id",
      //                   name: "$name",
      //                   username: "$username",
      //                   profilePicture: "$profilePicture",
      //                   createdAt: "$createdAt",
      //                 },
      //               },
      //             ],
      //             as: "user",
      //           },
      //         },

      //         {
      //           $lookup: {
      //             from: "users",
      //             let: { to: "$to" },
      //             pipeline: [
      //               { $match: { $expr: { $eq: ["$_id", "$$to"] } } },
      //               {
      //                 $project: {
      //                   _id: "$_id",
      //                   name: "$name",
      //                   username: "$username",
      //                   profilePicture: "$profilePicture",
      //                   createdAt: "$createdAt",
      //                 },
      //               },
      //             ],
      //             as: "to",
      //           },
      //         },
      //       ],
      //       as: "replies",
      //     },
      //   },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true,
        },
      },
      { $sort: { createdAt: -1 } },
      //   { $limit: limit },
    ])
    .toArray();
};

// In db/comment.js

export const getEntryComments = async (db, giveawayId, entryId) => {
  return db
    .collection("comments")
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

export const insertComment = async (db, giveawayId, entryId, text, userId) => {
  const new_comment = {
    text,
    giveawayId: new ObjectId(giveawayId),
    entryId: new ObjectId(entryId),
    userId: new ObjectId(userId),
    createdAt: new Date(),
  };

  const { inserted_id } = await db
    .collection("comments")
    .insertOne(new_comment);

  new_comment._id = inserted_id;

  console.log("Comment ID");
  console.log(inserted_id);

  return new_comment;
};

export const likeComment = async (db, commentId, userId) => {
  const oldComment = await db
    .collection("comments")
    .findOne({ _id: new ObjectId(commentId) });

  if (!oldComment.likes) {
    oldComment.likes = [];
    oldComment.likes = [...oldComment.likes, userId];
  } else {
    const index = oldComment?.likes?.findIndex((id) => id === String(userId));

    if (index === -1) {
      oldComment.likes = [...oldComment.likes, userId];
      console.log("liking now...");
    } else {
      oldComment.likes = oldComment?.likes?.filter(
        (id) => id !== String(userId)
      );
      console.log("unliking now...");
    }
  }

  const updatedComment = await db.collection("comments").findOneAndUpdate(
    { _id: new ObjectId(commentId) },
    {
      $set: {
        likes: oldComment.likes,
      },
    },
    { returnNewDocument: true }
  );

  return updatedComment.value;
};
