import { TournamentModel } from "@/models/tournament.model";
import database_connection from "@/services/database";
import { NextResponse } from "next/server";

database_connection().then(() =>
  console.log("Connected successfully (fetching showcase tournaments)")
);

// export async function GET(request) {
//   try {
//     const tournaments = await TournamentModel.aggregate([
//       {
//         $lookup: {
//           from: "users",
//           localField: "creator",
//           foreignField: "_id",
//           as: "creatorDetails",
//         },
//       },
//       {
//         $unwind: "$creatorDetails",
//       },
//       {
//         $lookup: {
//           from: "matches",
//           localField: "_id",
//           foreignField: "tournamentId",
//           as: "matches",
//         },
//       },
//       {
//         $addFields: {
//           currentParticipants: {
//             $size: {
//               $setUnion: {
//                 $reduce: {
//                   input: {
//                     $filter: {
//                       input: "$matches",
//                       cond: {
//                         $or: [
//                           { $eq: ["$$this.tournamentRoundText", "Round 1"] },
//                           {
//                             $eq: [
//                               "$$this.tournamentRoundText",
//                               "Quarter Final",
//                             ],
//                           },
//                           { $eq: ["$$this.tournamentRoundText", "Semi Final"] },
//                         ],
//                       },
//                     },
//                   },
//                   initialValue: [],
//                   in: {
//                     $concatArrays: [
//                       "$$value",
//                       { $ifNull: ["$$this.participants", []] },
//                     ],
//                   },
//                 },
//               },
//             },
//           },
//         },
//       },
//       {
//         $project: {
//           _id: 1,
//           name: 1,
//           slug: 1,
//           description: 1,
//           game: 1,
//           format: 1,
//           startTime: 1,
//           registrationType: 1,
//           numberOfParticipants: 1,
//           registrationEnd: 1,
//           status: 1,
//           currentParticipants: 1,
//           type: 1,
//           buyIn: 1,
//           prizePool: 1,
//           "creatorDetails._id": 1,
//           "creatorDetails.name": 1,
//           "creatorDetails.username": 1,
//           "creatorDetails.profilePicture": 1,
//         },
//       },
//       {
//         $sort: { createdAt: -1 }, // Sort by newest first
//       },
//       {
//         $limit: 3, // Limit to 3 documents
//       },
//     ]);

//     if (!tournaments.length) {
//       return NextResponse.json(
//         { message: "No Tournaments Found" },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json({ tournaments }, { status: 200 });
//   } catch (error) {
//     console.error("Error fetching showcase tournaments:", error);
//     return NextResponse.json(
//       { message: "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }

export async function GET(request) {
  try {
    const tournaments = await TournamentModel.aggregate([
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
          from: "matches",
          localField: "_id",
          foreignField: "tournamentId",
          as: "matches",
        },
      },
      // Move the sort to before the rest of the pipeline for better performance
      {
        $sort: { createdAt: -1 },
      },
      {
        $limit: 3, // Limit early in the pipeline for better performance
      },
      {
        $addFields: {
          currentParticipants: {
            $size: {
              $setUnion: {
                $reduce: {
                  input: {
                    $filter: {
                      input: "$matches",
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
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          slug: 1,
          description: 1,
          game: 1,
          format: 1,
          startTime: 1,
          registrationType: 1,
          numberOfParticipants: 1,
          registrationEnd: 1,
          status: 1,
          currentParticipants: 1,
          type: 1,
          buyIn: 1,
          sponsorshipDetails: 1,
          prizePool: 1,
          createdAt: 1, // Include createdAt in projection
          "creatorDetails._id": 1,
          "creatorDetails.name": 1,
          "creatorDetails.username": 1,
          "creatorDetails.profilePicture": 1,
        },
      },
    ]);

    if (!tournaments.length) {
      return NextResponse.json(
        { message: "No Tournaments Found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ tournaments }, { status: 200 });
  } catch (error) {
    console.error("Error fetching showcase tournaments:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
