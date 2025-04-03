import TelegramGroup from '@/models/telegram/group.model';

export async function handleBotRemovedFromAGroup(update) {
  try {
    // Check if this is a bot removal event
    const chat = update.my_chat_member.chat;
    const newStatus = update.my_chat_member.new_chat_member.status;
    
    // Only proceed if the status is 'left' or 'kicked'
    if (newStatus !== 'left' && newStatus !== 'kicked') {
      return null;
    }

    // Only process if it's a group or supergroup
    if (chat.type !== 'group' && chat.type !== 'supergroup') {
      return null;
    }

    // Find the current group to get existing memberCount
    const currentGroup = await TelegramGroup.findOne({ telegramGroupId: chat.id });
    
    if (!currentGroup) {
      console.log(`No group found with ID ${chat.id}`);
      return null;
    }

    // Update the group document
    const updatedGroup = await TelegramGroup.findOneAndUpdate(
      { telegramGroupId: chat.id },
      {
        $set: {
          wufwufBotRole: 'notInGroup',
          'botPermissions.canInviteViaLink': false,
          groupName: chat.title,
          groupType: chat.type,
          memberCount: Math.max(0, currentGroup.memberCount - 1)
        }
      },
      {
        new: true,
        runValidators: true
      }
    );

    console.log(`Bot removed from chat ${chat.title} (${chat.id}). Group document updated.`);
    return updatedGroup;

  } catch (error) {
    console.error('Error handling bot removal from group:', error);
    throw error;
  }
}