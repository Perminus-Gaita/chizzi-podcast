import TelegramGroup from '@/models/telegram/group.model';
import mongoose from 'mongoose';
import { sendBotStatusMessageToGroup } from '@/services/integrations/telegram/group/send-bot-status-message-to-group';

export async function handleGroupTypeChange(update) {
  const session = await mongoose.startSession();
  
  try {
    if (update.message && update.message.migrate_to_chat_id) {
      const oldGroupId = update.message.chat.id.toString();
      const newSupergroupId = update.message.migrate_to_chat_id.toString();

      console.log(`Group migrated from ${oldGroupId} to ${newSupergroupId}`);

      let newGroup;
      
      await session.withTransaction(async () => {
        // Find the old group to get its current state
        const oldGroup = await TelegramGroup.findOne(
          { telegramGroupId: oldGroupId }
        ).session(session);

        if (!oldGroup) {
          throw new Error(`Group with ID ${oldGroupId} not found in database.`);
        }

        // Create new group data with supergroup type
        const newGroupData = {
          ...oldGroup.toObject(),
          telegramGroupId: newSupergroupId,
          groupType: 'supergroup',
          hasSentFinalBotStatusMessage: false // Reset this flag for new status message
        };
        delete newGroupData._id; // Remove MongoDB _id to avoid conflicts

        // Create new group and delete old one within transaction
        newGroup = await TelegramGroup.create([newGroupData], { session });
        await TelegramGroup.deleteOne({ telegramGroupId: oldGroupId }).session(session);

        // Get the created group (create returns an array)
        newGroup = newGroup[0];
      });

      // Send status message after successful transaction
      if (newGroup) {
        await sendBotStatusMessageToGroup(
          newSupergroupId,
          'supergroup',
          newGroup.wufwufBotRole === 'admin' ? 'administrator' : 'member',
          newGroup.botPermissions
        );

        console.log(`Group migrated successfully: ${oldGroupId} -> ${newSupergroupId}`);
        return newGroup;
      }
    }

    return null;
  } catch (error) {
    console.error('Error handling group migration:', error);
    throw error;
  } finally {
    await session.endSession();
  }
}