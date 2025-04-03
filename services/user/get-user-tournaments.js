import UserModel from "@/models/user/index.model";

// Connect to the database **Outside of handler function**
import connectToDatabaseMongoDB from "@/lib/database";
await connectToDatabaseMongoDB("getUserTournaments");

export async function getUserTournaments(username) {
  try {
    if (!username) {
      const error = new Error("Username is required");
      error.statusCode = 400;
      throw error;
    }
    const tournaments = await UserModel.aggregate([
      // First find the user by username
      {
        $match: { username: username },
      },
      // Then lookup their tournaments
      {
        $lookup: {
          from: "tournaments",
          localField: "_id",
          foreignField: "creator",
          as: "tournaments",
        },
      },
      // Unwind the tournaments array
      {
        $unwind: "$tournaments",
      },
      // Now replicate the tournament pipeline for each tournament
      {
        $lookup: {
          from: "users",
          localField: "tournaments.creator",
          foreignField: "_id",
          as: "tournaments.creatorDetails",
        },
      },
      {
        $unwind: "$tournaments.creatorDetails",
      },
      {
        $lookup: {
          from: "matches",
          localField: "tournaments._id",
          foreignField: "tournamentId",
          as: "tournaments.matches",
        },
      },
      {
        $lookup: {
          from: "participants",
          localField: "tournaments.matches.participants",
          foreignField: "_id",
          as: "tournaments.allParticipants",
        },
      },
      {
        $addFields: {
          "tournaments.currentParticipants": {
            $size: {
              $setUnion: {
                $reduce: {
                  input: {
                    $filter: {
                      input: "$tournaments.matches",
                      cond: {
                        $or: [
                          { $eq: ["$$this.tournamentRoundText", "Round 1"] },
                          {
                            $eq: [
                              "$$this.tournamentRoundText",
                              "Quarter Final",
                            ],
                          },
                          { $eq: ["$$this.tournamentRoundText", "Semi Final"] },
                        ],
                      },
                    },
                  },
                  initialValue: [],
                  in: {
                    $concatArrays: [
                      "$$value",
                      { $ifNull: ["$$this.participants", []] },
                    ],
                  },
                },
              },
            },
          },
          "tournaments.processedMatches": {
            $map: {
              input: "$tournaments.matches",
              as: "match",
              in: {
                _id: { $toString: "$$match._id" },
                name: "$$match.name",
                nextMatchId: {
                  $toString: { $ifNull: ["$$match.nextMatchId", null] },
                },
                tournamentRoundText: "$$match.tournamentRoundText",
                startTime: "$$match.startTime",
                state: "$$match.state",
                gameRoom: {
                  $toString: { $ifNull: ["$$match.gameRoom", null] },
                },
                participants: {
                  $map: {
                    input: {
                      $filter: {
                        input: "$tournaments.allParticipants",
                        cond: {
                          $in: ["$$this._id", "$$match.participants"],
                        },
                      },
                    },
                    as: "participant",
                    in: {
                      userId: {
                        $toString: { $ifNull: ["$$participant.userId", null] },
                      },
                      name: "$$participant.name",
                      resultText: {
                        $ifNull: ["$$participant.resultText", null],
                      },
                      isWinner: "$$participant.isWinner",
                    },
                  },
                },
              },
            },
          },
        },
      },
      // First sort by the actual date
      {
        $sort: { "tournaments.createdAt": -1 },
      },
      // Then project and convert to string
      {
        $project: {
          _id: { $toString: "$tournaments._id" },
          name: "$tournaments.name",
          telegramGroupId: "$tournaments.telegramGroupId",
          slug: "$tournaments.slug",
          description: "$tournaments.description",
          game: "$tournaments.game",
          format: "$tournaments.format",
          gameRules: "$tournaments.gameRules",
          startTime: { $toString: "$tournaments.startTime" },
          registrationType: "$tournaments.registrationType",
          numberOfParticipants: "$tournaments.numberOfParticipants",
          registrationStart: "$tournaments.registrationStart",
          registrationEnd: "$tournaments.registrationEnd",
          status: "$tournaments.status",
          createdAt: { $toString: "$tournaments.createdAt" },
          updatedAt: { $toString: "$tournaments.updatedAt" },
          currentParticipants: "$tournaments.currentParticipants",
          type: "$tournaments.type",
          buyIn: "$tournaments.buyIn",
          sponsorshipDetails: "$tournaments.sponsorshipDetails",
          prizePool: "$tournaments.prizePool",
          matches: "$tournaments.processedMatches",
          customBannerImage: "$tournaments.customBannerImage",
          creatorDetails: {
            _id: { $toString: "$tournaments.creatorDetails._id" },
            name: "$tournaments.creatorDetails.name",
            username: "$tournaments.creatorDetails.username",
            profilePicture: "$tournaments.creatorDetails.profilePicture",
          },
        },
      },
    ]);
    // console.log({ tournaments });

    return tournaments;
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = error.message || "Error fetching user tournaments";
    }
    console.error(`Error getting tournaments for user ${username}:`, error);
    throw error;
  }
}
