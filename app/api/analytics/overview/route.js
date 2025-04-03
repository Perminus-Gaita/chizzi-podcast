import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getUserSession } from "@/services/auth/get-user-session";
import mongoose from 'mongoose';
import { TournamentModel, ParticipantModel } from '@/models/tournament.model';

export async function GET(request) {
    try {
        const userSession = await getUserSession(cookies, true);
        const currentWorkspaceId = userSession?.currentWorkspace?._id;
        const analyticsData = await getWorkspaceAnalytics(currentWorkspaceId);

        return NextResponse.json(
            { message: "Analytics data retrieved", data: analyticsData },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error getting analytics:', error);
        return NextResponse.json(
            { message: error.message || "An error occurred" },
            { status: error.statusCode || 500 }
        );
    }
}

const getWorkspaceAnalytics = async (workspaceId) => {
    try {
        // Calculate date ranges
        const today = new Date();
        const startOfToday = new Date(today.setHours(0, 0, 0, 0));
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        // Run all aggregations in parallel
        const [sponsorshipRevenue, buyInRevenue, participantMetrics, tournamentMetrics, prizePools] = await Promise.all([
            // Sponsorship Revenue
            TournamentModel.aggregate([
                {
                    $match: {
                        creator: new mongoose.Types.ObjectId(workspaceId),
                        type: "sponsored",
                        "sponsorshipDetails.sponsors": { $exists: true }
                    }
                },
                {
                    $facet: {
                        today: [
                            { $match: { createdAt: { $gte: startOfToday } } },
                            { $group: { _id: null, total: { $sum: "$sponsorshipDetails.currentAmount" } } }
                        ],
                        week: [
                            { $match: { createdAt: { $gte: startOfWeek } } },
                            { $group: { _id: null, total: { $sum: "$sponsorshipDetails.currentAmount" } } }
                        ],
                        month: [
                            { $match: { createdAt: { $gte: startOfMonth } } },
                            { $group: { _id: null, total: { $sum: "$sponsorshipDetails.currentAmount" } } }
                        ],
                        allTime: [
                            { $group: { _id: null, total: { $sum: "$sponsorshipDetails.currentAmount" } } }
                        ]
                    }
                }
            ]),

            // Buy-in Revenue
            ParticipantModel.aggregate([
                {
                    $lookup: {
                        from: "tournaments",
                        localField: "tournamentId",
                        foreignField: "_id",
                        as: "tournament"
                    }
                },
                {
                    $match: {
                        "tournament.creator": new mongoose.Types.ObjectId(workspaceId),
                        "tournament.type": "paid",
                        "buyInDetails": { $exists: true }
                    }
                },
                {
                    $facet: {
                        today: [
                            { $match: { createdAt: { $gte: startOfToday } } },
                            { $group: { _id: null, total: { $sum: "$buyInDetails.amount" } } }
                        ],
                        week: [
                            { $match: { createdAt: { $gte: startOfWeek } } },
                            { $group: { _id: null, total: { $sum: "$buyInDetails.amount" } } }
                        ],
                        month: [
                            { $match: { createdAt: { $gte: startOfMonth } } },
                            { $group: { _id: null, total: { $sum: "$buyInDetails.amount" } } }
                        ],
                        allTime: [
                            { $group: { _id: null, total: { $sum: "$buyInDetails.amount" } } }
                        ]
                    }
                }
            ]),

            // Participant Analytics (counting all participations)
            ParticipantModel.aggregate([
                {
                    $lookup: {
                        from: "tournaments",
                        localField: "tournamentId",
                        foreignField: "_id",
                        as: "tournament"
                    }
                },
                {
                    $match: {
                        "tournament.creator": new mongoose.Types.ObjectId(workspaceId)
                    }
                },
                {
                    $facet: {
                        today: [
                            { $match: { createdAt: { $gte: startOfToday } } },
                            { $count: "total" }
                        ],
                        week: [
                            { $match: { createdAt: { $gte: startOfWeek } } },
                            { $count: "total" }
                        ],
                        month: [
                            { $match: { createdAt: { $gte: startOfMonth } } },
                            { $count: "total" }
                        ],
                        total: [
                            { $count: "total" }
                        ]
                    }
                }
            ]),

            // Tournament Analytics
            TournamentModel.aggregate([
                {
                    $match: {
                        creator: new mongoose.Types.ObjectId(workspaceId)
                    }
                },
                {
                    $facet: {
                        active: [
                            {
                                $match: {
                                    status: {
                                        $in: ["draft", "setup", "ready", "in-progress"]
                                    }
                                }
                            },
                            { $count: "total" }
                        ],
                        total: [
                            { $count: "total" }
                        ]
                    }
                }
            ]),

            // Prize Pool Analytics
            TournamentModel.aggregate([
                {
                    $match: {
                        creator: new mongoose.Types.ObjectId(workspaceId),
                        $or: [
                            { 
                                type: "paid",
                                "buyIn.prizePool": { $exists: true }
                            },
                            {
                                type: "sponsored",
                                "sponsorshipDetails.currentAmount": { $exists: true }
                            }
                        ]
                    }
                },
                {
                    $project: {
                        prizePool: {
                            $cond: [
                                { $eq: ["$type", "paid"] },
                                "$buyIn.prizePool",
                                "$sponsorshipDetails.currentAmount"
                            ]
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        averagePrizePool: { $avg: "$prizePool" }
                    }
                }
            ])
        ]);

        // Calculate total revenue for each period
        const revenue = {
            today: (sponsorshipRevenue[0]?.today[0]?.total || 0) + 
                   (buyInRevenue[0]?.today[0]?.total || 0),
            week: (sponsorshipRevenue[0]?.week[0]?.total || 0) + 
                  (buyInRevenue[0]?.week[0]?.total || 0),
            month: (sponsorshipRevenue[0]?.month[0]?.total || 0) + 
                   (buyInRevenue[0]?.month[0]?.total || 0),
            total: (sponsorshipRevenue[0]?.allTime[0]?.total || 0) + 
                   (buyInRevenue[0]?.allTime[0]?.total || 0)
        };

        // Format and return the response
        return {
            revenue,
            participants: {
                today: participantMetrics[0]?.today[0]?.total || 0,
                week: participantMetrics[0]?.week[0]?.total || 0,
                month: participantMetrics[0]?.month[0]?.total || 0,
                total: participantMetrics[0]?.total[0]?.total || 0
            },
            tournaments: {
                active: tournamentMetrics[0]?.active[0]?.total || 0,
                total: tournamentMetrics[0]?.total[0]?.total || 0
            },
            prizePool: {
                average: prizePools[0]?.averagePrizePool || 0
            }
        };
    } catch (error) {
        console.error('Error getting workspace analytics:', error);
        throw error;
    }
}