import { aggregateNotificationDataToSendToClient } from '@/services/notification/aggregate-notificaton-data-to-send-to-client';

// Connect to the database
import connectToDatabaseMongoDB from '@/lib/database';

export const getNotificationsByUserId = async (userId) => {  
  try {
    // connect to database
    await connectToDatabaseMongoDB("getNotificationsByUserId");

    // get notification data to display
    const notificatonDataToDisplay = await aggregateNotificationDataToSendToClient(
      userId
    );

    return notificatonDataToDisplay;
  } catch (error) {
    console.error("Error notifications by userId", error)
    throw error;
  }
};





