import mongoose from 'mongoose';
  
// sponsorPurchaseOwnershipSchema
const sponsorPurchaseOwnershipSchema = {
    sponsorshipId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Sponsorship",
        required: function() {
            return this.transferType === 'sponsorPurchase';
        }
    },
    isRedeemed: { 
        type: Boolean,
        default: false 
    },
    redemptionDetails: {
        redeemedAt: Date,
        shippingAddress: String,
        phoneNumber: String,
        status: {
            type: String,
            enum: ["pending", "processing", "shipped", "delivered"],
            // default: "pending",
        },
    },
};

export default sponsorPurchaseOwnershipSchema;

