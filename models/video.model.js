import mongoose from 'mongoose';

const VideoSchema = new mongoose.Schema({
  userId: { //uploader of the Video
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  workspaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  s3ObjectKey:{
    type: String,
    unique: true
  },
  uploadedFrom:{
    type: String,
    enum: ["wufwuf", "facebook", "instagram", "tiktok", "youtube"],
    default: "wufwuf"
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
      reel: Boolean,
      story: Boolean,
      video: Boolean
    },
    instagram: {
      reel: Boolean,
      story: Boolean
    },
    tiktok: {
      video: Boolean
    },
    youtube: {
      short: Boolean,
      video: Boolean
    }
  }
}, {
    timestamps: true
});

const videoModel = mongoose.models.Video || mongoose.model('Video', VideoSchema);

export default videoModel;