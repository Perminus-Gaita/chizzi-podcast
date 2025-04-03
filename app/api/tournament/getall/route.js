import { TournamentModel } from "@/models/tournament.model";
import database_connection from "@/services/database";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

database_connection().then(() =>
  console.log(
    "Connected successfully (fetching all tournaments with participant count)"
  )
);

export async function GET(request) {
  try {
    const tournaments = await TournamentModel.aggregate([
      // First lookup to get the workspace details
      {
        $lookup: {
          from: "users",
          localField: "creator",
          foreignField: "_id",
          as: "workspaceDetails",
        },
      },
      {
        $addFields: {
          workspaceDetails: {
            $cond: {
              if: { $eq: [{ $size: "$workspaceDetails" }, 0] },
              then: [
                {
                  _id: null,
                  name: "Unknown Workspace",
                  username: "unknown",
                  profilePicture: null,
                  type: "workspace",
                  creator: null,
                },
              ],
              else: "$workspaceDetails",
            },
          },
        },
      },
      { $unwind: "$workspaceDetails" },

      // Get workspace creator details
      {
        $lookup: {
          from: "users",
          localField: "workspaceDetails.creator",
          foreignField: "_id",
          as: "creatorDetails",
        },
      },
      {
        $addFields: {
          creatorDetails: {
            $cond: {
              if: { $eq: [{ $size: "$creatorDetails" }, 0] },
              then: [
                {
                  _id: null,
                  name: "Unknown Creator",
                  username: "unknown",
                  profilePicture: null,
                },
              ],
              else: "$creatorDetails",
            },
          },
        },
      },
      { $unwind: "$creatorDetails" },

      // Simplified participants lookup
      {
        $lookup: {
          from: "participants",
          localField: "_id",
          foreignField: "tournamentId",
          as: "participants",
        },
      },

      // Sponsorships lookup
      {
        $lookup: {
          from: "sponsorships",
          let: { tournamentId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$tournamentId", "$$tournamentId"] },
                status: "success",
              },
            },
            {
              $lookup: {
                from: "users",
                localField: "sponsorId",
                foreignField: "_id",
                as: "sponsorDetails",
              },
            },
            {
              $unwind: {
                path: "$sponsorDetails",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                _id: 1,
                amount: 1,
                createdAt: 1,
                sponsor: {
                  _id: { $ifNull: ["$sponsorDetails._id", null] },
                  username: {
                    $ifNull: ["$sponsorDetails.username", "unknown"],
                  },
                  name: {
                    $ifNull: ["$sponsorDetails.name", "Unknown Sponsor"],
                  },
                  profilePicture: {
                    $ifNull: ["$sponsorDetails.profilePicture", null],
                  },
                },
              },
            },
            { $sort: { amount: -1 } },
          ],
          as: "sponsors",
        },
      },

      {
        $lookup: {
          from: "participants",
          let: { tournamentId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$tournamentId", "$$tournamentId"] },
              },
            },
            {
              $group: {
                _id: "$userId",
              },
            },
          ],
          as: "uniqueParticipants",
        },
      },
      {
        $addFields: {
          currentParticipants: { $size: "$uniqueParticipants" },
        },
      },

      // sponsorship stats
      {
        $addFields: {
          sponsorshipStats: {
            totalAmount: { $sum: { $ifNull: ["$sponsors.amount", 0] } },
            sponsorCount: { $size: { $ifNull: ["$sponsors", []] } },
            topSponsors: { $slice: [{ $ifNull: ["$sponsors", []] }, 3] },
            recentSponsors: {
              $slice: [
                {
                  $sortArray: {
                    input: { $ifNull: ["$sponsors", []] },
                    sortBy: { createdAt: -1 },
                  },
                },
                5,
              ],
            },
          },
        },
      },

      {
        $lookup: {
          from: "matches",
          let: { tournamentId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$tournamentId", "$$tournamentId"] },
              },
            },
            {
              $lookup: {
                from: "participants",
                localField: "participants",
                foreignField: "_id",
                as: "participantDetails",
              },
            },
          ],
          as: "matches",
        },
      },
      {
        $addFields: {
          winners: {
            $cond: {
              if: { $eq: ["$status", "completed"] },
              then: {
                $let: {
                  vars: {
                    // Get Final Match
                    finalMatch: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$matches",
                            as: "match",
                            cond: { $eq: ["$$match.name", "Final"] },
                          },
                        },
                        0,
                      ],
                    },
                  },
                  in: {
                    first: {
                      $arrayElemAt: [
                        {
                          $map: {
                            input: {
                              $filter: {
                                input: "$$finalMatch.participantDetails",
                                as: "participant",
                                cond: { $eq: ["$$participant.isWinner", true] },
                              },
                            },
                            as: "winner",
                            in: "$$winner.userId",
                          },
                        },
                        0,
                      ],
                    },
                    second: {
                      $arrayElemAt: [
                        {
                          $map: {
                            input: {
                              $filter: {
                                input: "$$finalMatch.participantDetails",
                                as: "participant",
                                cond: {
                                  $eq: ["$$participant.isWinner", false],
                                },
                              },
                            },
                            as: "runner",
                            in: "$$runner.userId",
                          },
                        },
                        0,
                      ],
                    },
                  },
                },
              },
              else: null,
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          let: {
            firstId: "$winners.first",
            secondId: "$winners.second",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: ["$_id", "$$firstId"] },
                    { $eq: ["$_id", "$$secondId"] },
                  ],
                },
              },
            },
            {
              $project: {
                _id: 1,
                name: 1,
                username: 1,
                profilePicture: 1,
              },
            },
          ],
          as: "winnerDetails",
        },
      },
      {
        $addFields: {
          formattedWinners: {
            $cond: {
              if: { $eq: ["$status", "completed"] },
              then: {
                first: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$winnerDetails",
                        as: "user",
                        cond: { $eq: ["$$user._id", "$winners.first"] },
                      },
                    },
                    0,
                  ],
                },
                second: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$winnerDetails",
                        as: "user",
                        cond: { $eq: ["$$user._id", "$winners.second"] },
                      },
                    },
                    0,
                  ],
                },
              },
              else: null,
            },
          },
        },
      },

      {
        $addFields: {
          engagementScore: {
            $add: [
              { $multiply: ["$currentParticipants", 0.4] },
              { $multiply: ["$sponsorshipStats.sponsorCount", 0.3] },
              { $multiply: ["$sponsorshipStats.totalAmount", 0.3] },
            ],
          },
          statusPriority: {
            $switch: {
              branches: [
                { case: { $eq: ["$status", "in-progress"] }, then: 3 },
                { case: { $eq: ["$status", "ready"] }, then: 2 },
                { case: { $eq: ["$status", "setup"] }, then: 1 },
              ],
              default: 0,
            },
          },
        },
      },

      // Final projection
      {
        $project: {
          _id: 1,
          name: 1,
          slug: 1,
          description: 1,
          game: 1,
          format: 1,
          startTime: 1,
          numberOfParticipants: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          currentParticipants: 1,
          type: 1,
          buyIn: 1,
          sponsorshipDetails: 1,
          prizePool: 1,
          prizeDistribution: 1,
          winners: {
            $cond: {
              if: { $eq: ["$status", "completed"] },
              then: {
                first: {
                  userId: "$formattedWinners.first._id",
                  name: "$formattedWinners.first.name",
                  username: "$formattedWinners.first.username",
                  profilePicture: "$formattedWinners.first.profilePicture",
                },
                second: {
                  userId: "$formattedWinners.second._id",
                  name: "$formattedWinners.second.name",
                  username: "$formattedWinners.second.username",
                  profilePicture: "$formattedWinners.second.profilePicture",
                },
              },
              else: null,
            },
          },
          sponsors: 1,
          sponsorshipStats: 1,
          creatorDetails: {
            _id: "$workspaceDetails._id",
            name: "$workspaceDetails.name",
            username: "$workspaceDetails.username",
            profilePicture: "$workspaceDetails.profilePicture",
          },
          customBannerImage: 1,
          viewCount: 1,
          shareCount: 1,
        },
      },

      // Sort by creationdate
      // { $sort: { createdAt: -1 } },
      { $sort: { statusPriority: -1, engagementScore: -1, createdAt: -1 } },
    ]);

    if (!tournaments.length) {
      return NextResponse.json(
        { message: "No Tournaments Found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ tournaments }, { status: 200 });
  } catch (error) {
    console.error("Error fetching all tournaments:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
