import mongoose from "mongoose";

export const roomAggregationPipeline = (roomId) => [
  { $match: { _id: new mongoose.Types.ObjectId(roomId) } },
  {
    $lookup: {
      from: "users",
      localField: "players.player", // Changed from players.user to players.player
      foreignField: "_id",
      as: "playersWithUsernames",
    },
  },
  {
    $project: {
      _id: 1,
      name: 1,
      maxPlayers: 1,
      timer: 1,
      direction: 1,
      turn: 1,
      gameStatus: 1,
      currentSuit: 1,
      desiredSuit: 1,
      isPenalty: 1,
      isQuestion: 1,
      isKickback: 1,
      jumpCounter: 1,
      winner: 1,
      createdAt: 1,
      updatedAt: 1,
      discardPile: 1,
      drawPileLength: { $size: "$drawPile" },
      players: {
        $map: {
          input: "$players",
          as: "player",
          in: {
            userId: "$$player.player",
            playerDeck: "$$player.playerDeck",
            score: "$$player.score",
            on: "$$player.on",
            numCards: { $size: "$$player.playerDeck" },
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
                    "$$player.player",
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
                    "$$player.player",
                  ],
                },
              ],
            },
          },
        },
      },
      lastGamePlay: { $arrayElemAt: ["$gamePlay", -1] },
      last10Moves: {
        $cond: {
          if: { $eq: ["$gameStatus", "gameover"] },
          then: { $slice: ["$gamePlay", -10] },
          else: "$$REMOVE",
        },
      },
    },
  },
];
