import axios from 'axios';

export async function sendMessageToUserOrGroup(telegramUserOrGroupId, message, reply_markup = null, link_preview_options = null) {
  try {
      const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
      console.log({
        telegramUserOrGroupId,
        message,
      })
      
      // Prepare request data.
      const requestData = {
        chat_id: telegramUserOrGroupId,
        text: message,
        parse_mode: 'HTML'
      };

      if (reply_markup) {
        requestData.reply_markup = reply_markup;
      }

      if (link_preview_options) {
        requestData.link_preview_options = link_preview_options;
      }

      const response = await axios.post(
        `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, 
        requestData
      );
    
      return response.data;
    
  } catch (error) {
    console.log({error: error});
    if (error.response) {
      throw new Error(`Telegram API Error: ${error.response.data.description}`);
    } else if (error.request) {
      throw new Error('No response received from Telegram API');
    } else {
      console.error('Error sending message:', error);
      throw error;
    }
  }
}