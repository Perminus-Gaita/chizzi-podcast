import entryModel from "@/models/entry.model";
import database_connection from "@/services/database";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

database_connection().then(() =>
  console.log("Connected successfully(entries with votes)")
);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const giveawayId = searchParams.get("giveawayId");

    if (!giveawayId) {
      return NextResponse.json(
        { message: "Giveaway ID is required" },
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const entries = await entryModel.aggregate([
      {
        $match: {
          giveawayId: new mongoose.Types.ObjectId(giveawayId),
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

    if (entries.length > 0) {
      return NextResponse.json(entries, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } else {
      return NextResponse.json([], {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
  } catch (error) {
    console.error("Error fetching an entries with comments:", error);

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
