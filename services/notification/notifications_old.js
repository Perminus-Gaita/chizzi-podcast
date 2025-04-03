import notificationModel from "@/models/notification.model";
import mongoose from "mongoose";

export async function createTournamentNotification(
  session,
  {
    userId,
    type,
    tournamentId,
    matchId = null,
    message,
    details = null,
    metadata = {},
  }
) {
  const notification = await notificationModel.create(
    [
      {
        userId,
        recipientType: "userPersonal",
        type,
        status: type.startsWith("error") ? "error" : "success",
        message,
        details,
        relatedId: tournamentId,
        relatedModel: "Tournament",
        metadata: {
          ...metadata,
          tournamentId,
          matchId,
        },
      },
    ],
    { session }
  );

  return notification[0];
}

export async function sendTournamentJoinNotifications(
  session,
  { tournament, participant, match, autoStarted, tournamentSlug }
) {
  const notifications = [];

  // Notification to participant
  notifications.push(
    await createTournamentNotification(session, {
      userId: participant.userId,
      type: "tournamentJoin",
      tournamentId: tournament._id,
      matchId: match._id,
      message: `You've successfully joined the ${tournament.name} tournament`,
      metadata: {
        tournamentType: tournament.type,
        buyIn: tournament.buyIn,
        matchName: match.name,
        tournamentSlug: tournamentSlug,
      },
    })
  );

  // Notification to tournament creator
  notifications.push(
    await createTournamentNotification(session, {
      userId: tournament.creator,
      type: "tournamentParticipantJoined",
      tournamentId: tournament._id,
      message: `@${participant.name} has joined your tournament`,
      metadata: {
        // participantCount: tournament.participantCount,
        maxParticipants: tournament.numberOfParticipants,
        tournamentSlug: tournamentSlug,
      },
    })
  );

  if (autoStarted) {
    // Notify all participants that tournament is starting
    const matches = await match
      .model("Match")
      .find({
        tournamentId: tournament._id,
      })
      .populate("participants");

    const uniqueParticipantIds = new Set(
      matches.flatMap((m) => m.participants.map((p) => p.userId.toString()))
    );

    await Promise.all(
      Array.from(uniqueParticipantIds).map((userId) =>
        createTournamentNotification(session, {
          userId: new mongoose.Types.ObjectId(userId),
          type: "tournamentStartingSoon",
          tournamentId: tournament._id,
          message: `The ${tournament.name} tournament is starting now`,
          metadata: {
            startDate: tournament.startDate,
            tournamentSlug: tournamentSlug,
          },
        })
      )
    );
  }

  return notifications;
}

export async function sendTournamentLeaveNotifications(
  session,
  {
    tournament,
    userId,
    refundTransaction = null,
    participantName,
    tournamentSlug,
  }
) {
  const notifications = [];

  // Notification to the leaving participant
  notifications.push(
    await createTournamentNotification(session, {
      userId,
      type: "tournamentLeave",
      tournamentId: tournament._id,
      message: `You have successfully left the ${tournament.name} tournament`,
      metadata: {
        tournamentType: tournament.type,
        refundDetails: refundTransaction
          ? {
              amount: refundTransaction.amount,
              currency: refundTransaction.currency,
              transactionId: refundTransaction._id,
            }
          : null,
        tournamentSlug: tournamentSlug,
      },
      details: refundTransaction
        ? `Your entry fee of ${refundTransaction.amount / 100} ${
            refundTransaction.currency
          } has been refunded to your wallet.`
        : null,
    })
  );

  // Notification to tournament creator
  notifications.push(
    await createTournamentNotification(session, {
      userId: tournament.creator,
      type: "tournamentParticipantLeft",
      tournamentId: tournament._id,
      message: `@${participantName} has left your tournament`,
      metadata: {
        participantName,
        tournamentType: tournament.type,
        remainingSpots:
          tournament.numberOfParticipants - (tournament.participantCount - 1),
        tournamentSlug: tournamentSlug,
      },
    })
  );

  // // If tournament status changes to draft due to all participants leaving
  // if (tournament.participantCount - 1 === 0) {
  //   notifications.push(
  //     await createTournamentNotification(session, {
  //       userId: tournament.creator,
  //       type: "tournamentStatusChange",
  //       tournamentId: tournament._id,
  //       message: `Your tournament ${tournament.name} has returned to draft status`,
  //       details: "All participants have left the tournament."
  //     })
  //   );
  // }

  return notifications;
}

export async function sendMatchReadyNotification(
  session,
  match,
  tournamentSlug
) {
  const notifications = [];

  // Notify both participants in the match
  for (const participant of match.participants) {
    notifications.push(
      await createTournamentNotification(session, {
        userId: participant.userId,
        type: "matchReady",
        tournamentId: match.tournamentId,
        matchId: match._id,
        message: `Your match ${match.name} is ready to begin`,
        metadata: {
          gameRoomId: match.gameRoom,
          opponent: match.participants.find(
            (p) => p.userId.toString() !== participant.userId.toString()
          )?.name,
          tournamentSlug: tournamentSlug,
        },
      })
    );
  }

  return notifications;
}
