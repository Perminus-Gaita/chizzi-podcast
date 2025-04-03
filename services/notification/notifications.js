import notificationModel from "@/models/notification.model";
import mongoose from "mongoose";
import axios from "axios";
import { publishNewPushNotification } from "./push/publish";

async function sendMessageToUserOrGroup(telegramUserOrGroupId, message) {
  try {
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const response = await axios.post(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        chat_id: telegramUserOrGroupId, // User's Telegram ID
        text: message,
        parse_mode: "HTML", // Optional: for HTML formatting
      }
    );

    // Axios automatically throws on 4xx/5xx status codes and parses JSON
    // response.data contains the parsed JSON response
    return response.data;
  } catch (error) {
    console.log("### TELEGRAM ERROR ###", error);
    // if (error.response) {
    //   // The request was made and the server responded with a status code
    //   // that falls out of the range of 2xx
    //   throw new Error(`Telegram API Error: ${error.response.data.description}`);
    // } else if (error.request) {
    //   // The request was made but no response was received
    //   throw new Error("No response received from Telegram API");
    // } else {
    //   // Something happened in setting up the request
    //   console.error("Error sending message:", error);
    //   throw error;
    // }
  }
}

// Helper function to create push notification from notification data
async function sendPushNotification(notification, tournamentName = "") {
  try {
    let title = "Wufwuf";
    let body = notification.message;
    let icon = "/wufwuf-icon/web-app-manifest-512x512.png";
    let url = "/";

    // Customize notification based on type
    if (notification.type.includes("tournament")) {
      title = tournamentName || "Tournament Update";

      // Set URL for tournament-related notifications
      if (notification.metadata?.tournamentSlug) {
        url = `/${notification.metadata.tournamentSlug}`;
      }

      // For match-ready notifications, direct to game room
      if (
        notification.type === "matchReady" &&
        notification.metadata?.gameRoomId
      ) {
        url = `/kadi/play/${notification.metadata.gameRoomId}`;
      }
    }

    await publishNewPushNotification(
      notification.userId,
      notification._id,
      title,
      body,
      icon,
      url
    );
  } catch (error) {
    console.error("Failed to send push notification:", error);
    // Don't throw the error - we don't want push notification failure to affect the main notification flow
  }
}

export async function challengePlayer({
  telegramUserId,
  challengerName,
  opponentName,
}) {
  // Notification to telegram group --> include game link ACCEPT DECLINE buttons
  // const message =
  //   `🎮 ${challengerName} has challenged ${opponentName} to a game!\n\n` +
  //   `Click here to accept: [Your game link]`;

  const message = `🎮 ${challengerName} has challenged ${opponentName} to a kadi game!\n\n`;

  await sendMessageToUserOrGroup(telegramUserId, message);
}

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
    tournamentName = "",
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

  // Send push notification
  await sendPushNotification(notification[0], tournamentName);

  return notification[0];
}

export async function sendTournamentJoinNotifications(
  session,
  {
    tournament,
    participant,
    match,
    autoStarted,
    tournamentSlug,
    totalParticipants,
  }
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
      tournamentName: tournament.name,
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
        maxParticipants: tournament.numberOfParticipants,
        tournamentSlug: tournamentSlug,
      },
      tournamentName: tournament.name,
    })
  );

  // Notification to telegram group
  if (tournament?.telegramGroupId) {
    const message =
      `🎮 ${participant.name} Joined!\n\n` +
      `Tournament: ${tournament.name}\n` +
      `👥 Players: ${totalParticipants}/${tournament.numberOfParticipants}\n` +
      `🏆 Status: ${tournament.status}\n` +
      `🔗 Details: https://wufwuf.io/${tournament.creator.username}/${tournament.slug}?tab=participation`;

    await sendMessageToUserOrGroup(tournament?.telegramGroupId, message);
  }

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
          tournamentName: tournament.name,
        })
      )
    );

    // notify telegram group
    if (tournament?.telegramGroupId) {
      const startingMessage =
        `🎮 Tournament Starting!\n\n` +
        `🏆 ${tournament.name}\n` +
        `👥 Players: ${totalParticipants}/${tournament.numberOfParticipants}\n` +
        `${
          tournament.type === "paid"
            ? `💰 Prize Pool: ${tournament.buyIn.prizePool / 100} KES\n`
            : ""
        }\n` +
        `⏰ Starting Now!\n` +
        `🔗 Join at: https://wufwuf.io/${tournament.creator.username}/${tournament.slug}?tab=participation`;

      await sendMessageToUserOrGroup(
        tournament?.telegramGroupId,
        startingMessage
      );
    }
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
      tournamentName: tournament.name,
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
      tournamentName: tournament.name,
    })
  );

  // notify telegram group

  if (tournament?.telegramGroupId) {
    const leftMessage =
      `👋 ${participantName} left the tournament!\n\n` +
      `🎮 ${tournament.name}\n` +
      `🏆 Status: ${tournament.status}\n` +
      `🔗 Details: https://wufwuf.io/${tournament.creator.username}/${tournament.slug}?tab=participation`;

    await sendMessageToUserOrGroup(tournament?.telegramGroupId, leftMessage);
  }

  return notifications;
}

export async function sendMatchReadyNotification(
  session,
  match,
  tournamentSlug,
  tournamentName
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
        tournamentName: tournamentName,
      })
    );
  }

  return notifications;
}
