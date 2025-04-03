import mongoose from "mongoose";

const PlanSchema = new mongoose.Schema({
    paystackPlanCode: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        // enum: ["free", "creator", "professional"]
    },
    interval: {
        type: String,
        required: true,
        enum: [ "hourly", "daily", "monthly", "yearly"]
    },
    price: { // price in cents.
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        enum: ["KES", "USD"],
        default: "KES",
        required: true,
    },
    isTrial: {
        type: Boolean,
        required: true,
        default: false
    }
}, {
    timestamps: true,
    versionKey: false
});

const PlanModel = mongoose?.models?.Plan || mongoose.model("Plan", PlanSchema);

export default PlanModel;

