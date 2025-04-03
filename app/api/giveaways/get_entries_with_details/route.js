import entryModel from "@/models/entry.model";
import database_connection from "@/services/database";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

database_connection().then(() => console.log("Connected successfully"));

export async function GET(request) {
  if (request.method !== "GET") {
    return NextResponse.json(
      { message: "Method Not Allowed" },
      {
        status: 405,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

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

    // Use the giveawayId in the query to fetch entries
    const entries = await entryModel.aggregate([
      {
        $match: {
          giveawayId: new mongoose.Types.ObjectId(giveawayId),
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

    if (entries.length > 0) {
      return NextResponse.json(
        { entries: entries },
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          }
        }
      );
    } else {
      return NextResponse.json(
        { entries: [] },
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
  } catch (error) {
    console.error("Error fetching entries:", error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        }
      }
    );
  }
}
