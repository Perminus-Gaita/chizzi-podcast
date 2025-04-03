import TelegramUserToAddToTournament from '@/models/telegram/user-to-add-to-tournament.model';
import { joinTournament } from '@/services/tournament/join-a-tournament';

export async function handleMemberJoiningAGroup(update) {
  try {
    // Extract relevant information from the update
    const newMember = update.message.new_chat_member || update.message.new_chat_participant;
    const chat = update.message.chat;
    
    if (!newMember || !chat) {
      console.log('Missing required member or chat information');
      return null;
    }

    // Check if this user should be added to a tournament based on this group
    const userToAdd = await TelegramUserToAddToTournament.findOne({
      telegramUserId: newMember.id.toString(),
      telegramGroupId: chat.id.toString(),
      userHasBeenAddedToTournament: false
    }).populate('userId', 'username');

    // If no pending tournament addition found, do nothing
    if (!userToAdd) {
      console.log(`No pending tournament addition found for user ${newMember.id} in group ${chat.id}`);
      return null;
    }

    console.log({userToAdd})
    try {
      // Call the tournament join service directly
      const result = await joinTournament(
        userToAdd.userId._id.toString(), // MongoDB user ID
        userToAdd.tournamentId.toString(), // Tournament ID
        userToAdd.userId.username // Player name
      );
      
      if (result) {
        // Update the record to indicate successful tournament addition
        await TelegramUserToAddToTournament.findByIdAndUpdate(
          userToAdd._id,
          { userHasBeenAddedToTournament: true }
        );

        console.log(`Successfully added user ${newMember.id} to tournament ${userToAdd.tournamentId}`);
        return result;
      }
    } catch (serviceError) {
      console.error('Error calling tournament join service:', serviceError.message);
      throw serviceError;
    }

    return null;
  } catch (error) {
    console.error('Error handling group member join:', error);
    throw error;
  }
}