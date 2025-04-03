import { S3Client, CreateMultipartUploadCommand} from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';
import { getUser } from "@/utils/auth/getUser";
import { cookies } from "next/headers";

// Configure AWS SDK with your credentials and region
const s3Client = new S3Client({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'ap-south-1',
    signatureVersion: "v4"
});

const s3BucketName = process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME;

export async function POST(request) {
    /**Needed to get user Session */
    try{
        const sessionUser = await getUser(cookies)
        if (!sessionUser) { throw "Error! Unauthorized action!"; }

        const randomNumber = Math.floor(Math.random() * 10000);
        const Key = `${sessionUser._id}/${randomNumber}-${request.body.filename}`;
        const multipartParams = {
            Bucket: s3BucketName,
            Key: Key,
            ACL: "public-read",
            Metadata: {
                filetype: request.body.fileType,
                userid: sessionUser._id.toString(),
                workspaceId: sessionUser.currentWorkspaceId.toString(),
                description: request.body.description,
                title: request.body.title
            }
        };

        const command = new CreateMultipartUploadCommand(multipartParams);
        const multipartUpload = await s3Client.send(command);

        return NextResponse.json({
            fileId: multipartUpload.UploadId,
            fileKey: multipartUpload.Key
        },{ status: 200 });

    } catch(error){
        console.error({ "error initiating multipart upload" : error });
        return res.status(500).json(error);
    }
}

export async function DELETE(request) {
    try{
        const sessionUser = await getUser(cookies);
        if (!sessionUser) { throw "Error! Unauthorized action!" };

        const { objectKey, uploadId } = request.body;
        const abortResponse = await abortAndCleanupMultipartUpload(s3BucketName, objectKey, uploadId);
        return NextResponse.json(abortResponse, { status: 200 });
    } catch (error) {
        console.error("Error aborting multipart upload:", error);
        return NextResponse.json(error, { status: 500 });
    }
}

async function abortAndCleanupMultipartUpload(s3BucketName, objectKey, uploadId) {
  
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