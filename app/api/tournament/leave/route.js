import mongoose from "mongoose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getUser } from "@/utils/auth/getUser";
import database_connection from "@/services/database";
import {
  TournamentModel,
  MatchModel,
  ParticipantModel,
} from "@/models/tournament.model";
import WalletModel from "@/models/payments/wallet.model";
import TransactionModel from "@/models/payments/transaction.model";
import { sendTournamentLeaveNotifications } from "@/services/notification/notifications";

database_connection().then(() =>
  console.log("Connected successfully to the database (leave tournament)")
);

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
    const { tournamentId } = await request.json();

    if (!tournamentId) {
      return NextResponse.json(
        { message: "Tournament ID is required" },
        { status: 400 }
      );
    }

    const tournament = await TournamentModel.findById(tournamentId).session(
      session
    );

    if (!tournament) {
      return NextResponse.json(
        { message: "Tournament not found" },
        { status: 404 }
      );
    }

    // Check if the tournament has started
    if (tournament.status !== "draft" && tournament.status !== "setup") {
      return NextResponse.json(
        { message: "Cannot leave the tournament after it has started" },
        { status: 400 }
      );
    }

    let refundTransaction;

    // Handle refund for paid tournaments
    if (tournament.type === "paid") {
      const buyInAmount = tournament.buyIn?.entryFee * 100; // Convert to cents
      const wallet = await WalletModel.findOne({
        userId: new mongoose.Types.ObjectId(userId),
      }).session(session);

      // Create refund transaction
      refundTransaction = new TransactionModel({
        type: "tournamentRefund",
        status: "success",
        userId: new mongoose.Types.ObjectId(userId),
        walletId: wallet._id,
        amount: buyInAmount,
        currency: "KES",
        tournamentId: tournamentId,
      });
      await refundTransaction.save({ session });

      // Update user's wallet
      await WalletModel.updateOne(
        { userId: new mongoose.Types.ObjectId(userId) },
        { $inc: { "balances.KES.balance": buyInAmount } },
        { session }
      );

      // Decrease tournament prize pool
      await TournamentModel.updateOne(
        { _id: tournamentId },
        { $inc: { "buyIn.prizePool": -buyInAmount } },
        { session }
      );
    }

    // Find all matches for the tournament
    const matches = await MatchModel.find({ tournamentId }).session(session);

    let participantFound = false;

    for (const match of matches) {
      for (let i = 0; i < match.participants.length; i++) {
        const participant = await ParticipantModel.findById(
          match.participants[i]
        ).session(session);

        if (participant?.userId.toString() === userId.toString()) {
          match.participants.splice(i, 1);
          participantFound = true;
          await ParticipantModel.findByIdAndDelete(participant._id, {
            session,
          });
          i--;
        }
      }
      await match.save({ session });
    }

    if (!participantFound) {
      await session.abortTransaction();
      return NextResponse.json(
        { message: "You are not a participant in this tournament" },
        { status: 400 }
      );
    }

    await sendTournamentLeaveNotifications(session, {
      tournament,
      userId,
      refundTransaction: tournament.type === "paid" ? refundTransaction : null,
      participantName: sessionUser.username, // or however you store the user's name
      tournamentSlug: tournament.slug,
    });

    await session.commitTransaction();
    return NextResponse.json(
      {
        message: "Player removed successfully",
        tournamentStatus: tournament.status,
      },
      { status: 200 }
    );
  } catch (error) {
    if (session) {
      await session.abortTransaction();
    }
    console.error("Error leaving tournament:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  } finally {
    if (session) {
      await session.endSession();
    }
  }
}
