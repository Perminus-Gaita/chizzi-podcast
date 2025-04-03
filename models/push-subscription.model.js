// models/push-subscription.model.js
import mongoose from 'mongoose';

const PushSubscriptionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    subscription: {
        endpoint: {
            type: String,
            required: true
        },
        expirationTime: {
            type: Number,
            default: null
        },
        keys: {
            p256dh: {
                type: String,
                required: true
            },
            auth: {
                type: String,
                required: true
            }
        }
    },
    userAgent: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Compound index to ensure unique subscriptions per user and endpoint
PushSubscriptionSchema.index({ userId: 1, 'subscription.endpoint': 1 }, { unique: true });

const PushSubscription = mongoose?.models?.PushSubscription || mongoose.model('PushSubscription', PushSubscriptionSchema);

export default PushSubscription;
