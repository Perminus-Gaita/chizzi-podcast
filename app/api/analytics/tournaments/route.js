import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getUserSession } from "@/services/auth/get-user-session";
import mongoose from 'mongoose';
import { TournamentModel, MatchModel, ParticipantModel } from '@/models/tournament.model';

export async function GET(request) {
    try {
        const userSession = await getUserSession(cookies, true);
        const currentWorkspaceId = userSession?.currentWorkspace?._id;

        // Get analytics data for all time ranges
        const analyticsData = await getWorkspaceTournamentAnalytics(currentWorkspaceId);

        return NextResponse.json(
            { message: "Tournament analytics data retrieved", data: analyticsData },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error getting tournament analytics:', error);
        return NextResponse.json(
            { message: error.message || "An error occurred" },
            { status: error.statusCode || 500 }
        );
    }
}

const getWorkspaceTournamentAnalytics = async (workspaceId) => {
    try {
        // Define time ranges
        const now = new Date();
        const timeRanges = {
            daily: {
                startDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
                groupBy: {
                    day: { $dayOfMonth: "$createdAt" },
                    month: { $month: "$createdAt" },
                    year: { $year: "$createdAt" }
                },
                dateFormat: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
            },
            weekly: {
                startDate: new Date(now.getTime() - 4 * 7 * 24 * 60 * 60 * 1000),
                groupBy: { week: { $week: "$createdAt" }, year: { $year: "$createdAt" } },
                dateFormat: {
                    $concat: [
                        { $toString: { $year: "$createdAt" } },
                        " Week ",
                        { $toString: { $week: "$createdAt" } }
                    ]
                }
            },
            monthly: {
                startDate: new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000),
                groupBy: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
                dateFormat: {
                    $concat: [
                        { $let: {
                            vars: {
                                months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
                            },
                            in: { $arrayElemAt: ["$$months", { $subtract: [{ $month: "$createdAt" }, 1] }] }
                        }},
                        " ",
                        { $toString: { $year: "$createdAt" } }
                    ]
                }
            },
            allTime: {
                startDate: new Date(0),
                groupBy: {
                    quarter: { $ceil: { $divide: [{ $month: "$createdAt" }, 3] } },
                    year: { $year: "$createdAt" }
                },
                dateFormat: {
                    $concat: [
                        { $toString: { $year: "$createdAt" } },
                        " Q",
                        { $toString: { $ceil: { $divide: [{ $month: "$createdAt" }, 3] } } }
                    ]
                }
            }
        };

        // Get all tournaments for this workspace
        const tournaments = await TournamentModel.find({
            creator: new mongoose.Types.ObjectId(workspaceId)
        });

        const tournamentIds = tournaments.map(t => t._id);
        const results = {};

        // Process each time range
        for (const [rangeName, config] of Object.entries(timeRanges)) {
            // Get tournament metrics
            const tournamentMetrics = await TournamentModel.aggregate([
                {
                    $match: {
                        creator: new mongoose.Types.ObjectId(workspaceId),
                        createdAt: { $gte: config.startDate }
                    }
                },
                {
                    $group: {
                        _id: config.groupBy,
                        tournaments: { $sum: 1 },
                        date: { $first: config.dateFormat }
                    }
                },
                { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
            ]);

            // Get match metrics with participant check
            const matchMetrics = await MatchModel.aggregate([
                {
                    $match: {
                        tournamentId: { $in: tournamentIds },
                        createdAt: { $gte: config.startDate }
                    }
                },
                {
                    $lookup: {
                        from: "participants",
                        let: { matchId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $eq: ["$matchId", "$$matchId"] }
                                }
                            }
                        ],
                        as: "matchParticipants"
                    }
                },
                {
                    $match: {
                        "matchParticipants": { $not: { $size: 0 } }
                    }
                },
                {
                    $group: {
                        _id: config.groupBy,
                        matches: { $sum: 1 },
                        date: { $first: config.dateFormat }
                    }
                },
                { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
            ]);

            // Get participant metrics - count all participations
            const participantMetrics = await ParticipantModel.aggregate([
                {
                    $match: {
                        tournamentId: { $in: tournamentIds },
                        createdAt: { $gte: config.startDate }
                    }
                },
                {
                    $group: {
                        _id: config.groupBy,
                        participants: { $sum: 1 }, // Count all participations
                        date: { $first: config.dateFormat }
                    }
                },
                { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
            ]);

            // Combine metrics
            const timeSeriesData = tournamentMetrics.map(tournament => {
                const participant = participantMetrics.find(
                    p => JSON.stringify(p._id) === JSON.stringify(tournament._id)
                ) || { participants: 0 };
                
                const match = matchMetrics.find(
                    m => JSON.stringify(m._id) === JSON.stringify(tournament._id)
                ) || { matches: 0 };

                return {
                    date: tournament.date,
                    tournaments: tournament.tournaments,
                    matches: match.matches,
                    participants: participant.participants
                };
            });

            // Calculate totals
            const periodTotals = timeSeriesData.reduce((acc, item) => ({
                tournaments: acc.tournaments + item.tournaments,
                matches: acc.matches + item.matches,
                participants: acc.participants + item.participants
            }), { tournaments: 0, matches: 0, participants: 0 });

            // Store results for this time range
            results[rangeName] = {
                timeSeriesData,
                totals: {
                    ...periodTotals,
                    totalTournaments: tournaments.length
                }
            };
        }

        return results;
    } catch (error) {
        console.error('Error calculating tournament analytics:', error);
        throw error;
    }
};