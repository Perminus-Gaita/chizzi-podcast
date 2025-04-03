import mongoose from "mongoose";

const PaystackTransferRecipientSchema = new mongoose.Schema({
    paystackRecipientCode: {
        type: String,
        required: true,
        unique: true
    },
    belongsTo: {
        type: String,
       enum: ["individual" , "workspace"],
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
    active: {
        type: Boolean,
        required: true
    },
    domain: {
        type: String,
        enum: ["test", "live"],
        required: true
    },
    currency: {
        type: String,
        enum: ["KES", "USD"],
        required: true
    },
    name: {
        type: String,
        minlength: [1, "Name must be at least 1 character long"],
        maxlength: [100, "Name cannot be more than 100 characters long"],
        required: true
    },
    type: {
        type: String,
        enum: ["mobile_money", "authorization", "kepss", "ghipss", "nuban", "basa"],
        required: true
    },
    isDeleted: {
        type: Boolean,
        required: true
    },
    details: {
        authorizationCode: String,
        accountNumber: String,
        accountName: String,
        bankCode: {
            type: String,
            required: true
        },
        bankName: {
            type: String,
            required: true
        },
    }
}, {
    timestamps: true,
    versionKey: false
});

const PaystackTransferRecipientModel = 
    mongoose?.models?.PaystackTransferRecipient ||
    mongoose.model("PaystackTransferRecipient", PaystackTransferRecipientSchema);

export default PaystackTransferRecipientModel;

