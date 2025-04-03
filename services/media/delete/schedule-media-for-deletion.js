import { S3Client, PutObjectTaggingCommand, GetObjectTaggingCommand } from "@aws-sdk/client-s3";
import VideoModel from '@/models/video.model';
import ImageModel from '@/models/image.model';

import connectToDatabaseMongoDB from '@/lib/database';
await connectToDatabaseMongoDB("createScheduleToDeleteMedia");

// create s3 client
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

export async function scheduleMediaForDeletion(mediaId, mediaType) {
    try {
        // find and update media document to be scheduled for deletion
        const mediaScheduledForDeletion = await getAndUpdateMediaById(
            mediaId,
            mediaType,
            30
        );

        // create an eventbridge schedule that will delete media
        const tagS3ObjectForDeletionReponse = await tagS3ObjectForDeletion(
            process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME,
            mediaScheduledForDeletion.s3ObjectKey,
            mediaScheduledForDeletion.deleteAt
        );

        return {
            mediaScheduledForDeletion,
            tagS3ObjectForDeletionReponse
        }
  } catch (error) {
    console.error('Error in createScheduleToDeleteMedia:', error);
    throw error;
  }
}

// Update deleteAt field to delete document at certain date
async function getAndUpdateMediaById(mediaId, mediaType, daysUntilDeletion) {
    const deleteAt = new Date();
    deleteAt.setDate(deleteAt.getDate() + daysUntilDeletion);
  
    const update = { deleteAt };
    const options = { new: true }; // This option returns the updated document
  
    let updatedMedia;
    if (mediaType === "video") {
        updatedMedia = await VideoModel.findByIdAndUpdate(mediaId, update, options);
    } else if (mediaType === "image") {
        updatedMedia = await ImageModel.findByIdAndUpdate(mediaId, update, options);
    } else {
        throw new Error(`Invalid media type: ${mediaType} passed.`);
    }
    if (!updatedMedia) { throw new Error('Media not found in database'); }
    return updatedMedia;
}

// Add a deleteAt tag to an S3 object
async function tagS3ObjectForDeletion(bucketName, objectKey, dateToDelete) {
  try {
    // Set deleteAt date
    const deleteAt = new Date(dateToDelete);

    // Get existing tags (if any)
    const getTaggingCommand = new GetObjectTaggingCommand({
      Bucket: bucketName,
      Key: objectKey,
    });
    const existingTags = await s3Client.send(getTaggingCommand);

    // Prepare the new tag set
    const newTags = [
      ...(existingTags.TagSet || []),
      {
        Key: "deleteAt",
        Value: deleteAt.toISOString(),
      },
    ];

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
      deleteAt: deleteAt.toISOString(),
    }
  } catch (error) {
    console.error("Error setting object deleteAt tag:", error);
    throw error;
  }
}



