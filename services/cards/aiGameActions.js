import mongoose from "mongoose";
import {
  IoTDataPlaneClient,
  PublishCommand,
} from "@aws-sdk/client-iot-data-plane";

import { roomAggregationPipeline } from "@/services/cards/aiAggregations";
import {
  hasValidMoveAfterAcesPlay,
  canFinishGame,
  isValidMoveAfterAces,
  hasValidMoveAfterQuestionPlay,
  hasValidMoveAfterPlay,
  isValidAdditionalMove,
  hasValidMove,
  hasValidMoveAfterJumpPlay,
  shuffle,
  isValidMove,
} from "./utils";
import { jokerDrawPile, noJokerDrawPile } from "@/utils/cards";

import WalletModel from "@/models/payments/wallet.model";
import TransactionModel from "@/models/payments/transaction.model";
import cardsRoomModel from "@/models/cardsroom.model";
import {kadiPlayerModel} from "@/models/kadiplayer.model";

import {
  TournamentModel,
  MatchModel,
  ParticipantModel,
} from "@/models/tournament.model";
import userModel from "@/models/user/index.model";

const AWSIoTEndpoint =
  process.env.NODE_ENV === "development"
    ? `https://${process.env.AWS_IOT_ENDPOINT_DEVELOPMENT}`
    : `https://${process.env.AWS_IOT_ENDPOINT_PRODUCTION}`;

const ioTClient = new IoTDataPlaneClient({ endpoint: AWSIoTEndpoint });

const iotPublish = async (topic, payload) => {
  try {
    const params = {
      topic: topic,
      qos: 1,
      payload: Buffer.from(JSON.stringify(payload)),
    };

    const command = new PublishCommand(params);
    const result = await ioTClient.send(command);
    return result;
  } catch (err) {
    console.error("iotPublish error:", err);
    throw err;
  }
};

const sendToOne = async (userId, payload) => {
  // // Publish the message to private IoT topic
  // const publishResult = await iotPublish(userId, payload);

  // console.log("### THE PRIVATE RESULT ###");
  // console.log(publishResult);

  // return publishResult;

  return;
};

const sendToRoom = async (roomId, payload) => {
  // // Publish the message to public IoT topic
  // const publishResult = await iotPublish(roomId, payload);

  // console.log("### THE PUBLIC RESULT ###");
  // console.log(publishResult);

  // return publishResult;

  return;
};

// TOURNAMENT FUNCTIONS

const updateTournamentMatch = async (tournamentId, winnerId, roomId) => {
  try {
    // Find the tournament
    const tournament = await TournamentModel.findById(tournamentId);
    if (!tournament) {
      throw new Error("Tournament not found!");
    }

    // Find the match within the tournament based on roomId
    const match = await MatchModel.findOne({ tournamentId, gameRoom: roomId });
    if (!match) {
      throw new Error("Match not found in the tournament!");
    }

    // Update the winner and loser in participants
    const participants = await ParticipantModel.find({
      _id: { $in: match.participants },
    });

    for (const participant of participants) {
      if (participant.userId.toString() === winnerId) {
        // Update winner details
        participant.resultText = "WON";
        participant.isWinner = true;
      } else {
        // Update loser details
        participant.resultText = "LOST";
        participant.isWinner = false;
      }
      await participant.save();
    }

    match.state = "SCORE_DONE";
    await match.save();

    console.log(`Tournament ${tournamentId} updated with match result.`);

    // Final match
    if (match.name === "Final" && match.nextMatchId === null) {
      tournament.status = "completed"; // Mark the tournament as completed
      await tournament.save();
      console.log(`Tournament ${tournamentId} has been completed.`);
      return;
    }

    // Find the next match using match.nextMatchId
    const nextMatch = await MatchModel.findOne({
      tournamentId,
      id: match.nextMatchId,
    });
    if (!nextMatch) {
      console.log("No next match found.");
      return;
    }

    const winner = await userModel.findById(winnerId);
    const winnerName = winner?.username || "Unknown";

    // Handle participants addition and game room creation
    if (nextMatch.participants.length === 0) {
      // Add the first participant
      const newParticipant = await ParticipantModel.create({
        userId: winnerId,
        name: winnerName,
      });
      nextMatch.participants.push(newParticipant._id);
      console.log(`First participant added to the next match: ${winnerId}`);
    } else if (nextMatch.participants.length === 1) {
      // Add the second participant
      const newParticipant = await ParticipantModel.create({
        userId: winnerId,
        name: winnerName,
      });
      nextMatch.participants.push(newParticipant._id);

      const participantDocs = await ParticipantModel.find({
        _id: { $in: nextMatch.participants },
      });

      // Create a new game room when two participants are present
      const cardsRoom = await cardsRoomModel.create({
        name: `${tournament.slug}-${nextMatch.name.split(" ").join("")}`,
        creator: tournament.creator,
        tournamentId: tournamentId,
        maxPlayers: 2,
        pot: 0,
        direction: 1,
        turn: null,
        desiredSuit: null,
        gameStatus: "waiting",
        winner: null,
        players: participantDocs.map((p) => ({
          player: p.userId,
          playerDeck: [],
          score: 0,
          on: false,
        })),
        drawPile: jokerDrawPile,
        discardPile: [],
      });

      // Assign the new game room to the next match
      nextMatch.gameRoom = cardsRoom._id;
      console.log(
        `New game room created for next match with ID: ${cardsRoom._id}`
      );
    }

    // Save the updated next match
    await nextMatch.save();
    console.log(`Tournament ${tournamentId} updated with next match setup.`);
  } catch (error) {
    console.error("Error updating tournament match:", error);
    throw error;
  }
};

// END TOURNAMENT FUNCTIONS

// GAME LOGIC FUNCTIONS

// LEADERBOARD AND RANKING FUNCTIONS

// Elo rating constant
const K = 32;

// Function to calculate Elo rating change
function calculateEloRatingChange(playerRating, opponentRatings, playerScore) {
  const expectedScore =
    opponentRatings.reduce(
      (sum, opponentRating) =>
        sum + 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400)),
      0
    ) / opponentRatings.length;

  return Math.round(K * (playerScore - expectedScore));
}

// Function to process game results and update rankings
async function processGameResults(gameId) {
  const game = await cardsRoomModel.findById(gameId).populate("players.player");
  if (!game || game.gameStatus !== "gameover") {
    throw new Error("Invalid game or game not finished");
  }

  const playerCount = game.players.length;
  const playerRatings = await Promise.all(
    game.players.map(async (p) => {
      const kadiPlayer = await kadiPlayerModel.findOne({
        userId: p.player._id,
      });
      return kadiPlayer?.rating || 1500;
    })
  );

  game.gameDuration = (game.updatedAt - game.createdAt) / 1000;

  for (let player of game.players) {
    const playerMoves = game.gamePlay.filter((move) =>
      move.player.equals(player.player._id)
    );
    player.averageMoveTime = game.gameDuration / playerMoves.length;

    const isWinner = player.player._id.equals(game.winner);
    const score = isWinner ? 1 : 0;
    let playerScore = 1000;

    // Card value deduction
    playerScore -= player.playerDeck.reduce((sum, card) => {
      const value = ["A", "K", "Q", "J", "8"].includes(card[0])
        ? { A: 1, K: 13, Q: 12, J: 11, 8: 12 }[card[0]]
        : card[0] === "JOKER"
        ? 365
        : parseInt(card);
      return sum + value;
    }, 0);

    // Winning bonus
    if (isWinner) playerScore += 500;

    // Game duration bonus
    const avgMoveTime = player.averageMoveTime;
    if (avgMoveTime < 30) playerScore += 300;
    else if (avgMoveTime < 60) playerScore += 200;
    else if (avgMoveTime < 120) playerScore += 100;
    else if (avgMoveTime < 300) playerScore += 50;

    // Player count multiplier
    playerScore *= [1, 1, 1.2, 1.5][playerCount - 1];

    // Special moves bonus
    playerScore +=
      (player.specialMoves.jumpCards + player.specialMoves.kickbackCards) * 10;
    playerScore += player.specialMoves.aceDeclarations * 15;
    playerScore += player.specialMoves.penaltyAvoidances * 20;

    // Stalling penalty
    playerScore -= player.stallingPenalties * 50;

    // Tournament multiplier (if applicable)
    if (game.tournamentId) {
      playerScore *= game.tournamentMultiplier || 1;
    }

    // Calculate Elo rating change
    const ratingChange = calculateEloRatingChange(
      playerRatings[game.players.indexOf(player)],
      playerRatings.filter((_, i) => i !== game.players.indexOf(player)),
      score
    );

    game.gameScores.set(player.player._id.toString(), playerScore);

    await kadiPlayerModel.findOneAndUpdate(
      { userId: player.player._id },
      {
        $inc: {
          totalGames: 1,
          totalScore: playerScore,
          rating: ratingChange,
          winCount: isWinner ? 1 : 0,
        },
        $set: { lastActive: new Date() },
      }
    );
  }

  await game.save();
}

// Function to generate global leaderboard
export const generateGlobalLeaderboard = async (limit = 100, skip = 0) => {
  try {
    const leaderboard = await kadiPlayerModel.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      { $unwind: "$userInfo" },
      {
        $project: {
          username: "$userInfo.username",
          rating: 1,
          totalGames: 1,
          winCount: 1,
          rankingTier: 1,
          winRate: {
            $multiply: [
              { $divide: ["$winCount", { $max: ["$totalGames", 1] }] },
              100,
            ],
          },
        },
      },
      { $sort: { rating: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    return leaderboard;
  } catch (error) {
    console.error("Error generating global leaderboard:", error);
    throw error;
  }
};

export const generateMonthlyLeaderboard = async (limit = 100, skip = 0) => {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const leaderboard = await kadiPlayerModel.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      { $unwind: "$userInfo" },
      {
        $lookup: {
          from: "cardsrooms",
          let: { userId: "$userId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $gte: ["$createdAt", startOfMonth] },
                    { $eq: ["$gameStatus", "gameover"] },
                  ],
                },
              },
            },
            { $unwind: "$players" },
            {
              $match: {
                $expr: {
                  $eq: ["$players.player", "$$userId"],
                },
              },
            },
            {
              $group: {
                _id: "$players.player",
                monthlyScore: {
                  $sum: { $ifNull: [{ $toDouble: "$players.score" }, 0] },
                },
                gamesPlayed: { $sum: 1 },
                wins: {
                  $sum: {
                    $cond: [{ $eq: ["$winner", "$players.player"] }, 1, 0],
                  },
                },
              },
            },
          ],
          as: "monthlyStats",
        },
      },
      { $unwind: { path: "$monthlyStats", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          username: "$userInfo.username",
          rating: 1,
          totalGames: "$monthlyStats.gamesPlayed",
          winCount: "$monthlyStats.wins",
          rankingTier: 1,
          winRate: {
            $multiply: [
              {
                $divide: [
                  { $ifNull: ["$monthlyStats.wins", 0] },
                  { $max: [{ $ifNull: ["$monthlyStats.gamesPlayed", 0] }, 1] },
                ],
              },
              100,
            ],
          },
        },
      },
      { $match: { totalGames: { $gt: 0 } } },
      { $sort: { rating: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    return leaderboard;
  } catch (error) {
    console.error("Error generating monthly leaderboard:", error);
    throw error;
  }
};

// Function to generate tournament leaderboard
export const generateTournamentLeaderboard = async (
  tournamentId,
  limit = 20,
  skip = 0
) => {
  try {
    const tournamentGames = await cardsRoomModel.aggregate([
      {
        $match: {
          tournamentId: new mongoose.Types.ObjectId(tournamentId),
          gameStatus: "gameover",
        },
      },
      { $unwind: "$players" },
      {
        $group: {
          _id: "$players.player",
          tournamentScore: {
            $sum: { $ifNull: [{ $toDouble: "$players.score" }, 0] },
          },
          gamesPlayed: { $sum: 1 },
          wins: {
            $sum: {
              $cond: [{ $eq: ["$winner", "$players.player"] }, 1, 0],
            },
          },
        },
      },
      {
        $lookup: {
          from: "kadiplayers",
          localField: "_id",
          foreignField: "userId",
          as: "playerInfo",
        },
      },
      { $unwind: "$playerInfo" },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      { $unwind: "$userInfo" },
      {
        $project: {
          username: "$userInfo.username",
          rating: "$playerInfo.rating",
          rankingTier: "$playerInfo.rankingTier",
          tournamentScore: 1,
          gamesPlayed: 1,
          wins: 1,
          winRate: {
            $multiply: [
              { $divide: ["$wins", { $max: ["$gamesPlayed", 1] }] },
              100,
            ],
          },
        },
      },
      { $sort: { tournamentScore: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    return tournamentGames;
  } catch (error) {
    console.error("Error generating tournament leaderboard:", error);
    throw error;
  }
};

// Function to generate speed leade
export const generateSpeedLeaderboard = async (
  limit = 100,
  skip = 0,
  minGames = 5
) => {
  try {
    const speedLeaderboard = await cardsRoomModel.aggregate([
      { $match: { gameStatus: "gameover" } },
      { $unwind: "$players" },
      {
        $group: {
          _id: "$players.player",
          totalGames: { $sum: 1 },
          averageMoveTime: { $avg: "$players.averageMoveTime" },
          fastestGame: { $min: "$gameDuration" },
        },
      },
      { $match: { totalGames: { $gte: minGames } } },
      {
        $lookup: {
          from: "kadiplayers",
          localField: "_id",
          foreignField: "userId",
          as: "playerInfo",
        },
      },
      { $unwind: "$playerInfo" },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      { $unwind: "$userInfo" },
      {
        $project: {
          username: "$userInfo.username",
          rating: "$playerInfo.rating",
          rankingTier: "$playerInfo.rankingTier",
          averageMoveTime: 1,
          fastestGame: 1,
          totalGames: 1,
        },
      },
      { $sort: { averageMoveTime: 1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    return speedLeaderboard;
  } catch (error) {
    console.error("Error generating speed leaderboard:", error);
    throw error;
  }
};

export const getPlayerRankings = async (userId) => {
  try {
    const playerRankings = await kadiPlayerModel.aggregate([
      {
        $facet: {
          globalRank: [
            { $sort: { rating: -1 } },
            {
              $group: {
                _id: null,
                players: {
                  $push: {
                    userId: "$userId",
                    rank: { $add: [{ $indexOfArray: ["$userId", userId] }, 1] },
                  },
                },
              },
            },
          ],
          monthlyRank: [
            // Similar aggregation for monthly ranking
          ],
          speedRank: [
            // Similar aggregation for speed ranking
          ],
        },
      },
    ]);

    const player = await KadiPlayer.findOne({ userId }).populate(
      "userId",
      "username"
    );

    return {
      player,
      rankings: playerRankings[0],
    };
  } catch (error) {
    console.error("Error getting player rankings:", error);
    throw error;
  }
};

const concludeGame = async (gameId) => {
  // Process game results
  await processGameResults(gameId);

  // Optionally update leaderboards
  await updateLeaderboards();
};

async function updateLeaderboards() {
  // Update various leaderboards
  await generateGlobalLeaderboard();
  await generateMonthlyLeaderboard();
  // ... update other leaderboards as needed ...
}

// LEADERBOARDS AND RANKING FUNCTIONS -- POST GAME

export const playerCheckin = async (roomId, userId) => {
  try {
    // Find the room and ensure it exists
    let room = await cardsRoomModel.findById(roomId);

    if (!room) {
      throw new Error("Room not found!");
    }

    // Find the player in the room
    const playerIndex = room.players.findIndex(
      (player) => player.player.toString() === userId
    );

    if (playerIndex === -1) {
      throw new Error("Player not found in room!");
    }

    // Verify game status is waiting
    if (room.gameStatus !== "waiting") {
      throw new Error("Cannot check in - game has already started!");
    }

    // Update player's check-in status
    room.players[playerIndex].checkedIn = true;
    await room.save(); // Save check-in status first

    const allCheckedIn = room.players.every((player) => player.checkedIn);

    // Deal cards only if all players have checked in
    if (allCheckedIn && room.players.length === room.maxPlayers) {
      await dealCards(roomId);

      let aggregatedRoom = await cardsRoomModel.aggregate(
        roomAggregationPipeline(roomId)
      );

      await sendToRoom(roomId, {
        turn: "success",
        room: aggregatedRoom,
      });
    }

    // Get total checked in players for the response
    const checkedInCount = room.players.filter(
      (player) => player.checkedIn
    ).length;

    // If all players are checked in, you might want to trigger game start
    if (allCheckedIn) {
      // You could add additional game start logic here if needed
      console.log("All players checked in for room:", roomId);
    }

    // Perform aggregation to get full room data
    room = await cardsRoomModel.aggregate(roomAggregationPipeline(roomId));

    // Notify the room of the check-in
    await sendToRoom(roomId, {
      checkIn: "success",
      room: room,
      checkedInCount: checkedInCount,
      allCheckedIn: allCheckedIn,
    });

    // Return success
    return {
      success: true,
      checkedInCount,
      allCheckedIn,
    };
  } catch (error) {
    console.error("Error checking in player:", error);
    throw error;
  }
};

const handlePenalty = async (roomId, userId, cardPlayed) => {
  try {
    // 1. get room
    let room = await cardsRoomModel.findById(roomId);

    if (!room) {
      throw new Error("Room not found!");
    }

    const {
      turn,
      discardPile,
      players,
      direction,
      desiredSuit,
      isQuestion,
      isKickback,
    } = room;

    // Check if it's the current user's turn to play
    if (turn.toString() !== userId) {
      throw new Error("It's not your turn to play (penalty)!");
    }

    // cannot be played after question
    if (isQuestion) {
      console.log("### Cannot answer with Penalty Card ###");

      await sendToOne(userId, {
        invalidMove: {
          message: "Cannot answer with Penalty Card",
        },
      });
      return;
    }
    if (isKickback) {
      console.log();
      await sendToOne(userId, {
        invalidMove: {
          message: "Cannot block kickback with Penalty Card",
        },
      });
      throw new Error("Cannot block kickback with Penalty Card");
    }

    // Find the current player by their ID
    const currentPlayer = players.find(
      (player) => player.player.toString() === userId
    );

    if (!currentPlayer) {
      throw new Error("Player not found!");
    }

    // 2. Validate move after aces play
    if (
      desiredSuit &&
      !isValidMoveAfterAces(
        discardPile[discardPile.length - 1],
        cardPlayed,
        desiredSuit
      ) &&
      cardPlayed !== "JOK1" &&
      cardPlayed !== "JOK2"
    ) {
      console.error("### Invalid penalty card after aces ###");
      return;
    } else {
      room.desiredSuit = null;
    }

    // 3. remove cards from player to discard pile
    currentPlayer.playerDeck.splice(
      currentPlayer.playerDeck.indexOf(cardPlayed),
      1
    );
    discardPile.push(cardPlayed);

    // 4. Extract the suit from the played card and update currentSuit
    if (cardPlayed === "JOK1" || cardPlayed === "JOK2") {
      room.currentSuit = "FREE";
    } else {
      room.currentSuit = cardPlayed[cardPlayed.length - 1];
    }

    const currentPlayerIndex = players.findIndex(
      (player) => player.player.toString() === userId
    );

    const nextPlayerIndex =
      (currentPlayerIndex + direction + players.length) % players.length;

    const nextPlayer = players[nextPlayerIndex];

    const hasMoveAfterPlay = hasValidMoveAfterPlay(
      currentPlayer.playerDeck,
      discardPile[discardPile.length - 1]
    );

    // Check if next player has a card that can block the penalty
    // const nextPlayerCanBlockPenalty = nextPlayer.playerDeck.some((card) => {
    //   const slicedCard = card.slice(0, -1);
    //   const cardSuit = card[card.length - 1];
    //   const cardPlayedRank =
    //     cardPlayed === "JOK" ? "JOK" : cardPlayed.slice(0, -1);
    //   const cardPlayedSuit =
    //     cardPlayed === "JOK" ? null : cardPlayed[card.length - 1];

    //   if (card === "JOK" || slicedCard === "A") {
    //     return true;
    //   } else if (slicedCard === "2" || slicedCard === "3") {
    //     if (cardPlayedRank === "JOK") {
    //       return true;
    //     } else if (
    //       cardPlayedRank === slicedCard ||
    //       cardPlayedSuit === cardSuit
    //     ) {
    //       return true;
    //     }
    //   }
    //   return false;
    // });

    console.log("### DOES PLAYER HAVE MOVE AFTER PLAY ###");
    console.log(hasMoveAfterPlay);
    console.log(currentPlayer.playerDeck);
    console.log(discardPile[discardPile.length - 1]);

    // 4. set isPenalty to true
    room.isPenalty = true;

    // 5. update turn to next player if no other move to be made

    if (!hasMoveAfterPlay && !canFinishGame(currentPlayer.playerDeck)) {
      console.log(
        "No move available && cannot finish game ... Moving to next player"
      );

      // Calculate the next player index considering the jump counter value
      let nextPlayerIndex =
        (currentPlayerIndex + direction + players.length) % players.length;

      // disable card on if next player cannot finish game
      if (!canFinishGame(players[nextPlayerIndex].playerDeck)) {
        room.players[nextPlayerIndex].on = false;
      }

      room.turn = nextPlayer.player;
    }

    console.log("PLAYER Still Has a move");

    // Save player move
    let newMove = {
      player: userId,
      moveType: "play",
      card: cardPlayed,
    };

    room.gamePlay.push(newMove);

    room = await room.save();

    // send updated player deck
    await sendToOne(userId, {
      playerObj: {
        playerDeck: currentPlayer.playerDeck,
        on: currentPlayer.on,
      },
    });

    // Perform aggregation
    room = await cardsRoomModel.aggregate(roomAggregationPipeline(roomId));

    // notify the room
    await sendToRoom(roomId, {
      play: "success",
      room: room,
    });
  } catch (error) {
    console.error("Error playing penalty:", error);
    throw error;
  }
};

const handleAces = async (roomId, userId, cardPlayed, desiredSuit) => {
  try {
    // 1. Get room
    let room = await cardsRoomModel.findById(roomId);

    if (!room) {
      throw new Error("Room not found!");
    }

    const { discardPile, players, direction, turn, isQuestion, isKickback } =
      room;

    // Check if it's the current user's turn to play
    if (turn.toString() !== userId) {
      throw new Error("It's not your turn to play (aces)!");
    }

    // Find the current player by their ID
    const currentPlayer = players.find(
      (player) => player.player.toString() === userId
    );

    if (!currentPlayer) {
      throw new Error("Player not found!");
    }

    // cannot be played after question
    if (isQuestion) {
      console.log("### Cannot answer with aces ###");

      await sendToOne(userId, {
        invalidMove: {
          message: "Cannot answer with aces",
        },
      });
      return;
    }

    if (isKickback) {
      console.log();
      await sendToOne(userId, {
        invalidMove: {
          message: "Cannot block kickback with Aces Card",
        },
      });
      throw new Error("Cannot block kickback with Aces Card");
    }

    // Increment the aces card counter for the player
    currentPlayer.specialMoves.aceDeclarations += 1;

    // 2. Remove card from player to discard pile
    currentPlayer.playerDeck.splice(
      currentPlayer.playerDeck.indexOf(cardPlayed),
      1
    );
    discardPile.push(cardPlayed);

    // 3. Handle Ace card logic
    if (room.isPenalty) {
      room.isPenalty = false;
      // Set current game suit - extract suit from the played card, update currentSuit
      room.currentSuit = cardPlayed[cardPlayed.length - 1];

      // Increment the penalty avoidances card counter for the player
      currentPlayer.specialMoves.penaltyAvoidances += 1;
    } else {
      room.desiredSuit = desiredSuit;

      // Set current game suit - extract suit from the played card, update currentSuit
      room.currentSuit = desiredSuit;
    }

    const currentPlayerIndex = room.players.findIndex(
      (player) => player.player.toString() === userId
    );

    const canFinish = canFinishGame(currentPlayer.playerDeck);

    console.log("## DOES PLAYER HAVE VALID MOVE AFTER PLAY ##");
    console.log(hasValidMoveAfterAcesPlay(currentPlayer.playerDeck));

    console.log("## CAN PLAYER FINISH THE GAME ##");
    console.log(canFinish);

    // 5. update turn to next player if no other move to be made
    if (!hasValidMoveAfterAcesPlay(currentPlayer.playerDeck) && !canFinish) {
      console.log(
        "No move available && cannot finish game ... Moving to next player"
      );

      const nextPlayerIndex =
        (currentPlayerIndex + direction + players.length) % players.length;

      // disable card on if next player cannot finish game
      if (!canFinishGame(room.players[nextPlayerIndex].playerDeck)) {
        room.players[nextPlayerIndex].on = false;
      }

      room.turn = room.players[nextPlayerIndex].player;

      // // reset timer for next player
      // resetPlayerTurnTimer(roomId);
    }

    // Save player move
    const newMove = {
      player: userId,
      moveType: "play",
      card: cardPlayed,
    };
    room.gamePlay.push(newMove);

    room = await room.save();

    // Send updated player deck
    await sendToOne(userId, {
      playerObj: {
        playerDeck: currentPlayer.playerDeck,
        on: currentPlayer.on,
      },
    });

    // Perform aggregation
    room = await cardsRoomModel.aggregate(roomAggregationPipeline(roomId));

    // Notify the room
    await sendToRoom(roomId, {
      play: "success",
      room: room,
    });
  } catch (error) {
    console.error("Error handling Ace:", error);
    throw error;
  }
};

const handleJump = async (roomId, userId, cardPlayed) => {
  try {
    let room = await cardsRoomModel.findById(roomId);

    if (!room) {
      throw new Error("Room not found!");
    }

    const {
      turn,
      discardPile,
      players,
      direction,
      gamePlay,
      desiredSuit,
      isQuestion,
      isPenalty,
      isKickback,
    } = room;

    // Check if it's the current user's turn to play
    if (turn.toString() !== userId) {
      throw new Error("It's not your turn to play (jump)!");
    }

    // cannot be played after question
    if (isQuestion) {
      console.log("### Cannot answer with Jump ###");

      await sendToOne(userId, {
        invalidMove: {
          message: "Cannot answer with Jump",
        },
      });
      return;
    }

    if (isKickback) {
      await sendToOne(userId, {
        invalidMove: {
          message: "Cannot block kickback with Jump Card",
        },
      });
      throw new Error("Cannot block kickback with Jump Card");
    }

    // cannot be played after question
    if (isPenalty) {
      console.log("### Cannot block Penalty with Jump Card ###");

      await sendToOne(userId, {
        invalidMove: {
          message: "Cannot block Penalty with Jump Card",
        },
      });
      return;
    }

    // Find the current player by their ID
    const currentPlayer = players.find(
      (player) => player.player.toString() === userId
    );
    if (!currentPlayer) {
      throw new Error("Player not found!");
    }

    // Increment the jump card counter for the player
    currentPlayer.specialMoves.jumpCards += 1;

    // 2. Validate move after aces play
    if (
      desiredSuit &&
      !isValidMoveAfterAces(
        discardPile[discardPile.length - 1],
        cardPlayed,
        desiredSuit
      )
    ) {
      console.error("### Invalid jump card after aces ###");
      return;
    } else {
      room.desiredSuit = null;
    }

    // Remove the played card from the player's deck and add it to the discard pile
    currentPlayer.playerDeck.splice(
      currentPlayer.playerDeck.indexOf(cardPlayed),
      1
    );
    discardPile.push(cardPlayed);

    const currentPlayerIndex = players.findIndex(
      (player) => player.player.toString() === userId
    );

    // 4. Set current game suit - extract suit from the played card, update currentSuit
    room.currentSuit = cardPlayed[cardPlayed.length - 1];

    console.log("### The room Jump COUNTER before ###");
    console.log(room.jumpCounter);

    const nextPlayerIndex =
      (currentPlayerIndex + direction + players.length) % players.length;

    // Check if the last played card was a "J" card by a different player
    const lastMove = gamePlay[gamePlay.length - 1];
    const lastPlayedCard = lastMove?.card;
    const isLastCardJ = lastPlayedCard && lastPlayedCard.slice(0, -1) === "J";
    const isLastJumperDifferentPlayer = lastMove?.player.toString() !== userId;

    const isLastJumperSamePlayer = lastMove?.player.toString() === userId;

    // Adjust jump counter based on the last played card
    if (isLastCardJ && isLastJumperDifferentPlayer) {
      if (players.length === 2) {
        room.jumpCounter = 1;
      }

      if (players.length > 2) {
        room.jumpCounter -= 1; // Decrement jump counter
      }
    } else {
      // If the room has only two players, count multiple jump cards played by the same player only once
      if (players.length === 2) {
        if (isLastCardJ && isLastJumperSamePlayer) {
          room.jumpCounter += 0; // Do not increment jump counter if the same player played multiple jumps
        } else {
          room.jumpCounter += 1; // Increment jump counter for a new jump by the same player or a different player
        }
      } else {
        room.jumpCounter += 1; // For more than two players, count each individual jump
      }
    }

    console.log("### The room Jump COUNTER after ###");
    console.log(room.jumpCounter);

    // 5. Update turn to next player if no other move to be maderor
    if (
      !hasValidMoveAfterJumpPlay(currentPlayer.playerDeck) &&
      !canFinishGame(currentPlayer.playerDeck)
    ) {
      console.log(
        "No move available && cannot finish game ... Moving to next player"
      );

      console.log("### THE CURRENT JUMP COUNTER ###");
      console.log(room.jumpCounter);

      if (room.jumpCounter > 0) {
        room.turn = room.players[nextPlayerIndex].player;
      }
    }

    // Save player move
    const newMove = {
      player: userId,
      moveType: "play",
      card: cardPlayed,
    };
    room.gamePlay.push(newMove);

    // Save room changes
    room = await room.save();

    // Send updated player deck
    await sendToOne(userId, {
      playerObj: {
        playerDeck: currentPlayer.playerDeck,
        on: currentPlayer.on,
      },
    });

    // Perform aggregation
    room = await cardsRoomModel.aggregate(roomAggregationPipeline(roomId));

    // Notify the room
    await sendToRoom(roomId, {
      play: "success",
      room: room,
    });
  } catch (error) {
    console.error("Error handling jump:", error);
    throw error;
  }
};

const handleKickback = async (roomId, userId, cardPlayed) => {
  try {
    let room = await cardsRoomModel.findById(roomId);

    if (!room) {
      throw new Error("Room not found!");
    }

    const {
      turn,
      discardPile,
      players,
      gamePlay,
      desiredSuit,
      isQuestion,
      isPenalty,
      isKickback,
      currentSuit,
    } = room;

    // Find the current player by their ID
    const currentPlayer = players.find(
      (player) => player.player.toString() === userId
    );
    if (!currentPlayer) {
      throw new Error("Player not found!");
    }

    // Increment the kickback card counter for the player
    currentPlayer.specialMoves.kickbackCards += 1;

    const currentPlayerIndex = players.findIndex(
      (player) => player.player.toString() === userId
    );

    // Check if it's the current user's turn to play
    if (turn.toString() !== userId) {
      throw new Error("It's not your turn to play (kickback)!");
    }

    // cannot be played after question
    if (isQuestion) {
      console.log("### Cannot answer with a Kickback ###");

      await sendToOne(userId, {
        invalidMove: {
          message: "Cannot answer with a Kickback",
        },
      });
      return;
    }

    // cannot be played after question
    if (isPenalty) {
      console.log("### Cannot block Penalty with Kickback Card ###");

      await sendToOne(userId, {
        invalidMove: {
          message: "Cannot block Penalty with Kickback Card",
        },
      });
      return;
    }

    // 2. Validate move after aces play
    if (
      desiredSuit &&
      !isValidMoveAfterAces(
        discardPile[discardPile.length - 1],
        cardPlayed,
        desiredSuit
      )
    ) {
      console.error("### Invalid kickback card after aces ###");
      // drawCard(roomId, currentPlayerIndex); // penalize player
      return;
    } else {
      room.desiredSuit = null;
    }

    if (
      !isValidMove(currentSuit, discardPile[discardPile.length - 1], cardPlayed)
    ) {
      console.error("### Invalid move ###");
      return;
    }

    // Remove the played card from the player's deck and add it to the discard pile
    currentPlayer.playerDeck.splice(
      currentPlayer.playerDeck.indexOf(cardPlayed),
      1
    );
    discardPile.push(cardPlayed);

    // Set current game suit - extract suit from the played card, update currentSuit
    room.currentSuit = cardPlayed[cardPlayed.length - 1];

    // 5. Update turn to next player if no other move to be made
    if (!canFinishGame(currentPlayer.playerDeck)) {
      console.log(
        "No move available && cannot finish game ... Moving to next player**"
      );

      // console.log("### GAME PLAY ###");
      // console.log(gamePlay);

      // Get the last 5 moves (or less if there are fewer than 5 moves)
      let lastMoves = gamePlay.slice(-Math.min(gamePlay.length, 5));

      // console.log("### LAST MOVES ###");
      // console.log(lastMoves);

      // console.log(currentPlayer.player);

      // Count the number of moves where the current player played a 'K' card
      let kickbackCount =
        lastMoves.filter(
          (move) =>
            move.player.toString() === currentPlayer.player.toString() &&
            move.card === "K"
        ).length + 1; // 1 to a/c for curr move

      // console.log("### THE KICKBACK COUNT ###");
      // console.log(kickbackCount);

      if (kickbackCount % 2 === 0) {
        // even number direction doesn't change
        // go to designaged next player
        let nextPlayerIndex =
          (currentPlayerIndex + room.direction + players.length) %
          players.length;

        room.turn = players[nextPlayerIndex].player;

        // console.log("### DETERMINED KICKBACK ###");
      } else {
        // odd direction changes -> send prompt
        if (!isKickback) {
          room.isKickback = true;
          // go next player turn
          let nextPlayerIndex =
            (currentPlayerIndex + room.direction + players.length) %
            players.length;

          room.turn = players[nextPlayerIndex].player;

          // console.log("### SET NEW KICKBACK ###");
        } else if (isKickback) {
          room.isKickback = false;
          console.log("### PLAYER SUCCESS FULLY BLOCKED THE KCIKBACK ###");
        }
      }
    }
    // Save player move
    const newMove = {
      player: userId,
      moveType: "play",
      card: cardPlayed,
    };
    gamePlay.push(newMove);

    // Save room changes
    room = await room.save();

    // Send updated player deck
    await sendToOne(userId, {
      playerObj: {
        playerDeck: currentPlayer.playerDeck,
        on: currentPlayer.on,
      },
    });

    // Perform aggregation
    room = await cardsRoomModel.aggregate(roomAggregationPipeline(roomId));

    // Notify the room
    await sendToRoom(roomId, {
      play: "success",
      room: room,
    });
  } catch (error) {
    console.error("Error handling kickback:", error);
    throw error;
  }
};

const handleQuestion = async (roomId, userId, cardPlayed) => {
  try {
    // 1. Get room
    let room = await cardsRoomModel.findById(roomId);

    if (!room) {
      throw new Error("Room not found!");
    }

    const { discardPile, players, direction, desiredSuit, turn, isKickback } =
      room;

    // Check if it's the current user's turn to play
    if (turn.toString() !== userId) {
      throw new Error("It's not your turn to play (question)!");
    }

    // Find the current player by their ID
    const currentPlayer = players.find(
      (player) => player.player.toString() === userId
    );

    if (!currentPlayer) {
      throw new Error("Player not found!");
    }

    if (isKickback) {
      await sendToOne(userId, {
        invalidMove: {
          message: "Cannot block kickback with Question Card",
        },
      });
      throw new Error("Cannot block kickback with Question Card");
    }

    // 2. Validate move after aces play
    if (
      desiredSuit &&
      !isValidMoveAfterAces(
        discardPile[discardPile.length - 1],
        cardPlayed,
        desiredSuit
      )
    ) {
      console.error("### Invalid question card after aces ###");
      return;
    } else {
      room.desiredSuit = null;
    }

    // 2. Remove card from player's deck and add to discard pile
    currentPlayer.playerDeck.splice(
      currentPlayer.playerDeck.indexOf(cardPlayed),
      1
    );
    discardPile.push(cardPlayed);

    // 3. Set isQuestion to true
    room.isQuestion = true;

    // 4. Set current game suit - extract suit from the played card, update currentSuit
    room.currentSuit = cardPlayed[cardPlayed.length - 1];

    // check additional player moves after question card play
    const hasMoveAfterPlay = hasValidMoveAfterQuestionPlay(
      currentPlayer.playerDeck,
      discardPile[discardPile.length - 1]
    );

    // check if player can finish game
    const canFinish = canFinishGame(currentPlayer.playerDeck);

    const currentPlayerIndex = room.players.findIndex(
      (player) => player.player.toString() === userId
    );

    const nextPlayerIndex =
      (currentPlayerIndex + direction + players.length) % players.length;

    // 5. update turn to next player if no other move to be made - otherwise allow timer to run out
    if (!hasMoveAfterPlay && !canFinish) {
      console.log(
        "No move available && cannot finish game ... Moving to next player"
      );

      // disable 'card on' if next player cannot finish game
      if (!canFinishGame(room.players[nextPlayerIndex].playerDeck)) {
        room.players[nextPlayerIndex].on = false;
      }

      // room.turn = room.players[nextPlayerIndex].player;

      // // reset timer for next player
      // resetPlayerTurnTimer(roomId);
    }

    // Save player move
    const newMove = {
      player: userId,
      moveType: "play",
      card: cardPlayed,
    };
    room.gamePlay.push(newMove);

    // Save room changes
    room = await room.save();

    // Send updated player deck to the current player
    await sendToOne(userId, {
      playerObj: {
        playerDeck: currentPlayer.playerDeck,
        on: currentPlayer.on,
      },
    });

    // Perform aggregation
    room = await cardsRoomModel.aggregate(roomAggregationPipeline(roomId));

    // Notify the room
    await sendToRoom(roomId, {
      play: "success",
      room: room,
    });
  } catch (error) {
    console.error("Error handling question card:", error);
    throw error;
  }
};

const handleAnswer = async (roomId, userId, cardPlayed) => {
  let session;
  try {
    // Start a MongoDB session for transactions
    session = await mongoose.startSession();
    await session.startTransaction();

    // 1. get room with session
    let room = await cardsRoomModel.findById(roomId).session(session);

    if (!room) {
      throw new Error("Room not found!");
    }

    const {
      turn,
      discardPile,
      players,
      direction,
      desiredSuit,
      gamePlay,
      isQuestion,
      isPenalty,
      isKickback,
      tournamentId,
      pot,
    } = room;

    // Check if it's the current user's turn to play
    if (turn.toString() !== userId) {
      throw new Error("It's not your turn to play (answer)!");
    }

    if (isPenalty) {
      console.log("### Cannot block Penalty with Answer Card ###");

      throw new Error("Cannot block Penalty with Answer Card");
    }

    if (isKickback) {
      console.log("Cannot block kickback with Answer Card");
      throw new Error("Cannot block kickback with Answer Card");
    }

    // Find the current player by their ID
    const currentPlayer = players.find(
      (player) => player.player.toString() === userId
    );

    if (!currentPlayer) {
      throw new Error("Player not found!");
    }

    // Validate move after aces play
    if (
      desiredSuit &&
      !isValidMoveAfterAces(
        discardPile[discardPile.length - 1],
        cardPlayed,
        desiredSuit
      )
    ) {
      console.error("### Invalid card Combo after Aces ###");
      return;
    } else {
      room.desiredSuit = null;
    }

    const lastMovePlayer =
      gamePlay.length > 0
        ? gamePlay[gamePlay.length - 1].player.toString()
        : null;

    // verify additional play
    if (currentPlayer.player.toString() === lastMovePlayer && !isQuestion) {
      if (
        !isValidAdditionalMove(discardPile[discardPile.length - 1], cardPlayed)
      ) {
        console.log("### ERROR PLAYING ADDITIONAL MOVE ###");
        return;
      }
    }

    // Remove cards from player to discard pile
    currentPlayer.playerDeck.splice(
      currentPlayer.playerDeck.indexOf(cardPlayed),
      1
    );
    discardPile.push(cardPlayed);

    // Reset isQuestion
    if (room.isQuestion) {
      room.isQuestion = false;
    }

    const currentPlayerIndex = room.players.findIndex(
      (player) => player.player.toString() === userId
    );

    // Set current game suit
    room.currentSuit = cardPlayed[cardPlayed.length - 1];

    // console.log("### GAME OVER DETAILS");
    // console.log(currentPlayer.playerDeck.length);
    // console.log(currentPlayer.on);

    // Handle winning condition
    if (currentPlayer.playerDeck.length === 0 && currentPlayer.on) {
      // Set game state for winner
      room.winner = currentPlayer.player;
      room.gameStatus = "gameover";
      currentPlayer.on = false;

      await sendToRoom(roomId, {
        gameover: "success",
      });
      console.log(`${currentPlayer.player} wins!`);

      await room.save({ session });
    }

    console.log("### AFTER GAME OVER ###");

    const hasMoveAfterPlay = hasValidMoveAfterPlay(
      currentPlayer.playerDeck,
      discardPile[discardPile.length - 1]
    );

    const canFinish = canFinishGame(currentPlayer.playerDeck);

    // Update turn if no other move available
    if (!hasMoveAfterPlay && !canFinish) {
      let nextPlayerIndex =
        (currentPlayerIndex + direction + players.length) % players.length;

      if (!canFinishGame(room.players[nextPlayerIndex].playerDeck)) {
        room.players[nextPlayerIndex].on = false;
      }

      room.turn = room.players[nextPlayerIndex].player;
    }

    // Save player move
    const newMove = {
      player: userId,
      moveType: "play",
      card: cardPlayed,
    };
    room.gamePlay.push(newMove);

    room = await room.save({ session });

    // Commit the transaction before any notifications
    await session.commitTransaction();

    // Send updated player deck
    await sendToOne(userId, {
      playerObj: {
        playerDeck: currentPlayer.playerDeck,
        on: currentPlayer.on,
      },
    });

    // Perform aggregation and notify room
    const updatedRoom = await cardsRoomModel.aggregate(
      roomAggregationPipeline(roomId)
    );
    await sendToRoom(roomId, {
      play: "success",
      room: updatedRoom,
    });
  } catch (error) {
    if (session) {
      await session.abortTransaction();
    }
    console.error("Error playing answer:", error);
    throw error;
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};

// END GAME LOGIC FUNCTIONS

// ACTION FUNCTIONS
export const registerRoom = async (roomId, username, userId) => {
  try {
    // find room
    const room = await cardsRoomModel.findById(roomId);

    const roomData = await cardsRoomModel.aggregate(
      roomAggregationPipeline(roomId)
    );

    if (!roomData) {
      throw new Error("Room not found!");
    }

    // console.log("### Adding to Room ###");
    // console.log(roomId, username);
    // console.log("ROOM MEMBERS: ### ");

    // Check if the userId is a player in the room -> send current deck
    const player = room.players.find(
      (player) => player.player.toString() === userId
    );

    // console.log("### USERID $####");
    // console.log(userId);

    // console.log("### ROOM PLAYERS $####");
    // console.log(room.players);

    // console.log("### FOUND PLAYER $####");
    // console.log(player);

    if (player) {
      await sendToOne(userId, {
        playerObj: {
          playerDeck: player.playerDeck,
          on: player.on,
        },
      });
    }

    const notificationMessage = `${username} joined ${room.name}.`;

    // notify the room
    await sendToRoom(roomId, {
      systemMessage: {
        message: notificationMessage,
        sender: {
          username: "moderator",
        },
        createdAt: new Date().toISOString(),
      },
      connect: "success",
      members: [],
      room: roomData,
    });

    // return { statusCode: 200 };
  } catch (error) {
    console.error("Error registering to room:", error);

    throw error;
  }
};

export const joinRoom = async (roomId, userId) => {
  console.log("### JOINING CARD GAME ####");

  try {
    let room = await cardsRoomModel.findById(roomId);

    // console.log("ROOM ID ###");
    // console.log(roomId);

    // console.log("USER ID ###");
    // console.log(userId);

    // console.log("FOUND CARD GAME ####");
    // console.log(room);

    if (!room) throw new Error("Room not found!");
    if (room.players.length >= room.maxPlayers)
      throw new Error("Room is full!");

    let kadiPlayer = await kadiPlayerModel.findOne({ userId });
    if (!kadiPlayer) {
      kadiPlayer = new kadiPlayerModel({ userId, rating: 1500 });
      await kadiPlayer.save();
    }

    const initialRating = kadiPlayer?.rating;

    // Handle competitive game buy-in
    if (room.pot > 0) {
      // Check if the player has enough balance for buy-in
      const wallet = await WalletModel.findOne({
        userId: new mongoose.Types.ObjectId(userId),
      });

      const amount = room.pot / room.players.length; // Assuming equal contribution to the pot

      // console.log("### PLAYERS LENGTH ###");
      // console.log(room.players.length);

      // console.log("### ORIGINAL POT ###");
      // console.log(room);

      // console.log("### THE CONVERTED POT ###");
      // console.log(amount);

      if (!wallet || wallet.balance < amount) {
        const _message = `Insufficient balance for buy-in`;

        await sendToOne(userId, {
          notificationMessage: {
            type: "error",
            message: _message,
          },
        });

        return;
      }

      // Create a new buy-in transaction
      const buyInTransaction = new TransactionModel({
        type: "buyIn",
        status: "success",
        userId: new mongoose.Types.ObjectId(userId),
        walletId: wallet._id,
        amount: amount,
        currency: "KES",
        gameId: roomId,
      });

      await buyInTransaction.save();

      // Update the room's pot
      room.pot += amount;
    }

    // add player to room if successful
    room.players.push({
      player: userId,
      playerDeck: [],
      score: 0,
      on: false,
      initialRating: initialRating,
      specialMoves: {
        jumpCards: 0,
        kickbackCards: 0,
        aceDeclarations: 0,
        penaltyAvoidances: 0,
      },
    });

    // if (room.players.length === room.maxPlayers) {
    //   room.gameStatus = "active";
    // }

    // Save the updated room state
    room = await room.save();

    // Notify the player about successful room join
    await sendToOne(userId, { joinedRoom: true });

    // // If the room is full, deal cards
    // if (room.players.length === room.maxPlayers) {
    //   await dealCards(roomId);
    // }

    const roomData = await cardsRoomModel.aggregate(
      roomAggregationPipeline(roomId)
    );

    // Notify the frontend about the updated room state

    const notificationMessage = `${userId} joined game room ${roomId}.`;

    await sendToRoom(roomId, {
      systemMessage: {
        message: notificationMessage,
        sender: {
          username: "moderator",
        },
        createdAt: new Date().toISOString(),
      },
      joinRoom: "success",
      room: roomData,
    });
  } catch (error) {
    console.error("Error joining room:", error);
    // Notify the player about the error
    await sendToOne(userId, {
      joinedRoom: false,
      message: error.message,
    });
  }
};

export const drawPenalty = async (roomId, userId) => {
  try {
    // Find room
    let room = await cardsRoomModel.findById(roomId);

    if (!room) {
      throw new Error("Room not found!");
    }

    const { turn, players } = room;

    // Check if it's the current user's turn to play
    if (turn.toString() !== userId) {
      throw new Error("It's not your turn to play (draw penalty!");
    }

    // Find player
    const player = players.find(
      (player) => player.player.toString() === userId
    );

    if (!player) {
      throw new Error("Player not found!");
    }

    // remove card on
    player.on = false;

    // Determine the number of penalty cards to draw based on the top card of the discard pile
    const topCard = room.discardPile[room.discardPile.length - 1];
    let penaltyCards = 0;
    if (topCard.startsWith("2")) {
      penaltyCards = 2;
    } else if (topCard.startsWith("3")) {
      penaltyCards = 3;
    } else if (topCard === "JOK1" || topCard === "JOK2") {
      penaltyCards = 5;
    }

    // Draw the penalty cards for the current player
    for (let i = 0; i < penaltyCards; i++) {
      if (room.drawPile.length <= 5) {
        // Draw pile is empty or low, reshuffle
        const topCard = room.discardPile[room.discardPile.length - 1]; // Keep the top card
        const newDrawPile = room.discardPile.slice(0, -1); // Create new draw pile from discard pile (exclude top card)
        room.drawPile = shuffle(newDrawPile); // Shuffle the new draw pile
        room.discardPile = [topCard]; // Keep only the top card in the discard pile

        // Notify the room
        await sendToRoom(roomId, {
          shuffle: "success",
        });
      }

      if (room.drawPile.length === 0) break; // Stop if the draw pile is empty

      const cardDrawn = room.drawPile.pop();
      player.playerDeck.push(cardDrawn);

      // Save draw (penalty) move
      const newMove = {
        player: userId,
        moveType: "draw",
        card: cardDrawn,
      };
      room.gamePlay.push(newMove);
    }

    // Reset the penalty state
    room.isPenalty = false;

    // Update turn to next player
    const currentPlayerIndex = room.players.findIndex(
      (player) => player.player.toString() === userId
    );

    const nextPlayerIndex =
      (currentPlayerIndex + room.direction + room.players.length) %
      room.players.length;

    // Check if next player was on and can finish game
    const hasMove = hasValidMove(
      room.currentSuit,
      room.players[nextPlayerIndex].playerDeck,
      room.discardPile[room.discardPile.length - 1]
    );

    if (!hasMove) {
      room.players[nextPlayerIndex].on = false;
    }

    room.turn = room.players[nextPlayerIndex].player;

    // Reset timer for next player
    // resetPlayerTurnTimer(roomId);

    // Save the updated room
    room = await room.save();

    // Perform aggregation
    room = await cardsRoomModel.aggregate(roomAggregationPipeline(roomId));

    // Notify the room
    await sendToRoom(roomId, {
      draw: "success",
      room: room,
    });

    await sendToOne(userId, {
      playerObj: {
        playerDeck: player.playerDeck,
        on: player.on,
      },
    });

    return room; // Return the aggregated room
  } catch (error) {
    console.error("Error drawing penalty cards:", error);
    throw error;
  }
};

export const dealCards = async (roomId) => {
  try {
    const cardsPerPlayer = 4;
    let room = await cardsRoomModel.findById(roomId);

    if (!room) {
      throw new Error("Room not found!");
    }

    console.log("ORIGINAL DECK");
    console.log(room.drawPile);

    console.log("Shuffling...");

    room.drawPile = shuffle(room.drawPile); // shuffle game deck

    const numCards = cardsPerPlayer * room.players.length;

    console.log("SHUFFLED DECK");
    console.log(room.drawPile);

    // Deal cards to players sequentially
    for (let i = 0; i < numCards; i++) {
      const currentPlayerIndex = i % room.players.length;
      const currentPlayer = room.players[currentPlayerIndex];
      const card = room.drawPile.pop(); // Take the top card from the deck

      if (card) {
        currentPlayer.playerDeck.push(card); // Assign the card to the current player
      } else {
        console.log("No cards left to deal!");
        break;
      }
    }

    // Pop cards from the top of the draw pile until an answer card is found
    let starterCard;
    while (room.drawPile.length > 0) {
      const card = room.drawPile.pop();
      if (["4", "5", "6", "7", "9", "10"].includes(card.slice(0, -1))) {
        starterCard = card;
        break;
      } else {
        room.drawPile.unshift(card); // Put the non-answer card back to the bottom of the draw pile
      }
    }

    // Push the starter card to the discard pile
    if (starterCard) {
      room.discardPile.push(starterCard);

      // Set current game suit - extract suit from the played card, update currentSuit
      room.currentSuit = starterCard[starterCard.length - 1];
    }

    // Set turn to player at index 0
    room.turn = room.players[0].player;

    // set status to active
    room.gameStatus = "active";

    // start timer
    // await startPlayerTurnTimer(roomId);

    room = await room.save();

    console.log("### Sending DATA NOW ###");

    console.log(`### ${roomId} Players ###`);
    console.log(room.players);

    for (const player of room.players) {
      const playerId = player.player.toString();

      // Send the player's deck information
      await sendToOne(playerId, {
        playerObj: {
          playerDeck: player.playerDeck,
          on: player.on,
        },
      });
    }

    room = await cardsRoomModel.aggregate(roomAggregationPipeline(roomId));

    const message = "Cards dealt successfully.";
    // notify the room
    await sendToRoom(roomId, {
      systemMessage: {
        message: message,
        sender: {
          username: "moderator",
        },
        createdAt: new Date().toISOString(),
      },
      deal: "success",
      room: room,
    });

    return room;
  } catch (error) {
    console.error("Error dealing cards:", error);
    throw error;
  }
};

export const drawCard = async (roomId, userId) => {
  try {
    // find room
    let room = await cardsRoomModel.findById(roomId);

    if (!room) {
      throw new Error("Room not found!");
    }

    const { players, direction, turn } = room;

    // find player
    const player = players.find(
      (player) => player.player.toString() === userId
    );

    if (!player) {
      throw new Error("Player not found!");
    }

    // Check if it's the current user's turn to play
    if (turn.toString() !== userId) {
      throw new Error("It's not your turn to play (draw card)!");
    }

    const currentPlayerIndex = players.findIndex(
      (player) => player.player.toString() === userId
    );

    const nextPlayerIndex =
      (currentPlayerIndex + direction + players.length) % room.players.length;

    let card;

    if (room.drawPile.length <= 5) {
      // Draw pile is empty, reshuffle
      const topCard = room.discardPile[room.discardPile.length - 1]; // Keep the top card
      const newDrawPile = room.discardPile.slice(0, -1); // Create new draw pile from discard pile (exclude top card)
      room.drawPile = shuffle(newDrawPile); // Shuffle the new draw pile
      room.discardPile = [topCard]; // Keep only the top card in the discard pile

      // notify the room
      await sendToRoom(roomId, {
        shuffle: "success",
      });
    }

    // Draw a card from the draw pile
    card = room.drawPile.pop(); // remove card

    if (card) {
      player.playerDeck.push(card); // Add card to player deck

      // Save player draw move
      const newMove = {
        player: userId,
        moveType: "draw",
        card: card,
      };
      room.gamePlay.push(newMove);

      // reset isQuestion
      if (room.isQuestion) {
        room.isQuestion = false;
      }

      // restore 'Kadi'
      if (player.on) {
        player.on = false;
      }

      // Update turn to next player

      // check of next player was on and can finish game
      const hasMove = hasValidMove(
        room.currentSuit,
        room.players[nextPlayerIndex].playerDeck,
        room.discardPile[room.discardPile.length - 1]
      );

      console.log("### DOES NEXT PLAYER HAVE MOVE ###");
      console.log(hasMove);
      console.log(room.players[nextPlayerIndex].playerDeck);
      console.log(room.discardPile[room.discardPile.length - 1]);

      if (!hasMove) {
        room.players[nextPlayerIndex].on = false;
      }

      room.turn = room.players[nextPlayerIndex].player;

      // Reset timer for next player
      // resetPlayerTurnTimer(roomId);
    }

    // Save the updated room
    room = await room.save();

    // Perform aggregation
    room = await cardsRoomModel.aggregate(roomAggregationPipeline(roomId));

    // notify the room
    await sendToRoom(roomId, {
      draw: "success",
      room: room,
    });

    await sendToOne(userId, {
      playerObj: {
        playerDeck: player.playerDeck,
        on: player.on,
      },
    });

    return room; // Return the aggregated room
  } catch (error) {
    console.error("Error drawing card:", error);
    throw error;
  }
};

export const playHand = async (roomId, userId, cardPlayed, desiredSuit) => {
  try {
    let slicedCard;

    if (cardPlayed === "JOK1" || cardPlayed === "JOK2") {
      slicedCard = "JOK";
    } else {
      slicedCard = cardPlayed.slice(0, -1);
    }

    // special cards handlers
    switch (slicedCard) {
      case "2":
      case "3":
      case "JOK":
        console.log("### PENALTY STATE ###");
        await handlePenalty(roomId, userId, cardPlayed);
        break;
      case "A":
        console.log("### ACES STATE ###");
        await handleAces(roomId, userId, cardPlayed, desiredSuit);
        break;
      case "J":
        console.log("### JUMP STATE ###");
        await handleJump(roomId, userId, cardPlayed);
        break;
      case "K":
        console.log("### KICKBACK STATE ###");
        await handleKickback(roomId, userId, cardPlayed);
        break;
      case "Q":
      case "8":
        console.log("### QUESTION STATE ###");
        await handleQuestion(roomId, userId, cardPlayed);
        break;
      case "4":
      case "5":
      case "6":
      case "7":
      case "9":
      case "10":
        console.log("### ANSWER STATE ###");
        await handleAnswer(roomId, userId, cardPlayed);
        break;
      default:
        console.log("## MISSED ALL.. ##");
        break;
    }
  } catch (error) {
    console.error("Error playing hand:", error);
    throw error;
  }
};

export const setPlayerOn = async (roomId, userId) => {
  try {
    // Find the room where the player is
    let room = await cardsRoomModel.findById(roomId);

    if (!room) {
      throw new Error("Room not found!");
    }

    const { players, isQuestion, isPenalty, gamePlay } = room;

    // Get the current player
    const currentPlayerIndex = players.findIndex(
      (player) => player.player.toString() === userId
    );

    const currentPlayer = players[currentPlayerIndex];

    // Find the player by their ID
    const player = players.find(
      (player) => player.player.toString() === userId
    );

    if (!player) {
      throw new Error("Player not found!");
    }

    if (isQuestion) {
      await sendToOne(userId, {
        invalidMove: {
          message: "Pick an Answer Card First",
        },
      });
      return;
    }

    const lastMove = gamePlay[gamePlay.length - 1];

    if (
      isPenalty &&
      lastMove.player.toString() !== currentPlayer.player._id.toString()
    ) {
      await sendToOne(userId, {
        invalidMove: {
          message: "Settle the Penalty First",
        },
      });
      return;
    }

    // Check if the player can finish the game
    const canFinish = canFinishGame(player.playerDeck);

    console.log("### THE DECK ###");
    console.log(player.playerDeck);

    if (!canFinish) {
      throw new Error("Player cannot finish the game!");
    }

    // Set 'on' to true for the player
    player.on = true;

    // Update turn to next player
    const nextPlayerIndex =
      (currentPlayerIndex + room.direction + room.players.length) %
      room.players.length;

    // check of next player was on and can finish game
    const hasMove = hasValidMove(
      room.currentSuit,
      room.players[nextPlayerIndex].playerDeck,
      room.discardPile[room.discardPile.length - 1]
    );

    if (!hasMove) {
      room.players[nextPlayerIndex].on = false;
    }

    room.turn = room.players[nextPlayerIndex].player;

    // Reset timer for next player(after kadi on)
    // resetPlayerTurnTimer(roomId);

    // Save the updated room
    const updatedRoom = await room.save();

    // send updated player deck
    await sendToOne(userId, {
      playerObj: {
        playerDeck: player.playerDeck,
        on: player.on,
      },
    });

    // Perform aggregation
    room = await cardsRoomModel.aggregate(roomAggregationPipeline(roomId));

    const message = `${userId} is KADI`;

    // notify the room
    await sendToRoom(roomId, {
      systemMessage: {
        message: message,
        sender: {
          username: "moderator",
        },
        createdAt: new Date().toISOString(),
      },

      kadi: "success",
      room: room,
    });

    return updatedRoom;
  } catch (error) {
    console.error("Error setting player 'on' status:", error);
    throw error;
  }
};

export const acceptJump = async (roomId, userId) => {
  try {
    let room = await cardsRoomModel.findById(roomId);

    if (!room) {
      throw new Error("Room not found!");
    }

    // Check if it's the current user's turn to play
    if (room.turn.toString() !== userId) {
      throw new Error("It's not your turn to play (skip turn)!");
    }

    const { players, direction, jumpCounter, discardPile } = room;

    const currentPlayerIndex = players.findIndex(
      (player) => player.player.toString() === userId
    );

    const nextPlayerIndex =
      (currentPlayerIndex + direction + players.length) % players.length;

    // Find the current player by their ID
    const currentPlayer = players.find(
      (player) => player.player.toString() === userId
    );
    if (!currentPlayer) {
      throw new Error("Player not found!");
    }

    if (jumpCounter > 0) {
      room.jumpCounter -= 1;

      // Save player move
      const newMove = {
        player: userId,
        moveType: "jump",
        card: null,
      };

      room.gamePlay.push(newMove);

      // disable 'card on' if next player cannot finish game
      if (!canFinishGame(players[nextPlayerIndex].playerDeck)) {
        room.players[nextPlayerIndex].on = false;
      }

      room.turn = room.players[nextPlayerIndex].player;

      // Save room changes
      room = await room.save();

      // Send updated player deck
      await sendToOne(userId, {
        playerObj: {
          playerDeck: currentPlayer.playerDeck,
          on: currentPlayer.on,
        },
      });

      // Perform aggregation
      room = await cardsRoomModel.aggregate(roomAggregationPipeline(roomId));

      // Notify the room
      await sendToRoom(roomId, {
        play: "success",
        room: room,
      });
    } else {
      console.error("No JUMP move Played");
    }
  } catch (error) {
    console.error("Error skipping turn:", error);
    throw error;
  }
};

export const acceptKickback = async (roomId, userId) => {
  try {
    let room = await cardsRoomModel.findById(roomId);

    if (!room) {
      throw new Error("Room not found!");
    }

    // Check if it's the current user's turn to play
    if (room.turn.toString() !== userId) {
      throw new Error("It's not your turn to play (skip turn)!");
    }

    const { players, direction, discardPile } = room;

    const currentPlayerIndex = players.findIndex(
      (player) => player.player.toString() === userId
    );

    const nextPlayerIndex =
      (currentPlayerIndex + direction + players.length) % players.length;

    // Find the current player by their ID
    const currentPlayer = players.find(
      (player) => player.player.toString() === userId
    );
    if (!currentPlayer) {
      throw new Error("Player not found!");
    }

    room.direction = -room.direction;
    room.isKickback = false;

    // Calculate the previous two player indices using modulo:
    const prevPlayer1Index =
      (currentPlayerIndex - 1 + players.length) % players.length;
    const prevPlayer2Index =
      (currentPlayerIndex - 2 + players.length) % players.length;

    console.log("Current Player Index:", currentPlayerIndex);
    console.log("Previous Player 1 Index:", prevPlayer1Index);
    console.log("Previous Player 2 Index:", prevPlayer2Index);

    // Log the next player's deck and the top card from the discard pile
    const nextPlayerDeck = players[nextPlayerIndex].playerDeck;

    // disable 'card on' if next player cannot finish game
    if (!canFinishGame(nextPlayerDeck)) {
      room.players[nextPlayerIndex].on = false;
    }

    if (players.length === 2) {
      room.turn = room.players[nextPlayerIndex].player;
    }

    if (players.length > 2) {
      room.turn = room.players[prevPlayer2Index].player;
    }

    // Save player move
    const newMove = {
      player: userId,
      moveType: "kickback",
      card: null,
    };

    room.gamePlay.push(newMove);

    // Save room changes
    room = await room.save();

    // Send updated player deck
    await sendToOne(userId, {
      playerObj: {
        playerDeck: currentPlayer.playerDeck,
        on: currentPlayer.on,
      },
    });

    // Perform aggregation
    room = await cardsRoomModel.aggregate(roomAggregationPipeline(roomId));

    // Notify the room
    await sendToRoom(roomId, {
      play: "success",
      room: room,
    });
  } catch (error) {
    console.error("Error accepting kickback:", error);
    throw error;
  }
};

export const passTurn = async (roomId, userId) => {
  try {
    let room = await cardsRoomModel.findById(roomId);

    if (!room) {
      throw new Error("Room not found!");
    }

    // Check if it's the current user's turn to play
    if (room.turn.toString() !== userId) {
      throw new Error("It's not your turn to play (pass turn)!");
    }

    const { players, direction, gamePlay } = room;

    // Find the current player by their ID
    const currentPlayer = players.find(
      (player) => player.player.toString() === userId
    );
    if (!currentPlayer) {
      throw new Error("Player not found!");
    }

    const lastMove = gamePlay[gamePlay.length - 1];

    if (lastMove.player.toString() !== userId) {
      throw new Error("Cannot pass turn if not played!");
    }

    const currentPlayerIndex = players.findIndex(
      (player) => player.player.toString() === userId
    );

    const nextPlayerIndex =
      (currentPlayerIndex + direction + players.length) % players.length;

    room.turn = room.players[nextPlayerIndex].player;

    // Save room changes
    room = await room.save();

    // Send updated player deck
    await sendToOne(userId, {
      playerObj: {
        playerDeck: currentPlayer.playerDeck,
        on: currentPlayer.on,
      },
    });

    // Perform aggregation
    room = await cardsRoomModel.aggregate(roomAggregationPipeline(roomId));

    // Notify the room
    await sendToRoom(roomId, {
      play: "success",
      room: room,
    });
  } catch (error) {
    console.error("Error passing turn:", error);
    throw error;
  }
};

export const react = async (roomId, userId, src, text) => {
  try {
    let room = await cardsRoomModel.findById(roomId);

    if (!room) {
      throw new Error("Room not found!");
    }

    console.log(`### REACTION IN ROOM ${roomId}`);

    const { players } = room;

    // Find the current player by their ID
    const currentPlayer = players.find(
      (player) => player.player.toString() === userId
    );
    if (!currentPlayer) {
      throw new Error("Player not found!");
    }

    // Notify the room
    await sendToRoom(roomId, {
      react: "success",
      player: userId,
      src: src,
      text: text,
    });
  } catch (error) {
    console.error("Error reacting:", error);
    throw error;
  }
};

export const sendMessageToRoom = async (roomId, username, message) => {
  try {
    let room = await cardsRoomModel.findById(roomId);

    if (!room) {
      throw new Error("Room not found!");
    }

    // notify the room
    await sendToRoom(roomId, {
      chatMessage: {
        message: message,
        sender: {
          username: username,
        },
        createdAt: new Date().toISOString(),
      },
    });

    // return { statusCode: 200 };
  } catch (error) {
    console.error("Error passing turn:", error);
    throw error;
  }
};

// END ACTION FUNCTIONS
