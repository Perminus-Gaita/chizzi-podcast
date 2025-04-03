import { IoTDataPlaneClient, PublishCommand } from '@aws-sdk/client-iot-data-plane';
import { getIotCoreHttpsUrl } from '@/api-lib/iot-core/get-iot-core-https-url';
import Notification from '@/models/notification.model';

import { aggregateNotificationDataToSendToClient } from '@/services/notification/aggregate-notificaton-data-to-send-to-client';

// create an aws iot client
const iotCoreHttpsUrl = getIotCoreHttpsUrl();
const ioTClient = new IoTDataPlaneClient({ endpoint: iotCoreHttpsUrl });

// Connect to the database **Outside of handler function**
import connectToDatabaseMongoDB from '@/lib/database';
await connectToDatabaseMongoDB("createNotificationDocumentAndPublishItToIotCoreTopic")

/**
 * Creates a notification document and publishes it to an IoT Core topic
 * @param {Object} notificationData - The data for creating the notification
 * @param {string} notificationData.userId - The ID of the user receiving the notification
 * @param {string} notificationData.recipientType - The type of recipient (e.g., 'user', 'group')
 * @param {string} notificationData.workspaceId - The ID of the workspace related to the notification
 * @param {string} notificationData.type - The type of notification
 * @param {string} notificationData.message - The notification message
 * @param {Object} notificationData.details - Additional details about the notification
 * @param {string} notificationData.relatedId - The ID of the related entity
 * @param {string} notificationData.relatedModel - The model name of the related entity
 * @param {import('mongoose').ClientSession} session - The MongoDB session for transaction
 * @returns {Promise<{notificationDocument: import('@/models/notification.model').NotificationDocument, publishResult: any}>}
 * @throws {Error} If there's an error in creating or publishing the notification
 */
export const createNotificationDocumentAndPublishItToIotCoreTopic = async (notificationData, session) => {  
  try {
    // create notification document
    const notificationDocument = await createNotificationDocument(notificationData, session);

    // put some jsdoc to show what is returned
    const notificatonDataToSendToClient = await aggregateNotificationDataToSendToClient(
      notificationDocument.userId, 10, session
    );
    console.log({notificatonDataToSendToClient});

    // publish notification to a user iot topic
    const publishResult = await publishNotificationToIotTopic(
      notificatonDataToSendToClient[0].userId, notificatonDataToSendToClient
    );

    return { notificationDocument, publishResult };
  } catch (error) {
    console.error("Error creating and publishing notification", error)
    throw error;
  }
};


async function createNotificationDocument(notificationData, session){
  const notification = new Notification({
    userId: notificationData.userId,
    recipientType: notificationData.recipientType,
    workspaceId: notificationData.workspaceId,
    type: notificationData.type,
    message: notificationData.message,
    details: notificationData.details,
    relatedId: notificationData.relatedId,
    relatedModel: notificationData.relatedModel
  });
  await notification.save({ session });

  return notification;  
};


async function publishNotificationToIotTopic(topic, payload){
  const params = {
    topic: topic.toString(),
    qos: 1,
    payload: Buffer.from(JSON.stringify(payload))
  };
  const command = await new PublishCommand(params);
  const result = await ioTClient.send(command);

  return result;
}




