import giveawayModel from "@/models/giveaway.model";
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
    const giveawayDetails = await giveawayModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(giveawayId),
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
      return NextResponse.json(giveawayDetails, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } else {
      return NextResponse.json(
        { giveawayDetails: null },
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
        },
      }
    );
  }
}
