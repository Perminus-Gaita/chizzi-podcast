"use server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { getUser } from "@/utils/auth/getUser";
import database_connection from "@/services/database";
import {
  TournamentModel,
  MatchModel,
  ParticipantModel,
} from "@/models/tournament.model";
import WalletModel from "@/models/payments/wallet.model";
import TransactionModel from "@/models/payments/transaction.model";
import cardsRoomModel from "@/models/cardsroom.model";
import { kadiPlayerModel } from "@/models/kadiplayer.model";
import { jokerDrawPile } from "@/utils/cards";
import {
  createTournamentNotification,
  sendTournamentJoinNotifications,
} from "@/services/notification/notifications";

database_connection().then(() =>
  console.log("Connected successfully to the database (tournaments)")
);

async function startTournament(tournament, finalPrizePool, session) {
  // Determine the target match type based on participants
  let targetMatchText = "";
  if (tournament.numberOfParticipants === 4) {
    targetMatchText = "Semi Final";
  } else if (tournament.numberOfParticipants === 8) {
    targetMatchText = "Quarter Final";
  } else if (
    tournament.numberOfParticipants === 16 ||
    tournament.numberOfParticipants === 32 ||
    tournament.numberOfParticipants === 64 ||
    tournament.numberOfParticipants === 128 ||
    tournament.numberOfParticipants === 256 ||
    tournament.numberOfParticipants === 512
  ) {
    targetMatchText = "Round 1";
  } else {
    throw new Error("Unsupported number of participants");
  }

  // Get all first round matches
  const matches = await MatchModel.find({
    tournamentId: tournament._id,
    tournamentRoundText: targetMatchText,
  })
    .populate("participants")
    .session(session);

  // Create game rooms for matches
  for (const match of matches) {
    if (match.participants.length >= 2) {
      const playerRatings = await Promise.all(
        match.participants.map(async (p) => {
          const kadiPlayer = await kadiPlayerModel
            .findOne({ userId: p.userId })
            .session(session);
          return kadiPlayer?.rating || 1500;
        })
      );

      const cardsRoom = await cardsRoomModel.create(
        [
          {
            name: `${tournament.slug}-${match.name.split(" ").join("")}`,
            creator: tournament.creator,
            tournamentId: tournament._id,
            maxPlayers: 2,
            timer: false, // change back to true
            pot: finalPrizePool,
            direction: 1,
            turn: null,
            currentSuit: null,
            desiredSuit: null,
            jumpCounter: 0,
            gameStatus: "waiting",
            isPenalty: false,
            isQuestion: false,
            isKickback: false,
            winner: null,
            players: match.participants.map((p, index) => ({
              player: p.userId,
              playerDeck: [],
              score: 0,
              on: false,
              checkedIn: false,
              initialRating: playerRatings[index],
              specialMoves: {
                jumpCards: 0,
                kickbackCards: 0,
                aceDeclarations: 0,
                penaltyAvoidances: 0,
              },
              stallingPenalties: 0,
            })),
            drawPile: jokerDrawPile,
            discardPile: [],
            tournamentMultiplier: 1.5,
          },
        ],
        { session }
      );

      match.gameRoom = cardsRoom[0]._id;
      match.state = "IN_PROGRESS";
      await match.save({ session });
    }
  }

  // Update tournament status
  tournament.status = "in-progress";
  tournament.startDate = new Date();

  // CREATE NOTIFICATIONS
  // 1. Send tournament start notification to all participants
  const uniqueParticipantIds = new Set(
    matches.flatMap((match) =>
      match.participants.map((p) => p.userId.toString())
    )
  );

  await Promise.all(
    Array.from(uniqueParticipantIds).map((userId) =>
      createTournamentNotification(session, {
        userId: new mongoose.Types.ObjectId(userId),
        type: "tournamentStarted",
        tournamentId: tournament._id,
        message: `${tournament.name} has started! Your matches are ready.`,
        metadata: {
          startDate: new Date(),
          prizePool:
            tournament.type === "paid" ? tournament.buyIn?.prizePool : 0,
          participantCount: tournament.numberOfParticipants,
          format: tournament.format,
          tournamentSlug: tournament.slug,
        },
      })
    )
  );

  // 2. Send match assignments to each participant
  for (const match of matches) {
    for (const participant of match.participants) {
      const opponent = match.participants.find(
        (p) => p.userId.toString() !== participant.userId.toString()
      );

      await createTournamentNotification(session, {
        userId: participant.userId,
        type: "matchReady",
        tournamentId: tournament._id,
        matchId: match._id,
        message: `Your ${match.tournamentRoundText} match is ready!`,
        details: `You'll be playing against ${opponent.name}`,
        metadata: {
          gameRoomId: match.gameRoom,
          opponentId: opponent.userId,
          opponentName: opponent.name,
          matchName: match.name,
          roundName: match.tournamentRoundText,
          tournamentSlug: tournament.slug,
        },
      });
    }
  }

  await tournament.save({ session });

  return matches;
}

export async function POST(request) {
  let session;

  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const sessionUser = await getUser(cookies);
    if (!sessionUser) {
      return NextResponse.json(
        { message: "No User Session Available" },
        { status: 400 }
      );
    }

    const userId = sessionUser?._id;
    const { tournamentId, playerName, referenceNote } = await request.json();

    if (!tournamentId || !playerName) {
      return NextResponse.json(
        { message: "tournamentId and playerName are required" },
        { status: 400 }
      );
    }

    const tournament = await TournamentModel.findById(tournamentId)
      .populate("creator", "username")
      .session(session);

    if (!tournament) {
      return NextResponse.json(
        { message: "Tournament not found" },
        { status: 404 }
      );
    }

    // Handle buy-in for paid tournaments
    let buyInTransactionDocument;

    let buyInDetails = {}; // Initialize buyInDetails

    if (tournament.type === "paid") {
      const buyInAmount = tournament.buyIn?.entryFee;

      if (!buyInAmount || buyInAmount <= 0) {
        throw new Error("Invalid entry fee for tournament");
      }

      buyInDetails = {
        referenceNote, // Store the reference note
        amount: buyInAmount,
        currency: "KES", // Or whatever currency you're using
      };

      // const buyInAmount = tournament.buyIn?.entryFee;
      // const wallet = await WalletModel.findOne({
      //   userId: new mongoose.Types.ObjectId(userId),
      // }).session(session);

      // const amountInLowestDenomination = buyInAmount ? buyInAmount * 100 : 0;

      // if (!wallet || wallet.balances.KES.balance < amountInLowestDenomination) {
      //   throw new Error("Insufficient balance for tournament buy-in");
      // }

      // // Process buy-in transaction
      // [buyInTransactionDocument] = await TransactionModel.create(
      //   [
      //     {
      //       type: "tournamentBuyIn",
      //       status: "success",
      //       userId: new mongoose.Types.ObjectId(userId),
      //       walletId: wallet._id,
      //       amount: amountInLowestDenomination,
      //       currency: "KES",
      //       tournamentId: tournamentId,
      //     },
      //   ],
      //   { session }
      // );

      // // Update wallet and prize pool
      // await WalletModel.updateOne(
      //   { _id: wallet._id },
      //   { $inc: { "balances.KES.balance": -amountInLowestDenomination } },
      //   { session }
      // );

      // await TournamentModel.updateOne(
      //   { _id: tournamentId },
      //   { $inc: { "buyIn.prizePool": amountInLowestDenomination } },
      //   { session }
      // );
    }

    // Check for existing participation
    const existingParticipation = await MatchModel.findOne({
      tournamentId,
      "participants.userId": userId,
    }).session(session);

    if (existingParticipation) {
      throw new Error("User has already joined this tournament");
    }

    // Find available match slot
    const targetMatchText =
      tournament.numberOfParticipants === 4
        ? "Semi Final"
        : tournament.numberOfParticipants === 8
        ? "Quarter Final"
        : "Round 1";

    const availableMatch = await MatchModel.findOne({
      tournamentId,
      tournamentRoundText: targetMatchText,
      $expr: { $lt: [{ $size: "$participants" }, 2] },
    }).session(session);

    if (!availableMatch) {
      throw new Error("No available slots in tournament");
    }

    // Create and add participant
    const newParticipant = await ParticipantModel.create(
      [
        {
          userId: new mongoose.Types.ObjectId(userId),
          matchId: availableMatch._id,
          tournamentId: tournamentId,
          tournamentType: tournament.type,
          name: playerName,
          resultText: null,
          isWinner: false,
          buyInDetails: buyInDetails,

          // buyInDetails: {
          //   transactionId: buyInTransactionDocument?._id,
          //   transactionType: buyInTransactionDocument?.type,
          //   amount: buyInTransactionDocument?.amount,
          //   currency: buyInTransactionDocument?.currency,
          // },
        },
      ],
      { session }
    );

    availableMatch.participants.push(newParticipant[0]._id);
    await availableMatch.save({ session });

    // Check if tournament should auto-start
    const allMatches = await MatchModel.find({ tournamentId })
      .populate("participants")
      .session(session);

    const totalParticipants = allMatches.reduce(
      (sum, match) => sum + match.participants.length,
      0
    );

    let autoStarted = false;

    if (totalParticipants >= tournament.numberOfParticipants) {
      const finalPrizePool =
        tournament.type === "paid"
          ? tournament.buyIn.prizePool + tournament.buyIn.entryFee * 100
          : 0;

      const shouldAutoStart =
        tournament.autoStart &&
        (tournament.type === "paid" ||
          (tournament.type === "sponsored" &&
            tournament.sponsorshipDetails.currentAmount >=
              tournament.sponsorshipDetails.targetAmount));

      if (shouldAutoStart) {
        await startTournament(tournament, finalPrizePool, session);
        autoStarted = true;
      } else {
        tournament.status = "ready";
        await tournament.save({ session });
      }
    } else if (totalParticipants === 1) {
      tournament.status = "setup";
      await tournament.save({ session });
    }

    console.log("### sending --->>> ###");

    // notify creator of tournament joining
    await sendTournamentJoinNotifications(session, {
      tournament,
      participant: newParticipant[0],
      match: availableMatch,
      autoStarted,
      tournamentSlug: tournament.slug,
      totalParticipants,
    });

    await session.commitTransaction();

    return NextResponse.json(
      {
        message: "Successfully joined tournament",
        tournamentStatus: tournament.status,
        autoStarted,
      },
      { status: 200 }
    );
  } catch (error) {
    if (session) {
      await session.abortTransaction();
    }
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: error.message ? 400 : 500 }
    );
  } finally {
    if (session) {
      await session.endSession();
    }
  }
}
