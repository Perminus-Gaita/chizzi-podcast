import { S3Client, GetObjectTaggingCommand, PutObjectTaggingCommand } from "@aws-sdk/client-s3";
import VideoModel from '@/models/video.model';
import ImageModel from '@/models/image.model';
import connectToDatabaseMongoDB from '@/lib/database';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

export async function deleteScheduleToDeleteMedia(mediaId, mediaType) {
  await connectToDatabaseMongoDB("cancelMediaDeletion");

  try {
    // Update media document to remove scheduled deletion
    const updatedMedia = await removeDeleteAtFieldFromMediaDocument(mediaId, mediaType);

    // Remove deleteAt tag from S3 object
    const s3UpdateResponse = await removeDeleteAtTagFromS3Object(
      process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME,
      updatedMedia.s3ObjectKey
    );

    return {
      updatedMedia,
      s3UpdateResponse
    }
  } catch (error) {
    console.error('Error in cancelMediaDeletion:', error);
    throw error;
  }
}

async function removeDeleteAtFieldFromMediaDocument(mediaId, mediaType) {
  const update = { $unset: { deleteAt: "" } };
  const options = { new: true }; // This option returns the updated document

  let updatedMedia;
  if (mediaType === "video") {
    updatedMedia = await VideoModel.findByIdAndUpdate(mediaId, update, options);
  } else if (mediaType === "image") {
    updatedMedia = await ImageModel.findByIdAndUpdate(mediaId, update, options);
  } else {
    throw new Error(`Invalid media type: ${mediaType} passed.`);
  }

  if (!updatedMedia) { 
    throw new Error('Media not found in database'); 
  }

  return updatedMedia;
}

async function removeDeleteAtTagFromS3Object(bucketName, objectKey) {
  try {
    // Get existing tags
    const getTaggingCommand = new GetObjectTaggingCommand({
      Bucket: bucketName,
      Key: objectKey,
    });
    const existingTags = await s3Client.send(getTaggingCommand);

    // Filter out the deleteAt tag
    const newTags = existingTags.TagSet.filter(tag => tag.Key !== "deleteAt");

    // Create the command to update tags
    const command = new PutObjectTaggingCommand({
      Bucket: bucketName,
      Key: objectKey,
      Tagging: {
        TagSet: newTags,
      },
    });

    // Send the command to update the object's tags
    await s3Client.send(command);

    return {
      objectKey,
      bucketName,
      message: "deleteAt tag removed successfully"
    }
  } catch (error) {
    console.error("Error removing deleteAt tag from S3 object:", error);
    throw error;
  }
}