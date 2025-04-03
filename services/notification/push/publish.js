import webpush from 'web-push';
import PushSubscription from "@/models/push-subscription.model";

// Set VAPID details
const vapidDetails = {
    subject: 'mailto:gaita@wufwuf.io',  // Replace with your email
    publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    privateKey: process.env.VAPID_PRIVATE_KEY
};

// Validate VAPID configuration
if (!vapidDetails.publicKey || !vapidDetails.privateKey) {
    console.error('VAPID keys are not set in environment variables');
}

// Set up web-push with VAPID details
webpush.setVapidDetails(
    vapidDetails.subject,
    vapidDetails.publicKey,
    vapidDetails.privateKey
);

// Connect to database
import connectToDatabaseMongoDB from '@/lib/database';
await connectToDatabaseMongoDB("pushNotification");

export async function publishNewPushNotification(
    userId,
    notificationId,
    title,
    body,
    icon,
    url
) {
    try {

        // Get all active subscriptions for the user
        const activeSubscriptions = await PushSubscription.find({
            userId: userId
        });

        if (!activeSubscriptions || activeSubscriptions.length === 0) {
            console.log('No active push subscriptions found for user:', userId);
            return;
        }

        const payload = JSON.stringify({
            notificationId,
            title,
            body,
            icon,
            url,
            type: "pushNotification"
        });

        // Send notification to all active subscriptions
        const notificationPromises = activeSubscriptions.map(async (subscriptionDoc) => {
            try {
                await webpush.sendNotification(subscriptionDoc.subscription, payload);
            } catch (error) {
                console.error(`Failed to send notification to subscription ${subscriptionDoc.subscription.endpoint}:`, error);

                // If subscription is invalid or expired, delete the document
                if (error.statusCode === 410 || error.statusCode === 404) {
                    await PushSubscription.findOneAndDelete({
                        _id: subscriptionDoc._id
                    });
                }
            }
        });

        // Wait for all notifications to be sent
        await Promise.all(notificationPromises);

    } catch (error) {
        console.error('Error publishing push notification:', error);
        throw error;
    }
}

export async function removeOnePushNotificationForAUser(
    userId,
    notificationId
) {
    try {
        // Get all active subscriptions for the user
        const activeSubscriptions = await PushSubscription.find({
            userId: userId
        });

        if (!activeSubscriptions || activeSubscriptions.length === 0) {
            console.log('No active push subscriptions found for user:', userId);
            return;
        }

        const payload = JSON.stringify({
            notificationId,
            type: "removeNotification"
        });

        // Send remove notification to all active subscriptions
        const notificationPromises = activeSubscriptions.map(async (subscriptionDoc) => {
            try {
                await webpush.sendNotification(subscriptionDoc.subscription, payload);
            } catch (error) {
                console.error(`Failed to send remove notification to subscription ${subscriptionDoc.subscription.endpoint}:`, error);

                // If subscription is invalid or expired, delete the document
                if (error.statusCode === 410 || error.statusCode === 404) {
                    await PushSubscription.findOneAndDelete({
                        _id: subscriptionDoc._id
                    });
                }
            }
        });

        // Wait for all notifications to be sent
        await Promise.all(notificationPromises);

    } catch (error) {
        console.error('Error sending remove notification:', error);
        throw error;
    }
}

export async function removeAllPushNotificationsForAUser(
    userId
) {
    try {
        // Get all active subscriptions for the user
        const activeSubscriptions = await PushSubscription.find({
            userId: userId
        });

        if (!activeSubscriptions || activeSubscriptions.length === 0) {
            console.log('No active push subscriptions found for user:', userId);
            return;
        }

        const payload = JSON.stringify({
            type: "removeAllNotifications"
        });

        // Send remove all notifications command to all active subscriptions
        const notificationPromises = activeSubscriptions.map(async (subscriptionDoc) => {
            try {
                await webpush.sendNotification(subscriptionDoc.subscription, payload);
            } catch (error) {
                console.error(`Failed to send remove all notifications command to subscription ${subscriptionDoc.subscription.endpoint}:`, error);

                // If subscription is invalid or expired, delete the document
                if (error.statusCode === 410 || error.statusCode === 404) {
                    await PushSubscription.findOneAndDelete({
                        _id: subscriptionDoc._id
                    });
                }
            }
        });

        // Wait for all notifications to be sent
        await Promise.all(notificationPromises);

    } catch (error) {
        console.error('Error sending remove all notifications command:', error);
        throw error;
    }
}
