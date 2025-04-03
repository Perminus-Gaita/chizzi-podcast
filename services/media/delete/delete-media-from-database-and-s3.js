import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
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

export async function deleteMediaFromDatabaseAndS3(mediaId, mediaType) {
    try {
        // Delete media document from database
        const deletedMedia = await deleteMediaFromDatabase(mediaId, mediaType);

        // Delete object from S3
        const s3DeletionResponse = await deleteS3Object(
            process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME,
            deletedMedia.s3ObjectKey
        );

        return {
            deletedMedia,
            s3DeletionResponse
        }
    } catch (error) {
        console.error('Error in deleteMediaImmediately:', error);
        throw error;
    }
}

async function deleteMediaFromDatabase(mediaId, mediaType) {
    let deletedMedia;

    if (mediaType === "video") {
        deletedMedia = await VideoModel.findByIdAndDelete(mediaId);
    } else if (mediaType === "image") {
        deletedMedia = await ImageModel.findByIdAndDelete(mediaId);
    } else {
        throw new Error(`Invalid media type: ${mediaType} passed.`);
    }

    if (!deletedMedia) { 
        throw new Error('Media not found in database'); 
    }

    return deletedMedia;
}

async function deleteS3Object(bucketName, objectKey) {
    try {
        const deleteCommand = new DeleteObjectCommand({
            Bucket: bucketName,
            Key: objectKey,
        });

        await s3Client.send(deleteCommand);

        return {
            objectKey,
            bucketName,
            message: "Object deleted successfully from S3"
        };
    } catch (error) {
        console.error("Error deleting object from S3:", error);
        throw error;
    }
}
