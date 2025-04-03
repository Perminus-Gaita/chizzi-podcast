import mongoose from 'mongoose';
  
// individual user schema
const individualUserSchema = {
    currentWorkspaceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: function() {
            return this.type === 'individual';
        }
    },
    onboardingStatus: {
        type: String,
        enum: ["discover", "connect", "create", "done"],
        default: "discover",
        required: function() {
            return this.type === 'individual';
        }
    },
    accountType: {
        type: String,
        default: null,
    },
    discovery: {
        type: String,
        default: null,
    },
    mainEmail: {
       type: String,
    },
    providers: [{
        type: String,
        enum: ["google", "telegram", "twitter"],
    }],
    google: {
        userId: {
            type: String,
            unique: true,
            sparse: true
        },
        name: String,
        email: {
            type: String,
            unique: true,
            sparse: true
        },
        profilePicture: String,
        phone: String,
        accessToken: String,
        accessTokenExpiryDate: Date,
        refreshToken: String
    },
    telegram: {
        userId: {
            type: String,
            unique: true,
            sparse: true
        },
        firstName: String,
        lastName: String,
        username: String,
        profilePicture: String,
        authorizationDate: Date
    }
};

export default individualUserSchema;

