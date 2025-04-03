import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getUserSession } from "@/services/auth/get-user-session";
import mongoose from 'mongoose';
import { TournamentModel } from '@/models/tournament.model';
import { ParticipantModel } from '@/models/tournament.model';

export async function GET(request) {
    try {
        // Get user session
        const userSession = await getUserSession(cookies, true);
        const currentWorkspaceId = userSession?.currentWorkspace?._id;

        // Get analytics data for all time ranges
        const analyticsData = await getWorkspaceAnalytics(currentWorkspaceId);

        return NextResponse.json(
            { message: "Revenue analytics data retrieved", data: analyticsData },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error getting revenue analytics:', error);
        return NextResponse.json(
            { message: error.message || "An error occurred" },
            { status: error.statusCode || 500 }
        );
    }
}

const getWorkspaceAnalytics = async (workspaceId) => {
    try {
        // Calculate time ranges
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

        const results = {};

        // Process each time range
        for (const [rangeName, rangeConfig] of Object.entries(timeRanges)) {
            // Get paid tournament revenue
            const paidTournaments = await TournamentModel.find({
                creator: new mongoose.Types.ObjectId(workspaceId),
                type: 'paid'
            }).select('_id');

            const paidTournamentIds = paidTournaments.map(t => t._id);

            const buyInRevenue = await ParticipantModel.aggregate([
                {
                    $match: {
                        tournamentId: { $in: paidTournamentIds },
                        tournamentType: 'paid',
                        createdAt: { $gte: rangeConfig.startDate }
                    }
                },
                {
                    $group: {
                        _id: rangeConfig.groupBy,
                        buyInRevenue: { $sum: "$buyInDetails.amount" },
                        date: { $first: rangeConfig.dateFormat }
                    }
                },
                { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
            ]);

            // Get sponsored tournament revenue
            const sponsoredRevenue = await TournamentModel.aggregate([
                {
                    $match: {
                        creator: new mongoose.Types.ObjectId(workspaceId),
                        type: 'sponsored',
                        'sponsorshipDetails.sponsors.sponsoredAt': { $gte: rangeConfig.startDate }
                    }
                },
                { $unwind: "$sponsorshipDetails.sponsors" },
                {
                    $group: {
                        _id: {
                            ...rangeConfig.groupBy,
                            date: {
                                $dateFromParts: {
                                    year: { $year: "$sponsorshipDetails.sponsors.sponsoredAt" },
                                    month: { $month: "$sponsorshipDetails.sponsors.sponsoredAt" },
                                    day: { $dayOfMonth: "$sponsorshipDetails.sponsors.sponsoredAt" }
                                }
                            }
                        },
                        sponsorshipRevenue: { $sum: "$sponsorshipDetails.sponsors.amount" },
                        date: { 
                            $first: {
                                $dateToString: { 
                                    format: rangeConfig.dateFormat, 
                                    date: "$sponsorshipDetails.sponsors.sponsoredAt" 
                                }
                            }
                        }
                    }
                },
                { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
            ]);

            // Combine data
            const timeSeriesData = new Map();

            buyInRevenue.forEach(item => {
                timeSeriesData.set(item.date, {
                    date: item.date,
                    buyInRevenue: item.buyInRevenue || 0,
                    sponsorshipRevenue: 0
                });
            });

            sponsoredRevenue.forEach(item => {
                if (timeSeriesData.has(item.date)) {
                    timeSeriesData.get(item.date).sponsorshipRevenue = item.sponsorshipRevenue || 0;
                } else {
                    timeSeriesData.set(item.date, {
                        date: item.date,
                        buyInRevenue: 0,
                        sponsorshipRevenue: item.sponsorshipRevenue || 0
                    });
                }
            });

            // Calculate totals
            const totals = {
                buyInRevenue: buyInRevenue.reduce((sum, item) => sum + (item.buyInRevenue || 0), 0),
                sponsorshipRevenue: sponsoredRevenue.reduce((sum, item) => sum + (item.sponsorshipRevenue || 0), 0)
            };

            results[rangeName] = {
                timeSeriesData: Array.from(timeSeriesData.values()).sort((a, b) => a.date.localeCompare(b.date)),
                totals: {
                    totalRevenue: totals.buyInRevenue + totals.sponsorshipRevenue,
                    buyInRevenue: totals.buyInRevenue,
                    sponsorshipRevenue: totals.sponsorshipRevenue
                }
            };
        }

        return results;
    } catch (error) {
        console.error('Error calculating workspace analytics:', error);
        throw error;
    }
};