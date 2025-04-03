// import { NextResponse } from "next/server";
// import database_connection from "@/services/database";
// import {
//   MatchModel,
//   ParticipantModel,
//   TournamentModel,
// } from "@/models/tournament.model";

// // Connect to database
// database_connection().then(() =>
//   console.log("Connected successfully(Tournament Matches GET)")
// );

// const getTournamentMatches = async (tournamentId) => {
//   if (!tournamentId) {
//     throw new Error("Invalid Tournament ID");
//   }

//   // Get matches
//   const matches = await MatchModel.find({
//     tournamentId: tournamentId,
//   }).lean();

//   // Get unique participants
//   const uniqueParticipants = new Set(
//     matches.flatMap((match) => match.participants)
//   );
//   const participantIds = Array.from(uniqueParticipants);

//   // Get participant details
//   const participants = await ParticipantModel.find({
//     _id: { $in: participantIds },
//   })
//     .populate("userId", "name username profilePicture")
//     .lean();

//   // Map matches with participant details
//   return matches.map((match) => ({
//     ...match,
//     participants: match.participants
//       .map((pId) =>
//         participants.find((p) => p._id.toString() === pId.toString())
//       )
//       .filter(Boolean)
//       .map((p) => ({
//         participantId: p._id,
//         userId: p?.userId?._id,
//         name: p.name,
//         resultText: p.resultText,
//         isWinner: p.isWinner,
//         username: p?.userId?.username,
//         profilePicture: p?.userId?.profilePicture,
//       })),
//   }));
// };

// export async function GET(request, { params }) {
//   try {
//     const { tournamentId } = params;

//     const tournament = await TournamentModel.findById(tournamentId);

//     if (!tournament) {
//       return NextResponse.json(
//         { message: "Tournament Not Found" },
//         {
//           status: 404,
//           headers: {
//             "Content-Type": "application/json",
//           },
//         }
//       );
//     }

//     // Get matches data
//     const matches = await getTournamentMatches(tournament._id);

//     return NextResponse.json(
//       { matches },
//       {
//         status: 200,
//         headers: {
//           "Content-Type": "application/json",
//         },
//       }
//     );
//   } catch (error) {
//     console.error("Error fetching tournament matches:", error);

//     return NextResponse.json(
//       { message: "Internal Server Error(get tournament matches)" },
//       {
//         status: 500,
//         headers: {
//           "Content-Type": "application/json",
//         },
//       }
//     );
//   }
// }

import { NextResponse } from "next/server";
import database_connection from "@/services/database";
import {
  MatchModel,
  ParticipantModel,
  TournamentModel,
} from "@/models/tournament.model";

database_connection();

const getTournamentMatches = async (tournamentId) => {
  if (!tournamentId) throw new Error("Invalid Tournament ID");

  const matches = await MatchModel.find({ tournamentId })
    .populate({
      path: "participants",
      populate: {
        path: "userId",
        select: "name username profilePicture",
      },
    })
    .populate("gameRoom", "status players")
    .lean();

  return matches.map((match) => ({
    ...match,
    participants: match.participants.map((p) => ({
      participantId: p._id,
      userId: p.userId?._id,
      name: p.name,
      username: p.userId?.username,
      profilePicture: p.userId?.profilePicture,
      resultText: p.resultText,
      isWinner: p.isWinner,
      tournamentType: p.tournamentType,
      buyInDetails: p.tournamentType === "paid" ? p.buyInDetails : null,
      gameStatus: match.gameRoom?.status,
      playerState: match.gameRoom?.players.find(
        (player) => player.player.toString() === p.userId?._id.toString()
      ),
    })),
  }));
};

export async function GET(request, props) {
  const params = await props.params;
  try {
    const { tournamentId } = params;

    const tournament = await TournamentModel.findById(tournamentId)
      .populate("creator", "name username profilePicture")
      .lean();

    if (!tournament) {
      return NextResponse.json(
        { message: "Tournament Not Found" },
        { status: 404 }
      );
    }

    const matches = await getTournamentMatches(tournament._id);

    return NextResponse.json(
      {
        matches,
        tournament: {
          type: tournament.type,
          prizePool:
            tournament.type === "sponsored"
              ? tournament.sponsorshipDetails.currentAmount
              : tournament.buyIn.prizePool,
          prizeDistribution: tournament.prizeDistribution,
          paymentDistribution: tournament.paymentDistribution,
          creator: tournament.creator,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching tournament matches:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
