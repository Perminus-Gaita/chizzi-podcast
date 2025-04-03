import { NextResponse } from "next/server";
import cardsRoomModel from "@/models/cardsroom.model";
import userModel from "@/models/user/index.model";

import connectToDatabaseMongoDB from "@/lib/database";

await connectToDatabaseMongoDB("getGameHistory");

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    // Get query parameters
    const url = new URL(request.url);
    const username = url.searchParams.get("username");

    const page = parseInt(url.searchParams.get("page")) || 1;
    const limit = parseInt(url.searchParams.get("limit")) || 10;
    const filter = url.searchParams.get("filter") || "all"; // all, tournament, casual
    const sort = url.searchParams.get("sort") || "recent"; // recent, rating-change, duration

    const user = await userModel.findOne({ username });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const userId = user._id;

    const skip = (page - 1) * limit;

    // Base match conditions
    const matchConditions = {
      "players.player": userId,
      gameStatus: "gameover",
    };

    // Add filter conditions
    if (filter === "tournament") {
      matchConditions.tournamentId = { $ne: null };
    } else if (filter === "casual") {
      matchConditions.tournamentId = null;
    }

    // Define sort order
    const sortStage = {};
    switch (sort) {
      case "rating-change":
        sortStage.$sort = { "playerStats.ratingChange": -1 };
        break;
      case "duration":
        sortStage.$sort = { gameDuration: -1 };
        break;
      default:
        sortStage.$sort = { createdAt: -1 };
    }

    const games = await cardsRoomModel.aggregate([
      { $match: matchConditions },
      {
        $lookup: {
          from: "tournaments",
          localField: "tournamentId",
          foreignField: "_id",
          as: "tournament",
        },
      },
      // Unwind and filter player stats
      {
        $addFields: {
          playerStats: {
            $filter: {
              input: "$players",
              as: "player",
              cond: { $eq: ["$$player.player", userId] },
            },
          },
          opponents: {
            $filter: {
              input: "$players",
              as: "player",
              cond: { $ne: ["$$player.player", userId] },
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "opponents.player",
          foreignField: "_id",
          as: "opponentDetails",
        },
      },
      // Calculate game statistics
      {
        $addFields: {
          isWinner: { $eq: ["$winner", userId] },
          matchDuration: "$gameDuration",
          specialMovesCount: {
            $let: {
              vars: {
                playerMoves: { $arrayElemAt: ["$playerStats.specialMoves", 0] },
              },
              in: {
                $add: [
                  "$$playerMoves.jumpCards",
                  "$$playerMoves.kickbackCards",
                  "$$playerMoves.aceDeclarations",
                  "$$playerMoves.penaltyAvoidances",
                ],
              },
            },
          },
        },
      },
      // Project final shape
      {
        $project: {
          _id: 1,
          name: 1,
          createdAt: 1,
          tournament: { $arrayElemAt: ["$tournament", 0] },
          isWinner: 1,
          matchDuration: 1,
          specialMovesCount: 1,
          initialRating: { $arrayElemAt: ["$playerStats.initialRating", 0] },
          finalRating: { $arrayElemAt: ["$playerStats.finalRating", 0] },
          ratingChange: { $arrayElemAt: ["$playerStats.ratingChange", 0] },
          stallingPenalties: {
            $arrayElemAt: ["$playerStats.stallingPenalties", 0],
          },
          averageMoveTime: {
            $arrayElemAt: ["$playerStats.averageMoveTime", 0],
          },
          opponents: {
            $map: {
              input: "$opponentDetails",
              as: "opponent",
              in: {
                _id: "$$opponent._id",
                username: "$$opponent.username",
                profilePicture: "$$opponent.profilePicture",
              },
            },
          },
          //   gamePlay: {
          //     $filter: {
          //       input: "$gamePlay",
          //       as: "play",
          //       cond: { $eq: ["$$play.player", userId] },
          //     },
          //   },
          pot: 1,
        },
      },
      sortStage,
      { $skip: skip },
      { $limit: limit },
    ]);

    // Get total count for pagination
    const total = await cardsRoomModel.countDocuments(matchConditions);

    // Calculate summary statistics
    const totalGames = await cardsRoomModel.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: null,
          totalGames: { $sum: 1 },
          wins: {
            $sum: { $cond: [{ $eq: ["$winner", userId] }, 1, 0] },
          },
          totalRatingChange: {
            $sum: {
              $let: {
                vars: {
                  playerStats: {
                    $filter: {
                      input: "$players",
                      as: "p",
                      cond: { $eq: ["$$p.player", userId] },
                    },
                  },
                },
                in: { $arrayElemAt: ["$$playerStats.ratingChange", 0] },
              },
            },
          },
        },
      },
    ]);

    return NextResponse.json(
      {
        games,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          currentPage: page,
          limit,
        },
        summary: totalGames[0] || {
          totalGames: 0,
          wins: 0,
          totalRatingChange: 0,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching game history:", error);
    return NextResponse.json(
      { message: "Error fetching game history" },
      { status: 500 }
    );
  }
}
