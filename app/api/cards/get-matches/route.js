import { NextResponse } from "next/server";
import { getUser } from "@/utils/auth/getUser";
import { cookies } from "next/headers";
import cardsRoomModel from "@/models/cardsroom.model";
import database_connection from "@/services/database";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

database_connection().then(() =>
  console.log("Connected successfully(MATCHES GET)")
);

// Helper to calculate match priority score
const getMatchPriorityScore = {
  $addFields: {
    priorityScore: {
      $add: [
        // Base score for game status
        {
          $switch: {
            branches: [
              // Active games where it's the player's turn get highest priority
              {
                case: {
                  $and: [
                    { $eq: ["$gameStatus", "active"] },
                    {
                      $eq: [
                        { $toString: "$turn" },
                        { $toString: "$currentPlayerId" },
                      ],
                    },
                  ],
                },
                then: 100000,
              },
              // Other active games
              { case: { $eq: ["$gameStatus", "active"] }, then: 50000 },
              // Waiting games
              { case: { $eq: ["$gameStatus", "waiting"] }, then: 30000 },
              // Inactive games
              { case: { $eq: ["$gameStatus", "inactive"] }, then: 10000 },
            ],
            default: 0,
          },
        },
        // Time pressure bonus (for timed games)
        {
          $cond: [{ $eq: ["$timer", true] }, 20000, 0],
        },
        // Tournament games get priority
        {
          $cond: [{ $ne: ["$tournamentId", null] }, 15000, 0],
        },
        // Stakes/pot bonus
        {
          $cond: [{ $gt: ["$pot", 0] }, 10000, 0],
        },
      ],
    },
  },
};

export async function GET(request) {
  try {
    const sessionUser = await getUser(cookies);

    if (!sessionUser) {
      return NextResponse.json(
        { message: "No User Session Available" },
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const playerId = sessionUser?._id.toString();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category"); // 'active' or 'scheduled'
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;

    if (!playerId) {
      return NextResponse.json(
        { message: "Player ID is required" },
        { status: 400 }
      );
    }

    const playerObjectId = new mongoose.Types.ObjectId(playerId);

    // Base aggregation pipeline
    const basePipeline = [
      {
        $addFields: {
          currentPlayerId: playerObjectId,
        },
      },
      {
        $lookup: {
          from: "tournaments",
          localField: "tournamentId",
          foreignField: "_id",
          as: "tournamentDetails",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "players.player",
          foreignField: "_id",
          as: "playerDetails",
        },
      },
      getMatchPriorityScore,
      {
        $project: {
          name: 1,
          gameStatus: 1,
          turn: 1,
          currentSuit: 1,
          timer: 1,
          pot: 1,
          createdAt: 1,
          priorityScore: 1,
          isComputerPlay: 1,
          // Tournament context
          tournamentContext: {
            $cond: [
              { $ne: ["$tournamentId", null] },
              {
                tournamentId: "$tournamentId",
                tournamentName: {
                  $arrayElemAt: ["$tournamentDetails.name", 0],
                },
                round: "$name",
              },
              null,
            ],
          },
          playerState: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$players",
                  as: "p",
                  cond: { $eq: ["$$p.player", "$currentPlayerId"] },
                },
              },
              0,
            ],
          },
          opponents: {
            $map: {
              input: {
                $filter: {
                  input: "$players",
                  as: "p",
                  cond: { $ne: ["$$p.player", "$currentPlayerId"] },
                },
              },
              as: "opponent",
              in: {
                $mergeObjects: [
                  {
                    numCards: { $size: "$$opponent.playerDeck" },
                    _id: "$$opponent.player",
                  },
                  {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: "$playerDetails",
                          as: "details",
                          cond: { $eq: ["$$details._id", "$$opponent.player"] },
                        },
                      },
                      0,
                    ],
                  },
                ],
              },
            },
          },
          gameState: {
            topCard: { $arrayElemAt: ["$discardPile", -1] },
            isQuestion: "$isQuestion",
            isPenalty: "$isPenalty",
            isKickback: "$isKickback",
            jumpCounter: "$jumpCounter",
            direction: "$direction",
            lastGamePlay: { $arrayElemAt: ["$gamePlay", -1] },
            turn: "$turn",
            desiredSuit: "$desiredSuit",
          },
        },
      },
      {
        $project: {
          // Final projection to select only needed opponent fields
          name: 1,
          gameStatus: 1,
          turn: 1,
          currentSuit: 1,
          timer: 1,
          pot: 1,
          createdAt: 1,
          priorityScore: 1,
          isComputerPlay: 1,
          tournamentContext: 1,
          playerState: 1,
          gameState: 1,
          opponents: {
            $map: {
              input: "$opponents",
              as: "opponent",
              in: {
                _id: "$$opponent._id",
                name: "$$opponent.name",
                username: "$$opponent.username",
                initialRating: "$$opponent.initialRating",
                profilePicture: "$$opponent.profilePicture",
                numCards: "$$opponent.numCards",
              },
            },
          },
        },
      },
    ];

    // If requesting specific category
    if (category) {
      const categoryPipeline = [
        {
          $match: {
            "players.player": playerObjectId,
            gameStatus: category === "scheduled" ? "waiting" : "active",
            ...(category === "active" && {
              $or: [
                { turn: { $ne: playerObjectId } },
                { $and: [{ timer: false }, { tournamentId: null }] },
              ],
            }),
          },
        },
        ...basePipeline,
        { $sort: { priorityScore: -1, createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
      ];

      const matches = await cardsRoomModel.aggregate(categoryPipeline);
      const totalCount = await cardsRoomModel.countDocuments(
        categoryPipeline[0].$match
      );

      return NextResponse.json({
        matches: { [category]: matches },
        pagination: {
          total: totalCount,
          page,
          hasMore: page * limit < totalCount,
        },
      });
    }

    // Initial load - get all categories with limits
    const urgentPipeline = [
      {
        $match: {
          "players.player": playerObjectId,
          gameStatus: "active",
          turn: playerObjectId,
        },
      },
      ...basePipeline,
    ];

    const activeMatchQuery = {
      "players.player": playerObjectId,
      gameStatus: "active",
      turn: { $ne: playerObjectId },
    };

    const scheduledMatchQuery = {
      "players.player": playerObjectId,
      gameStatus: "waiting",
    };

    const activePipeline = [
      { $match: activeMatchQuery },
      ...basePipeline,
      { $sort: { priorityScore: -1, createdAt: -1 } },
      { $limit: 5 },
    ];

    const scheduledPipeline = [
      { $match: scheduledMatchQuery },
      ...basePipeline,
      { $sort: { priorityScore: -1, createdAt: -1 } },
      { $limit: 5 },
    ];

    const [urgent, active, scheduled, activeTotalCount, scheduledTotalCount] =
      await Promise.all([
        cardsRoomModel.aggregate(urgentPipeline),
        cardsRoomModel.aggregate(activePipeline),
        cardsRoomModel.aggregate(scheduledPipeline),
        cardsRoomModel.countDocuments(activeMatchQuery), // Count ALL active matches
        cardsRoomModel.countDocuments(scheduledMatchQuery), // Count ALL scheduled matches
      ]);

    return NextResponse.json({
      matches: { urgent, active, scheduled },
      counts: {
        active: activeTotalCount,
        scheduled: scheduledTotalCount,
      },
    });
  } catch (error) {
    console.error("Error fetching matches:", error);
    return NextResponse.json(
      { message: "Internal Server Error(get matches)" },
      { status: 500 }
    );
  }
}
