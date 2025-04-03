// services/push-subscription/index.js
import PushSubscription from '@/models/push-subscription.model';

// Connect to database
import connectToDatabaseMongoDB from '@/lib/database';
await connectToDatabaseMongoDB("subscriptionNotification");

export const pushSubscriptionService = {
    /**
     * Save or update a push subscription for a user
     */
    async saveSubscription(userId, subscription, userAgent) {
        try {
            const subscriptionData = {
                userId,
                subscription: {
                    endpoint: subscription.endpoint,
                    expirationTime: subscription.expirationTime,
                    keys: {
                        p256dh: subscription.keys.p256dh,
                        auth: subscription.keys.auth
                    }
                },
                userAgent,
                isActive: true,
                lastUpdated: new Date()
            };

            // Try to update existing subscription first
            const updated = await PushSubscription.findOneAndUpdate(
                {
                    userId: userId,
                    'subscription.endpoint': subscription.endpoint
                },
                subscriptionData,
                {
                    new: true,
                    upsert: true
                }
            );

            return updated;
        } catch (error) {
            if (error.code === 11000) {
                // Handle duplicate key error
                throw new Error('Subscription already exists for this user and endpoint');
            }
            throw error;
        }
    },

    /**
     * Delete a subscription for a user
     */
    async deleteSubscription(userId, endpoint) {
        const subscription = await PushSubscription.findOneAndDelete({
            userId: userId,
            'subscription.endpoint': endpoint
        });

        if (!subscription) {
            throw new Error('Active subscription not found');
        }

        return subscription;
    },

    /**
     * Get all active subscriptions for a user
     */
    async getUserSubscriptions(userId) {
        return await PushSubscription.find({
            userId: userId,
            isActive: true
        }).sort({ createdAt: -1 });
    },

    /**
     * Delete a subscription for a user
     */
    async deleteSubscription(userId, endpoint) {
        return await PushSubscription.findOneAndDelete({
            userId: userId,
            'subscription.endpoint': endpoint
        });
    }
};
