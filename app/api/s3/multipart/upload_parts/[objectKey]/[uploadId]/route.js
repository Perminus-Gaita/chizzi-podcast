import { S3Client, ListPartsCommand} from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';

// Configure AWS SDK with your credentials and region
const s3Client = new S3Client({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'ap-south-1',
    signatureVersion: "v4",
    ACL: 'public-read', // Set the object ACL to public-read
});

const s3BucketName = process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME;

export async function GET(request) {
    try {
        const { objectKey: urlEncodedObjectKey, uploadId } = req.query;
        const objectKey = decodeURIComponent(urlEncodedObjectKey);

        const params = {
            Bucket: s3BucketName,
            Key: objectKey,
            UploadId: uploadId,
        };

        const command = new ListPartsCommand(params);
        const response = await s3Client.send(command);

        return NextResponse.json(response.Parts,{ status: 200 });
    } catch (error) {
        console.error("Error fetching uploads:", error);
        return NextResponse.json(error,{ status: 500 });
    }
}




