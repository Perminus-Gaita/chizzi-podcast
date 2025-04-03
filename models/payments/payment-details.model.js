import mongoose from "mongoose";

const PaymentDetailsSchema = new mongoose.Schema({
    belongsTo: {
        type: String,
        enum: ["individual", "workspace"],
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    workspaceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Workspace"
    },
    type: {
        type: String,
        enum: ["mobileMoney", "authorization", "kepss", "ghipss", "nuban", "basa"],
        required: true
    },
    name: String,
    accountNumber: String,
    email: String,
    bankCode: String,
    currency: String,
    authorization: {
        authorizationCode: String,
        bin: String,
        last4: String,
        expiryMonth: String,
        expiryYear: String,
        channel: String,
        cardType: String,
        bank: String,
        countryCode: String,
        brand: String,
        reusable: Boolean,
        signature: String,
        accountName: String,
        receiverBankAccountNumber: String,
        receiverBank: String
    }
}, {
    timestamps: true
});

const PaymentDetailsModel = 
    mongoose?.models?.PaymentDetails ||
    mongoose.model("PaymentDetails", PaymentDetailsSchema);

export default PaymentDetailsModel;

/**
 * This document is created/updated when a payment is made,
 * It is used for creating a payment recipient. The payment
 * details are currently being created/updated in the payment webhooks
 * in aws cdk.
 */