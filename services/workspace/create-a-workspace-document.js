import UserModel from '@/models/user/index.model';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Connect to the database **Outside of handler function**
import connectToDatabaseMongoDB from '@/lib/database';
await connectToDatabaseMongoDB("createAWorkspaceDocument")

export async function createAWorkspaceDocument(
  name, username, creatorId, profilePicture, filename
) {

  try {
    let workspaceDoc = await UserModel.create({
      name: name,
      username: username.replace(/\s/g, ''),
      type: 'workspace',
      creator: creatorId,
      members: [{
        userId: creatorId,
        role: 'admin'
      }],
    });

    if (profilePicture) {
      const profilePictureUrl = await uploadToS3(
        profilePicture, workspaceDoc._id, creatorId, filename
      );
      workspaceDoc.profilePicture = profilePictureUrl;
      await workspaceDoc.save();
    }

    return workspaceDoc;
  } catch (error) {
    console.error('Error in createAWorkspaceDocument service:', error);
    throw error;
  }
}

async function uploadToS3(profilePicture, workspaceId, userId, filename) {
  const fileType = profilePicture.split(';')[0].split('/')[1];
  const randomNumber = Math.floor(Math.random() * 10000);
  const sanitizedFileName = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  const Key = `${workspaceId}/profile-pictures/${randomNumber}-${sanitizedFileName}`;

  const params = {
    Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME,
    Key: Key,
    Body: Buffer.from(profilePicture.split(',')[1], 'base64'),
    ContentType: `image/${fileType}`,
    ACL: "public-read",
    Metadata: {
      workspaceId: workspaceId.toString(),
      userId: userId.toString(),
    }
  };

  const command = new PutObjectCommand(params);
  await s3Client.send(command);

  return `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${Key}`;
}
