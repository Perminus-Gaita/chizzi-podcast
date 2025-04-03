import axios from 'axios';

export async function verifyTelegramAccess(telegramUserId, botToken) {
    try {
        await axios.get(
            `https://api.telegram.org/bot${botToken}/getChat`, {
                params: {
                    chat_id: telegramUserId
                }
            }
        );
        return true;
    } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 400) {
            return false;
        }
        throw error;
    }
}