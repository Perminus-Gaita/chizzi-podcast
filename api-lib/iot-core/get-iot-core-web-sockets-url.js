import { getEnvironmentSpecificEnvVariable } from '@/lib/env/get-environment-specific-env-variable'

// create an aws iot client
const AWSIoTEndpoint = getEnvironmentSpecificEnvVariable("AWS_IOT_ENDPOINT");
const ioTClient = new IoTDataPlaneClient({ endpoint: AWSIoTEndpoint });

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
    return `https://${IOT_CORE_HOST}:${IOT_CORE_HTTP_PORT}`;
};