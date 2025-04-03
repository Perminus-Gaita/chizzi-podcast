import { S3Client, UploadPartCommand} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextResponse } from 'next/server';

// Configure AWS SDK with your credentials and region
const s3Client = new S3Client({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'ap-south-1',
  signatureVersion: "v4"
});

const s3BucketName = process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME;

export async function PUT(request) {
  try{
    const { objectKey, uploadId, partNumber, body, signal } = request.body;

    const multipartParams = {
      // Body: body,
      Bucket: s3BucketName, // s3Client,
      Key: objectKey,
      UploadId: uploadId,
      PartNumber: partNumber
    };

    const command = new UploadPartCommand(multipartParams);

    const signedUrl = await getSignedUrl(s3Client, command);
 
    return NextResponse.json({url: signedUrl}, { status: 200 });
  } catch (error) {
    console.error("Error presigning url:", error);
    return NextResponse.json(error, { status: 500 });
  }
}

