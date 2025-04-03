import { NextResponse } from "next/server";
import cardsRoomModel from "@/models/cardsroom.model";
import database_connection from "@/services/database";

export const dynamic = "force-dynamic";

database_connection()
  .then(() => console.log("Connected successfully(CARDS GET rooms)"))
  .catch((err) => console.error("Database connection error:", err));

// scoring system
const getRoomSortScore = {
  $addFields: {
    sortScore: {
      $add: [
        // Base scores for game status - Much higher base values
        {
          $switch: {
            branches: [
              { case: { $eq: ["$gameStatus", "active"] }, then: 100000 },
              { case: { $eq: ["$gameStatus", "waiting"] }, then: 80000 },
              { case: { $eq: ["$gameStatus", "inactive"] }, then: 20000 },
              { case: { $eq: ["$gameStatus", "closed"] }, then: 0 },
              { case: { $eq: ["$gameStatus", "gameover"] }, then: 0 },
            ],
            default: 0,
          },
        },
        // Bonus for rooms with pots
        { $cond: [{ $gt: ["$pot", 0] }, 40000, 0] },
        // Bonus for rooms with timer
        { $cond: [{ $eq: ["$timer", true] }, 20000, 0] },
        // Fill rate bonus
        {
          $let: {
            vars: {
              fillPercentage: {
                $multiply: [
                  { $divide: [{ $size: "$players" }, "$maxPlayers"] },
                  100,
                ],
              },
            },
            in: {
              $switch: {
                branches: [
                  {
                    case: {
                      $and: [
                        { $gte: ["$$fillPercentage", 50] },
                        { $lte: ["$$fillPercentage", 80] },
                      ],
                    },
                    then: 30000,
                  },
                  {
                    case: {
                      $and: [
                        { $gte: ["$$fillPercentage", 25] },
                        { $lt: ["$$fillPercentage", 50] },
                      ],
                    },
                    then: 20000,
                  },
                  {
                    case: {
                      $and: [
                        { $gt: ["$$fillPercentage", 80] },
                        { $lt: ["$$fillPercentage", 100] },
                      ],
                    },
                    then: 10000,
                  },
                ],
                default: 0,
              },
            },
          },
        },
        // Time decay - gentler decrease
        {
          $subtract: [
            0,
            {
              $divide: [
                { $subtract: [new Date(), "$createdAt"] },
                1000 * 60 * 60, // Hours
              ],
            },
          ],
        },
      ],
    },
  },
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 12;
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const totalCount = await cardsRoomModel.countDocuments();

    const rooms = await cardsRoomModel.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "players.player",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $addFields: {
          players: {
            $map: {
              input: "$players",
              as: "player",
              in: {
                $mergeObjects: [
                  {
                    $arrayElemAt: [
                      "$userDetails",
                      {
                        $indexOfArray: ["$userDetails._id", "$$player.player"],
                      },
                    ],
                  },
                  { checkedIn: "$$player.checkedIn" },
                ],
              },
            },
          },
        },
      },
      getRoomSortScore,
      {
        $project: {
          name: 1,
          creator: 1,
          maxPlayers: 1,
          pot: 1,
          timer: 1,
          winner: 1,
          gameStatus: 1,
          createdAt: 1,
          tournamentId: 1,
          isComputerPlay: 1,
          // sortScore: 1, // Add this to see the calculated scores
          "players._id": 1,
          "players.username": 1,
          "players.name": 1,
          "players.profilePicture": 1,
          "players.checkedIn": 1,
        },
      },
      {
        $sort: {
          sortScore: -1,
          createdAt: -1,
        },
      },
      { $skip: skip },
      { $limit: limit },
    ]);

    if (rooms.length === 0) {
      return NextResponse.json(
        { message: "No cards rooms found" },
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    console.log(`Returning ${rooms.length} rooms`);

    return NextResponse.json(
      {
        rooms,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // return NextResponse.json(rooms, {
    //   status: 200,
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    // });
  } catch (error) {
    console.error("Error fetching rooms:", error);

    return NextResponse.json(
      { message: "Internal Server Error(get rooms)" },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
