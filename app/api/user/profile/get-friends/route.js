import { NextResponse } from "next/server";
import cardsRoomModel from "@/models/cardsroom.model";
import userModel from "@/models/user/index.model";

import connectToDatabaseMongoDB from "@/lib/database";

await connectToDatabaseMongoDB("getUserFriends");

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    // Get query parameters
    const url = new URL(request.url);
    const username = url.searchParams.get("username");

    const page = parseInt(url.searchParams.get("page")) || 1;
    const limit = parseInt(url.searchParams.get("limit")) || 10;
    const filter = url.searchParams.get("filter") || "all"; // all, frequent, recent

    const user = await userModel.findOne({ username });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const userId = user._id;

    const skip = (page - 1) * limit;

    // Aggregation pipeline to find player connections
    const pipeline = [
      // Match games where the user was a player
      {
        $match: {
          "players.player": userId,
          gameStatus: "gameover",
        },
      },
      // Unwind players array
      { $unwind: "$players" },
      // Filter out the user themselves
      {
        $match: {
          "players.player": { $ne: userId },
        },
      },
      // Group by opponent
      {
        $group: {
          _id: "$players.player",
          gamesPlayed: { $sum: 1 },
          lastGameDate: { $max: "$createdAt" },
          wins: {
            $sum: {
              $cond: [{ $eq: ["$winner", "$players.player"] }, 1, 0],
            },
          },
          totalDuration: { $sum: "$gameDuration" },
          tournaments: {
            $addToSet: {
              $cond: [{ $ne: ["$tournamentId", null] }, "$tournamentId", null],
            },
          },
        },
      },
      // Lookup opponent details
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "playerDetails",
        },
      },
      {
        $addFields: {
          playerDetails: { $arrayElemAt: ["$playerDetails", 0] },
          tournamentGames: {
            $size: {
              $filter: {
                input: "$tournaments",
                as: "t",
                cond: { $ne: ["$$t", null] },
              },
            },
          },
        },
      },
      // Calculate engagement metrics
      {
        $addFields: {
          averageGameDuration: { $divide: ["$totalDuration", "$gamesPlayed"] },
          winRate: {
            $multiply: [{ $divide: ["$wins", "$gamesPlayed"] }, 100],
          },
          lastPlayed: "$lastGameDate",
        },
      },
      // Project final shape
      {
        $project: {
          playerId: "$_id",
          name: "$playerDetails.name",
          username: "$playerDetails.username",
          profilePicture: "$playerDetails.profilePicture",
          telegram: "$playerDetails.telegram",
          gamesPlayed: 1,
          lastPlayed: 1,
          winRate: 1,
          tournamentGames: 1,
          averageGameDuration: 1,
          engagement: {
            $add: ["$gamesPlayed", { $multiply: ["$tournamentGames", 2] }],
          },
        },
      },
    ];

    // Add filter conditions
    if (filter === "frequent") {
      pipeline.push({ $match: { gamesPlayed: { $gte: 3 } } });
    } else if (filter === "recent") {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      pipeline.push({ $match: { lastPlayed: { $gte: thirtyDaysAgo } } });
    }

    // Add sorting
    pipeline.push({
      $sort: {
        engagement: -1,
        lastPlayed: -1,
      },
    });

    // Add pagination
    pipeline.push({ $skip: skip }, { $limit: limit });

    const friends = await cardsRoomModel.aggregate(pipeline);

    // Get total count for pagination
    const countPipeline = [...pipeline];
    countPipeline.splice(-2); // Remove skip and limit
    const totalDocs = await cardsRoomModel.aggregate([
      ...countPipeline,
      { $count: "total" },
    ]);
    const total = totalDocs[0]?.total || 0;

    return NextResponse.json(
      {
        friends,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          currentPage: page,
          limit,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching friends:", error);
    return NextResponse.json(
      { message: "Error fetching friends" },
      { status: 500 }
    );
  }
}
