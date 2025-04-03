import axios from 'axios';
import TelegramGroup from '@/models/telegram/group.model';
import { sendBotStatusMessageToGroup } from '@/services/integrations/telegram/group/send-bot-status-message-to-group';

export async function handleBotAddedToAGroup(update) {
  try {
    const chat = update.my_chat_member.chat;
    const from = update.my_chat_member.from;
    const status = update.my_chat_member.new_chat_member.status;
    const oldStatus = update.my_chat_member.old_chat_member.status;

    // Early return if the bot is not being added
    if (oldStatus !== 'left' && oldStatus !== 'kicked') {
      console.log(`Bot was not added to the group. Previous status: ${oldStatus}`);
      return null;
    }

    // Early return if bot is being removed
    if (status === 'left' || status === 'kicked') {
      console.log(`Bot removed from chat ${chat.title} (${chat.id})`);
      return null;
    }

    // Only process if it's a group or supergroup
    if (chat.type !== 'group' && chat.type !== 'supergroup') {
      return null;
    }

    // Only process if bot is being added as a member or administrator
    if (status !== 'member' && status !== 'administrator') {
      return null;
    }

    // Fetch member count from Telegram API
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const memberCountResponse = await axios.get(
      `https://api.telegram.org/bot${botToken}/getChatMemberCount`,
      {
        params: {
          chat_id: chat.id
        }
      }
    );

    const memberCount = memberCountResponse.data.ok ? memberCountResponse.data.result : 0;

    // Get bot permissions from the update
    const botPermissions = {
      canInviteViaLink: update.my_chat_member.new_chat_member.can_invite_users || false,
      canManageStories: update.my_chat_member.new_chat_member.can_post_stories || false
    };

    // Create or update group document
    const groupData = {
      telegramGroupId: chat.id.toString(),
      telegramUserId: from.id.toString(),
      groupName: chat.title,
      groupType: chat.type,
      memberCount: memberCount,
      wufwufBotRole: status === 'administrator' ? 'admin' : 'member',
      botPermissions: botPermissions,
      allMembersAreAdministrators: chat.all_members_are_administrators || false
    };

    // Use findOneAndUpdate with upsert
    const group = await TelegramGroup.findOneAndUpdate(
      { telegramGroupId: chat.id.toString() },
      groupData,
      { 
        upsert: true,
        new: true,
        runValidators: true
      }
    );

    // Send status message
    await sendBotStatusMessageToGroup(
      chat.id,
      chat.type,
      status,
      botPermissions
    );

    console.log(`Bot ${status} in chat ${chat.title} (${chat.id})`);
    
    return group;

  } catch (error) {
    console.error('Error handling group member update:', error);
    throw error;
  }
}