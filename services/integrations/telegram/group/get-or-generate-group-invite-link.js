import TelegramGroup from '@/models/telegram/group.model'; // Adjust the import path accordingly

async function getOrGenerateGroupInviteLink(_groupId) {
  try {
    const groupId = _groupId.toString();
    // 1. Fetch the group by ID
    const group = await TelegramGroup.findOne({ telegramGroupId: groupId });

    if (!group) {
      throw new Error('No group found with the provided ID');
    }

    // 2. Check if the group already has a primary invite link
    if (!group.primaryInviteLink) {
      // 3. If no primary invite link exists, generate a new one
      const { inviteLink, error } = await generateInviteLink(groupId);

      if (error) {
        throw new Error(error || 'Failed to generate invite link');
      }

      // 4. Update the group with the new invite link
      group.primaryInviteLink = inviteLink;
      await group.save();
    }

    // 5. Return the entire group data including the invite link
    return {
      ...group.toObject(), // Convert Mongoose document to a plain JavaScript object
      inviteLink: group.primaryInviteLink
    };
  } catch (error) {
    throw error;
  }
}

// Improved generateInviteLink function
async function generateInviteLink(chatId) {
  try {
    if (!chatId) {
      throw new Error('Chat ID is required');
    }

    const response = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/exportChatInviteLink`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId
        })
      }
    );

    const data = await response.json();

    if (!data.ok) {
      throw new Error(data.description || 'Failed to generate invite link');
    }

    return {
      inviteLink: data.result
    };
  } catch (error) {
    throw error;
  }
}

export default getOrGenerateGroupInviteLink;
