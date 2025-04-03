import mongoose from "mongoose";

export const roomAggregationPipeline = (roomId) => [
  { $match: { _id: new mongoose.Types.ObjectId(roomId) } },
  {
    $lookup: {
      from: "users",
      localField: "players.player",
      foreignField: "_id",
      as: "playersWithUser",
    },
  },
  {
    $lookup: {
      from: "users",
      localField: "creator",
      foreignField: "_id",
      as: "creatorDetails",
    },
  },
  {
    $unwind: "$creatorDetails",
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
      from: "matches",
      let: { roomId: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$gameRoom", "$$roomId"] },
          },
        },
      ],
      as: "tournamentMatchData",
    },
  },
  {
    $unwind: {
      path: "$tournamentMatchData",
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $project: {
      name: 1,
      maxPlayers: 1,
      timer: 1,
      pot: 1,
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
      tournamentId: 1,
      tournamentDetails: {
        $cond: {
          if: { $gt: [{ $size: "$tournamentDetails" }, 0] },
          then: {
            $let: {
              vars: { tournament: { $arrayElemAt: ["$tournamentDetails", 0] } },
              in: {
                name: "$$tournament.name",
                slug: "$$tournament.slug",
                customTableBackgroundImage:
                  "$$tournament.customTableBackgroundImage",
                customCardSkinImage: "$$tournament.customCardSkinImage",
                status: "$$tournament.status",
                format: "$$tournament.format",
                numberOfParticipants: "$$tournament.numberOfParticipants",
                // Add lookup for creator username
                creatorUsername: "$creatorDetails.username",
              },
            },
          },
          else: null,
        },
      },
      tournamentMatchData: {
        $cond: {
          if: "$tournamentId",
          then: {
            tournamentRoundText: "$tournamentMatchData.tournamentRoundText",
            nextMatchId: "$tournamentMatchData.nextMatchId",
            name: "$tournamentMatchData.name",
            state: "$tournamentMatchData.state",
          },
          else: "$$REMOVE",
        },
      },
      players: {
        $map: {
          input: "$players",
          as: "player",
          in: {
            userId: "$$player.player",
            username: {
              $arrayElemAt: [
                "$playersWithUser.username",
                {
                  $indexOfArray: ["$playersWithUser._id", "$$player.player"],
                },
              ],
            },
            name: {
              $arrayElemAt: [
                "$playersWithUser.name",
                { $indexOfArray: ["$playersWithUser._id", "$$player.player"] },
              ],
            },
            profilePicture: {
              $arrayElemAt: [
                "$playersWithUser.profilePicture",
                {
                  $indexOfArray: ["$playersWithUser._id", "$$player.player"],
                },
              ],
            },
            score: "$$player.score",
            on: "$$player.on",
            checkedIn: "$$player.checkedIn",
            numCards: { $size: "$$player.playerDeck" },
            playerDeck: {
              $cond: {
                if: { $eq: ["$gameStatus", "gameover"] },
                then: "$$player.playerDeck",
                else: "$$REMOVE",
              },
            },
          },
        },
      },
      lastGamePlay: { $arrayElemAt: ["$gamePlay", -1] },
      secondLastGamePlay: {
        $cond: {
          if: { $gte: [{ $size: "$gamePlay" }, 2] },
          then: { $arrayElemAt: ["$gamePlay", -2] },
          else: {
            player: null,
            moveType: null,
            card: null,
            timestamp: null,
          },
        },
      },
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
