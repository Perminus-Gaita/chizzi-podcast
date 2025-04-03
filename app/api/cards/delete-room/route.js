import mongoose from "mongoose";
import { getUser } from "@/utils/auth/getUser";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import cardsRoomModel from "@/models/cardsroom.model";
import TransactionModel from "@/models/payments/transaction.model";
import WalletModel from "@/models/payments/wallet.model";
import database_connection from "@/services/database";

database_connection().then(() =>
  console.log("Connected successfully(CARDS Delete Room)")
);

export async function POST(request) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const sessionUser = await getUser(cookies);

    if (!sessionUser) {
      return NextResponse.json(
        { message: "No User Session Available" },
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const userId = sessionUser?._id;
    const workspaceId = sessionUser?.currentWorkspace._id;

    const { roomId } = await request.json();

    const room = await cardsRoomModel.findById(roomId).session(session);
    if (!room) {
      await session.abortTransaction();
      return NextResponse.json(
        { message: "Room not found" },
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    if (room.players[0].player.toString() !== userId.toString()) {
      await session.abortTransaction();
      return NextResponse.json(
        { message: "You do not have permission to delete this room" },
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    // Only process refunds for paid games
    if (room.pot > 0) {
      const amount = room.pot / room.players.length;

      for (const player of room.players) {
        const playerId = player.player;

        const wallet = await WalletModel.findOne({
          userId: new mongoose.Types.ObjectId(playerId),
        }).session(session);

        if (!wallet) {
          await session.abortTransaction();
          return NextResponse.json(
            { message: `Wallet not found for player ${playerId}` },
            { status: 404, headers: { "Content-Type": "application/json" } }
          );
        }

        await TransactionModel.createTransactionAndUpdateWallet(
          {
            type: "gameCancelled",
            status: "success",
            transactionBelongsTo: "individual",
            userId: new mongoose.Types.ObjectId(playerId),
            workspaceId: new mongoose.Types.ObjectId(workspaceId),
            walletId: wallet._id,
            amount: amount,
            currency: "KES",
            paymentMethod: "wufwufWallet",
            gameId: new mongoose.Types.ObjectId(roomId),
          },
          session
        );
      }
    }

    await cardsRoomModel.findByIdAndDelete(roomId).session(session);

    await session.commitTransaction();

    return NextResponse.json(
      { message: "Game deleted successfully" },
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    await session.abortTransaction();
    console.error("Error deleting the room:", error);

    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  } finally {
    session.endSession();
  }
}
