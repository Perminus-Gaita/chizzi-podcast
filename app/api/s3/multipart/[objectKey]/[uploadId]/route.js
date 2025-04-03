import { S3Client, AbortMultipartUploadCommand, ListPartsCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';

export async function DELETE(request) {
    try{
        const s3BucketName = process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME;
        const { objectKey: urlEncodedObjectKey, uploadId } = request.query; // Access the post ID from the URL
        const objectKey = decodeURIComponent(urlEncodedObjectKey);

        const abortResponse = await abortAndCleanupMultipartUpload(s3BucketName, objectKey, uploadId);
    
        return NextResponse.json(abortResponse, { status: 200 });
    } catch (error) {
        console.error("Error presigning url:", error);
        return NextResponse.json(error, { status: 500 });
    }
}
  
// function to abort + delete multipart upload
async function abortAndCleanupMultipartUpload(s3BucketName, objectKey, uploadId) {

    // Configure AWS SDK with your credentials and region
    const s3Client = new S3Client({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: 'ap-south-1',
        signatureVersion: "v4",
    });
  
    try {
        // Abort the multipart upload
        const abortParams = {
            Bucket: s3BucketName,
            Key: objectKey,
            UploadId: uploadId,
        };
        console.log({abortParams})
        await s3Client.send(new AbortMultipartUploadCommand(abortParams));
  
        // List uploaded parts
        const listParams = {
            Bucket: s3BucketName,
            Key: objectKey,
            UploadId: uploadId,
        };
        const listPartsResponse = await s3Client.send(new ListPartsCommand(listParams));
      
        // Delete each uploaded part
        const deletePartPromises = listPartsResponse.Parts.map(async (part) => {
            const deletePartParams = {
                Bucket: s3BucketName,
                Key: objectKey,
                UploadId: uploadId,
                PartNumber: part.PartNumber,
            };
            await s3Client.send(new DeleteObjectCommand(deletePartParams));
        });
  
        // Wait for all parts to be deleted
        return await Promise.all(deletePartPromises);
    } catch (error) {
      console.error('Error aborting multipart upload...:', error);
      throw error;
    }
}

  
  