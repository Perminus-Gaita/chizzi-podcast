import { NextResponse } from "next/server";
import { getUser } from "@/utils/auth/getUser";
import { cookies } from "next/headers";
import mongoose from "mongoose";
import cardsRoomModel from "@/models/cardsroom.model";
import { kadiPlayerModel } from "@/models/kadiplayer.model";
import connectToDatabaseMongoDB from "@/lib/database";

export async function GET(request) {
  try {
    await connectToDatabaseMongoDB("fetching player stats");
    const session = await mongoose.startSession();
    session.startTransaction();

    const sessionUser = await getUser(cookies);

    if (!sessionUser) {
      return NextResponse.json(
        { message: "No User Session Available" },
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const playerId = sessionUser?._id.toString();

    const player = await kadiPlayerModel.findOne({ userId: playerId }).lean();

    if (!player) {
      return NextResponse.json(
        { message: "Player not found" },
        { status: 404 }
      );
    }

    const rankDetails = calculatePlayerRank(player);

    return NextResponse.json({
      stats: player,
      ranking: rankDetails,
    });
  } catch (error) {
    console.error("Error fetching matches:", error);
    return NextResponse.json(
      { message: "Internal Server Error(get matches)" },
      { status: 500 }
    );
  }
}

const RATING_TITLES = {
  BRONZE: {
    NOVICE: { threshold: 0, title: "Bronze Novice" },
    COMPETITOR: { threshold: 1200, title: "Bronze Competitor" },
    ELITE: { threshold: 1350, title: "Bronze Elite" },
  },
  SILVER: {
    CHALLENGER: { threshold: 1500, title: "Silver Challenger" },
    VETERAN: { threshold: 1700, title: "Silver Veteran" },
    ELITE: { threshold: 1850, title: "Silver Elite" },
  },
  GOLD: {
    MASTER: { threshold: 2000, title: "Gold Master" },
    EXPERT: { threshold: 2200, title: "Gold Expert" },
    ELITE: { threshold: 2350, title: "Gold Elite" },
  },
  PLATINUM: {
    CHAMPION: { threshold: 2500, title: "Platinum Champion" },
    MASTER: { threshold: 2700, title: "Platinum Master" },
    ELITE: { threshold: 2850, title: "Platinum Elite" },
  },
  DIAMOND: {
    GRANDMASTER: { threshold: 3000, title: "Diamond Grandmaster" },
    ELITE: { threshold: 3200, title: "Diamond Elite" },
    LEGENDARY: { threshold: 3400, title: "Diamond Legend" },
  },
};

function calculatePlayerPrestige(player) {
  let prestige = 0;

  // Win-based prestige
  prestige += player.rankedWins * 15;
  prestige += player.casualWins * 5;

  // Tournament prestige
  prestige += player.tournamentsPlayed * 20;
  prestige += player.tournamentsWon * 100;
  prestige += Math.floor(player.tournamentEarnings / 100);

  // Achievement prestige
  const achievementPoints = Object.values(player.achievements).reduce(
    (sum, count) => sum + count * 50,
    0
  );
  prestige += achievementPoints;

  // Consistency prestige
  const winRate =
    player.totalGames > 0 ? player.rankedWins / player.totalGames : 0;
  prestige += Math.floor(winRate * 200);

  // Season performance
  prestige += player.seasonScore / 100;

  return prestige;
}

function getDetailedRankInfo(rating, prestige) {
  // Find base tier (BRONZE, SILVER, etc.)
  let tier = Object.entries(RATING_TITLES).find(([_, ranges]) => {
    const thresholds = Object.values(ranges);
    return (
      rating >= thresholds[0].threshold &&
      rating < thresholds[thresholds.length - 1].threshold + 400
    );
  });

  if (!tier) {
    tier = ["BRONZE", RATING_TITLES.BRONZE];
  }

  // Find specific rank within tier
  const [tierName, ranks] = tier;
  const rank = Object.entries(ranks).find(
    ([_, data]) => rating >= data.threshold
  );
  const [rankName, rankData] = rank || Object.entries(ranks)[0];

  // Calculate progress to next rank
  const ranksArray = Object.entries(ranks);
  const currentRankIndex = ranksArray.findIndex(([name]) => name === rankName);
  const nextRank = ranksArray[currentRankIndex + 1];

  let progress = null;
  if (nextRank) {
    const [nextRankName, nextRankData] = nextRank;
    const rangeSize = nextRankData.threshold - rankData.threshold;
    const playerProgress = rating - rankData.threshold;
    progress = {
      current: playerProgress,
      total: rangeSize,
      percentage: Math.min(100, Math.floor((playerProgress / rangeSize) * 100)),
      nextTitle: nextRankData.title,
    };
  }

  return {
    title: rankData.title,
    tier: tierName,
    rank: rankName,
    prestige,
    progress,
    rating,
  };
}

export function calculatePlayerRank(player) {
  const prestige = calculatePlayerPrestige(player);
  const rankInfo = getDetailedRankInfo(player.rating, prestige);

  return {
    ...rankInfo,
    stats: {
      totalGames: player.totalGames,
      rankedWins: player.rankedWins,
      winStreak: player.winStreak,
      seasonScore: player.seasonScore,
      tournamentStats: {
        played: player.tournamentsPlayed,
        won: player.tournamentsWon,
        earnings: player.tournamentEarnings,
      },
      achievements: player.achievements,
    },
  };
}
