export const maxDuration = 60; // This function can run for a maximum of 60 seconds
export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import CompetitionModel from "@/models/competition.model";

// Connect to the database
import connectToDatabaseMongoDB from '@/lib/database';
await connectToDatabaseMongoDB("/api/competitions");

export async function GET(request) {
  try {

    const competitions = await CompetitionModel.aggregate([
      {
        $lookup: {
          from: "users", // Assuming your users collection is named "users"
          localField: "creatorId",
          foreignField: "_id",
          as: "creator",
        },
      },
      {
        $unwind: "$creator",
      },
      {
        $project: {
          _id: 1,
          name: 1,
          creator: {
            _id: "$creator._id",
            username: "$creator.username", // or any other fields you want to include
            // add additional creator fields here
          },
          status: 1,
          startDate: 1,
          endDate: 1,
          sponsors: 1,
          participants: 1,
          numberOfParticipants: { $size: "$participants" },
          numberOfSponsors: { $size: "$sponsors" },
          numberOfVotes: {
            $sum: {
              $map: {
                input: "$participants",
                as: "participant",
                in: { $size: "$$participant.votes" },
              },
            },
          },
        },
      },
    ]);

    if (!competitions || competitions.length === 0) {
      return NextResponse.json(
        { message: "No competitions found" },
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return NextResponse.json(
      { competitions },
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching competitions:", error);
    return NextResponse.json(
      { message: "Internal Server Error fetching competitions" },
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}