export const maxDuration = 60; // This function can run for a maximum of 60 seconds
export const dynamic = 'force-dynamic';

import mongoose from 'mongoose';
import { NextResponse } from "next/server";
import CompetitionModel from "@/models/competition.model";
import { getUserSession } from "@/services/auth/get-user-session";
import { cookies } from "next/headers";

// Connect to the database
import connectToDatabaseMongoDB from '@/lib/database';
await connectToDatabaseMongoDB("/api/competitions/[competitionId]");

export async function GET(request, { params }) {
  try {
    // Get the current user session
    const sessionUser = await getUserSession(cookies, false);
    const { competitionId } = await params;

    console.log(competitionId);

    const competition = await CompetitionModel.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(competitionId) },
      },
      {
        $lookup: {
          from: "users",
          localField: "creatorId",
          foreignField: "_id",
          as: "creator",
        },
      },
      {
        $unwind: {
          path: "$creator",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "participants.participantId",
          foreignField: "_id",
          as: "populatedParticipants",
        },
      },
      {
        $addFields: {
          participants: {
            $map: {
              input: "$participants",
              as: "participant",
              in: {
                $mergeObjects: [
                  {
                    submissions: "$$participant.submission",
                    votes: "$$participant.votes",
                  },
                  {
                    participant: {
                      $let: {
                        vars: {
                          foundUser: {
                            $arrayElemAt: [
                              "$populatedParticipants",
                              {
                                $indexOfArray: [
                                  "$populatedParticipants._id",
                                  "$$participant.participantId",
                                ],
                              },
                            ],
                          },
                        },
                        in: {
                          _id: "$$foundUser._id",
                          name: "$$foundUser.name",
                          username: "$$foundUser.username",
                          profilePicture: "$$foundUser.profilePicture",
                          type: "$$foundUser.type",
                        },
                      },
                    },
                  },
                ],
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          creator: {
            _id: "$creator._id",
            name: "$creator.name",
            username: "$creator.username",
            profilePicture: "$creator.profilePicture",
            type: "$creator.type",
            isSessionUser: {
              $eq: ["$creator._id", sessionUser?._id],
            },
          },
          status: 1,
          startDate: 1,
          endDate: 1,
          sponsors: 1,
          participants: {
            $map: {
              input: "$participants",
              as: "participant",
              in: {
                _id: "$$participant.participant._id",
                name: "$$participant.participant.name",
                username: "$$participant.participant.username",
                profilePicture: "$$participant.participant.profilePicture",
                type: "$$participant.participant.type",
                submissions: "$$participant.submissions",
                votes: "$$participant.votes",
                isSessionUser: {
                  $eq: ["$$participant.participant._id", sessionUser?._id],
                },
              },
            },
          },
          numberOfParticipants: { $size: "$participants" },
          numberOfSponsors: { $size: "$sponsors" },
          numberOfVotes: {
            $sum: {
              $map: {
                input: "$participants",
                as: "participant",
                in: { $size: "$$participant.votes" },
              },
            },
          },
          isSessionUserAParticipant:{
            $in: [sessionUser?._id, "$participants.participant._id"]
          }
        },
      },
      {
        $project: {
          "participants.populatedParticipants": 0,
        },
      }
    ]);

    if (!competition || competition.length === 0) {
      return NextResponse.json(
        { message: "Competition not found" },
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return NextResponse.json(
      { competition: competition[0] },
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching competition:", error);
    return NextResponse.json(
      { message: "Internal Server Error fetching competition" },
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}