import TelegramGroup from '@/models/telegram/group.model';
import connectToDatabaseMongoDB from '@/lib/database';


/**
 * Check if a user is a member of a specified Telegram group
 * @param {string} groupId - The Telegram group ID
 * @param {string} userId - The Telegram user ID to check
 * @returns {Promise<{isMember: boolean, error?: string}>}
 */
export async function checkGroupMembership(groupId, userId) {
    try {
        if (!groupId || !userId) {
            throw new Error('Group ID and User ID are required');
        }

        // Ensure IDs are strings
        const chatId = groupId.toString();
        const telegramUserId = userId.toString();

        // connect to database
        await connectToDatabaseMongoDB("checkGroupMembership");

        // 1. First verify the group exists in our database
        const group = await TelegramGroup.findOne({ telegramGroupId: chatId });
        if (!group) {
            throw new Error('No group found with the provided ID');
        }

        // 2. Make request to Telegram API to get chat member
        const response = await fetch(
            `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getChatMember`,
        {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({
            chat_id: chatId,
            user_id: telegramUserId
            })
        }
        );

        const data = await response.json();

        // 3. Handle API response
        if (!data.ok) {
        // If user is not a member, Telegram returns a 400 error
        if (data.error_code === 400 && data.description.includes('user not found')) {
            return {
            isMember: false
            };
        }
        throw new Error(data.description || 'Failed to check membership');
        }

        // 4. Check member status
        // Valid statuses: 'creator', 'administrator', 'member', 'restricted', 'left', 'kicked'
        const memberStatus = data.result.status;
        const isMember = ['creator', 'administrator', 'member', 'restricted'].includes(memberStatus);

        return {
        isMember,
        memberStatus,
        memberInfo: data.result
        };

    } catch (error) {
        console.error('Error checking group membership:', error);
        return {
        isMember: false,
        error: error.message
        };
    }
}

