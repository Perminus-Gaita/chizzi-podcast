import axios from 'axios';

/**
 * Sends a status message to the group based on current permissions and conditions
 * @param {number} chatId Telegram chat ID
 * @param {string} groupType Type of the group
 * @param {string} botRole Bot's role
 * @param {Object} botPermissions Bot's permissions
 */
export async function sendBotStatusMessageToGroup(chatId, groupType, botRole, botPermissions) {
  try {
    // Check permissions only if bot is administrator
    const canInviteViaLink = botRole === 'administrator' ? (botPermissions?.canInviteViaLink || false) : false;
    const canManageStories = botRole === 'administrator' ? (botPermissions?.canManageStories || false) : false;

    // Check if all conditions are met
    const allConditionsMet = (
      groupType === 'supergroup' &&
      botRole === 'administrator' &&
      canInviteViaLink &&
      canManageStories
    );

    // Helper function for status symbol
    const getStatusSymbol = (condition) => condition ? '✅' : '⚠️';

    // Generate message
    let message = 'Hi, my name is *Rafiki*, Wufwuf\'s *official bot*🤖. Thank you for adding me to your group.\n\n';

    // Add status information with new formatting
    message += `Group type: *${groupType}* ${getStatusSymbol(groupType === 'supergroup')}`;
    if (!allConditionsMet && groupType !== 'supergroup') message += ' (needs to be super group)';
    message += '\n';

    message += `Bot role: *${botRole}* ${getStatusSymbol(botRole === 'administrator')}`;
    if (!allConditionsMet && botRole !== 'administrator') message += ' (needs to be administrator)';
    message += '\n';

    message += 'Bot has needed permissions:\n';
    message += `    1. invite users via link: *${canInviteViaLink}* ${getStatusSymbol(canInviteViaLink)}\n`;
    message += `    2. Manage stories: *${canManageStories}* ${getStatusSymbol(canManageStories)}\n`;
    message += '    (2 is needed to make your group a super group)\n\n';

    // Add conclusion based on conditions
    if (allConditionsMet) {
      message += 'Congratulations 🎉, I now have the needed conditions for me to function properly. Let\'s play 🎮.';
    } else {
      message += 'For me to function properly the group needs to be of type super group, I need to be an administrator and have the above mentioned permissions. I cannot wait for us to play together 🙂.';
    }

    // Send message
    const response = await axios.post(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown' // Changed to Markdown for better text formatting
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error sending status message:', error);
    throw error;
  }
}