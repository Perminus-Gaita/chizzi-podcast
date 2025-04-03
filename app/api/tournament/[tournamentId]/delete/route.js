import { cookies } from "next/headers";
import { getUser } from "@/utils/auth/getUser";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import database_connection from "@/services/database";
import {
  TournamentModel,
  MatchModel,
  ParticipantModel,
} from "@/models/tournament.model";
import WalletModel from "@/models/payments/wallet.model";
import TransactionModel from "@/models/payments/transaction.model";

database_connection().then(() =>
  console.log("Connected successfully (delete tournament)")
);

export async function DELETE(request, props) {
  const params = await props.params;
  let session;

  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const sessionUser = await getUser(cookies);

    if (!sessionUser) {
      return NextResponse.json(
        { message: "No User Session Available" },
        { status: 401 }
      );
    }

    const { tournamentId } = params;

    // Check if the tournament exists
    const tournament = await TournamentModel.findById(tournamentId).session(
      session
    );

    if (!tournament) {
      return NextResponse.json(
        { message: "Tournament not found" },
        { status: 404 }
      );
    }

    // Verify that the user is the tournament creator
    if (
      tournament.creator.toString() !==
      sessionUser.currentWorkspaceId.toString()
    ) {
      return NextResponse.json(
        { message: "Something went wrong." },
        { status: 403 }
      );
    }

    // Handle refunds for paid tournaments
    if (tournament.type === "paid") {
      const matches = await MatchModel.find({ tournamentId }).populate(
        "participants"
      );
      const participants = matches.flatMap((match) => match.participants);
      const uniqueParticipants = [
        ...new Set(participants.map((p) => p.userId.toString())),
      ];

      // Process refunds for each participant
      for (const userId of uniqueParticipants) {
        const buyInAmount = tournament.buyIn?.entryFee * 100; // Convert to cents
        const wallet = await WalletModel.findOne({
          userId: new mongoose.Types.ObjectId(userId),
        }).session(session);

        // Create refund transaction
        const refundTransaction = new TransactionModel({
          type: "tournamentCancelled",
          status: "success",
          userId: new mongoose.Types.ObjectId(userId),
          walletId: wallet._id,
          amount: buyInAmount,
          currency: "KES",
          tournamentId: tournamentId,
        });
        await refundTransaction.save({ session });

        // Update participant's wallet
        await WalletModel.updateOne(
          { userId: new mongoose.Types.ObjectId(userId) },
          { $inc: { "balances.KES.balance": buyInAmount } },
          { session }
        );
      }
    }

    // Get all matches for this tournament
    const matches = await MatchModel.find({ tournamentId });

    // Get all participant IDs from matches
    const participantIds = matches.flatMap((match) => match.participants);

    // Delete all associated data in order
    await ParticipantModel.deleteMany(
      { _id: { $in: participantIds } },
      { session }
    );

    await MatchModel.deleteMany(
      { tournamentId: new mongoose.Types.ObjectId(tournamentId) },
      { session }
    );

    await TournamentModel.deleteOne(
      { _id: new mongoose.Types.ObjectId(tournamentId) },
      { session }
    );

    await session.commitTransaction();
    return NextResponse.json(
      { message: "Tournament and associated data deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting tournament:", error);
    return NextResponse.json(
      { message: "Internal Server Error (deleting tournament)" },
      { status: 500 }
    );
  }
}
