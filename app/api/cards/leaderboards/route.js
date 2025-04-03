import { NextResponse } from "next/server";
import database_connection from "@/services/database";
import {
  generateGlobalLeaderboard,
  generateMonthlyLeaderboard,
  generateSpeedLeaderboard,
} from "@/services/cards/gameActions";
import { kadiPlayerModel } from "@/models/kadiplayer.model";

export const dynamic = "force-dynamic";

const CORE_LEADERBOARDS = {
  RANKED: {
    GLOBAL: async (limit = 100, skip = 0) => {
      try {
        return await kadiPlayerModel.aggregate([
          {
            $lookup: {
              from: "users",
              localField: "userId",
              foreignField: "_id",
              as: "userInfo",
            },
          },
          { $unwind: "$userInfo" },
          {
            $project: {
              name: "$userInfo.name",
              username: "$userInfo.username",
              profilePicture: "$userInfo.profilePicture",
              rating: 1,
              totalGames: 1,
              rankedWins: 1,
              rankingTier: 1,
              seasonHighest: 1,
              winStreak: 1,
              winRate: {
                $multiply: [
                  { $divide: ["$rankedWins", { $max: ["$totalGames", 1] }] },
                  100,
                ],
              },
              performanceScore: "$seasonScore",
            },
          },
          { $sort: { rating: -1 } },
          { $skip: skip },
          { $limit: limit },
        ]);
      } catch (error) {
        console.error("Error generating global leaderboard:", error);
        throw error;
      }
    },

    SEASONAL: async (limit = 100, skip = 0) => {
      try {
        return await kadiPlayerModel.aggregate([
          {
            $match: {
              seasonGames: { $gt: 0 }, // Only players who played this season
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "userId",
              foreignField: "_id",
              as: "userInfo",
            },
          },
          { $unwind: "$userInfo" },
          {
            $project: {
              name: "$userInfo.name",
              username: "$userInfo.username",
              profilePicture: "$userInfo.profilePicture",
              currentRating: "$rating",
              seasonHighest: 1,
              seasonGames: 1,
              rankingTier: 1,
              ratingGain: { $subtract: ["$rating", 1500] }, // From initial rating
              winStreak: 1,
              seasonScore: 1,
            },
          },
          { $sort: { seasonScore: -1 } },
          { $skip: skip },
          { $limit: limit },
        ]);
      } catch (error) {
        console.error("Error generating seasonal leaderboard:", error);
        throw error;
      }
    },

    TOURNAMENT: async (limit = 100, skip = 0) => {
      try {
        return await kadiPlayerModel.aggregate([
          {
            $match: {
              tournamentsPlayed: { $gt: 0 },
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "userId",
              foreignField: "_id",
              as: "userInfo",
            },
          },
          { $unwind: "$userInfo" },
          {
            $project: {
              name: "$userInfo.name",
              username: "$userInfo.username",
              profilePicture: "$userInfo.profilePicture",
              rating: 1,
              rankingTier: 1,
              tournamentsPlayed: 1,
              tournamentsWon: 1,
              tournamentEarnings: 1,
              winRate: {
                $multiply: [
                  {
                    $divide: [
                      "$tournamentsWon",
                      { $max: ["$tournamentsPlayed", 1] },
                    ],
                  },
                  100,
                ],
              },
            },
          },
          { $sort: { tournamentEarnings: -1 } },
          { $skip: skip },
          { $limit: limit },
        ]);
      } catch (error) {
        console.error("Error generating tournament leaderboard:", error);
        throw error;
      }
    },

    EARNINGS: async (limit = 100, skip = 0) => {
      try {
        return await kadiPlayerModel.aggregate([
          {
            $match: {
              $or: [
                { tournamentEarnings: { $gt: 0 } },
                { "achievements.tournamentTitan": { $gt: 0 } },
              ],
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "userId",
              foreignField: "_id",
              as: "userInfo",
            },
          },
          { $unwind: "$userInfo" },
          {
            $project: {
              name: "$userInfo.name",
              username: "$userInfo.username",
              profilePicture: "$userInfo.profilePicture",
              rating: 1,
              rankingTier: 1,
              tournamentEarnings: 1,
              tournamentsWon: 1,
              achievements: {
                tournamentTitan: 1,
              },
            },
          },
          { $sort: { tournamentEarnings: -1 } },
          { $skip: skip },
          { $limit: limit },
        ]);
      } catch (error) {
        console.error("Error generating earnings leaderboard:", error);
        throw error;
      }
    },
  },
};

const SKILL_MASTERY_LEADERBOARDS = {
  QUESTION_SEQUENCE: async (limit = 100, skip = 0) => {
    try {
      return await kadiPlayerModel.aggregate([
        {
          $match: {
            "skillMetrics.questionSequences.total": { $gt: 0 },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userInfo",
          },
        },
        { $unwind: "$userInfo" },
        {
          $project: {
            name: "$userInfo.name",
            username: "$userInfo.username",
            profilePicture: "$userInfo.profilePicture",
            rating: 1,
            rankingTier: 1,
            totalSequences: "$skillMetrics.questionSequences.total",
            longestSequence: "$skillMetrics.questionSequences.longest",
            winRate: "$skillMetrics.questionSequences.winRate",
            perfectGames: "$skillMetrics.efficiency.perfectGames",
            totalGames: 1,
          },
        },
        {
          $addFields: {
            sequencesPerGame: {
              $divide: ["$totalSequences", { $max: ["$totalGames", 1] }],
            },
          },
        },
        { $sort: { totalSequences: -1 } },
        { $skip: skip },
        { $limit: limit },
      ]);
    } catch (error) {
      console.error("Error generating sequence mastery leaderboard:", error);
      throw error;
    }
  },

  SPECIAL_CARDS: async (limit = 100, skip = 0) => {
    try {
      return await kadiPlayerModel.aggregate([
        {
          $match: {
            $or: [
              { "skillMetrics.specialMoves.aceControls": { $gt: 0 } },
              { "skillMetrics.specialMoves.jumpChains": { $gt: 0 } },
              { "skillMetrics.specialMoves.successfulKickbacks": { $gt: 0 } },
              { "skillMetrics.specialMoves.penaltyAvoidances": { $gt: 0 } },
            ],
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userInfo",
          },
        },
        { $unwind: "$userInfo" },
        {
          $project: {
            name: "$userInfo.name",
            username: "$userInfo.username",
            profilePicture: "$userInfo.profilePicture",
            rating: 1,
            rankingTier: 1,
            aceControls: "$skillMetrics.specialMoves.aceControls",
            jumpChains: "$skillMetrics.specialMoves.jumpChains",
            successfulKickbacks:
              "$skillMetrics.specialMoves.successfulKickbacks",
            penaltyAvoidances: "$skillMetrics.specialMoves.penaltyAvoidances",
            totalGames: 1,
            totalMoves: {
              $add: [
                "$skillMetrics.specialMoves.aceControls",
                "$skillMetrics.specialMoves.jumpChains",
                "$skillMetrics.specialMoves.successfulKickbacks",
                "$skillMetrics.specialMoves.penaltyAvoidances",
              ],
            },
          },
        },
        {
          $addFields: {
            specialMovesPerGame: {
              $divide: ["$totalMoves", { $max: ["$totalGames", 1] }],
            },
          },
        },
        { $sort: { totalMoves: -1 } },
        { $skip: skip },
        { $limit: limit },
      ]);
    } catch (error) {
      console.error("Error generating special cards leaderboard:", error);
      throw error;
    }
  },

  EFFICIENCY: async (limit = 100, skip = 0) => {
    try {
      return await kadiPlayerModel.aggregate([
        {
          $match: {
            totalGames: { $gt: 10 }, // Minimum games for meaningful stats
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userInfo",
          },
        },
        { $unwind: "$userInfo" },
        {
          $project: {
            name: "$userInfo.name",
            username: "$userInfo.username",
            profilePicture: "$userInfo.profilePicture",
            rating: 1,
            rankingTier: 1,
            averageMoveTime: "$skillMetrics.efficiency.averageMoveTime",
            cardEfficiency: "$skillMetrics.efficiency.cardEfficiency",
            perfectGames: "$skillMetrics.efficiency.perfectGames",
            totalGames: 1,
            efficiencyScore: {
              $add: [
                { $multiply: ["$skillMetrics.efficiency.cardEfficiency", 100] },
                {
                  $multiply: [
                    {
                      $divide: [
                        "$skillMetrics.efficiency.perfectGames",
                        { $max: ["$totalGames", 1] },
                      ],
                    },
                    50,
                  ],
                },
              ],
            },
          },
        },
        { $sort: { efficiencyScore: -1 } },
        { $skip: skip },
        { $limit: limit },
      ]);
    } catch (error) {
      console.error("Error generating efficiency leaderboard:", error);
      throw error;
    }
  },
};

export async function GET(request) {
  try {
    await database_connection();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit")) || 100;
    const skip = parseInt(searchParams.get("skip")) || 0;
    const type = searchParams.get("type") || "all";
    const category = searchParams.get("category") || "competitive"; // new parameter

    let response = {};

    if (category === "competitive") {
      if (type === "all") {
        const [global, seasonal, tournament, earnings] = await Promise.all([
          CORE_LEADERBOARDS.RANKED.GLOBAL(limit, skip),
          CORE_LEADERBOARDS.RANKED.SEASONAL(limit, skip),
          CORE_LEADERBOARDS.RANKED.TOURNAMENT(limit, skip),
          CORE_LEADERBOARDS.RANKED.EARNINGS(limit, skip),
        ]);

        response = {
          global,
          seasonal,
          tournament,
          earnings,
        };
      } else {
        response = {
          [type]: await CORE_LEADERBOARDS.RANKED[type.toUpperCase()](
            limit,
            skip
          ),
        };
      }
    } else if (category === "skills") {
      if (type === "all") {
        const [sequences, specialCards, efficiency] = await Promise.all([
          SKILL_MASTERY_LEADERBOARDS.QUESTION_SEQUENCE(limit, skip),
          SKILL_MASTERY_LEADERBOARDS.SPECIAL_CARDS(limit, skip),
          SKILL_MASTERY_LEADERBOARDS.EFFICIENCY(limit, skip),
        ]);

        response = {
          sequences,
          specialCards,
          efficiency,
        };
      } else {
        response = {
          [type]: await SKILL_MASTERY_LEADERBOARDS[type.toUpperCase()](
            limit,
            skip
          ),
        };
      }
    }

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error fetching leaderboards:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
