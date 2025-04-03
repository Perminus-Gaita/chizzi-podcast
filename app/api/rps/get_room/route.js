import { NextResponse } from "next/server";
import rpsRoomModel from "@/models/rpsroom.model";
import mongoose from "mongoose";
import database_connection from "@/services/database";

export const dynamic = "force-dynamic";

database_connection().then(() =>
  console.log("Connected successfully(RPS GET room)")
);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get("roomId");

    const room = await rpsRoomModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(roomId) } },
      {
        $lookup: {
          from: "users",
          localField: "players.user",
          foreignField: "_id",
          as: "playersWithUsernames",
        },
      },
      {
        $project: {
          name: 1,
          players: {
            $map: {
              input: "$players",
              as: "player",
              in: {
                userId: "$$player.user",
                username: {
                  $arrayElemAt: [
                    {
                      $map: {
                        input: "$playersWithUsernames",
                        as: "p",
                        in: "$$p.username",
                      },
                    },
                    {
                      $indexOfArray: [
                        "$playersWithUsernames._id",
                        "$$player.user",
                      ],
                    },
                  ],
                },
                profilePicture: {
                  $arrayElemAt: [
                    {
                      $map: {
                        input: "$playersWithUsernames",
                        as: "p",
                        in: "$$p.profilePicture",
                      },
                    },
                    {
                      $indexOfArray: [
                        "$playersWithUsernames._id",
                        "$$player.user",
                      ],
                    },
                  ],
                },
                score: "$$player.score",
                choice: "$$player.choice",
              },
            },
          },
          gameStatus: 1,
          game: {
            rounds: 1,
          },
        },
      },
    ]);

    return NextResponse.json(room, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching room data:", error);

    return NextResponse.json(
      { message: "Internal Server Error(get room)" },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
