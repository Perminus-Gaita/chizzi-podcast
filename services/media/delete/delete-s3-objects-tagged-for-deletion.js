import { S3Client, ListObjectsV2Command, GetObjectTaggingCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
  
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});
const bucketName = process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME;
  
export async function deleteS3ObjectsTaggedForDeletion() {
    const deletedObjects = [];
    let continuationToken = null;
  
    do {
        try {
            // List objects in the bucket
            const listCommand = new ListObjectsV2Command({
                Bucket: bucketName,
                ContinuationToken: continuationToken,
            });
            const listResponse = await s3Client.send(listCommand);
  
            // Process each object
            for (const object of listResponse.Contents || []) {
                const tagCommand = new GetObjectTaggingCommand({
                    Bucket: bucketName,
                    Key: object.Key,
                });
                const tagResponse = await s3Client.send(tagCommand);
  
                // Find the deleteAt tag
                const deleteAtTag = tagResponse.TagSet.find(tag => tag.Key === "deleteAt");
                if (deleteAtTag) {
                    const deleteAtDate = new Date(deleteAtTag.Value);
                    if (deleteAtDate <= new Date()) {
                        // Delete the object if it's expired
                        const deleteCommand = new DeleteObjectCommand({
                            Bucket: bucketName,
                            Key: object.Key,
                        });
                        await s3Client.send(deleteCommand);
                        deletedObjects.push(object.Key);
                        console.log(`Deleted expired object: ${object.Key}`);
                    }
                }
            }
  
            continuationToken = listResponse.NextContinuationToken;
        } catch (error) {
            console.error("Error processing objects:", error);
            throw error;
        }
    } while (continuationToken);
  
    console.log(`Number of deleted s3 objects: ${deletedObjects.length}`);
    return deletedObjects;
}
  
