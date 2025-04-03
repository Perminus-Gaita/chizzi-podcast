import entryModel from "@/models/entry.model";
import database_connection from "@/services/database";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

database_connection().then(() => console.log("Connected successfully"));

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const entryId = searchParams.get("entryId");

    if (!entryId) {
      return NextResponse.json(
        { message: "Entry ID is required" },
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const entry = await entryModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(entryId),
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
        $lookup: {
          from: "comments",
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
                // preserveNullAndEmptyArrays: true // Preserve comments without users
              },
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
                  $size: { $ifNull: ["$likes", []] }, // Handle scenario with no likes in comments
                },
              },
            },
          ],
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
          votes: 1,
          comments: 1,
        },
      },
    ]);

    if (entry.length > 0) {
      return NextResponse.json(
        { entry: entry[0] },
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } else {
      return NextResponse.json(
        { entry: null },
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
  } catch (error) {
    console.error("Error fetching an entry:", error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
