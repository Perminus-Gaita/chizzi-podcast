import mongoose from "mongoose";
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

function getTargetMatchText(numberOfParticipants) {
  if (numberOfParticipants === 4) return "Semi Final";
  if (numberOfParticipants === 8) return "Quarter Final";
  if ([16, 32, 64, 128, 256, 512].includes(numberOfParticipants))
    return "Round 1";
  throw new Error("Unsupported number of participants");
}

async function handleTournamentBuyIn(userId, tournament, session) {
  if (tournament.type !== "paid") return null;

  const buyInAmount = tournament.buyIn?.entryFee;
  const amountInLowestDenomination = buyInAmount ? buyInAmount * 100 : 0;

  const wallet = await WalletModel.findOne({
    userId: new mongoose.Types.ObjectId(userId),
  }).session(session);

  if (!wallet || wallet.balances.KES.balance < amountInLowestDenomination) {
    throw new Error("Insufficient balance for tournament buy-in");
  }

  // Process buy-in transaction
  const [buyInTransaction] = await TransactionModel.create(
    [
      {
        type: "tournamentBuyIn",
        status: "success",
        userId: new mongoose.Types.ObjectId(userId),
        walletId: wallet._id,
        amount: amountInLowestDenomination,
        currency: "KES",
        tournamentId: tournament._id,
      },
    ],
    { session }
  );

  // Update wallet and prize pool
  await WalletModel.updateOne(
    { _id: wallet._id },
    { $inc: { "balances.KES.balance": -amountInLowestDenomination } },
    { session }
  );

  await TournamentModel.updateOne(
    { _id: tournament._id },
    { $inc: { "buyIn.prizePool": amountInLowestDenomination } },
    { session }
  );

  return buyInTransaction;
}

async function createGameRoomsForMatch(
  match,
  tournament,
  finalPrizePool,
  playerRatings,
  session
) {
  const cardsRoom = await cardsRoomModel.create(
    [
      {
        name: `${tournament.slug}-${match.name.split(" ").join("")}`,
        creator: tournament.creator,
        tournamentId: tournament._id,
        maxPlayers: 2,
        timer: true,
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

async function startTournament(tournament, finalPrizePool, session) {
  const targetMatchText = getTargetMatchText(tournament.numberOfParticipants);

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
          console.log("### REACHED HERE ####");
          console.log(p.userId);
          console.log(match.participants);

          let kadiPlayer = await kadiPlayerModel
            .findOne({ userId: p.userId })
            .session(session);

          if (!kadiPlayer) {
            kadiPlayer = new kadiPlayerModel({
              userId: p.userId,
              rating: 1500,
            });
            await kadiPlayer.save({ session });
          }

          return kadiPlayer.rating;
        })
      );

      await createGameRoomsForMatch(
        match,
        tournament,
        finalPrizePool,
        playerRatings,
        session
      );
    }
  }

  // Update tournament status
  tournament.status = "in-progress";
  tournament.startDate = new Date();
  await tournament.save({ session });

  // Send notifications
  await sendTournamentStartNotifications(tournament, matches, session);

  return matches;
}

async function sendTournamentStartNotifications(tournament, matches, session) {
  const uniqueParticipantIds = new Set(
    matches.flatMap((match) =>
      match.participants.map((p) => p.userId.toString())
    )
  );

  await Promise.all([
    // Send tournament start notifications
    ...Array.from(uniqueParticipantIds).map((userId) =>
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
    ),
    // Send match assignment notifications
    ...matches.flatMap((match) =>
      match.participants.map((participant) => {
        const opponent = match.participants.find(
          (p) => p.userId.toString() !== participant.userId.toString()
        );
        return createTournamentNotification(session, {
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
      })
    ),
  ]);
}

async function joinAvailableMatch(
  userId,
  tournament,
  playerName,
  buyInTransaction,
  session
) {
  const targetMatchText = getTargetMatchText(tournament.numberOfParticipants);

  const availableMatch = await MatchModel.findOne({
    tournamentId: tournament._id,
    tournamentRoundText: targetMatchText,
    $expr: { $lt: [{ $size: "$participants" }, 2] },
  }).session(session);

  if (!availableMatch) {
    throw new Error("No available slots in tournament");
  }

  // Create new participant
  const [newParticipant] = await ParticipantModel.create(
    [
      {
        userId: new mongoose.Types.ObjectId(userId),
        matchId: availableMatch._id,
        tournamentId: tournament._id,
        tournamentType: tournament.type,
        name: playerName,
        resultText: null,
        isWinner: false,
        buyInDetails: buyInTransaction
          ? {
              transactionId: buyInTransaction._id,
              transactionType: buyInTransaction.type,
              amount: buyInTransaction.amount,
              currency: buyInTransaction.currency,
            }
          : null,
      },
    ],
    { session }
  );

  // Add participant to match
  availableMatch.participants.push(newParticipant._id);
  await availableMatch.save({ session });

  // Check tournament auto-start conditions
  const autoStarted = await handleTournamentAutoStart(tournament, session);

  // Return the newly created participant along with other data
  return {
    autoStarted,
    availableMatch,
    participant: newParticipant,
  };
}

async function handleTournamentAutoStart(tournament, session) {
  const allMatches = await MatchModel.find({ tournamentId: tournament._id })
    .populate("participants")
    .session(session);

  const totalParticipants = allMatches.reduce(
    (sum, match) => sum + match.participants.length,
    0
  );

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
      return true;
    } else {
      tournament.status = "ready";
      await tournament.save({ session });
    }
  } else if (totalParticipants === 1) {
    tournament.status = "setup";
    await tournament.save({ session });
  }

  return false;
}

async function getTotalParticipants(tournamentId, session) {
  const allMatches = await MatchModel.find({ tournamentId }).session(session);

  return allMatches.reduce((sum, match) => sum + match.participants.length, 0);
}

export async function joinTournament(userId, tournamentId, playerName) {
  let session;

  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const tournament = await TournamentModel.findById(tournamentId)
      .populate("creator", "username")
      .session(session);

    if (!tournament) {
      throw new Error("Tournament not found");
    }

    // Handle buy-in
    const buyInTransaction = await handleTournamentBuyIn(
      userId,
      tournament,
      session
    );

    // Check existing participation
    const existingParticipation = await MatchModel.findOne({
      tournamentId,
      "participants.userId": userId,
    }).session(session);

    if (existingParticipation) {
      throw new Error("User has already joined this tournament");
    }

    // Find and join available match
    const { autoStarted, availableMatch, participant } =
      await joinAvailableMatch(
        userId,
        tournament,
        playerName,
        buyInTransaction,
        session
      );

    // Send notifications
    await sendTournamentJoinNotifications(session, {
      tournament,
      participant,
      match: availableMatch,
      autoStarted,
      tournamentSlug: tournament.slug,
      totalParticipants: await getTotalParticipants(tournamentId, session),
    });

    await session.commitTransaction();

    return {
      message: "Successfully joined tournament",
      tournamentStatus: tournament.status,
      autoStarted,
    };
  } catch (error) {
    if (session) {
      await session.abortTransaction();
    }
    throw error;
  } finally {
    if (session) {
      await session.endSession();
    }
  }
}
