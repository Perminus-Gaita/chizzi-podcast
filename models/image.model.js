import mongoose from "mongoose";

const ImageSchema = new mongoose.Schema({
    userId: { //uploader of the Image
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    workspaceId: { // workspace it was uploaded from
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    s3ObjectKey:{
        type: String,
        unique: true
    },
    isTranscoded:{
        type: Boolean,
        default: false
    },
    title:{
        type: String,
        maxlength: [100, "Title cannot be more than 100 characters long"],
    },
    description:{
        type: String,
        maxlength: [200, "Description cannot be more than 200 characters long"],
    },
    deleteAt: {
        type: Date,
        expires: 0
    },
    platformCompatibility: {
        facebook: {
            carousel: Boolean,
            image: Boolean,
            story: Boolean
        },
        instagram: {
            carousel: Boolean,
            image: Boolean,
            story: Boolean
        },
        tiktok: {
            image: Boolean,
            carousel: Boolean
        },
        youtube: {
            image: Boolean
        }
    }
}, {
    timestamps: true
});

const imageModel = mongoose.models.Image || mongoose.model('Image', ImageSchema);

export default imageModel;